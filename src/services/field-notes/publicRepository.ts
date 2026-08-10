import communityMascot from '@/assets/mascot-wide.png';
import villageIllustration from '@/assets/village-illustration.webp';
import { pickLocalized, type SiteLanguage } from '@/lib/brand';
import { getSupabaseClient } from '@/lib/supabase/client';
import { getFieldNoteBySlug, listPublishedFieldNotes } from '@/services/field-notes';
import { refreshStoredMediaUrls } from '@/services/media';
import type { FieldNote, FieldNotePerson, FieldNoteTopic } from '@/types/field-notes';

export interface FieldNoteQuery {
  language: SiteLanguage;
  search?: string;
  personSlug?: string;
  topicSlug?: string;
  featuredOnly?: boolean;
}

export interface FieldNoteRepository {
  listPublishedNotes(query: FieldNoteQuery): Promise<FieldNote[]>;
  getPublishedNoteBySlug(slug: string): Promise<FieldNote | null>;
}

type PublicNoteRecord = Record<string, unknown>;

function normalizeSearch(value: string): string {
  return value.trim().toLocaleLowerCase();
}

function noteAuthors(note: FieldNote): FieldNotePerson[] {
  return note.authors;
}

function noteTopics(note: FieldNote): FieldNoteTopic[] {
  return note.topics;
}

function buildSearchText(note: FieldNote, language: SiteLanguage): string {
  return normalizeSearch([
    pickLocalized(note.title, language),
    pickLocalized(note.excerpt, language),
    ...noteAuthors(note).flatMap((person) => [
      pickLocalized(person.name, language),
      pickLocalized(person.identityLabel, language),
    ]),
    ...noteTopics(note).map((topic) => pickLocalized(topic.name, language)),
  ].join(' '));
}

function sortNotes(notes: FieldNote[]): FieldNote[] {
  return [...notes].sort((left, right) => right.publishedAt.localeCompare(left.publishedAt));
}

function asRecord(value: unknown): PublicNoteRecord | null {
  return value && typeof value === 'object' ? value as PublicNoteRecord : null;
}

function nestedRecords(value: unknown): PublicNoteRecord[] {
  return Array.isArray(value)
    ? value.map(asRecord).filter((row): row is PublicNoteRecord => Boolean(row))
    : [];
}

async function mediaUrl(record: PublicNoteRecord): Promise<string> {
  const mediaRows = nestedRecords(record.field_note_media);
  const coverId = Number(record.cover_media_id) || null;
  const media = mediaRows
    .map((row) => ({ relation: row, asset: asRecord(row.media_assets) }))
    .find(({ relation, asset }) => Boolean(asset) && (
      Number(asset?.id) === coverId || relation.usage_role === 'cover'
    ))?.asset;
  if (!media) return villageIllustration;

  const bucket = String(media.storage_bucket ?? '');
  const path = String(media.storage_path ?? '');
  if (!bucket || !path) return villageIllustration;
  const storage = getSupabaseClient().storage.from(bucket);
  if (bucket === 'public-media') return storage.getPublicUrl(path).data.publicUrl;
  const { data, error } = await storage.createSignedUrl(path, 60 * 60);
  return error || !data?.signedUrl ? villageIllustration : data.signedUrl;
}

function mappedAuthors(record: PublicNoteRecord): FieldNotePerson[] {
  const authors = nestedRecords(record.field_note_authors)
    .map((row) => asRecord(row.people))
    .filter((person): person is PublicNoteRecord => Boolean(person))
    .map((person): FieldNotePerson => ({
      slug: String(person.slug ?? 'community-author'),
      name: {
        zh: String(person.nature_name || person.display_name || '社群作者'),
        en: String(person.nature_name || person.display_name || 'Community author'),
      },
      identityLabel: { zh: '社群作者', en: 'Community author' },
      introduction: { zh: '', en: '' },
      avatar: communityMascot,
    }));
  return authors;
}

async function resolvedContentHtml(record: PublicNoteRecord) {
  const assets = nestedRecords(record.field_note_media)
    .map((row) => asRecord(row.media_assets))
    .filter((asset): asset is PublicNoteRecord => Boolean(asset))
    .map((asset) => ({
      storage_bucket: String(asset.storage_bucket ?? ''),
      storage_path: String(asset.storage_path ?? ''),
    }))
    .filter((asset) => asset.storage_bucket && asset.storage_path);
  return refreshStoredMediaUrls(
    typeof record.content_html === 'string' ? record.content_html : undefined,
    assets,
  );
}

function mappedTopics(record: PublicNoteRecord): FieldNoteTopic[] {
  return nestedRecords(record.field_note_topics)
    .map((row) => asRecord(row.topics))
    .filter((topic): topic is PublicNoteRecord => Boolean(topic))
    .map((topic) => ({
      slug: String(topic.slug ?? 'community'),
      name: {
        zh: String(topic.name_zh || topic.name_en || '社群文章'),
        en: String(topic.name_en || topic.name_zh || 'Community story'),
      },
      shortName: {
        zh: String(topic.name_zh || topic.name_en || '社群'),
        en: String(topic.name_en || topic.name_zh || 'Community'),
      },
      description: { zh: String(topic.description ?? ''), en: String(topic.description ?? '') },
    }));
}

async function mapDatabaseNote(value: unknown): Promise<FieldNote | null> {
  const record = asRecord(value);
  if (!record || record.status !== 'published' || record.visibility !== 'public') return null;
  const title = String(record.title ?? '').trim();
  const slug = String(record.slug ?? '').trim();
  if (!title || !slug) return null;
  const authors = mappedAuthors(record);
  const topics = mappedTopics(record);
  const language = record.language === 'en' ? 'en' : 'zh';
  const excerpt = String(record.excerpt ?? '').trim();
  const plainText = String(record.content ?? '');
  const publishedAt = String(record.published_at || record.updated_at || '').slice(0, 10);

  return {
    slug,
    title: { zh: title, en: title },
    excerpt: { zh: excerpt, en: excerpt },
    authorSlugs: authors.map((author) => author.slug),
    topicSlugs: topics.map((topic) => topic.slug),
    publishedAt,
    readingMinutes: Math.max(1, Math.ceil((language === 'zh' ? plainText.length : plainText.split(/\s+/).length) / (language === 'zh' ? 420 : 220))),
    featuredRank: record.featured === true ? 1 : undefined,
    cover: await mediaUrl(record),
    coverAlt: { zh: title, en: title },
    contentHtml: await resolvedContentHtml(record),
    plainContent: plainText,
    authors,
    topics,
  };
}

async function databaseNotes(language?: SiteLanguage): Promise<FieldNote[]> {
  const rows = await listPublishedFieldNotes(language, 100);
  const mapped = await Promise.all(rows.map(mapDatabaseNote));
  return mapped.filter((note): note is FieldNote => Boolean(note));
}

export function filterPublishedNotes(notes: FieldNote[], query: FieldNoteQuery): FieldNote[] {
  const search = normalizeSearch(query.search ?? '');
  const matches = notes.filter((note) => {
    if (query.featuredOnly && !note.featuredRank) return false;
    if (query.personSlug && !note.authorSlugs.includes(query.personSlug)) return false;
    if (query.topicSlug && !note.topicSlugs.includes(query.topicSlug)) return false;
    if (search && !buildSearchText(note, query.language).includes(search)) return false;
    return true;
  });
  if (query.featuredOnly) {
    return [...matches].sort((left, right) => (left.featuredRank ?? 99) - (right.featuredRank ?? 99));
  }
  return sortNotes(matches);
}

export function peopleFromPublishedNotes(notes: FieldNote[]): FieldNotePerson[] {
  const people = new Map<string, FieldNotePerson>();
  notes.forEach((note) => note.authors.forEach((person) => people.set(person.slug, person)));
  return [...people.values()].sort((left, right) => left.name.zh.localeCompare(right.name.zh, 'zh-CN'));
}

export function topicsFromPublishedNotes(notes: FieldNote[]): FieldNoteTopic[] {
  const topics = new Map<string, FieldNoteTopic>();
  notes.forEach((note) => note.topics.forEach((topic) => topics.set(topic.slug, topic)));
  return [...topics.values()].sort((left, right) => left.name.zh.localeCompare(right.name.zh, 'zh-CN'));
}

export const fieldNotesRepository: FieldNoteRepository = {
  async listPublishedNotes(query) {
    return filterPublishedNotes(await databaseNotes(query.language), query);
  },

  async getPublishedNoteBySlug(slug) {
    return mapDatabaseNote(await getFieldNoteBySlug(slug));
  },
};

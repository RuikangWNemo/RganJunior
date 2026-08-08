import communityMascot from '@/assets/mascot-wide.png';
import villageIllustration from '@/assets/village-illustration.webp';
import {
  fieldNotePeople,
  fieldNotes,
  fieldNoteTopics,
  getFieldNotePerson,
  getFieldNoteTopic,
  type FieldNote,
  type FieldNotePerson,
  type FieldNoteTopic,
} from '@/content/fieldNotes';
import { pickLocalized, type SiteLanguage } from '@/lib/brand';
import { getSupabaseClient } from '@/lib/supabase/client';
import { getFieldNoteBySlug, listPublishedFieldNotes } from '@/services/field-notes';

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
  listPublicPeople(): Promise<FieldNotePerson[]>;
  listActiveTopics(): Promise<FieldNoteTopic[]>;
}

type PublicNoteRecord = Record<string, unknown>;
const useLivePublishedNotes = import.meta.env.MODE !== 'test';

function normalizeSearch(value: string): string {
  return value.trim().toLocaleLowerCase();
}

function noteAuthors(note: FieldNote): FieldNotePerson[] {
  return note.authors ?? note.authorSlugs
    .map(getFieldNotePerson)
    .filter((person): person is FieldNotePerson => Boolean(person));
}

function noteTopics(note: FieldNote): FieldNoteTopic[] {
  return note.topics ?? note.topicSlugs
    .map(getFieldNoteTopic)
    .filter((topic): topic is FieldNoteTopic => Boolean(topic));
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
        zh: String(person.name_zh || person.display_name || '社群作者'),
        en: String(person.name_en || person.display_name || 'Community author'),
      },
      identity: 'collaborator',
      identityLabel: { zh: '社群作者', en: 'Community author' },
      introduction: { zh: '', en: '' },
      avatar: communityMascot,
    }));
  return authors.length ? authors : [{
    slug: 'rgan-community',
    name: { zh: '阿柑少年社群', en: "R-Gan Junior Community" },
    identity: 'collaborator',
    identityLabel: { zh: '社群作者', en: 'Community author' },
    introduction: { zh: '', en: '' },
    avatar: communityMascot,
  }];
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
    featuredRank: record.featured === true ? 10 : undefined,
    cover: await mediaUrl(record),
    coverAlt: { zh: title, en: title },
    body: [],
    contentHtml: typeof record.content_html === 'string' ? record.content_html : undefined,
    authors,
    topics,
    preview: false,
  };
}

async function databaseNotes(language?: SiteLanguage): Promise<FieldNote[]> {
  const rows = await listPublishedFieldNotes(language, 100);
  const mapped = await Promise.all(rows.map(mapDatabaseNote));
  return mapped.filter((note): note is FieldNote => Boolean(note));
}

function applyQuery(notes: FieldNote[], query: FieldNoteQuery): FieldNote[] {
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

export const localFieldNotesRepository: FieldNoteRepository = {
  async listPublishedNotes(query) {
    let liveNotes: FieldNote[] = [];
    if (useLivePublishedNotes) {
      try {
        liveNotes = await databaseNotes(query.language);
      } catch (error) {
        console.warn('Published Field Notes are temporarily using the local fallback.', error);
      }
    }
    const liveSlugs = new Set(liveNotes.map((note) => note.slug));
    return applyQuery([...liveNotes, ...fieldNotes.filter((note) => !liveSlugs.has(note.slug))], query);
  },

  async getPublishedNoteBySlug(slug) {
    if (useLivePublishedNotes) {
      try {
        const live = await mapDatabaseNote(await getFieldNoteBySlug(slug));
        if (live) return live;
      } catch (error) {
        console.warn('Published Field Note is temporarily using the local fallback.', error);
      }
    }
    return fieldNotes.find((note) => note.slug === slug) ?? null;
  },

  async listPublicPeople() {
    return fieldNotePeople;
  },

  async listActiveTopics() {
    return fieldNoteTopics;
  },
};

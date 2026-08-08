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

function normalizeSearch(value: string): string {
  return value.trim().toLocaleLowerCase();
}

function buildSearchText(note: FieldNote, language: SiteLanguage): string {
  const authors = note.authorSlugs
    .map(getFieldNotePerson)
    .filter((person): person is FieldNotePerson => Boolean(person));
  const topics = note.topicSlugs
    .map(getFieldNoteTopic)
    .filter((topic): topic is FieldNoteTopic => Boolean(topic));

  return normalizeSearch([
    pickLocalized(note.title, language),
    pickLocalized(note.excerpt, language),
    ...authors.flatMap((person) => [
      pickLocalized(person.name, language),
      pickLocalized(person.identityLabel, language),
    ]),
    ...topics.map((topic) => pickLocalized(topic.name, language)),
  ].join(' '));
}

function sortNotes(notes: FieldNote[]): FieldNote[] {
  return [...notes].sort((left, right) => right.publishedAt.localeCompare(left.publishedAt));
}

export const localFieldNotesRepository: FieldNoteRepository = {
  async listPublishedNotes(query) {
    const search = normalizeSearch(query.search ?? '');
    const matches = fieldNotes.filter((note) => {
      if (query.featuredOnly && !note.featuredRank) return false;
      if (query.personSlug && !note.authorSlugs.includes(query.personSlug)) return false;
      if (query.topicSlug && !note.topicSlugs.includes(query.topicSlug as FieldNoteTopic['slug'])) return false;
      if (search && !buildSearchText(note, query.language).includes(search)) return false;
      return true;
    });

    if (query.featuredOnly) {
      return [...matches].sort((left, right) => (left.featuredRank ?? 99) - (right.featuredRank ?? 99));
    }

    return sortNotes(matches);
  },

  async getPublishedNoteBySlug(slug) {
    return fieldNotes.find((note) => note.slug === slug) ?? null;
  },

  async listPublicPeople() {
    return fieldNotePeople;
  },

  async listActiveTopics() {
    return fieldNoteTopics;
  },
};

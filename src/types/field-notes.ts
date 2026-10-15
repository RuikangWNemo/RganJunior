import type { LocalizedText } from '@/lib/brand';

export interface FieldNotePerson {
  slug: string;
  name: LocalizedText;
  identityLabel: LocalizedText;
  introduction: LocalizedText;
  avatar: string;
  portraitGroup?: string[];
  displayName?: LocalizedText;
}

export interface FieldNoteTopic {
  slug: string;
  name: LocalizedText;
  shortName: LocalizedText;
  description: LocalizedText;
}

export interface FieldNote {
  slug: string;
  title: LocalizedText;
  excerpt: LocalizedText;
  authorSlugs: string[];
  topicSlugs: string[];
  publishedAt: string;
  readingMinutes: number;
  featuredRank?: number;
  cover: string;
  coverAlt: LocalizedText;
  contentHtml?: string;
  contentHtmlEn?: string;
  originalUrl?: string;
  plainContent?: string;
  authors: FieldNotePerson[];
  topics: FieldNoteTopic[];
}

import { getSupabaseClient } from '@/lib/supabase/client';
import type { Tables, TablesInsert, TablesUpdate } from '@/lib/supabase/database.types';
import { BackendServiceError, throwIfSupabaseError } from '@/lib/supabase/errors';

export type FieldNoteStatus =
  | 'draft'
  | 'submitted'
  | 'in_review'
  | 'changes_requested'
  | 'approved'
  | 'published'
  | 'archived';

export type FieldNoteVisibility = 'private' | 'members' | 'public';
export type ArticleCategory = Tables<'article_categories'>;
export type FieldNoteTag = Tables<'topics'>;

export type ManagedFieldNote = Tables<'field_notes'> & {
  article_categories: ArticleCategory | null;
  field_note_topics: Array<{
    topic_id: number;
    topics: FieldNoteTag | null;
  }>;
  field_note_media: Array<{
    usage_role: string;
    media_assets: Tables<'media_assets'> | null;
  }>;
};

export type CommunitySquareFieldNote = ManagedFieldNote & {
  field_note_authors: Array<{
    author_order: number;
    contribution_role: string | null;
    people: Tables<'people'> | null;
  }>;
};

export interface FieldNoteMetadata {
  categoryId: number | null;
  topicIds: number[];
  visibility: FieldNoteVisibility;
}

const storyRelations = `
  *,
  article_categories(*),
  field_note_topics(topic_id, topics(*)),
  field_note_authors(author_order, contribution_role, people(*)),
  field_note_media(usage_role, media_assets(*))
`;

function categorySlug(nameZh: string, nameEn?: string | null) {
  const source = (nameEn || nameZh)
    .normalize('NFKD')
    .toLocaleLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 56);
  return source || `category-${crypto.randomUUID().slice(0, 12)}`;
}

async function authenticatedUserId() {
  const { data, error } = await getSupabaseClient().auth.getSession();
  throwIfSupabaseError(error, 'AUTH_SESSION_READ_FAILED');
  const userId = data.session?.user.id;
  if (!userId) throw new BackendServiceError('AUTH_REQUIRED', 'Sign in is required.');
  return userId;
}

export async function listPublishedFieldNotes(language?: 'zh' | 'en', limit = 24) {
  let query = getSupabaseClient()
    .from('field_notes')
    .select(storyRelations)
    .eq('status', 'published')
    .eq('visibility', 'public')
    .order('published_at', { ascending: false })
    .limit(Math.min(Math.max(limit, 1), 100));

  if (language) query = query.eq('language', language);
  const { data, error } = await query;
  throwIfSupabaseError(error, 'FIELD_NOTES_READ_FAILED');
  return (data ?? []) as unknown as CommunitySquareFieldNote[];
}

export async function getFieldNoteBySlug(slug: string) {
  const { data, error } = await getSupabaseClient()
    .from('field_notes')
    .select(storyRelations)
    .eq('slug', slug)
    .eq('status', 'published')
    .eq('visibility', 'public')
    .maybeSingle();
  throwIfSupabaseError(error, 'FIELD_NOTE_READ_FAILED');
  return data as unknown as CommunitySquareFieldNote | null;
}

export async function createFieldNote(input: TablesInsert<'field_notes'>) {
  const { data, error } = await getSupabaseClient()
    .from('field_notes')
    .insert(input)
    .select('*')
    .single();
  throwIfSupabaseError(error, 'FIELD_NOTE_CREATE_FAILED');
  return data;
}

export async function updateFieldNote(id: number, input: TablesUpdate<'field_notes'>) {
  const { data, error } = await getSupabaseClient()
    .from('field_notes')
    .update(input)
    .eq('id', id)
    .select('*')
    .single();
  throwIfSupabaseError(error, 'FIELD_NOTE_UPDATE_FAILED');
  return data;
}

export async function transitionFieldNote(id: number, status: FieldNoteStatus) {
  return updateFieldNote(id, { status });
}

export async function listMyFieldNotes() {
  const userId = await authenticatedUserId();
  const { data, error } = await getSupabaseClient()
    .from('field_notes')
    .select(`
      *,
      article_categories(*),
      field_note_topics(topic_id, topics(*)),
      field_note_media(usage_role, media_assets(*))
    `)
    .eq('created_by', userId)
    .order('updated_at', { ascending: false });
  throwIfSupabaseError(error, 'MY_FIELD_NOTES_READ_FAILED');
  return (data ?? []) as unknown as ManagedFieldNote[];
}

export async function listCommunitySquareFieldNotes(limit = 100) {
  return listPublishedFieldNotes(undefined, limit);
}

export async function listArticleCategories(options: { includeInactive?: boolean } = {}) {
  let query = getSupabaseClient()
    .from('article_categories')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('id', { ascending: true });
  if (!options.includeInactive) query = query.eq('is_active', true);
  const { data, error } = await query;
  throwIfSupabaseError(error, 'ARTICLE_CATEGORIES_READ_FAILED');
  return data ?? [];
}

export async function createArticleCategory(input: {
  nameZh: string;
  nameEn?: string;
  sortOrder?: number;
}) {
  const nameZh = input.nameZh.trim();
  const nameEn = input.nameEn?.trim() || null;
  if (!nameZh) throw new BackendServiceError('ARTICLE_CATEGORY_NAME_REQUIRED', 'Category name is required.');
  const { data, error } = await getSupabaseClient()
    .from('article_categories')
    .insert({
      slug: categorySlug(nameZh, nameEn),
      name_zh: nameZh,
      name_en: nameEn,
      sort_order: input.sortOrder ?? 100,
    })
    .select('*')
    .single();
  throwIfSupabaseError(error, 'ARTICLE_CATEGORY_CREATE_FAILED');
  return data;
}

export async function updateArticleCategory(
  id: number,
  input: Pick<TablesUpdate<'article_categories'>, 'name_zh' | 'name_en' | 'sort_order' | 'is_active'>,
) {
  const { data, error } = await getSupabaseClient()
    .from('article_categories')
    .update(input)
    .eq('id', id)
    .select('*')
    .single();
  throwIfSupabaseError(error, 'ARTICLE_CATEGORY_UPDATE_FAILED');
  return data;
}

export async function listFieldNoteTags() {
  const { data, error } = await getSupabaseClient()
    .from('topics')
    .select('*')
    .eq('is_active', true)
    .is('archived_at', null)
    .order('name_zh', { ascending: true });
  throwIfSupabaseError(error, 'FIELD_NOTE_TAGS_READ_FAILED');
  return data ?? [];
}

export async function findOrCreateFieldNoteTag(nameZh: string, nameEn?: string) {
  const { data, error } = await getSupabaseClient().rpc('find_or_create_field_note_tag', {
    tag_name_zh: nameZh.trim(),
    tag_name_en: nameEn?.trim() || undefined,
  });
  throwIfSupabaseError(error, 'FIELD_NOTE_TAG_CREATE_FAILED');
  return data;
}

export async function getFieldNoteMetadata(id: number): Promise<FieldNoteMetadata> {
  const { data, error } = await getSupabaseClient()
    .from('field_notes')
    .select('category_id, visibility, field_note_topics(topic_id)')
    .eq('id', id)
    .single();
  throwIfSupabaseError(error, 'FIELD_NOTE_METADATA_READ_FAILED');
  return {
    categoryId: data.category_id,
    topicIds: data.field_note_topics.map((row) => row.topic_id),
    visibility: data.visibility as FieldNoteVisibility,
  };
}

export async function saveFieldNoteMetadata(id: number, metadata: FieldNoteMetadata) {
  const { error } = await getSupabaseClient().rpc('save_field_note_metadata', {
    target_field_note_id: id,
    target_category_id: metadata.categoryId,
    target_topic_ids: metadata.topicIds,
    target_visibility: metadata.visibility,
  });
  throwIfSupabaseError(error, 'FIELD_NOTE_METADATA_SAVE_FAILED');
}

export async function archiveFieldNote(id: number) {
  return transitionFieldNote(id, 'archived');
}

export async function restoreFieldNote(id: number) {
  return transitionFieldNote(id, 'draft');
}

export async function permanentlyDeleteFieldNote(id: number) {
  const { data, error } = await getSupabaseClient()
    .from('field_notes')
    .delete()
    .eq('id', id)
    .eq('status', 'archived')
    .select('id')
    .maybeSingle();
  throwIfSupabaseError(error, 'FIELD_NOTE_DELETE_FAILED');
  if (!data) throw new BackendServiceError('FIELD_NOTE_DELETE_NOT_ALLOWED', 'Only an owned story in Trash can be permanently deleted.');
}

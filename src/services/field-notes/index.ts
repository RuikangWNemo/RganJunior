import { getSupabaseClient } from '@/lib/supabase/client';
import type { TablesInsert, TablesUpdate } from '@/lib/supabase/database.types';
import { throwIfSupabaseError } from '@/lib/supabase/errors';

export type FieldNoteStatus =
  | 'draft'
  | 'submitted'
  | 'in_review'
  | 'changes_requested'
  | 'approved'
  | 'published'
  | 'archived';

export async function listPublishedFieldNotes(language?: 'zh' | 'en', limit = 24) {
  let query = getSupabaseClient()
    .from('field_notes')
    .select('*, field_note_topics(*, topics(*)), field_note_authors(*), field_note_media(*, media_assets(*))')
    .eq('status', 'published')
    .eq('visibility', 'public')
    .order('published_at', { ascending: false })
    .limit(Math.min(Math.max(limit, 1), 100));

  if (language) query = query.eq('language', language);
  const { data, error } = await query;
  throwIfSupabaseError(error, 'FIELD_NOTES_READ_FAILED');
  return data;
}

export async function getFieldNoteBySlug(slug: string) {
  const { data, error } = await getSupabaseClient()
    .from('field_notes')
    .select('*, field_note_topics(*, topics(*)), field_note_authors(*), field_note_media(*, media_assets(*))')
    .eq('slug', slug)
    .eq('status', 'published')
    .eq('visibility', 'public')
    .maybeSingle();
  throwIfSupabaseError(error, 'FIELD_NOTE_READ_FAILED');
  return data;
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
  const { data, error } = await getSupabaseClient()
    .from('field_notes')
    .select('*')
    .order('updated_at', { ascending: false });
  throwIfSupabaseError(error, 'MY_FIELD_NOTES_READ_FAILED');
  return data;
}

import { getSupabaseClient } from '@/lib/supabase/client';
import type { TablesInsert, TablesUpdate } from '@/lib/supabase/database.types';
import { throwIfSupabaseError } from '@/lib/supabase/errors';

export async function listTopics() {
  const { data, error } = await getSupabaseClient()
    .from('topics')
    .select('*')
    .order('sort_order')
    .order('id');
  throwIfSupabaseError(error, 'TOPICS_READ_FAILED');
  return data;
}

export async function createTopic(input: TablesInsert<'topics'>) {
  const { data, error } = await getSupabaseClient().from('topics').insert(input).select('*').single();
  throwIfSupabaseError(error, 'TOPIC_CREATE_FAILED');
  return data;
}

export async function updateTopic(id: number, input: TablesUpdate<'topics'>) {
  const { data, error } = await getSupabaseClient()
    .from('topics')
    .update(input)
    .eq('id', id)
    .select('*')
    .single();
  throwIfSupabaseError(error, 'TOPIC_UPDATE_FAILED');
  return data;
}

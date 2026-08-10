import { getSupabaseClient } from '@/lib/supabase/client';
import type { TablesInsert, TablesUpdate } from '@/lib/supabase/database.types';
import { throwIfSupabaseError } from '@/lib/supabase/errors';

export async function listIdentityLabels() {
  const { data, error } = await getSupabaseClient()
    .from('identity_labels')
    .select('*')
    .order('sort_order')
    .order('id');
  throwIfSupabaseError(error, 'IDENTITY_LABELS_READ_FAILED');
  return data;
}

export async function createIdentityLabel(input: TablesInsert<'identity_labels'>) {
  const { data, error } = await getSupabaseClient()
    .from('identity_labels')
    .insert(input)
    .select('*')
    .single();
  throwIfSupabaseError(error, 'IDENTITY_LABEL_CREATE_FAILED');
  return data;
}

export async function updateIdentityLabel(id: number, input: TablesUpdate<'identity_labels'>) {
  const { data, error } = await getSupabaseClient()
    .from('identity_labels')
    .update(input)
    .eq('id', id)
    .select('*')
    .single();
  throwIfSupabaseError(error, 'IDENTITY_LABEL_UPDATE_FAILED');
  return data;
}

export async function assignIdentity(input: TablesInsert<'person_identity_labels'>) {
  const { data, error } = await getSupabaseClient()
    .from('person_identity_labels')
    .insert(input)
    .select('*')
    .single();
  throwIfSupabaseError(error, 'IDENTITY_ASSIGN_FAILED');
  return data;
}

export async function removeIdentity(personId: number, identityLabelId: number) {
  const { error } = await getSupabaseClient()
    .from('person_identity_labels')
    .delete()
    .eq('person_id', personId)
    .eq('identity_label_id', identityLabelId);
  throwIfSupabaseError(error, 'IDENTITY_REMOVE_FAILED');
}

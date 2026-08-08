import { getSupabaseClient } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/database.types';
import { throwIfSupabaseError } from '@/lib/supabase/errors';

export type CommunityPerson = Database['public']['Functions']['list_community_people']['Returns'][number];

export async function listCommunityPeople(pageSize = 40) {
  const { data, error } = await getSupabaseClient().rpc('list_community_people', {
    page_size: pageSize,
  });
  throwIfSupabaseError(error, 'PEOPLE_READ_FAILED');
  return data;
}

export const listPublicPeople = listCommunityPeople;

export async function getPersonBySlug(slug: string) {
  const { data, error } = await getSupabaseClient().rpc('get_community_person_by_slug', {
    person_slug: slug,
  });
  throwIfSupabaseError(error, 'PERSON_READ_FAILED');
  return data[0] ?? null;
}

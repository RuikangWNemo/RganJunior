import { getSupabaseClient } from '@/lib/supabase/client';
import type { Database, Json } from '@/lib/supabase/database.types';
import { throwIfSupabaseError } from '@/lib/supabase/errors';

export type PlanetSlug = 'youth' | 'support' | 'guardian';

export type SignupIdentityOption = Database['public']['Functions']['list_signup_identity_options']['Returns'][number];
export type AdminIdentityLabel = Database['public']['Functions']['list_community_identity_labels_admin']['Returns'][number];
export type AdminIdentityMember = Database['public']['Functions']['list_community_identity_members_admin']['Returns'][number];

export type ConfirmedIdentityLabel = {
  slug: string;
  nameZh: string;
  nameEn: string | null;
  color: string | null;
  planetSlug: PlanetSlug;
  isPrimary: boolean;
};

export type IdentityCount = { slug: string; count: number };
export type PlanetOverlapCount = { planets: PlanetSlug[]; count: number };

export type CommunityIdentityStats = {
  declared: IdentityCount[];
  confirmedPrimary: IdentityCount[];
  planets: IdentityCount[];
  overlaps: PlanetOverlapCount[];
  pendingDeclarations: number;
  missingPrimary: number;
};

const emptyStats: CommunityIdentityStats = {
  declared: [],
  confirmedPrimary: [],
  planets: [],
  overlaps: [],
  pendingDeclarations: 0,
  missingPrimary: 0,
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function asCountList(value: unknown): IdentityCount[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!isRecord(item) || typeof item.slug !== 'string' || typeof item.count !== 'number') return [];
    return [{ slug: item.slug, count: item.count }];
  });
}

export function parseConfirmedIdentityLabels(value: Json): ConfirmedIdentityLabel[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (
      !isRecord(item)
      || typeof item.slug !== 'string'
      || typeof item.nameZh !== 'string'
      || !['youth', 'support', 'guardian'].includes(String(item.planetSlug))
    ) return [];
    return [{
      slug: item.slug,
      nameZh: item.nameZh,
      nameEn: typeof item.nameEn === 'string' ? item.nameEn : null,
      color: typeof item.color === 'string' ? item.color : null,
      planetSlug: item.planetSlug as PlanetSlug,
      isPrimary: item.isPrimary === true,
    }];
  });
}

function parseStats(value: Json): CommunityIdentityStats {
  if (!isRecord(value)) return emptyStats;
  const overlaps = Array.isArray(value.overlaps)
    ? value.overlaps.flatMap((item) => {
      if (!isRecord(item) || !Array.isArray(item.planets) || typeof item.count !== 'number') return [];
      const planets = item.planets.filter((planet): planet is PlanetSlug => (
        planet === 'youth' || planet === 'support' || planet === 'guardian'
      ));
      return planets.length > 1 ? [{ planets, count: item.count }] : [];
    })
    : [];
  return {
    declared: asCountList(value.declared),
    confirmedPrimary: asCountList(value.confirmedPrimary),
    planets: asCountList(value.planets),
    overlaps,
    pendingDeclarations: typeof value.pendingDeclarations === 'number' ? value.pendingDeclarations : 0,
    missingPrimary: typeof value.missingPrimary === 'number' ? value.missingPrimary : 0,
  };
}

export async function listSignupIdentityOptions() {
  const { data, error } = await getSupabaseClient().rpc('list_signup_identity_options');
  throwIfSupabaseError(error, 'SIGNUP_IDENTITIES_READ_FAILED');
  return data;
}

export async function listAdminIdentityLabels() {
  const { data, error } = await getSupabaseClient().rpc('list_community_identity_labels_admin');
  throwIfSupabaseError(error, 'ADMIN_IDENTITIES_READ_FAILED');
  return data;
}

export async function updateAdminIdentityLabel(input: {
  id: number;
  nameZh: string;
  nameEn?: string | null;
  descriptionZh?: string | null;
  descriptionEn?: string | null;
  color?: string | null;
  planetSlug: PlanetSlug;
  selectableOnSignup: boolean;
  isActive: boolean;
  sortOrder: number;
}) {
  const { error } = await getSupabaseClient().rpc('update_community_identity_label_admin', {
    target_label_id: input.id,
    target_name_zh: input.nameZh,
    target_name_en: input.nameEn,
    target_description_zh: input.descriptionZh,
    target_description_en: input.descriptionEn,
    target_color: input.color,
    target_planet_slug: input.planetSlug,
    target_selectable_on_signup: input.selectableOnSignup,
    target_is_active: input.isActive,
    target_sort_order: input.sortOrder,
  });
  throwIfSupabaseError(error, 'ADMIN_IDENTITY_UPDATE_FAILED');
}

export async function listAdminIdentityMembers(searchQuery?: string) {
  const { data, error } = await getSupabaseClient().rpc('list_community_identity_members_admin', {
    search_query: searchQuery,
    page_size: 100,
  });
  throwIfSupabaseError(error, 'ADMIN_IDENTITY_MEMBERS_READ_FAILED');
  return data;
}

export async function setAdminMemberIdentities(
  personId: number,
  primaryIdentitySlug: string,
  secondaryIdentitySlugs: string[],
) {
  const { error } = await getSupabaseClient().rpc('set_community_member_identities_admin', {
    target_person_id: personId,
    primary_identity_slug: primaryIdentitySlug,
    secondary_identity_slugs: secondaryIdentitySlugs,
  });
  throwIfSupabaseError(error, 'ADMIN_MEMBER_IDENTITIES_UPDATE_FAILED');
}

export async function getAdminIdentityStats() {
  const { data, error } = await getSupabaseClient().rpc('get_community_identity_stats_admin');
  throwIfSupabaseError(error, 'ADMIN_IDENTITY_STATS_READ_FAILED');
  return parseStats(data);
}

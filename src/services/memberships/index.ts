import { getSupabaseClient } from '@/lib/supabase/client';
import { throwIfSupabaseError } from '@/lib/supabase/errors';

export type CommunityApplicationInput = {
  motivation: string;
  hopes?: string;
  contribution?: string;
  additionalInfo?: string;
};

export async function createAndSubmitCommunityApplication(input: CommunityApplicationInput) {
  const supabase = getSupabaseClient();
  const { data: applicationId, error: createError } = await supabase.rpc(
    'create_community_application',
    {
      application_motivation: input.motivation,
      application_hopes: input.hopes,
      application_contribution: input.contribution,
      application_additional_info: input.additionalInfo,
    },
  );
  throwIfSupabaseError(createError, 'COMMUNITY_APPLICATION_CREATE_FAILED');

  const { data: status, error: submitError } = await supabase.rpc(
    'submit_community_application',
    {
      target_application_id: applicationId,
      application_motivation: input.motivation,
      application_hopes: input.hopes,
      application_contribution: input.contribution,
      application_additional_info: input.additionalInfo,
    },
  );
  throwIfSupabaseError(submitError, 'COMMUNITY_APPLICATION_SUBMIT_FAILED');
  return { applicationId, status };
}

export async function getMyCommunityApplication() {
  const { data, error } = await getSupabaseClient().rpc('get_my_community_application');
  throwIfSupabaseError(error, 'COMMUNITY_APPLICATION_READ_FAILED');
  return data[0] ?? null;
}

export async function listMembershipApplications(statuses?: string[]) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.rpc('list_membership_applications', {
    application_statuses: statuses,
    page_size: 50,
  });
  throwIfSupabaseError(error, 'MEMBERSHIP_APPLICATIONS_READ_FAILED');
  const applicationIds = data.map((application) => application.id);
  const { data: declarations, error: declarationsError } = await supabase.rpc(
    'list_membership_application_identity_declarations',
    { target_application_ids: applicationIds },
  );
  throwIfSupabaseError(declarationsError, 'MEMBERSHIP_APPLICATION_IDENTITIES_READ_FAILED');
  const declarationsByApplication = new Map(
    declarations.map((declaration) => [declaration.application_id, declaration]),
  );
  return data.map((application) => ({
    ...application,
    declared_primary_identity_slug: declarationsByApplication.get(application.id)?.primary_identity_slug || null,
    declared_secondary_identity_slugs: declarationsByApplication.get(application.id)?.secondary_identity_slugs || [],
  }));
}

export async function reviewMembershipApplication(
  applicationId: number,
  decision: 'approve' | 'reject',
  applicantMessage: string,
  internalNote?: string,
  confirmedPrimaryIdentitySlug?: string,
  confirmedSecondaryIdentitySlugs: string[] = [],
) {
  const { error } = decision === 'approve'
    ? await getSupabaseClient().rpc('review_community_application_with_identities', {
      target_application_id: applicationId,
      review_decision: decision,
      applicant_message: applicantMessage,
      reviewer_internal_note: internalNote,
      confirmed_primary_identity_slug: confirmedPrimaryIdentitySlug,
      confirmed_secondary_identity_slugs: confirmedSecondaryIdentitySlugs,
    })
    : await getSupabaseClient().rpc('review_community_application', {
      target_application_id: applicationId,
      review_decision: decision,
      applicant_message: applicantMessage,
      reviewer_internal_note: internalNote,
    });
  throwIfSupabaseError(error, 'MEMBERSHIP_APPLICATION_REVIEW_FAILED');
}

export async function requestMembershipApplicationChanges(
  applicationId: number,
  applicantMessage: string,
  internalNote?: string,
) {
  const { error } = await getSupabaseClient().rpc('request_application_changes', {
    target_application_id: applicationId,
    applicant_message: applicantMessage,
    reviewer_internal_note: internalNote,
  });
  throwIfSupabaseError(error, 'MEMBERSHIP_APPLICATION_CHANGES_FAILED');
}

export async function reviewMinorIdentity(
  userId: string,
  decision: 'verify' | 'reject',
  method: 'guardian_attestation' | 'manual_document_review' | 'trusted_offline_relationship' | 'other',
  note: string,
) {
  const { data, error } = await getSupabaseClient().rpc('review_minor_identity_verification', {
    target_minor_user_id: userId,
    review_decision: decision,
    target_verification_method: method,
    target_reviewer_note: note,
  });
  throwIfSupabaseError(error, 'MINOR_IDENTITY_REVIEW_FAILED');
  return data;
}

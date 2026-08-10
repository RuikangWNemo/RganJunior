import { getSupabaseClient } from '@/lib/supabase/client';
import { throwIfSupabaseError } from '@/lib/supabase/errors';

export async function listPracticeSessions() {
  const { data, error } = await getSupabaseClient().rpc('list_practice_sessions');
  throwIfSupabaseError(error, 'PRACTICE_SESSIONS_READ_FAILED');
  return data;
}

export async function joinPracticeSession(sessionId: number) {
  const { data, error } = await getSupabaseClient().rpc('join_practice_session', {
    target_session_id: sessionId,
  });
  throwIfSupabaseError(error, 'PRACTICE_JOIN_FAILED');
  return data;
}

export async function cancelPracticeParticipation(sessionId: number) {
  const { error } = await getSupabaseClient().rpc('cancel_practice_participation', {
    target_session_id: sessionId,
  });
  throwIfSupabaseError(error, 'PRACTICE_CANCEL_FAILED');
}

export async function getPracticeSessionAccess(sessionId: number) {
  const { data, error } = await getSupabaseClient().rpc('get_practice_session_access', {
    target_session_id: sessionId,
  });
  throwIfSupabaseError(error, 'PRACTICE_ACCESS_READ_FAILED');
  return data[0] ?? null;
}

export async function createPracticeSession(input: {
  title: string;
  description?: string;
  startsAt: string;
  endsAt: string;
  timezone: string;
  capacity: number;
  meetingUrl?: string;
  accessNotes?: string;
}) {
  const { data: sessionId, error } = await getSupabaseClient().rpc('create_practice_session', {
    session_title: input.title,
    session_description: input.description,
    session_starts_at: input.startsAt,
    session_ends_at: input.endsAt,
    session_timezone: input.timezone,
    session_capacity: input.capacity,
    session_meeting_url: input.meetingUrl,
    session_access_notes: input.accessNotes,
  });
  throwIfSupabaseError(error, 'PRACTICE_CREATE_FAILED');
  return sessionId;
}

export async function publishPracticeSession(sessionId: number) {
  const { error } = await getSupabaseClient().rpc('publish_practice_session', {
    target_session_id: sessionId,
  });
  throwIfSupabaseError(error, 'PRACTICE_PUBLISH_FAILED');
}

import { getSupabaseClient } from '@/lib/supabase/client';
import { throwIfSupabaseError } from '@/lib/supabase/errors';

export async function createDirectConversationWithPerson(personId: number) {
  const { data, error } = await getSupabaseClient().rpc('create_direct_conversation_with_person', {
    target_person_id: personId,
  });
  throwIfSupabaseError(error, 'CONVERSATION_CREATE_FAILED');
  return data;
}

export async function listDirectConversations() {
  const { data, error } = await getSupabaseClient().rpc('list_direct_conversations');
  throwIfSupabaseError(error, 'CONVERSATIONS_READ_FAILED');
  return data;
}

export async function listDirectMessages(conversationId: string) {
  const { data, error } = await getSupabaseClient().rpc('list_direct_messages', {
    target_conversation_id: conversationId,
    page_size: 100,
  });
  throwIfSupabaseError(error, 'MESSAGES_READ_FAILED');
  return [...data].reverse();
}

export async function sendDirectMessage(conversationId: string, body: string) {
  const { data, error } = await getSupabaseClient().rpc('send_direct_message', {
    target_conversation_id: conversationId,
    message_body: body,
  });
  throwIfSupabaseError(error, 'MESSAGE_SEND_FAILED');
  return data;
}

export async function markConversationRead(conversationId: string) {
  const { error } = await getSupabaseClient().rpc('mark_conversation_read', {
    target_conversation_id: conversationId,
  });
  throwIfSupabaseError(error, 'CONVERSATION_READ_UPDATE_FAILED');
}

export async function blockCommunityMember(userId: string) {
  const { error } = await getSupabaseClient().rpc('block_community_member', {
    target_user_id: userId,
  });
  throwIfSupabaseError(error, 'MEMBER_BLOCK_FAILED');
}

export async function unblockCommunityMember(userId: string) {
  const { error } = await getSupabaseClient().rpc('unblock_community_member', {
    target_user_id: userId,
  });
  throwIfSupabaseError(error, 'MEMBER_UNBLOCK_FAILED');
}

export async function reportDirectMessage(messageId: number, category: string, details?: string) {
  const { data, error } = await getSupabaseClient().rpc('report_direct_message', {
    target_message_id: messageId,
    report_category: category,
    report_details: details,
  });
  throwIfSupabaseError(error, 'MESSAGE_REPORT_FAILED');
  return data;
}

export function subscribeToDirectMessages(conversationId: string, onInsert: () => void) {
  const client = getSupabaseClient();
  const channel = client
    .channel(`direct-messages:${conversationId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'direct_messages',
        filter: `conversation_id=eq.${conversationId}`,
      },
      onInsert,
    )
    .subscribe();
  return () => { void client.removeChannel(channel); };
}

export async function listCommunityReports() {
  const { data, error } = await getSupabaseClient().rpc('list_community_reports');
  throwIfSupabaseError(error, 'COMMUNITY_REPORTS_READ_FAILED');
  return data;
}

export async function resolveCommunityReport(reportId: number, status: 'resolved' | 'dismissed', note: string) {
  const { error } = await getSupabaseClient().rpc('resolve_community_report', {
    target_report_id: reportId,
    resolution_status: status,
    target_resolution_note: note,
  });
  throwIfSupabaseError(error, 'COMMUNITY_REPORT_RESOLVE_FAILED');
}

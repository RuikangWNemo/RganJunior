import { randomBytes } from 'node:crypto';

import type { FieldNoteBlocks } from '../../../src/lib/field-note-document/schema.js';
import { createFieldNoteSnapshot } from '../../../src/lib/field-note-document/server.js';
import type { ApiRequest, ApiResponse } from '../http.js';
import { readJsonBody, sendJson } from '../http.js';
import { createUserScopedSupabaseClient, createSecretSupabaseClient } from '../supabase.js';
import {
  authorizeFieldNoteConnection,
  CollaborationAuthorizationError,
  createSupabaseAuthorizationDependencies,
  hashShareToken,
  type FieldNoteConnectionAuthorization,
} from './authorization.js';
import { fieldNoteDocumentName } from './documents.js';
import { getFieldNoteCollaborationServer } from './runtime.js';
import { callCollaborationRpc, createCollaborationRpcClient } from './rpc.js';

type EditorApiRequest = ApiRequest & {
  query?: Record<string, string | string[] | undefined>;
  url?: string;
};

type LooseQueryResult = { data: unknown; error: { message: string; code?: string } | null };
type LooseQueryBuilder = PromiseLike<LooseQueryResult> & {
  select(columns: string): LooseQueryBuilder;
  eq(column: string, value: unknown): LooseQueryBuilder;
  in(column: string, values: unknown[]): LooseQueryBuilder;
  is(column: string, value: null): LooseQueryBuilder;
  order(column: string, options: { ascending: boolean }): LooseQueryBuilder;
};
type LooseServiceClient = {
  from(table: string): LooseQueryBuilder;
};

function header(request: ApiRequest, name: string): string {
  const value = request.headers[name.toLowerCase()];
  return (Array.isArray(value) ? value[0] : value)?.trim() ?? '';
}

function bearerToken(request: ApiRequest): string {
  const match = header(request, 'authorization').match(/^Bearer\s+(.+)$/i);
  if (!match) throw new CollaborationAuthorizationError('COLLABORATION_AUTH_REQUIRED');
  return match[1];
}

function queryValue(request: EditorApiRequest, key: string): string {
  const direct = request.query?.[key];
  if (direct) return (Array.isArray(direct) ? direct[0] : direct).trim();
  if (!request.url) return '';
  return new URL(request.url, 'https://community.local').searchParams.get(key)?.trim() ?? '';
}

function noteIdFrom(value: unknown): number {
  const noteId = Number(value);
  if (!Number.isSafeInteger(noteId) || noteId < 1) throw new Error('INVALID_FIELD_NOTE_ID');
  return noteId;
}

function compactText(value: unknown, maxLength: number): string {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
}

function serviceClient(): LooseServiceClient {
  return createSecretSupabaseClient() as unknown as LooseServiceClient;
}

async function queryRows(query: unknown): Promise<Array<Record<string, unknown>>> {
  const { data, error } = await query as LooseQueryResult;
  if (error) {
    const failure = new Error(error.message);
    Object.assign(failure, { code: error.code ?? 'FIELD_NOTE_EDITOR_QUERY_FAILED' });
    throw failure;
  }
  return Array.isArray(data)
    ? data.filter((row): row is Record<string, unknown> => Boolean(row && typeof row === 'object'))
    : [];
}

async function authorize(
  request: ApiRequest,
  noteId: number,
  shareToken = '',
): Promise<{ token: string; result: FieldNoteConnectionAuthorization }> {
  const token = bearerToken(request);
  const result = await authorizeFieldNoteConnection(
    createSupabaseAuthorizationDependencies(),
    {
      documentName: fieldNoteDocumentName(noteId),
      token: JSON.stringify({
        accessToken: token,
        ...(shareToken ? { shareToken } : {}),
      }),
    },
  );
  return { token, result };
}

async function profileMap(userIds: string[]): Promise<Map<string, Record<string, unknown>>> {
  if (!userIds.length) return new Map();
  const rows = await queryRows(
    serviceClient()
      .from('people')
      .select('user_id, display_name, nature_name, avatar_media_id, slug')
      .in('user_id', userIds),
  );
  return new Map(rows.map((row) => [String(row.user_id), row]));
}

async function loadBundle(authorization: FieldNoteConnectionAuthorization) {
  const client = serviceClient();
  const revisionsPromise = queryRows(
    client
      .from('field_note_revisions')
      .select('id, revision_number, source, change_note, changed_by, created_at')
      .eq('field_note_id', authorization.access.fieldNoteId)
      .order('revision_number', { ascending: false }),
  );
  const collaboratorsPromise = authorization.access.canManageCollaboration
    ? queryRows(
      client
        .from('field_note_collaborators')
        .select('user_id, role, invited_by, created_at, updated_at')
        .eq('field_note_id', authorization.access.fieldNoteId)
        .is('revoked_at', null),
    )
    : Promise.resolve([]);
  const shareLinksPromise = authorization.access.canManageCollaboration
    ? queryRows(
      client
        .from('field_note_share_links')
        .select('id, created_at, expires_at, last_used_at')
        .eq('field_note_id', authorization.access.fieldNoteId)
        .is('revoked_at', null),
    )
    : Promise.resolve([]);

  const [revisions, collaborators, shareLinks] = await Promise.all([
    revisionsPromise,
    collaboratorsPromise,
    shareLinksPromise,
  ]);
  const people = await profileMap([
    ...collaborators.map((row) => String(row.user_id)),
    ...revisions.map((row) => String(row.changed_by ?? '')).filter(Boolean),
  ]);

  return {
    access: authorization.access,
    collaborators: collaborators.map((row) => ({
      userId: String(row.user_id),
      role: row.role === 'commenter' ? 'commenter' : 'editor',
      createdAt: String(row.created_at ?? ''),
      displayName: String(people.get(String(row.user_id))?.nature_name
        || people.get(String(row.user_id))?.display_name
        || 'Community member'),
      avatarMediaId: people.get(String(row.user_id))?.avatar_media_id ?? null,
    })),
    revisions: revisions.map((row) => ({
      id: Number(row.id),
      revisionNumber: Number(row.revision_number),
      source: String(row.source ?? 'legacy'),
      changeNote: row.change_note ? String(row.change_note) : null,
      changedBy: row.changed_by ? String(row.changed_by) : null,
      changedByName: row.changed_by
        ? String(people.get(String(row.changed_by))?.nature_name
          || people.get(String(row.changed_by))?.display_name
          || 'Community member')
        : null,
      createdAt: String(row.created_at ?? ''),
    })),
    shareLink: shareLinks[0]
      ? {
        active: true,
        expiresAt: shareLinks[0].expires_at ? String(shareLinks[0].expires_at) : null,
        lastUsedAt: shareLinks[0].last_used_at ? String(shareLinks[0].last_used_at) : null,
      }
      : { active: false, expiresAt: null, lastUsedAt: null },
  };
}

async function listEligibleMembers(noteId: number) {
  const client = serviceClient();
  const memberships = await queryRows(
    client
      .from('community_memberships')
      .select('user_id, status')
      .eq('status', 'active'),
  );
  const userIds = memberships.map((row) => String(row.user_id)).filter(Boolean).slice(0, 200);
  const people = await profileMap(userIds);
  const collaborators = await queryRows(
    client
      .from('field_note_collaborators')
      .select('user_id')
      .eq('field_note_id', noteId)
      .is('revoked_at', null),
  );
  const existing = new Set(collaborators.map((row) => String(row.user_id)));

  return userIds
    .filter((userId) => !existing.has(userId))
    .map((userId) => ({
      userId,
      displayName: String(people.get(userId)?.nature_name
        || people.get(userId)?.display_name
        || 'Community member'),
      avatarMediaId: people.get(userId)?.avatar_media_id ?? null,
    }))
    .sort((a, b) => a.displayName.localeCompare(b.displayName, 'zh-CN'))
    .slice(0, 80);
}

function errorStatus(error: unknown): number {
  const code = error instanceof CollaborationAuthorizationError
    ? error.code
    : error instanceof Error
      ? String((error as Error & { code?: string }).code ?? error.message)
      : '';
  if (code.includes('AUTH') || code.includes('SESSION')) return 401;
  if (code.includes('DENIED') || code.includes('NOT_ALLOWED') || code === '42501') return 403;
  if (code.includes('NOT_FOUND') || code === 'P0002') return 404;
  if (code.includes('INVALID') || code.includes('UNSAFE') || code === '22023') return 400;
  return 500;
}

export async function handleFieldNoteEditor(request: EditorApiRequest, response: ApiResponse) {
  try {
    if (request.method === 'GET') {
      const noteId = noteIdFrom(queryValue(request, 'noteId'));
      const shareToken = header(request, 'x-field-note-share-token');
      const { result } = await authorize(request, noteId, shareToken);
      return sendJson(response, 200, await loadBundle(result));
    }

    if (request.method !== 'POST') {
      return sendJson(response, 405, { error: 'METHOD_NOT_ALLOWED' });
    }

    const body = await readJsonBody(request);
    const action = compactText(body.action, 40);
    const noteId = noteIdFrom(body.noteId);
    const shareToken = compactText(body.shareToken, 512)
      || header(request, 'x-field-note-share-token');
    const { token, result } = await authorize(request, noteId, shareToken);
    const rpc = createCollaborationRpcClient();

    if (action === 'checkpoint') {
      if (!result.access.canWrite) {
        throw new CollaborationAuthorizationError('FIELD_NOTE_EDIT_ACCESS_DENIED');
      }
      const title = compactText(body.title, 240);
      if (!title) throw new Error('INVALID_FIELD_NOTE_TITLE');
      const blocks = body.blocks as FieldNoteBlocks;
      if (!Array.isArray(blocks)) throw new Error('INVALID_FIELD_NOTE_CONTENT');
      const snapshot = await createFieldNoteSnapshot(blocks);
      const submit = body.submit === true;
      const automatic = body.automatic === true && !submit;
      const revisionId = await callCollaborationRpc(rpc, 'checkpoint_field_note_server', {
        target_user_id: result.context.userId,
        target_field_note_id: noteId,
        target_title: title,
        target_excerpt: compactText(body.excerpt, 2_000),
        target_content: snapshot.plainText,
        target_content_json: snapshot.blocks,
        target_content_html: snapshot.html,
        target_schema_version: snapshot.schemaVersion,
        target_source: submit ? 'submitted' : automatic ? 'automatic' : 'manual',
        target_change_note: compactText(body.changeNote, 500) || null,
        candidate_share_token_hash: result.context.shareTokenHash,
        create_revision: !automatic,
      });

      let nextStatus = result.access.status;
      if (submit) {
        const userClient = createUserScopedSupabaseClient(token);
        const { data, error } = await userClient
          .from('field_notes')
          .update({ status: 'submitted' })
          .eq('id', noteId)
          .select('status')
          .single();
        if (error) throw error;
        nextStatus = data.status;
        getFieldNoteCollaborationServer().hocuspocus.closeConnections(fieldNoteDocumentName(noteId));
      }
      return sendJson(response, 200, {
        revisionId: Number(revisionId) || null,
        status: nextStatus,
        savedAt: new Date().toISOString(),
      });
    }

    if (action === 'resolve-users') {
      const userIds = Array.isArray(body.userIds)
        ? body.userIds
          .map((value) => compactText(value, 80))
          .filter((value) => /^[0-9a-f-]{36}$/i.test(value))
          .slice(0, 50)
        : [];
      const people = await profileMap(userIds);
      return sendJson(response, 200, {
        users: userIds.map((userId) => ({
          id: userId,
          username: String(people.get(userId)?.nature_name
            || people.get(userId)?.display_name
            || 'Community member'),
          avatarUrl: '',
        })),
      });
    }

    if (!result.access.canManageCollaboration) {
      throw new CollaborationAuthorizationError('FIELD_NOTE_COLLABORATION_ACCESS_DENIED');
    }

    if (action === 'members') {
      return sendJson(response, 200, { members: await listEligibleMembers(noteId) });
    }
    if (action === 'invite') {
      const targetUserId = compactText(body.userId, 80);
      const role = body.role === 'commenter' ? 'commenter' : 'editor';
      if (!/^[0-9a-f-]{36}$/i.test(targetUserId)) throw new Error('INVALID_COLLABORATOR_ID');
      await callCollaborationRpc(rpc, 'invite_field_note_collaborator_server', {
        actor_user_id: result.context.userId,
        target_field_note_id: noteId,
        target_user_id: targetUserId,
        target_role: role,
      });
      return sendJson(response, 200, { bundle: await loadBundle(result) });
    }
    if (action === 'revoke') {
      const targetUserId = compactText(body.userId, 80);
      if (!/^[0-9a-f-]{36}$/i.test(targetUserId)) throw new Error('INVALID_COLLABORATOR_ID');
      await callCollaborationRpc(rpc, 'revoke_field_note_collaborator_server', {
        actor_user_id: result.context.userId,
        target_field_note_id: noteId,
        target_user_id: targetUserId,
      });
      getFieldNoteCollaborationServer().hocuspocus.closeConnections(fieldNoteDocumentName(noteId));
      return sendJson(response, 200, { bundle: await loadBundle(result) });
    }
    if (action === 'create-share-link') {
      const rawToken = randomBytes(32).toString('base64url');
      const expiresAt = compactText(body.expiresAt, 80) || null;
      await callCollaborationRpc(rpc, 'create_field_note_share_link_server', {
        actor_user_id: result.context.userId,
        target_field_note_id: noteId,
        target_token_hash: hashShareToken(rawToken),
        target_expires_at: expiresAt,
      });
      return sendJson(response, 200, { shareToken: rawToken, expiresAt });
    }
    if (action === 'revoke-share-link') {
      await callCollaborationRpc(rpc, 'revoke_field_note_share_link_server', {
        actor_user_id: result.context.userId,
        target_field_note_id: noteId,
      });
      getFieldNoteCollaborationServer().hocuspocus.closeConnections(fieldNoteDocumentName(noteId));
      return sendJson(response, 200, { revoked: true });
    }

    return sendJson(response, 400, { error: 'FIELD_NOTE_EDITOR_ACTION_INVALID' });
  } catch (error) {
    const status = errorStatus(error);
    if (status === 500) console.error('Field Note editor API failed.', error);
    const code = error instanceof CollaborationAuthorizationError
      ? error.code
      : error instanceof Error
        ? String((error as Error & { code?: string }).code ?? error.message)
        : 'FIELD_NOTE_EDITOR_FAILED';
    return sendJson(response, status, { error: code });
  }
}

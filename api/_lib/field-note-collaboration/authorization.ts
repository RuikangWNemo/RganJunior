import { createHash } from 'node:crypto';

import { normalizeFieldNoteBlocks } from '../../../src/lib/field-note-document/legacy.js';
import type { FieldNoteEditorAccess } from '../../../src/lib/field-note-document/types.js';
import { createUserScopedSupabaseClient } from '../supabase.js';
import { parseFieldNoteDocumentName } from './documents.js';
import {
  callCollaborationRpc,
  createCollaborationRpcClient,
  firstRpcRow,
  type CollaborationRpcClient,
} from './rpc.js';

interface CollaborationTokenPayload {
  accessToken: string;
  shareToken?: string;
}

export interface FieldNoteCollaborationContext {
  userId: string;
  noteId: number;
  canWrite: boolean;
  canComment: boolean;
  displayName: string;
  avatarMediaId: number | null;
  shareTokenHash: string | null;
}

export interface FieldNoteConnectionAuthorization {
  access: FieldNoteEditorAccess;
  context: FieldNoteCollaborationContext;
}

export class CollaborationAuthorizationError extends Error {
  readonly code: string;

  constructor(code: string) {
    super(code);
    this.name = 'CollaborationAuthorizationError';
    this.code = code;
  }
}

export interface CollaborationAuthorizationDependencies {
  verifyUser(accessToken: string): Promise<{ id: string } | null>;
  loadAccess(input: {
    userId: string;
    noteId: number;
    shareTokenHash: string | null;
  }): Promise<Record<string, unknown> | null>;
}

function compactToken(value: unknown, maxLength: number): string {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
}

export function parseCollaborationToken(value: unknown): CollaborationTokenPayload {
  const raw = compactToken(value, 12_000);
  if (!raw) throw new CollaborationAuthorizationError('COLLABORATION_AUTH_REQUIRED');

  if (!raw.startsWith('{')) return { accessToken: raw };

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new CollaborationAuthorizationError('COLLABORATION_TOKEN_INVALID');
  }
  if (!parsed || typeof parsed !== 'object') {
    throw new CollaborationAuthorizationError('COLLABORATION_TOKEN_INVALID');
  }

  const record = parsed as Record<string, unknown>;
  const accessToken = compactToken(record.accessToken, 10_000);
  const shareToken = compactToken(record.shareToken, 512);
  if (!accessToken) throw new CollaborationAuthorizationError('COLLABORATION_AUTH_REQUIRED');
  return { accessToken, ...(shareToken ? { shareToken } : {}) };
}

export function hashShareToken(value: string | undefined): string | null {
  return value
    ? createHash('sha256').update(value, 'utf8').digest('hex')
    : null;
}

function asBoolean(value: unknown): boolean {
  return value === true;
}

function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function asNullableNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isSafeInteger(value) ? value : null;
}

function mapAccess(row: Record<string, unknown>, userId: string): FieldNoteEditorAccess {
  const fieldNoteId = asNullableNumber(row.field_note_id);
  if (!fieldNoteId) throw new CollaborationAuthorizationError('FIELD_NOTE_NOT_FOUND');

  const mode = row.collaboration_mode === 'members_with_link'
    ? 'members_with_link'
    : 'invite_only';
  const collaboratorRole = row.collaborator_role === 'editor' || row.collaborator_role === 'commenter'
    ? row.collaborator_role
    : null;

  return {
    fieldNoteId,
    status: asString(row.note_status),
    collaborationMode: mode,
    canRead: asBoolean(row.can_read),
    canWrite: asBoolean(row.can_write),
    canComment: asBoolean(row.can_comment),
    shareLinkUsed: asBoolean(row.share_link_used),
    collaboratorRole,
    title: asString(row.title),
    excerpt: asString(row.excerpt),
    legacyContent: asString(row.legacy_content),
    contentJson: Array.isArray(row.content_json)
      ? normalizeFieldNoteBlocks(row.content_json)
      : null,
    contentSchemaVersion: asNullableNumber(row.content_schema_version) ?? 1,
    canManageCollaboration: asBoolean(row.can_manage_collaboration),
    visibility: row.note_visibility === 'public' || row.note_visibility === 'members'
      ? row.note_visibility
      : 'private',
    language: row.note_language === 'en' ? 'en' : 'zh',
    isOwner: asBoolean(row.is_owner),
    user: {
      id: userId,
      displayName: asString(row.user_display_name, 'Community member'),
      avatarMediaId: asNullableNumber(row.user_avatar_media_id),
    },
  };
}

export async function authorizeFieldNoteConnection(
  dependencies: CollaborationAuthorizationDependencies,
  input: { documentName: string; token: unknown },
): Promise<FieldNoteConnectionAuthorization> {
  const noteId = parseFieldNoteDocumentName(input.documentName);
  const token = parseCollaborationToken(input.token);
  const user = await dependencies.verifyUser(token.accessToken);
  if (!user) throw new CollaborationAuthorizationError('COLLABORATION_SESSION_INVALID');

  const shareTokenHash = hashShareToken(token.shareToken);
  const row = await dependencies.loadAccess({ userId: user.id, noteId, shareTokenHash });
  if (!row) throw new CollaborationAuthorizationError('FIELD_NOTE_NOT_FOUND');

  const access = mapAccess(row, user.id);
  if (!access.canRead) throw new CollaborationAuthorizationError('FIELD_NOTE_ACCESS_DENIED');

  return {
    access,
    context: {
      userId: user.id,
      noteId,
      canWrite: access.canWrite,
      canComment: access.canComment,
      displayName: access.user.displayName,
      avatarMediaId: access.user.avatarMediaId,
      shareTokenHash,
    },
  };
}

export function createSupabaseAuthorizationDependencies(
  rpcClient: CollaborationRpcClient = createCollaborationRpcClient(),
): CollaborationAuthorizationDependencies {
  return {
    async verifyUser(accessToken) {
      const client = createUserScopedSupabaseClient(accessToken);
      const { data, error } = await client.auth.getUser(accessToken);
      return error || !data.user ? null : { id: data.user.id };
    },
    async loadAccess({ userId, noteId, shareTokenHash }) {
      const data = await callCollaborationRpc(
        rpcClient,
        'authorize_field_note_collaboration_server',
        {
          target_user_id: userId,
          target_field_note_id: noteId,
          candidate_share_token_hash: shareTokenHash,
        },
      );
      return firstRpcRow(data);
    },
  };
}

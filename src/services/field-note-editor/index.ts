import type { User } from '@blocknote/core';

import type { FieldNoteBlocks } from '@/lib/field-note-document/schema';
import type { FieldNoteEditorAccess } from '@/lib/field-note-document/types';

export interface FieldNoteCollaborator {
  userId: string;
  role: 'editor' | 'commenter';
  displayName: string;
  avatarMediaId: number | null;
  createdAt: string;
}

export interface FieldNoteRevisionSummary {
  id: number;
  revisionNumber: number;
  source: string;
  changeNote: string | null;
  changedBy: string | null;
  changedByName: string | null;
  createdAt: string;
}

export interface FieldNoteEditorBundle {
  access: FieldNoteEditorAccess;
  collaborators: FieldNoteCollaborator[];
  revisions: FieldNoteRevisionSummary[];
  shareLink: {
    active: boolean;
    expiresAt: string | null;
    lastUsedAt: string | null;
  };
}

export interface EligibleFieldNoteMember {
  userId: string;
  displayName: string;
  avatarMediaId: number | null;
}

interface RequestOptions {
  accessToken: string;
  shareToken?: string;
  body?: Record<string, unknown>;
  method?: 'GET' | 'POST';
}

function collaborationHeaders(options: RequestOptions): Record<string, string> {
  return {
    Authorization: `Bearer ${options.accessToken}`,
    ...(options.shareToken ? { 'X-Field-Note-Share-Token': options.shareToken } : {}),
    ...(options.body ? { 'Content-Type': 'application/json' } : {}),
  };
}

async function editorRequest<T>(path: string, options: RequestOptions): Promise<T> {
  const response = await fetch(path, {
    method: options.method ?? (options.body ? 'POST' : 'GET'),
    headers: collaborationHeaders(options),
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const contentType = response.headers.get('content-type')?.toLowerCase() ?? '';
  const responseText = await response.text();
  if (!contentType.includes('application/json')) {
    throw new Error('FIELD_NOTE_EDITOR_API_UNAVAILABLE');
  }

  let result: T & { error?: string };
  try {
    result = (responseText ? JSON.parse(responseText) : {}) as T & { error?: string };
  } catch {
    throw new Error('FIELD_NOTE_EDITOR_API_INVALID_RESPONSE');
  }
  if (!response.ok) throw new Error(result.error || 'FIELD_NOTE_EDITOR_REQUEST_FAILED');
  return result;
}

export function fieldNoteCollaborationToken(accessToken: string, shareToken?: string): string {
  return JSON.stringify({ accessToken, ...(shareToken ? { shareToken } : {}) });
}

export async function getFieldNoteEditorBundle(
  noteId: number,
  accessToken: string,
  shareToken?: string,
): Promise<FieldNoteEditorBundle> {
  return editorRequest<FieldNoteEditorBundle>(
    `/api/community/field-note-editor?noteId=${encodeURIComponent(noteId)}`,
    { accessToken, shareToken },
  );
}

export async function checkpointFieldNote(input: {
  noteId: number;
  accessToken: string;
  shareToken?: string;
  title: string;
  excerpt: string;
  blocks: FieldNoteBlocks;
  submit?: boolean;
  automatic?: boolean;
  changeNote?: string;
}) {
  return editorRequest<{ revisionId: number | null; status: string; savedAt: string }>(
    '/api/community/field-note-editor',
    {
      accessToken: input.accessToken,
      shareToken: input.shareToken,
      body: {
        action: 'checkpoint',
        noteId: input.noteId,
        shareToken: input.shareToken,
        title: input.title,
        excerpt: input.excerpt,
        blocks: input.blocks,
        submit: input.submit === true,
        automatic: input.automatic === true,
        changeNote: input.changeNote,
      },
    },
  );
}

async function collaborationAction<T>(input: {
  action: string;
  noteId: number;
  accessToken: string;
  shareToken?: string;
  values?: Record<string, unknown>;
}): Promise<T> {
  return editorRequest<T>('/api/community/field-note-editor', {
    accessToken: input.accessToken,
    shareToken: input.shareToken,
    body: {
      action: input.action,
      noteId: input.noteId,
      shareToken: input.shareToken,
      ...input.values,
    },
  });
}

export async function listEligibleFieldNoteMembers(
  noteId: number,
  accessToken: string,
): Promise<EligibleFieldNoteMember[]> {
  const result = await collaborationAction<{ members: EligibleFieldNoteMember[] }>({
    action: 'members',
    noteId,
    accessToken,
  });
  return result.members;
}

export async function inviteFieldNoteCollaborator(input: {
  noteId: number;
  accessToken: string;
  userId: string;
  role: 'editor' | 'commenter';
}) {
  return collaborationAction<{ bundle: FieldNoteEditorBundle }>({
    action: 'invite',
    noteId: input.noteId,
    accessToken: input.accessToken,
    values: { userId: input.userId, role: input.role },
  });
}

export async function revokeFieldNoteCollaborator(
  noteId: number,
  accessToken: string,
  userId: string,
) {
  return collaborationAction<{ bundle: FieldNoteEditorBundle }>({
    action: 'revoke',
    noteId,
    accessToken,
    values: { userId },
  });
}

export async function createFieldNoteShareLink(
  noteId: number,
  accessToken: string,
  expiresAt?: string,
) {
  return collaborationAction<{ shareToken: string; expiresAt: string | null }>({
    action: 'create-share-link',
    noteId,
    accessToken,
    values: { expiresAt },
  });
}

export async function revokeFieldNoteShareLink(noteId: number, accessToken: string) {
  return collaborationAction<{ revoked: boolean }>({
    action: 'revoke-share-link',
    noteId,
    accessToken,
  });
}

export async function resolveFieldNoteUsers(input: {
  noteId: number;
  accessToken: string;
  shareToken?: string;
  userIds: string[];
}): Promise<User[]> {
  const result = await collaborationAction<{ users: User[] }>({
    action: 'resolve-users',
    noteId: input.noteId,
    accessToken: input.accessToken,
    shareToken: input.shareToken,
    values: { userIds: input.userIds },
  });
  return result.users;
}

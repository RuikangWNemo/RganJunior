import {
  DefaultThreadStoreAuth,
  type CommentData,
  type ThreadData,
} from '@blocknote/core/comments';
import { YjsThreadStore } from '@blocknote/core/yjs';
import type { DirectConnection, Document } from '@hocuspocus/server';

import {
  FIELD_NOTE_YJS_FRAGMENT,
  FIELD_NOTE_YJS_THREADS,
} from '../../../src/lib/field-note-document/schema.js';
import type { ApiRequest, ApiResponse } from '../http.js';
import { readJsonBody, sendJson } from '../http.js';
import {
  authorizeFieldNoteConnection,
  CollaborationAuthorizationError,
  createSupabaseAuthorizationDependencies,
  type FieldNoteCollaborationContext,
} from './authorization.js';
import { fieldNoteDocumentName } from './documents.js';
import { getFieldNoteCollaborationServer } from './runtime.js';
import { callCollaborationRpc, createCollaborationRpcClient } from './rpc.js';
import { setCommentMark, type CommentYjsSelection } from './set-comment-mark.js';

type CommentEvent = 'created' | 'updated' | 'replied' | 'resolved' | 'reopened' | 'deleted' | 'reacted';

type CommentApiRequest = ApiRequest & {
  query?: Record<string, string | string[] | undefined>;
  url?: string;
};

type FieldNoteDirectConnection = DirectConnection & {
  document: Document | null;
};

export interface FieldNoteCommentDependencies {
  authorize(input: {
    noteId: number;
    accessToken: string;
    shareToken?: string;
  }): Promise<{
    context: FieldNoteCollaborationContext;
    canWrite: boolean;
    canComment: boolean;
  }>;
  openDocument(
    documentName: string,
    context: FieldNoteCollaborationContext,
  ): Promise<FieldNoteDirectConnection>;
  record(input: {
    context: FieldNoteCollaborationContext;
    threadId: string;
    snapshot: Record<string, unknown>;
    event: CommentEvent;
    resolved: boolean;
  }): Promise<void>;
}

interface CommentRoute {
  noteId: number;
  segments: string[];
}

function header(request: ApiRequest, name: string): string {
  const value = request.headers[name.toLowerCase()];
  return (Array.isArray(value) ? value[0] : value)?.trim() ?? '';
}

function accessToken(request: ApiRequest): string {
  const match = header(request, 'authorization').match(/^Bearer\s+(.+)$/i);
  if (!match) throw new CollaborationAuthorizationError('COLLABORATION_AUTH_REQUIRED');
  return match[1];
}

function routeFromRequest(request: CommentApiRequest): CommentRoute {
  const queryPath = request.query?.path;
  let segments = (Array.isArray(queryPath) ? queryPath : queryPath?.split('/'))
    ?.filter(Boolean)
    .map(decodeURIComponent);

  if (!segments?.length && request.url) {
    const pathname = new URL(request.url, 'https://community.local').pathname;
    const marker = '/api/community/field-note-comments/';
    const suffix = pathname.startsWith(marker) ? pathname.slice(marker.length) : '';
    segments = suffix.split('/').filter(Boolean).map(decodeURIComponent);
  }

  const noteId = Number(segments?.shift());
  if (!Number.isSafeInteger(noteId) || noteId < 1) {
    throw new Error('FIELD_NOTE_COMMENT_ROUTE_INVALID');
  }
  if (segments?.some((segment) => !segment || segment.length > 180)) {
    throw new Error('FIELD_NOTE_COMMENT_ROUTE_INVALID');
  }
  return { noteId, segments: segments ?? [] };
}

function validatePayload(value: Record<string, unknown>): void {
  const serialized = JSON.stringify(value);
  if (serialized.length > 48_000) throw new Error('FIELD_NOTE_COMMENT_TOO_LARGE');
}

function validateId(value: string | undefined): string {
  if (!value || value.length > 160 || !/^[A-Za-z0-9_-]+$/.test(value)) {
    throw new Error('FIELD_NOTE_COMMENT_ID_INVALID');
  }
  return value;
}

function threadSnapshot(thread: ThreadData): Record<string, unknown> {
  return JSON.parse(JSON.stringify(thread)) as Record<string, unknown>;
}

function deletedThreadSnapshot(threadId: string): Record<string, unknown> {
  return { id: threadId, type: 'thread', deleted: true };
}

function createDefaultDependencies(): FieldNoteCommentDependencies {
  const authorization = createSupabaseAuthorizationDependencies();
  const rpc = createCollaborationRpcClient();

  return {
    async authorize({ noteId, accessToken: token, shareToken }) {
      const result = await authorizeFieldNoteConnection(authorization, {
        documentName: fieldNoteDocumentName(noteId),
        token: JSON.stringify({ accessToken: token, ...(shareToken ? { shareToken } : {}) }),
      });
      return {
        context: result.context,
        canWrite: result.access.canWrite,
        canComment: result.access.canComment,
      };
    },
    openDocument(documentName, context) {
      return getFieldNoteCollaborationServer().hocuspocus.openDirectConnection(
        documentName,
        context,
      ) as Promise<FieldNoteDirectConnection>;
    },
    async record({ context, threadId, snapshot, event, resolved }) {
      await callCollaborationRpc(rpc, 'record_field_note_comment_server', {
        actor_user_id: context.userId,
        target_field_note_id: context.noteId,
        target_thread_id: threadId,
        target_thread_snapshot: snapshot,
        target_event_type: event,
        target_resolved: resolved,
        candidate_share_token_hash: context.shareTokenHash,
      });
    },
  };
}

async function mutate<T>(
  connection: FieldNoteDirectConnection,
  operation: (document: Document) => Promise<T> | T,
): Promise<T> {
  let result: Promise<T> | T | undefined;
  await connection.transact((document) => {
    result = operation(document);
  });
  return await result as T;
}

function softDelete(request: CommentApiRequest): boolean {
  if (!request.url) return false;
  return new URL(request.url, 'https://community.local').searchParams.get('soft') === 'true';
}

function errorStatus(error: unknown): number {
  const code = error instanceof CollaborationAuthorizationError ? error.code : '';
  if (code.includes('AUTH') || code.includes('SESSION')) return 401;
  if (code.includes('DENIED')) return 403;
  if (code.includes('NOT_FOUND')) return 404;
  const message = error instanceof Error ? error.message : '';
  if (/not authorized/i.test(message)) return 403;
  if (/not found/i.test(message)) return 404;
  if (/INVALID|TOO_LARGE|REQUIRED/.test(message)) return 400;
  return 500;
}

export async function handleFieldNoteComments(
  request: CommentApiRequest,
  response: ApiResponse,
  dependencies: FieldNoteCommentDependencies = createDefaultDependencies(),
) {
  let connection: FieldNoteDirectConnection | undefined;
  const flushConnection = async () => {
    if (!connection) return;
    const activeConnection = connection;
    connection = undefined;
    await activeConnection.disconnect();
  };

  try {
    const route = routeFromRequest(request);
    const payload = request.method === 'POST' || request.method === 'PUT'
      ? await readJsonBody(request)
      : {};
    validatePayload(payload);

    const authorization = await dependencies.authorize({
      noteId: route.noteId,
      accessToken: accessToken(request),
      shareToken: header(request, 'x-field-note-share-token') || undefined,
    });
    if (!authorization.canComment) {
      throw new CollaborationAuthorizationError('FIELD_NOTE_COMMENT_ACCESS_DENIED');
    }

    connection = await dependencies.openDocument(
      fieldNoteDocumentName(route.noteId),
      authorization.context,
    );
    const document = connection.document;
    if (!document) throw new Error('FIELD_NOTE_DOCUMENT_NOT_FOUND');
    const threadStore = new YjsThreadStore(
      authorization.context.userId,
      document.getMap(FIELD_NOTE_YJS_THREADS),
      new DefaultThreadStoreAuth(
        authorization.context.userId,
        authorization.canWrite ? 'editor' : 'comment',
      ),
    );

    const [threadSegment, action, commentSegment, reactionSegment] = route.segments;
    const method = request.method?.toUpperCase();

    if (method === 'POST' && route.segments.length === 0) {
      const thread = await mutate(connection, () => threadStore.createThread(payload as never));
      await flushConnection();
      await dependencies.record({
        context: authorization.context,
        threadId: thread.id,
        snapshot: threadSnapshot(thread),
        event: 'created',
        resolved: false,
      });
      return sendJson(response, 201, thread);
    }

    const threadId = validateId(threadSegment);
    if (method === 'POST' && action === 'addToDocument' && route.segments.length === 2) {
      const selection = (payload.selection as Record<string, unknown> | undefined)?.yjs;
      if (!selection || typeof selection !== 'object') {
        throw new Error('FIELD_NOTE_COMMENT_SELECTION_INVALID');
      }
      await mutate(connection, (activeDocument) => setCommentMark(
        activeDocument,
        activeDocument.getXmlFragment(FIELD_NOTE_YJS_FRAGMENT),
        selection as unknown as CommentYjsSelection,
        threadId,
      ));
      await flushConnection();
      return sendJson(response, 200, { message: 'Thread added to document.' });
    }

    if (method === 'POST' && action === 'comments' && route.segments.length === 2) {
      const comment = await mutate(connection, () => threadStore.addComment({
        threadId,
        ...payload,
      } as never));
      const thread = threadStore.getThread(threadId);
      await flushConnection();
      await dependencies.record({
        context: authorization.context,
        threadId,
        snapshot: threadSnapshot(thread),
        event: 'replied',
        resolved: thread.resolved,
      });
      return sendJson(response, 201, comment);
    }

    const commentId = action === 'comments' ? validateId(commentSegment) : undefined;
    if (method === 'PUT' && commentId && route.segments.length === 3) {
      await mutate(connection, () => threadStore.updateComment({
        threadId,
        commentId,
        ...payload,
      } as never));
      const thread = threadStore.getThread(threadId);
      await flushConnection();
      await dependencies.record({
        context: authorization.context,
        threadId,
        snapshot: threadSnapshot(thread),
        event: 'updated',
        resolved: thread.resolved,
      });
      return sendJson(response, 200, { message: 'Comment updated.' });
    }

    if (method === 'DELETE' && commentId && route.segments.length === 3) {
      await mutate(connection, () => threadStore.deleteComment({
        threadId,
        commentId,
        softDelete: softDelete(request),
      }));
      let thread: ThreadData | undefined;
      try { thread = threadStore.getThread(threadId); } catch { thread = undefined; }
      await flushConnection();
      await dependencies.record({
        context: authorization.context,
        threadId,
        snapshot: thread ? threadSnapshot(thread) : deletedThreadSnapshot(threadId),
        event: thread ? 'updated' : 'deleted',
        resolved: thread?.resolved ?? false,
      });
      return sendJson(response, 200, { message: 'Comment deleted.' });
    }

    if (method === 'DELETE' && route.segments.length === 1) {
      await mutate(connection, () => threadStore.deleteThread({ threadId }));
      await flushConnection();
      await dependencies.record({
        context: authorization.context,
        threadId,
        snapshot: deletedThreadSnapshot(threadId),
        event: 'deleted',
        resolved: false,
      });
      return sendJson(response, 200, { message: 'Thread deleted.' });
    }

    if (method === 'POST' && (action === 'resolve' || action === 'unresolve') && route.segments.length === 2) {
      await mutate(connection, () => action === 'resolve'
        ? threadStore.resolveThread({ threadId })
        : threadStore.unresolveThread({ threadId }));
      const thread = threadStore.getThread(threadId);
      await flushConnection();
      await dependencies.record({
        context: authorization.context,
        threadId,
        snapshot: threadSnapshot(thread),
        event: action === 'resolve' ? 'resolved' : 'reopened',
        resolved: thread.resolved,
      });
      return sendJson(response, 200, { message: action === 'resolve' ? 'Thread resolved.' : 'Thread reopened.' });
    }

    if (
      action === 'comments'
      && commentId
      && reactionSegment === 'reactions'
      && route.segments.length >= 4
    ) {
      const emoji = method === 'POST'
        ? String(payload.emoji ?? '').trim()
        : decodeURIComponent(route.segments[4] ?? '').trim();
      if (!emoji || emoji.length > 24) throw new Error('FIELD_NOTE_COMMENT_REACTION_INVALID');
      if (method === 'POST' && route.segments.length === 4) {
        await mutate(connection, () => threadStore.addReaction({ threadId, commentId, emoji }));
      } else if (method === 'DELETE' && route.segments.length === 5) {
        await mutate(connection, () => threadStore.deleteReaction({ threadId, commentId, emoji }));
      } else {
        return sendJson(response, 405, { error: 'METHOD_NOT_ALLOWED' });
      }
      const thread = threadStore.getThread(threadId);
      await flushConnection();
      await dependencies.record({
        context: authorization.context,
        threadId,
        snapshot: threadSnapshot(thread),
        event: 'reacted',
        resolved: thread.resolved,
      });
      return sendJson(response, 200, { message: 'Reaction updated.' });
    }

    return sendJson(response, 405, { error: 'METHOD_NOT_ALLOWED' });
  } catch (error) {
    const status = errorStatus(error);
    if (status === 500) console.error('Field Note comment API failed.', error);
    const code = error instanceof CollaborationAuthorizationError
      ? error.code
      : error instanceof Error
        ? error.message
        : 'FIELD_NOTE_COMMENT_FAILED';
    return sendJson(response, status, { error: code });
  } finally {
    await flushConnection();
  }
}

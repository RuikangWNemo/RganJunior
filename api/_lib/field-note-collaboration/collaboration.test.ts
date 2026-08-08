import { describe, expect, it, vi } from 'vitest';
import { Document } from '@hocuspocus/server';
import * as Y from 'yjs';

import { fieldNoteYDocToBlocks } from '../../../src/lib/field-note-document/server.js';
import { fieldNoteBlocksToPlainText } from '../../../src/lib/field-note-document/text.js';
import {
  authorizeFieldNoteConnection,
  CollaborationAuthorizationError,
  hashShareToken,
  parseCollaborationToken,
} from './authorization.js';
import { fieldNoteDocumentName, parseFieldNoteDocumentName } from './documents.js';
import { assertClientUpdateDoesNotChangeComments } from './comment-guard.js';
import {
  handleFieldNoteComments,
  type FieldNoteCommentDependencies,
} from './comments.js';
import {
  createFieldNotePersistence,
  postgresByteaToUint8Array,
  uint8ArrayToPostgresBytea,
} from './persistence.js';
import { parseRedisUrl } from './redis.js';
import type { CollaborationRpcClient } from './rpc.js';
import { createFieldNoteCollaborationServer } from './server.js';

function accessRow(overrides: Record<string, unknown> = {}) {
  return {
    field_note_id: 42,
    note_status: 'draft',
    collaboration_mode: 'invite_only',
    can_read: true,
    can_write: true,
    can_comment: true,
    share_link_used: false,
    collaborator_role: 'editor',
    title: 'Shared story',
    excerpt: 'A summary',
    legacy_content: 'Legacy body',
    content_json: null,
    content_schema_version: 1,
    user_display_name: '山风',
    user_avatar_media_id: null,
    can_manage_collaboration: true,
    note_visibility: 'private',
    note_language: 'zh',
    is_owner: true,
    ...overrides,
  };
}

describe('field-note collaboration authorization', () => {
  it('accepts only stable field-note document names', () => {
    expect(fieldNoteDocumentName(42)).toBe('field-note:42');
    expect(parseFieldNoteDocumentName('field-note:42')).toBe(42);
    expect(() => parseFieldNoteDocumentName('field-note:0')).toThrow('INVALID_FIELD_NOTE_DOCUMENT');
    expect(() => parseFieldNoteDocumentName('../field-note:42')).toThrow('INVALID_FIELD_NOTE_DOCUMENT');
  });

  it('supports a plain JWT and a structured JWT/share payload', () => {
    expect(parseCollaborationToken('jwt-token')).toEqual({ accessToken: 'jwt-token' });
    expect(parseCollaborationToken(JSON.stringify({
      accessToken: 'jwt-token',
      shareToken: 'share-secret',
    }))).toEqual({ accessToken: 'jwt-token', shareToken: 'share-secret' });
    expect(hashShareToken('share-secret')).toMatch(/^[0-9a-f]{64}$/);
  });

  it('maps server authorization and rejects a non-readable document', async () => {
    const verifyUser = vi.fn(async () => ({ id: 'member-1' }));
    const loadAccess = vi.fn(async () => accessRow());
    const authorized = await authorizeFieldNoteConnection(
      { verifyUser, loadAccess },
      {
        documentName: 'field-note:42',
        token: JSON.stringify({ accessToken: 'jwt', shareToken: 'secret' }),
      },
    );

    expect(authorized.access.canWrite).toBe(true);
    expect(authorized.context).toMatchObject({
      noteId: 42,
      userId: 'member-1',
      displayName: '山风',
    });
    expect(loadAccess).toHaveBeenCalledWith(expect.objectContaining({
      shareTokenHash: hashShareToken('secret'),
    }));

    await expect(authorizeFieldNoteConnection(
      {
        verifyUser,
        loadAccess: async () => accessRow({ can_read: false, can_write: false }),
      },
      { documentName: 'field-note:42', token: 'jwt' },
    )).rejects.toEqual(expect.objectContaining<Partial<CollaborationAuthorizationError>>({
      code: 'FIELD_NOTE_ACCESS_DENIED',
    }));
  });
});

describe('field-note Yjs persistence', () => {
  it('round-trips Postgres bytea values', () => {
    const source = Uint8Array.from([1, 2, 250, 255]);
    expect(uint8ArrayToPostgresBytea(source)).toBe('\\x0102faff');
    expect(postgresByteaToUint8Array('\\x0102faff')).toEqual(source);
  });

  it('atomically initializes a legacy document and materializes safe snapshots', async () => {
    const calls: Array<{ name: string; parameters: Record<string, unknown> }> = [];
    const client: CollaborationRpcClient = {
      async rpc(name, parameters = {}) {
        calls.push({ name, parameters });
        if (name === 'load_field_note_collab_document_server') {
          return { data: [], error: null };
        }
        if (name === 'load_field_note_collab_seed_server') {
          return {
            data: [{ content_json: null, legacy_content: 'First\n\nSecond', schema_version: 1 }],
            error: null,
          };
        }
        if (name === 'initialize_field_note_collab_document_server') {
          return {
            data: [{ yjs_state: parameters.candidate_yjs_state, schema_version: 1 }],
            error: null,
          };
        }
        if (name === 'materialize_field_note_server') {
          return { data: true, error: null };
        }
        return { data: null, error: null };
      },
    };
    const persistence = createFieldNotePersistence(client);
    const state = await persistence.fetch('field-note:42');
    expect(state).toBeInstanceOf(Uint8Array);

    const document = new Y.Doc();
    Y.applyUpdate(document, state as Uint8Array);
    expect(fieldNoteBlocksToPlainText(fieldNoteYDocToBlocks(document))).toBe('First\n\nSecond');
    expect(calls.map((call) => call.name)).toContain('initialize_field_note_collab_document_server');

    expect(await persistence.materialize('field-note:42', document)).toBe(true);
    const materialize = calls.find((call) => call.name === 'materialize_field_note_server');
    expect(materialize?.parameters).toMatchObject({
      target_field_note_id: 42,
      target_content: 'First\n\nSecond',
      target_schema_version: 1,
    });
    expect(String(materialize?.parameters.target_content_html)).not.toContain('<script');
  });
});

describe('collaboration server configuration', () => {
  it('parses TLS Redis URLs and fails closed when Redis is required', () => {
    expect(parseRedisUrl('rediss://member:secret@redis.example.com:6380/3')).toEqual({
      host: 'redis.example.com',
      port: 6380,
      options: {
        db: 3,
        password: 'secret',
        tls: {},
        username: 'member',
      },
    });

    expect(() => createFieldNoteCollaborationServer({
      authorization: {
        verifyUser: async () => null,
        loadAccess: async () => null,
      },
      persistence: {
        fetch: async () => null,
        store: async () => undefined,
        materialize: async () => false,
      },
      requireRedis: true,
    })).toThrow('COMMUNITY_COLLAB_REDIS_REQUIRED');
  });

  it('blocks client updates to the protected comment map', () => {
    const document = new Y.Doc();
    document.getXmlFragment('field-note-content').insert(0, [new Y.XmlElement('paragraph')]);

    const contentCandidate = new Y.Doc();
    Y.applyUpdate(contentCandidate, Y.encodeStateAsUpdate(document));
    contentCandidate.getXmlFragment('field-note-content').insert(1, [new Y.XmlElement('paragraph')]);
    const contentUpdate = Y.encodeStateAsUpdate(contentCandidate, Y.encodeStateVector(document));
    expect(() => assertClientUpdateDoesNotChangeComments(document, contentUpdate)).not.toThrow();

    const commentCandidate = new Y.Doc();
    Y.applyUpdate(commentCandidate, Y.encodeStateAsUpdate(document));
    commentCandidate.getMap('field-note-comments').set('thread-1', { body: 'bypass' });
    const commentUpdate = Y.encodeStateAsUpdate(commentCandidate, Y.encodeStateVector(document));
    expect(() => assertClientUpdateDoesNotChangeComments(document, commentUpdate))
      .toThrow('FIELD_NOTE_COMMENT_UPDATE_REQUIRES_REST');
  });
});

describe('field-note comment REST mutations', () => {
  it('creates a thread through the protected server document and records its read model', async () => {
    const document = new Document('field-note:42');
    const records: Array<Record<string, unknown>> = [];
    const dependencies: FieldNoteCommentDependencies = {
      async authorize() {
        return {
          canWrite: false,
          canComment: true,
          context: {
            userId: 'member-1',
            noteId: 42,
            canWrite: false,
            canComment: true,
            displayName: '山风',
            avatarMediaId: null,
            shareTokenHash: null,
          },
        };
      },
      async openDocument() {
        return {
          document,
          async transact(operation: (value: Document) => void) {
            document.transact(() => operation(document), { source: 'local' });
          },
          async disconnect() {},
        } as never;
      },
      async record(input) {
        records.push(input as unknown as Record<string, unknown>);
      },
    };
    const responseState: { status?: number; body?: unknown } = {};
    const response = {
      setHeader: vi.fn(),
      status(status: number) {
        responseState.status = status;
        return this;
      },
      json(body: unknown) {
        responseState.body = body;
        return body;
      },
    };

    await handleFieldNoteComments({
      method: 'POST',
      headers: { authorization: 'Bearer valid-session' },
      query: { path: ['42'] },
      body: {
        initialComment: {
          body: [{ type: 'paragraph', content: '第一条评论' }],
        },
      },
    } as never, response, dependencies);

    expect(responseState.status).toBe(201);
    expect(responseState.body).toMatchObject({
      type: 'thread',
      comments: [expect.objectContaining({ userId: 'member-1' })],
    });
    expect(records).toHaveLength(1);
    expect(records[0]).toMatchObject({ event: 'created', resolved: false });
    expect(document.getMap('field-note-comments').size).toBe(1);
  });
});

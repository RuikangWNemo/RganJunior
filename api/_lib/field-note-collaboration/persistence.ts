import { Database } from '@hocuspocus/extension-database';
import type { Doc } from 'yjs';
import * as Y from 'yjs';

import { legacyTextToBlocks, normalizeFieldNoteBlocks } from '../../../src/lib/field-note-document/legacy.js';
import { createFieldNoteSnapshot, fieldNoteBlocksToYDoc } from '../../../src/lib/field-note-document/server.js';
import { FIELD_NOTE_DOCUMENT_SCHEMA_VERSION } from '../../../src/lib/field-note-document/schema.js';
import { parseFieldNoteDocumentName } from './documents.js';
import {
  callCollaborationRpc,
  createCollaborationRpcClient,
  firstRpcRow,
  type CollaborationRpcClient,
} from './rpc.js';

function parseHex(value: string): Uint8Array | null {
  const hex = value.startsWith('\\x') ? value.slice(2) : value;
  if (!hex || hex.length % 2 !== 0 || !/^[0-9a-f]+$/i.test(hex)) return null;
  return Uint8Array.from(Buffer.from(hex, 'hex'));
}

export function postgresByteaToUint8Array(value: unknown): Uint8Array | null {
  if (value instanceof Uint8Array) return value;
  if (typeof value !== 'string') return null;
  return parseHex(value) ?? Uint8Array.from(Buffer.from(value, 'base64'));
}

export function uint8ArrayToPostgresBytea(value: Uint8Array): string {
  return `\\x${Buffer.from(value).toString('hex')}`;
}

export interface FieldNotePersistence {
  fetch(documentName: string): Promise<Uint8Array | null>;
  store(documentName: string, state: Uint8Array): Promise<void>;
  materialize(documentName: string, document: Doc): Promise<boolean>;
}

export function createFieldNotePersistence(
  rpcClient: CollaborationRpcClient = createCollaborationRpcClient(),
): FieldNotePersistence {
  return {
    async fetch(documentName) {
      const noteId = parseFieldNoteDocumentName(documentName);
      const existing = firstRpcRow(await callCollaborationRpc(
        rpcClient,
        'load_field_note_collab_document_server',
        { target_field_note_id: noteId },
      ));
      const existingState = postgresByteaToUint8Array(existing?.yjs_state);
      if (existingState) return existingState;

      const seed = firstRpcRow(await callCollaborationRpc(
        rpcClient,
        'load_field_note_collab_seed_server',
        { target_field_note_id: noteId },
      ));
      if (!seed) return null;

      const blocks = Array.isArray(seed.content_json)
        ? normalizeFieldNoteBlocks(seed.content_json)
        : legacyTextToBlocks(typeof seed.legacy_content === 'string' ? seed.legacy_content : '');
      const candidateState = Y.encodeStateAsUpdate(fieldNoteBlocksToYDoc(blocks));
      const initialized = firstRpcRow(await callCollaborationRpc(
        rpcClient,
        'initialize_field_note_collab_document_server',
        {
          target_field_note_id: noteId,
          candidate_yjs_state: uint8ArrayToPostgresBytea(candidateState),
          candidate_schema_version: FIELD_NOTE_DOCUMENT_SCHEMA_VERSION,
        },
      ));
      return postgresByteaToUint8Array(initialized?.yjs_state);
    },
    async store(documentName, state) {
      const noteId = parseFieldNoteDocumentName(documentName);
      await callCollaborationRpc(
        rpcClient,
        'store_field_note_collab_document_server',
        {
          target_field_note_id: noteId,
          target_yjs_state: uint8ArrayToPostgresBytea(state),
          target_schema_version: FIELD_NOTE_DOCUMENT_SCHEMA_VERSION,
        },
      );
    },
    async materialize(documentName, document) {
      const noteId = parseFieldNoteDocumentName(documentName);
      const snapshot = await createFieldNoteSnapshot(document);
      const data = await callCollaborationRpc(
        rpcClient,
        'materialize_field_note_server',
        {
          target_field_note_id: noteId,
          target_content: snapshot.plainText,
          target_content_json: snapshot.blocks,
          target_content_html: snapshot.html,
          target_schema_version: snapshot.schemaVersion,
        },
      );
      return data === true;
    },
  };
}

export function createFieldNoteDatabaseExtension(persistence: FieldNotePersistence): Database {
  return new Database({
    fetch: ({ documentName }) => persistence.fetch(documentName),
    store: ({ documentName, state }) => persistence.store(documentName, state),
  });
}

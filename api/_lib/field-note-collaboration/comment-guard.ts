import * as Y from 'yjs';

import { FIELD_NOTE_YJS_THREADS } from '../../../src/lib/field-note-document/schema.js';

function commentsSnapshot(document: Y.Doc): string {
  return JSON.stringify(document.getMap(FIELD_NOTE_YJS_THREADS).toJSON());
}

/**
 * Comment-only writes must pass through the authenticated REST API. Editors can
 * otherwise use a custom Yjs client to bypass per-comment authorship checks.
 */
export function assertClientUpdateDoesNotChangeComments(
  document: Y.Doc,
  update: Uint8Array,
): void {
  const before = commentsSnapshot(document);
  const candidate = new Y.Doc();

  try {
    Y.applyUpdate(candidate, Y.encodeStateAsUpdate(document));
    Y.applyUpdate(candidate, update);
    if (commentsSnapshot(candidate) !== before) {
      throw new Error('FIELD_NOTE_COMMENT_UPDATE_REQUIRES_REST');
    }
  } finally {
    candidate.destroy();
  }
}

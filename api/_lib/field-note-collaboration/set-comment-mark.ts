import { ServerBlockNoteEditor } from '@blocknote/server-util';
import type { Document } from '@hocuspocus/server';
import { EditorState, TextSelection } from 'prosemirror-state';
import {
  initProseMirrorDoc,
  relativePositionToAbsolutePosition,
  updateYFragment,
} from 'y-prosemirror';
import type * as Y from 'yjs';

import { fieldNoteDocumentSchema } from '../../../src/lib/field-note-document/schema.js';

const editor = ServerBlockNoteEditor.create({ schema: fieldNoteDocumentSchema });

export interface CommentYjsSelection {
  anchor: unknown;
  head: unknown;
}

export function setCommentMark(
  document: Document,
  fragment: Y.XmlFragment,
  selection: CommentYjsSelection,
  threadId: string,
): void {
  const { doc: proseMirrorDocument, mapping } = initProseMirrorDoc(
    fragment,
    editor.editor.pmSchema as never,
  );
  const anchor = relativePositionToAbsolutePosition(
    document,
    fragment,
    selection.anchor as never,
    mapping,
  );
  const head = relativePositionToAbsolutePosition(
    document,
    fragment,
    selection.head as never,
    mapping,
  );

  if (anchor === null || head === null || anchor === head) {
    throw new Error('FIELD_NOTE_COMMENT_SELECTION_INVALID');
  }

  const state = EditorState.create({
    doc: proseMirrorDocument,
    schema: editor.editor.pmSchema as never,
    selection: TextSelection.create(proseMirrorDocument, anchor, head),
  });
  const commentMark = editor.editor.pmSchema.marks.comment;
  if (!commentMark) throw new Error('FIELD_NOTE_COMMENT_MARK_UNAVAILABLE');

  let transaction = state.tr;
  for (const range of state.selection.ranges) {
    const from = range.$from.pos;
    const to = range.$to.pos;

    state.doc.nodesBetween(from, to, (node, position) => {
      const trimmedFrom = Math.max(position, from);
      const trimmedTo = Math.min(position + node.nodeSize, to);
      const existing = node.marks.find((mark) => mark.type === commentMark);

      transaction = transaction.addMark(
        trimmedFrom,
        trimmedTo,
        commentMark.create({
          ...existing?.attrs,
          orphan: false,
          threadId,
        }),
      );
    });
  }

  updateYFragment(document, fragment, transaction.doc, {
    mapping,
    isOMark: new Map(),
  });
}

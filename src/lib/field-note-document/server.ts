import { ServerBlockNoteEditor } from '@blocknote/server-util';
import sanitizeHtml from 'sanitize-html';
import type * as Y from 'yjs';

import { legacyTextToBlocks, normalizeFieldNoteBlocks } from './legacy.js';
import {
  FIELD_NOTE_DOCUMENT_SCHEMA_VERSION,
  FIELD_NOTE_YJS_FRAGMENT,
  fieldNoteDocumentSchema,
  type FieldNoteBlocks,
} from './schema.js';
import { fieldNoteBlocksToPlainText } from './text.js';
import type { FieldNoteDocumentSnapshot } from './types.js';

const serverEditor = ServerBlockNoteEditor.create({
  schema: fieldNoteDocumentSchema,
});

const allowedTags = [
  ...sanitizeHtml.defaults.allowedTags,
  'audio',
  'div',
  'figcaption',
  'figure',
  'h1',
  'h2',
  'h3',
  'img',
  'source',
  'span',
  'video',
];

export function sanitizeFieldNoteHtml(value: string): string {
  return sanitizeHtml(value, {
    allowedTags,
    allowedAttributes: {
      '*': ['class', 'data-*'],
      a: ['href', 'rel', 'target', 'title'],
      audio: ['controls', 'preload', 'src'],
      img: ['alt', 'height', 'loading', 'src', 'width'],
      source: ['src', 'type'],
      video: ['controls', 'height', 'poster', 'preload', 'src', 'width'],
    },
    allowedSchemes: ['http', 'https', 'mailto', 'tel'],
    allowProtocolRelative: false,
    transformTags: {
      a: (_tagName, attribs) => ({
        tagName: 'a',
        attribs: {
          ...attribs,
          rel: 'noopener noreferrer',
        },
      }),
      img: (_tagName, attribs) => ({
        tagName: 'img',
        attribs: {
          ...attribs,
          loading: 'lazy',
        },
      }),
    },
  });
}

export function fieldNoteBlocksToYDoc(blocks: FieldNoteBlocks): Y.Doc {
  return serverEditor.blocksToYDoc(
    normalizeFieldNoteBlocks(blocks),
    FIELD_NOTE_YJS_FRAGMENT,
  );
}

export function legacyFieldNoteToYDoc(value: string | null | undefined): Y.Doc {
  return fieldNoteBlocksToYDoc(legacyTextToBlocks(value));
}

export function fieldNoteYDocToBlocks(document: Y.Doc): FieldNoteBlocks {
  return normalizeFieldNoteBlocks(
    serverEditor.yDocToBlocks(document, FIELD_NOTE_YJS_FRAGMENT),
  );
}

export async function createFieldNoteSnapshot(
  input: FieldNoteBlocks | Y.Doc,
): Promise<FieldNoteDocumentSnapshot> {
  const blocks = Array.isArray(input)
    ? normalizeFieldNoteBlocks(input)
    : fieldNoteYDocToBlocks(input);
  const fullHtml = await serverEditor.blocksToFullHTML(blocks);

  return {
    blocks,
    plainText: fieldNoteBlocksToPlainText(blocks),
    html: sanitizeFieldNoteHtml(fullHtml),
    schemaVersion: FIELD_NOTE_DOCUMENT_SCHEMA_VERSION,
  };
}

import { BlockNoteSchema, type PartialBlock } from '@blocknote/core';

export const FIELD_NOTE_DOCUMENT_SCHEMA_VERSION = 1;
export const FIELD_NOTE_YJS_FRAGMENT = 'field-note-content';
export const FIELD_NOTE_YJS_THREADS = 'field-note-comments';

export const fieldNoteDocumentSchema = BlockNoteSchema.create();

export type FieldNoteBlock = PartialBlock;
export type FieldNoteBlocks = FieldNoteBlock[];

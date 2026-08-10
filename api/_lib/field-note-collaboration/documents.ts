const FIELD_NOTE_DOCUMENT_PATTERN = /^field-note:([1-9][0-9]*)$/;

export function fieldNoteDocumentName(noteId: number): string {
  if (!Number.isSafeInteger(noteId) || noteId <= 0) {
    throw new Error('INVALID_FIELD_NOTE_ID');
  }
  return `field-note:${noteId}`;
}

export function parseFieldNoteDocumentName(value: string): number {
  const match = FIELD_NOTE_DOCUMENT_PATTERN.exec(value);
  const noteId = match ? Number(match[1]) : Number.NaN;
  if (!Number.isSafeInteger(noteId) || noteId <= 0) {
    throw new Error('INVALID_FIELD_NOTE_DOCUMENT');
  }
  return noteId;
}

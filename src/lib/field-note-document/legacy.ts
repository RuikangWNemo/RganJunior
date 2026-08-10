import type { FieldNoteBlocks } from './schema.js';

export function emptyFieldNoteBlocks(): FieldNoteBlocks {
  return [{ type: 'paragraph', content: '' }];
}

export function legacyTextToBlocks(value: string | null | undefined): FieldNoteBlocks {
  const normalized = (value ?? '').replace(/\r\n?/g, '\n').trim();
  if (!normalized) return emptyFieldNoteBlocks();

  return normalized
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph) => ({
      type: 'paragraph' as const,
      content: paragraph,
    }));
}

export function normalizeFieldNoteBlocks(
  blocks: FieldNoteBlocks | readonly unknown[] | null | undefined,
): FieldNoteBlocks {
  if (!Array.isArray(blocks) || blocks.length === 0) return emptyFieldNoteBlocks();
  return JSON.parse(JSON.stringify(blocks)) as FieldNoteBlocks;
}

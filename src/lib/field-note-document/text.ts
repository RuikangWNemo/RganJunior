import type { FieldNoteBlock, FieldNoteBlocks } from './schema.js';

type UnknownRecord = Record<string, unknown>;

function collectContentText(value: unknown): string {
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) {
    return value.map(collectContentText).filter(Boolean).join('');
  }
  if (!value || typeof value !== 'object') return '';

  const record = value as UnknownRecord;
  if (typeof record.text === 'string') return record.text;
  if (record.content !== undefined) return collectContentText(record.content);
  if (record.rows !== undefined) {
    return (Array.isArray(record.rows) ? record.rows : [])
      .map((row) => collectContentText(row))
      .filter(Boolean)
      .join('\n');
  }
  if (record.cells !== undefined) {
    return (Array.isArray(record.cells) ? record.cells : [])
      .map((cell) => collectContentText(cell))
      .filter(Boolean)
      .join('\t');
  }
  return '';
}

function collectBlockText(block: FieldNoteBlock): string[] {
  const current = collectContentText(block.content).trim();
  const children = (block.children ?? []).flatMap((child) => collectBlockText(child));
  return current ? [current, ...children] : children;
}

export function fieldNoteBlocksToPlainText(blocks: FieldNoteBlocks): string {
  return blocks
    .flatMap((block) => collectBlockText(block))
    .map((line) => line.trim())
    .filter(Boolean)
    .join('\n\n');
}

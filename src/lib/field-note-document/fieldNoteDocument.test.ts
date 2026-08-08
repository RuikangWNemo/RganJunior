import { describe, expect, it } from 'vitest';

import { emptyFieldNoteBlocks, legacyTextToBlocks } from './legacy';
import {
  createFieldNoteSnapshot,
  fieldNoteBlocksToYDoc,
  fieldNoteYDocToBlocks,
  sanitizeFieldNoteHtml,
} from './server';
import { fieldNoteBlocksToPlainText } from './text';

describe('field-note document model', () => {
  it('converts legacy paragraphs without dropping single line breaks', () => {
    expect(legacyTextToBlocks('First line\ncontinues\n\nSecond paragraph')).toEqual([
      { type: 'paragraph', content: 'First line\ncontinues' },
      { type: 'paragraph', content: 'Second paragraph' },
    ]);
    expect(legacyTextToBlocks('')).toEqual(emptyFieldNoteBlocks());
  });

  it('extracts readable text from inline content, tables, and nested blocks', () => {
    const plainText = fieldNoteBlocksToPlainText([
      {
        type: 'paragraph',
        content: [
          { type: 'text', text: 'A shared ', styles: {} },
          { type: 'link', href: 'https://example.com', content: 'moment' },
        ],
        children: [{ type: 'quote', content: 'A nested memory' }],
      },
      {
        type: 'table',
        content: {
          type: 'tableContent',
          rows: [{ cells: [['Place'], ['Chengdu']] }],
        },
      },
    ]);

    expect(plainText).toContain('A shared moment');
    expect(plainText).toContain('A nested memory');
    expect(plainText).toContain('Place\tChengdu');
    expect(plainText).not.toContain('https://example.com');
  });

  it('round-trips BlockNote content through the configured Yjs fragment', () => {
    const source = legacyTextToBlocks('First paragraph\n\nSecond paragraph');
    const document = fieldNoteBlocksToYDoc(source);
    const result = fieldNoteYDocToBlocks(document);

    expect(fieldNoteBlocksToPlainText(result)).toBe('First paragraph\n\nSecond paragraph');
  });

  it('creates a portable snapshot and strips active content', async () => {
    const snapshot = await createFieldNoteSnapshot([
      { type: 'heading', props: { level: 2 }, content: 'A field note' },
      { type: 'paragraph', content: 'A safe paragraph.' },
    ]);

    expect(snapshot.schemaVersion).toBe(1);
    expect(snapshot.plainText).toBe('A field note\n\nA safe paragraph.');
    expect(snapshot.html).toContain('A safe paragraph.');

    const sanitized = sanitizeFieldNoteHtml(
      '<p>Safe</p><script>alert(1)</script><a href="javascript:alert(1)">bad</a><img src="https://example.com/photo.jpg">',
    );
    expect(sanitized).not.toContain('<script');
    expect(sanitized).not.toContain('javascript:');
    expect(sanitized).toContain('rel="noopener noreferrer"');
    expect(sanitized).toContain('loading="lazy"');
  });
});

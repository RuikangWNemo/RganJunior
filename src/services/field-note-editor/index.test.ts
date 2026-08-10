import { afterEach, describe, expect, it, vi } from 'vitest';

import { getFieldNoteEditorBundle } from './index';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('Field Note editor API client', () => {
  it('reports a clear API error when Vite returns a source module instead of JSON', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(
      'import { handleFieldNoteEditor } from "/api/editor.ts";',
      { status: 200, headers: { 'Content-Type': 'text/javascript' } },
    )));

    await expect(getFieldNoteEditorBundle(42, 'access-token')).rejects.toThrow(
      'FIELD_NOTE_EDITOR_API_UNAVAILABLE',
    );
  });

  it('preserves structured API failures', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(
      JSON.stringify({ error: 'FIELD_NOTE_ACCESS_DENIED' }),
      { status: 403, headers: { 'Content-Type': 'application/json' } },
    )));

    await expect(getFieldNoteEditorBundle(42, 'access-token')).rejects.toThrow(
      'FIELD_NOTE_ACCESS_DENIED',
    );
  });
});

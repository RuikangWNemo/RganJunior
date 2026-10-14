import { beforeEach, describe, expect, it, vi } from 'vitest';

import { listEditorialFieldNotes, listMyFieldNotes, listPublishedFieldNotes, setFieldNoteFeatured } from './index';

const getClient = vi.fn();

vi.mock('@/lib/supabase/client', () => ({
  getSupabaseClient: () => getClient(),
}));

function queryChain(data: unknown[] = []) {
  const result = Promise.resolve({ data, error: null });
  const chain = {
    select: vi.fn(),
    eq: vi.fn(),
    order: vi.fn(),
    limit: vi.fn(),
    in: vi.fn(),
    update: vi.fn(),
    maybeSingle: vi.fn(),
    then: result.then.bind(result),
  };
  chain.select.mockReturnValue(chain);
  chain.eq.mockReturnValue(chain);
  chain.order.mockReturnValue(chain);
  chain.limit.mockReturnValue(chain);
  chain.in.mockReturnValue(chain);
  chain.update.mockReturnValue(chain);
  chain.maybeSingle.mockResolvedValue({ data: data[0] ?? null, error: null });
  return chain;
}

describe('field note listing boundaries', () => {
  beforeEach(() => {
    getClient.mockReset();
  });

  it('loads both created and attributed stories using IDs scoped by the database', async () => {
    const query = queryChain();
    const rpc = vi.fn().mockResolvedValue({ data: [{ id: 11 }, { id: 22 }], error: null });
    getClient.mockReturnValue({
      auth: { getSession: vi.fn().mockResolvedValue({ data: { session: { user: { id: 'member-42' } } }, error: null }) },
      rpc,
      from: vi.fn().mockReturnValue(query),
    });

    await listMyFieldNotes();

    expect(rpc).toHaveBeenCalledWith('list_my_field_note_ids');
    expect(query.in).toHaveBeenCalledWith('id', [11, 22]);
    expect(query.eq).not.toHaveBeenCalledWith('created_by', expect.anything());
    expect(query.order).toHaveBeenCalledWith('updated_at', { ascending: false });
  });

  it('keeps the square repository query restricted to published public stories', async () => {
    const query = queryChain();
    getClient.mockReturnValue({
      auth: { getSession: vi.fn() },
      from: vi.fn().mockReturnValue(query),
    });

    await listPublishedFieldNotes(undefined, 100);

    expect(query.eq).toHaveBeenCalledWith('status', 'published');
    expect(query.eq).toHaveBeenCalledWith('visibility', 'public');
    expect(query.limit).toHaveBeenCalledWith(100);
    const relationQuery = String(query.select.mock.calls[0]?.[0]);
    expect(relationQuery).toMatch(
      /people\(\s*id,\s*slug,\s*display_name,\s*nature_name\s*\)/,
    );
    expect(relationQuery).not.toContain('people(*)');
  });

  it('loads the editorial queue from real workflow records', async () => {
    const query = queryChain();
    getClient.mockReturnValue({ from: vi.fn().mockReturnValue(query) });

    await listEditorialFieldNotes();

    expect(query.in).toHaveBeenCalledWith('status', ['draft', 'submitted', 'in_review', 'changes_requested', 'approved', 'published']);
    expect(query.order).toHaveBeenCalledWith('updated_at', { ascending: false });
  });

  it('does not issue an unscoped article query for an empty library', async () => {
    const from = vi.fn();
    getClient.mockReturnValue({
      auth: { getSession: vi.fn().mockResolvedValue({ data: { session: { user: { id: 'member-42' } } }, error: null }) },
      rpc: vi.fn().mockResolvedValue({ data: [], error: null }), from,
    });
    expect(await listMyFieldNotes()).toEqual([]);
    expect(from).not.toHaveBeenCalled();
  });

  it('propagates authorship lookup failures without broadening the query', async () => {
    const from = vi.fn();
    getClient.mockReturnValue({
      auth: { getSession: vi.fn().mockResolvedValue({ data: { session: { user: { id: 'member-42' } } }, error: null }) },
      rpc: vi.fn().mockResolvedValue({ data: null, error: { message: 'denied', code: '42501' } }), from,
    });
    await expect(listMyFieldNotes()).rejects.toThrow();
    expect(from).not.toHaveBeenCalled();
  });

  it('only changes featured state on a published record', async () => {
    const query = queryChain([{ id: 8, status: 'published', featured: true }]);
    getClient.mockReturnValue({ from: vi.fn().mockReturnValue(query) });

    await setFieldNoteFeatured(8, true);

    expect(query.update).toHaveBeenCalledWith({ featured: true });
    expect(query.eq).toHaveBeenCalledWith('id', 8);
    expect(query.eq).toHaveBeenCalledWith('status', 'published');
  });
  it('loads only public article bylines without exposing private profile fields', async () => {
    const query = queryChain([{ id: 99, slug: 'published', status: 'published', visibility: 'public', field_note_authors: [] }]);
    const rpc = vi.fn().mockResolvedValue({ data: [{ field_note_id: 99, person_id: 5, slug: 'orange', display_name: '橙子', nature_name: null, author_order: 0 }], error: null });
    getClient.mockReturnValue({ from: vi.fn().mockReturnValue(query), rpc });
    const notes = await listPublishedFieldNotes();
    expect(rpc).toHaveBeenCalledWith('list_published_field_note_authors', { target_note_ids: [99] });
    expect(notes[0].field_note_authors[0].people?.display_name).toBe('橙子');
    expect(notes[0].field_note_authors[0].people).not.toHaveProperty('user_id');
  });

});

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

  it('explicitly scopes My stories to the authenticated owner', async () => {
    const query = queryChain();
    getClient.mockReturnValue({
      auth: { getSession: vi.fn().mockResolvedValue({ data: { session: { user: { id: 'member-42' } } }, error: null }) },
      from: vi.fn().mockReturnValue(query),
    });

    await listMyFieldNotes();

    expect(query.eq).toHaveBeenCalledWith('created_by', 'member-42');
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

    expect(query.in).toHaveBeenCalledWith('status', ['submitted', 'in_review', 'changes_requested', 'approved', 'published']);
    expect(query.order).toHaveBeenCalledWith('updated_at', { ascending: false });
  });

  it('only changes featured state on a published record', async () => {
    const query = queryChain([{ id: 8, status: 'published', featured: true }]);
    getClient.mockReturnValue({ from: vi.fn().mockReturnValue(query) });

    await setFieldNoteFeatured(8, true);

    expect(query.update).toHaveBeenCalledWith({ featured: true });
    expect(query.eq).toHaveBeenCalledWith('id', 8);
    expect(query.eq).toHaveBeenCalledWith('status', 'published');
  });
});

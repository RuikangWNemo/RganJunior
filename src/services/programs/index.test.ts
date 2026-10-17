import { beforeEach, describe, expect, it, vi } from 'vitest';
import { decodeSession, emptySession, safeProgramLink, saveProgramSession, uploadProgramPhoto, validateSession } from './index';
const { db, chain } = vi.hoisted(() => {
  const chain = { update: vi.fn(), insert: vi.fn(), eq: vi.fn(), select: vi.fn(), maybeSingle: vi.fn() };
  const db = { from: vi.fn(() => chain), auth: { getUser: vi.fn() }, storage: { from: vi.fn() } };
  return { db, chain };
});
vi.mock('@/lib/supabase/client', () => ({ getSupabaseClient: () => db }));
beforeEach(() => { vi.clearAllMocks(); for (const key of ['update','insert','eq','select'] as const) chain[key].mockReturnValue(chain); });
const valid = () => ({ ...emptySession('category'), slug: 'autumn-camp', title_zh: '秋日营', location_zh: '铁牛村', date_label_zh: '日期待定' });
describe('session publishing', () => {
  it('allows incomplete drafts but requires time and location for publication', () => {
    const session = { ...emptySession('category'), slug: 'test', title_zh: 'Test' };
    expect(() => validateSession(session)).not.toThrow();
    expect(() => validateSession({ ...session, status: 'published' })).toThrow('发布前');
    expect(() => validateSession({ ...valid(), status: 'published' })).not.toThrow();
  });
  it('requires an actual registration link and closes past sessions', () => {
    expect(() => validateSession({ ...valid(), status: 'published', registration_state: 'open' })).toThrow('报名链接');
    expect(() => validateSession({ ...valid(), phase: 'past' })).toThrow('关闭报名');
  });
  it.each(['javascript:alert(1)','//evil.example','https://a.example\\evil','https://name:secret@example.com','https://'])('rejects unsafe link %s', href => expect(safeProgramLink(href)).toBe(false));
  it('accepts site paths and HTTPS resources and filters malformed remote JSON', () => {
    expect(safeProgramLink('/community-stories/camp')).toBe(true);
    expect(safeProgramLink('https://example.com/record')).toBe(true);
    const decoded = decodeSession({ ...valid(), photos: [{ src: 'https://tracker.example/photo', alt_zh: 'bad' }], links: [{ kind: 'review', href: 'javascript:alert(1)' }] });
    expect(decoded.photos).toEqual([]); expect(decoded.links).toEqual([]);
  });
  it('uses an optimistic version match and reports concurrent edits without success', async () => {
    chain.maybeSingle.mockResolvedValue({ data: null, error: null });
    await expect(saveProgramSession({ ...valid(), id: 'saved', updated_at: 'version-one' })).rejects.toThrow('其他管理员');
    expect(chain.eq).toHaveBeenCalledWith('updated_at', 'version-one');
  });
  it('rejects unsafe/oversized uploads before accessing storage', async () => {
    await expect(uploadProgramPhoto(new File(['svg'], 'photo.svg', { type: 'image/svg+xml' }))).rejects.toThrow('10 MB');
    const file = new File(['jpg'], 'large.jpg', { type: 'image/jpeg' });
    Object.defineProperty(file, 'size', { value: 11 * 1024 * 1024 });
    await expect(uploadProgramPhoto(file)).rejects.toThrow('10 MB');
    expect(db.storage.from).not.toHaveBeenCalled();
  });
  it('uploads to a unique private path and returns an editable photo', async () => {
    const upload = vi.fn().mockResolvedValue({ error: null });
    db.auth.getUser.mockResolvedValue({ data: { user: { id: 'editor-id' } }, error: null });
    db.storage.from.mockReturnValue({ upload });
    const photo = await uploadProgramPhoto(new File(['photo'], 'photo.jpg', { type: 'image/jpeg' }));
    expect(db.storage.from).toHaveBeenCalledWith('program-media');
    expect(photo.src).toMatch(/^editor-id\/.+\.jpg$/);
    expect(upload).toHaveBeenCalledWith(photo.src, expect.any(File), { contentType: 'image/jpeg', upsert: false });
  });
});

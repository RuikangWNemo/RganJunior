import { beforeEach, describe, expect, it, vi } from 'vitest';

import { uploadFieldNoteMedia } from './index';

const getClient = vi.fn();
const getUser = vi.fn();

vi.mock('@/lib/supabase/client', () => ({
  getSupabaseClient: () => getClient(),
}));

vi.mock('@/services/auth', () => ({
  getCurrentUser: () => getUser(),
}));

function imageFile(size = 128) {
  return new File([new Uint8Array(size)], 'field-photo.jpg', { type: 'image/jpeg' });
}

function mediaClient(relationError: unknown = null) {
  const upload = vi.fn().mockResolvedValue({ error: null });
  const remove = vi.fn().mockResolvedValue({ error: null });
  const createSignedUrl = vi.fn().mockResolvedValue({ data: { signedUrl: 'https://signed.example/field-photo.jpg' }, error: null });
  const deleteEq = vi.fn().mockResolvedValue({ data: null, error: null });
  const mediaAssets = {
    insert: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({
          data: {
            id: 91,
            storage_bucket: 'field-notes',
            storage_path: 'member-1/photo.jpg',
          },
          error: null,
        }),
      }),
    }),
    delete: vi.fn().mockReturnValue({ eq: deleteEq }),
  };
  const fieldNoteMedia = {
    insert: vi.fn().mockResolvedValue({ error: relationError }),
  };
  const client = {
    storage: { from: vi.fn().mockReturnValue({ upload, remove, createSignedUrl }) },
    from: vi.fn((table: string) => table === 'media_assets' ? mediaAssets : fieldNoteMedia),
  };
  return { client, upload, remove, createSignedUrl, deleteEq, fieldNoteMedia };
}

describe('Field Note image upload', () => {
  beforeEach(() => {
    getClient.mockReset();
    getUser.mockReset().mockResolvedValue({ id: 'member-1' });
  });

  it('accepts a real image, links it to the story, and returns its editor URL', async () => {
    const mocks = mediaClient();
    getClient.mockReturnValue(mocks.client);

    await expect(uploadFieldNoteMedia(42, imageFile())).resolves.toBe('https://signed.example/field-photo.jpg');
    expect(mocks.upload).toHaveBeenCalledWith(expect.stringContaining('member-1/'), expect.objectContaining({ type: 'image/jpeg' }), expect.objectContaining({ upsert: false }));
    expect(mocks.fieldNoteMedia.insert).toHaveBeenCalledWith({ field_note_id: 42, media_asset_id: 91, usage_role: 'inline' });
  });

  it('rejects non-image and oversized files before Storage is called', async () => {
    const textFile = new File(['not a photo'], 'notes.txt', { type: 'text/plain' });
    await expect(uploadFieldNoteMedia(42, textFile)).rejects.toThrow('请上传 JPG、PNG、WebP 或 GIF 图片。');
    await expect(uploadFieldNoteMedia(42, imageFile(10 * 1024 * 1024 + 1))).rejects.toThrow('图片不能超过 10 MB。');
    expect(getClient).not.toHaveBeenCalled();
  });

  it('cleans up the new asset when it cannot be linked to the story', async () => {
    const mocks = mediaClient({ message: 'not allowed' });
    getClient.mockReturnValue(mocks.client);

    await expect(uploadFieldNoteMedia(42, imageFile())).rejects.toMatchObject({ code: 'FIELD_NOTE_MEDIA_LINK_FAILED' });
    expect(mocks.deleteEq).toHaveBeenCalledWith('id', 91);
    expect(mocks.remove).toHaveBeenCalledWith(['member-1/photo.jpg']);
  });
});

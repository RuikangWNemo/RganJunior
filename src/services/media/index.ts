import { getSupabaseClient } from '@/lib/supabase/client';
import type { Tables } from '@/lib/supabase/database.types';
import { BackendServiceError, throwIfSupabaseError } from '@/lib/supabase/errors';
import { getCurrentUser } from '@/services/auth';

export type UploadBucket = 'avatars' | 'field-notes' | 'member-media';

const FIELD_NOTE_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
const MAX_FIELD_NOTE_IMAGE_BYTES = 10 * 1024 * 1024;

type StoredMediaAsset = Pick<
  Tables<'media_assets'>,
  'storage_bucket' | 'storage_path'
>;

function mediaTypeForMime(mimeType: string): Tables<'media_assets'>['media_type'] {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  if (mimeType === 'application/pdf') return 'document';
  return 'other';
}

function safeFilename(filename: string): string {
  return filename.toLowerCase().replace(/[^a-z0-9._-]+/g, '-').replace(/^-+|-+$/g, '');
}

export async function uploadOwnedMedia(file: File, bucket: UploadBucket) {
  const user = await getCurrentUser();
  if (!user) throw new BackendServiceError('AUTH_REQUIRED', 'Sign in is required.');

  const supabase = getSupabaseClient();
  const path = `${user.id}/${crypto.randomUUID()}-${safeFilename(file.name) || 'upload'}`;
  const { error: uploadError } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: '3600',
    contentType: file.type,
    upsert: false,
  });
  throwIfSupabaseError(uploadError, 'MEDIA_UPLOAD_FAILED');

  const { data, error: metadataError } = await supabase
    .from('media_assets')
    .insert({
      owner_user_id: user.id,
      uploaded_by: user.id,
      storage_bucket: bucket,
      storage_path: path,
      media_type: mediaTypeForMime(file.type),
      mime_type: file.type || 'application/octet-stream',
      file_size: file.size,
    })
    .select('*')
    .single();

  if (metadataError) {
    await supabase.storage.from(bucket).remove([path]);
    throwIfSupabaseError(metadataError, 'MEDIA_METADATA_CREATE_FAILED');
  }
  return data;
}

export async function listOwnedMedia() {
  const { data, error } = await getSupabaseClient()
    .from('media_assets')
    .select('*')
    .order('created_at', { ascending: false });
  throwIfSupabaseError(error, 'MEDIA_READ_FAILED');
  return data;
}

export async function uploadFieldNoteMedia(noteId: number, file: File): Promise<string> {
  if (!Number.isSafeInteger(noteId) || noteId < 1) throw new Error('INVALID_FIELD_NOTE_ID');
  if (!FIELD_NOTE_IMAGE_TYPES.has(file.type)) {
    throw new BackendServiceError('FIELD_NOTE_IMAGE_TYPE_UNSUPPORTED', '请上传 JPG、PNG、WebP 或 GIF 图片。');
  }
  if (file.size > MAX_FIELD_NOTE_IMAGE_BYTES) {
    throw new BackendServiceError('FIELD_NOTE_IMAGE_TOO_LARGE', '图片不能超过 10 MB。');
  }
  const asset = await uploadOwnedMedia(file, 'field-notes');
  const supabase = getSupabaseClient();
  const { error: relationError } = await supabase.from('field_note_media').insert({
    field_note_id: noteId,
    media_asset_id: asset.id,
    usage_role: 'inline',
  });
  if (relationError) {
    await Promise.allSettled([
      supabase.from('media_assets').delete().eq('id', asset.id),
      supabase.storage.from(asset.storage_bucket).remove([asset.storage_path]),
    ]);
    throwIfSupabaseError(relationError, 'FIELD_NOTE_MEDIA_LINK_FAILED');
  }

  const { data, error } = await supabase.storage
    .from(asset.storage_bucket)
    .createSignedUrl(asset.storage_path, 60 * 60 * 24 * 7);
  if (error) {
    await Promise.allSettled([
      supabase
        .from('field_note_media')
        .delete()
        .eq('field_note_id', noteId)
        .eq('media_asset_id', asset.id)
        .then(() => supabase.from('media_assets').delete().eq('id', asset.id)),
      supabase.storage.from(asset.storage_bucket).remove([asset.storage_path]),
    ]);
  }
  throwIfSupabaseError(error, 'FIELD_NOTE_MEDIA_URL_FAILED');
  return data.signedUrl;
}

export async function storedMediaUrl(asset: StoredMediaAsset, expiresIn = 60 * 60): Promise<string | null> {
  const storage = getSupabaseClient().storage.from(asset.storage_bucket);
  if (asset.storage_bucket === 'public-media') {
    return storage.getPublicUrl(asset.storage_path).data.publicUrl;
  }
  const { data, error } = await storage.createSignedUrl(asset.storage_path, expiresIn);
  return error ? null : data?.signedUrl ?? null;
}

export async function refreshStoredMediaUrls(
  html: string | null | undefined,
  assets: StoredMediaAsset[],
): Promise<string | undefined> {
  let refreshed = html || undefined;
  if (!refreshed) return undefined;

  const replacements = await Promise.all(assets.map(async (asset) => ({
    asset,
    url: await storedMediaUrl(asset),
  })));

  for (const { asset, url } of replacements) {
    if (!url) continue;
    const escaped = `${asset.storage_bucket}/${asset.storage_path}`.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    refreshed = refreshed.replace(
      new RegExp(`src=(['"])[^'"]*${escaped}[^'"]*\\1`, 'g'),
      `src="${url}"`,
    );
  }

  return refreshed;
}

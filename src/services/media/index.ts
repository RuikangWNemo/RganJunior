import { getSupabaseClient } from '@/lib/supabase/client';
import type { Tables } from '@/lib/supabase/database.types';
import { BackendServiceError, throwIfSupabaseError } from '@/lib/supabase/errors';
import { getCurrentUser } from '@/services/auth';

export type UploadBucket = 'avatars' | 'field-notes' | 'member-media';

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
  const asset = await uploadOwnedMedia(file, 'field-notes');
  const supabase = getSupabaseClient();
  const { error: relationError } = await supabase.from('field_note_media').insert({
    field_note_id: noteId,
    media_asset_id: asset.id,
    usage_role: 'inline',
  });
  throwIfSupabaseError(relationError, 'FIELD_NOTE_MEDIA_LINK_FAILED');

  const { data, error } = await supabase.storage
    .from(asset.storage_bucket)
    .createSignedUrl(asset.storage_path, 60 * 60 * 24 * 7);
  throwIfSupabaseError(error, 'FIELD_NOTE_MEDIA_URL_FAILED');
  return data.signedUrl;
}

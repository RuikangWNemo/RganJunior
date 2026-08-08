import { getSupabaseClient } from '@/lib/supabase/client';
import type { Database, Json, Tables } from '@/lib/supabase/database.types';
import { BackendServiceError, throwIfSupabaseError } from '@/lib/supabase/errors';
import { getCurrentUser } from '@/services/auth';

const GROWTH_BUCKET = 'private-impact';
const MAX_GROWTH_PHOTO_BYTES = 50 * 1024 * 1024;

type GrowthRecordRpcRow =
  Database['public']['Functions']['list_growth_records']['Returns'][number];

export type GrowthPhoto = {
  mediaAssetId: number;
  storageBucket: string;
  storagePath: string;
  mimeType: string;
  width: number | null;
  height: number | null;
  sortOrder: number;
  isPrimary: boolean;
  caption: string | null;
  attachedAt: string;
};

export type GrowthRecord = {
  id: number;
  personId: number;
  observedAt: string;
  observedTimezone: string;
  title: string | null;
  note: string;
  recordedBy: string;
  createdAt: string;
  updatedAt: string;
  archivedAt: string | null;
  media: GrowthPhoto[];
};

export type CreateGrowthRecordInput = {
  personId: number;
  observedAt: string | Date;
  observedTimezone?: string;
  title?: string | null;
  note: string;
};

export type UpdateGrowthRecordInput = Omit<CreateGrowthRecordInput, 'personId'> & {
  growthRecordId: number;
};

export type GrowthRecordCursor = {
  observedAt: string;
  recordId: number;
};

export type ListGrowthRecordsInput = {
  personId: number;
  pageSize?: number;
  before?: GrowthRecordCursor;
  includeArchived?: boolean;
};

export type UploadGrowthPhotoInput = {
  personId: number;
  file: File;
  caption?: string | null;
  altText?: string | null;
  takenAt?: string | Date | null;
  width?: number | null;
  height?: number | null;
};

export type AddGrowthPhotoInput = UploadGrowthPhotoInput & {
  growthRecordId: number;
  sortOrder?: number;
  isPrimary?: boolean;
};

function safeFilename(filename: string): string {
  return filename.toLowerCase().replace(/[^a-z0-9._-]+/g, '-').replace(/^-+|-+$/g, '');
}

function positiveInteger(value: number, code: string, label: string): number {
  if (!Number.isSafeInteger(value) || value <= 0) {
    throw new BackendServiceError(code, `${label} must be a positive integer.`);
  }
  return value;
}

function optionalPositiveInteger(
  value: number | null | undefined,
  code: string,
  label: string,
): number | null {
  if (value == null) return null;
  return positiveInteger(value, code, label);
}

function isoTimestamp(value: string | Date, code: string, label: string): string {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new BackendServiceError(code, `${label} must be a valid date and time.`);
  }
  return date.toISOString();
}

function optionalText(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function jsonObject(value: Json): Record<string, Json | undefined> | null {
  if (value === null || Array.isArray(value) || typeof value !== 'object') return null;
  return value;
}

function parseGrowthPhoto(value: Json): GrowthPhoto | null {
  const photo = jsonObject(value);
  if (!photo) return null;

  const mediaAssetId = photo.media_asset_id;
  const storageBucket = photo.storage_bucket;
  const storagePath = photo.storage_path;
  const mimeType = photo.mime_type;
  const sortOrder = photo.sort_order;
  const isPrimary = photo.is_primary;
  const attachedAt = photo.attached_at;
  if (
    typeof mediaAssetId !== 'number'
    || typeof storageBucket !== 'string'
    || typeof storagePath !== 'string'
    || typeof mimeType !== 'string'
    || typeof sortOrder !== 'number'
    || typeof isPrimary !== 'boolean'
    || typeof attachedAt !== 'string'
  ) {
    return null;
  }

  return {
    mediaAssetId,
    storageBucket,
    storagePath,
    mimeType,
    width: typeof photo.width === 'number' ? photo.width : null,
    height: typeof photo.height === 'number' ? photo.height : null,
    sortOrder,
    isPrimary,
    caption: typeof photo.caption === 'string' ? photo.caption : null,
    attachedAt,
  };
}

function normalizeGrowthRecord(row: GrowthRecordRpcRow): GrowthRecord {
  const media = Array.isArray(row.media)
    ? row.media.map(parseGrowthPhoto).filter((photo): photo is GrowthPhoto => photo !== null)
    : [];

  return {
    id: row.id,
    personId: row.person_id,
    observedAt: row.observed_at,
    observedTimezone: row.observed_timezone,
    title: row.title || null,
    note: row.note,
    recordedBy: row.recorded_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    archivedAt: row.archived_at || null,
    media,
  };
}

async function removeUploadedPhotoMetadata(media: Tables<'media_assets'>): Promise<void> {
  const supabase = getSupabaseClient();
  await supabase.storage.from(GROWTH_BUCKET).remove([media.storage_path]);
  await supabase.from('media_assets').delete().eq('id', media.id);
}

export async function createGrowthRecord(input: CreateGrowthRecordInput): Promise<number> {
  positiveInteger(input.personId, 'INVALID_PERSON_ID', 'Person ID');
  if (!input.note.trim()) {
    throw new BackendServiceError('GROWTH_NOTE_REQUIRED', 'Growth note is required.');
  }

  const { data, error } = await getSupabaseClient().rpc('create_growth_record', {
    target_person_id: input.personId,
    growth_observed_at: isoTimestamp(
      input.observedAt,
      'INVALID_OBSERVED_AT',
      'Observed time',
    ),
    growth_observed_timezone: input.observedTimezone?.trim() || 'Asia/Shanghai',
    growth_title: optionalText(input.title) || '',
    growth_note: input.note.trim(),
  });
  throwIfSupabaseError(error, 'GROWTH_RECORD_CREATE_FAILED');
  return data;
}

export async function listGrowthRecords(
  input: ListGrowthRecordsInput,
): Promise<GrowthRecord[]> {
  positiveInteger(input.personId, 'INVALID_PERSON_ID', 'Person ID');
  if (input.before) {
    positiveInteger(input.before.recordId, 'INVALID_GROWTH_CURSOR', 'Cursor record ID');
  }

  const { data, error } = await getSupabaseClient().rpc('list_growth_records', {
    target_person_id: input.personId,
    page_size: input.pageSize ?? 50,
    before_observed_at: input.before?.observedAt,
    before_record_id: input.before?.recordId,
    include_archived: input.includeArchived ?? false,
  });
  throwIfSupabaseError(error, 'GROWTH_RECORDS_READ_FAILED');
  return data.map(normalizeGrowthRecord);
}

export async function updateGrowthRecord(input: UpdateGrowthRecordInput): Promise<void> {
  positiveInteger(input.growthRecordId, 'INVALID_GROWTH_RECORD_ID', 'Growth record ID');
  if (!input.note.trim()) {
    throw new BackendServiceError('GROWTH_NOTE_REQUIRED', 'Growth note is required.');
  }

  const { error } = await getSupabaseClient().rpc('update_growth_record', {
    target_growth_record_id: input.growthRecordId,
    growth_observed_at: isoTimestamp(
      input.observedAt,
      'INVALID_OBSERVED_AT',
      'Observed time',
    ),
    growth_observed_timezone: input.observedTimezone?.trim() || 'Asia/Shanghai',
    growth_title: optionalText(input.title) || '',
    growth_note: input.note.trim(),
  });
  throwIfSupabaseError(error, 'GROWTH_RECORD_UPDATE_FAILED');
}

export async function archiveGrowthRecord(growthRecordId: number): Promise<void> {
  positiveInteger(growthRecordId, 'INVALID_GROWTH_RECORD_ID', 'Growth record ID');
  const { error } = await getSupabaseClient().rpc('archive_growth_record', {
    target_growth_record_id: growthRecordId,
  });
  throwIfSupabaseError(error, 'GROWTH_RECORD_ARCHIVE_FAILED');
}

export async function uploadGrowthPhoto(
  input: UploadGrowthPhotoInput,
): Promise<Tables<'media_assets'>> {
  positiveInteger(input.personId, 'INVALID_PERSON_ID', 'Person ID');
  if (!input.file.type.startsWith('image/')) {
    throw new BackendServiceError('GROWTH_PHOTO_REQUIRED', 'Growth media must be an image.');
  }
  if (input.file.size > MAX_GROWTH_PHOTO_BYTES) {
    throw new BackendServiceError(
      'GROWTH_PHOTO_TOO_LARGE',
      'Growth photos must not exceed 50 MB.',
    );
  }

  const user = await getCurrentUser();
  if (!user) throw new BackendServiceError('AUTH_REQUIRED', 'Sign in is required.');

  const supabase = getSupabaseClient();
  const filename = safeFilename(input.file.name) || 'growth-photo';
  const path = `${user.id}/${input.personId}/${crypto.randomUUID()}-${filename}`;
  const { error: uploadError } = await supabase.storage.from(GROWTH_BUCKET).upload(
    path,
    input.file,
    {
      cacheControl: '3600',
      contentType: input.file.type,
      upsert: false,
    },
  );
  throwIfSupabaseError(uploadError, 'GROWTH_PHOTO_UPLOAD_FAILED');

  const { error: metadataError } = await supabase.from('media_assets').insert({
    storage_bucket: GROWTH_BUCKET,
    storage_path: path,
    media_type: 'image',
    mime_type: input.file.type,
    file_size: input.file.size,
    width: optionalPositiveInteger(input.width, 'INVALID_PHOTO_WIDTH', 'Photo width'),
    height: optionalPositiveInteger(input.height, 'INVALID_PHOTO_HEIGHT', 'Photo height'),
    caption: optionalText(input.caption),
    alt_text: optionalText(input.altText),
    taken_at: input.takenAt
      ? isoTimestamp(input.takenAt, 'INVALID_PHOTO_TAKEN_AT', 'Photo taken time')
      : null,
    visibility: 'private',
  });

  if (metadataError) {
    await supabase.storage.from(GROWTH_BUCKET).remove([path]);
    throwIfSupabaseError(metadataError, 'GROWTH_PHOTO_METADATA_CREATE_FAILED');
  }

  const { data: media, error: readError } = await supabase
    .from('media_assets')
    .select('*')
    .eq('storage_bucket', GROWTH_BUCKET)
    .eq('storage_path', path)
    .single();

  if (readError) {
    await supabase.from('media_assets').delete().eq('storage_path', path);
    await supabase.storage.from(GROWTH_BUCKET).remove([path]);
    throwIfSupabaseError(readError, 'GROWTH_PHOTO_METADATA_READ_FAILED');
  }
  return media;
}

export async function attachGrowthPhoto(
  growthRecordId: number,
  mediaAssetId: number,
  options: { sortOrder?: number; isPrimary?: boolean; caption?: string | null } = {},
): Promise<void> {
  positiveInteger(growthRecordId, 'INVALID_GROWTH_RECORD_ID', 'Growth record ID');
  positiveInteger(mediaAssetId, 'INVALID_MEDIA_ASSET_ID', 'Media asset ID');
  if (!Number.isSafeInteger(options.sortOrder ?? 0) || (options.sortOrder ?? 0) < 0) {
    throw new BackendServiceError(
      'INVALID_MEDIA_SORT_ORDER',
      'Photo sort order must be a non-negative integer.',
    );
  }

  const { error } = await getSupabaseClient().rpc('attach_growth_media', {
    target_growth_record_id: growthRecordId,
    target_media_asset_id: mediaAssetId,
    media_sort_order: options.sortOrder ?? 0,
    media_is_primary: options.isPrimary ?? false,
    media_caption: optionalText(options.caption) || undefined,
  });
  throwIfSupabaseError(error, 'GROWTH_PHOTO_ATTACH_FAILED');
}

export async function addGrowthPhoto(
  input: AddGrowthPhotoInput,
): Promise<Tables<'media_assets'>> {
  const media = await uploadGrowthPhoto(input);
  try {
    await attachGrowthPhoto(input.growthRecordId, media.id, {
      sortOrder: input.sortOrder,
      isPrimary: input.isPrimary,
      caption: input.caption,
    });
  } catch (error) {
    await removeUploadedPhotoMetadata(media);
    throw error;
  }
  return media;
}

export async function createGrowthPhotoSignedUrl(
  photo: Pick<GrowthPhoto, 'storageBucket' | 'storagePath'>,
  expiresInSeconds = 300,
): Promise<string> {
  if (photo.storageBucket !== GROWTH_BUCKET) {
    throw new BackendServiceError(
      'INVALID_GROWTH_PHOTO_BUCKET',
      'Growth photos must use the private-impact bucket.',
    );
  }
  if (!Number.isSafeInteger(expiresInSeconds) || expiresInSeconds <= 0) {
    throw new BackendServiceError(
      'INVALID_SIGNED_URL_EXPIRY',
      'Signed URL expiry must be a positive integer.',
    );
  }

  const { data, error } = await getSupabaseClient()
    .storage.from(GROWTH_BUCKET)
    .createSignedUrl(photo.storagePath, expiresInSeconds);
  throwIfSupabaseError(error, 'GROWTH_PHOTO_SIGNED_URL_FAILED');
  return data.signedUrl;
}

export async function removeGrowthPhoto(
  growthRecordId: number,
  mediaAssetId: number,
): Promise<void> {
  positiveInteger(growthRecordId, 'INVALID_GROWTH_RECORD_ID', 'Growth record ID');
  positiveInteger(mediaAssetId, 'INVALID_MEDIA_ASSET_ID', 'Media asset ID');

  const supabase = getSupabaseClient();
  const { data, error } = await supabase.rpc('remove_growth_media', {
    target_growth_record_id: growthRecordId,
    target_media_asset_id: mediaAssetId,
  });
  throwIfSupabaseError(error, 'GROWTH_PHOTO_DETACH_FAILED');

  const removed = data[0];
  if (!removed || removed.storage_bucket !== GROWTH_BUCKET) {
    throw new BackendServiceError(
      'GROWTH_PHOTO_REMOVE_RESULT_INVALID',
      'The detached photo did not return a valid private storage path.',
    );
  }

  const { error: storageError } = await supabase
    .storage.from(GROWTH_BUCKET)
    .remove([removed.storage_path]);
  throwIfSupabaseError(storageError, 'GROWTH_PHOTO_STORAGE_DELETE_FAILED');

  const { error: metadataError } = await supabase
    .from('media_assets')
    .update({ status: 'deleted' })
    .eq('id', removed.media_asset_id);
  throwIfSupabaseError(metadataError, 'GROWTH_PHOTO_METADATA_DELETE_FAILED');
}

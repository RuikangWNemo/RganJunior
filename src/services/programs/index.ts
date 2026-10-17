import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database, Json } from '@/lib/supabase/database.types';
import { getSupabaseClient } from '@/lib/supabase/client';
import { actionProgramIds, type ActionProgramId } from '@/content/actionPrograms';

export type ProgramProduct = {
  id: string; program_id: ActionProgramId; name_zh: string; name_en: string;
  is_active: boolean; sort_order: number; updated_at: string;
};
export type SessionPhoto = { src: string; alt_zh: string; alt_en: string };
export type SessionLink = { kind: 'recruitment' | 'registration' | 'review' | 'reference'; label_zh: string; label_en: string; href: string };
export type ProgramSession = {
  id: string; product_id: string; slug: string; title_zh: string; title_en: string;
  status: 'draft' | 'published' | 'archived'; phase: 'upcoming' | 'past';
  registration_state: 'interest' | 'open' | 'closed'; starts_on: string | null; ends_on: string | null;
  date_label_zh: string; date_label_en: string; location_zh: string; location_en: string;
  description_zh: string; description_en: string; highlights_zh: string[]; highlights_en: string[];
  photos: SessionPhoto[]; links: SessionLink[]; created_at: string; updated_at: string;
};
type SessionRow = Omit<ProgramSession, 'photos' | 'links'> & { photos: Json; links: Json };
type ProductInsert = Omit<ProgramProduct, 'id' | 'updated_at'> & { id?: string };
type SessionInsert = Omit<SessionRow, 'id' | 'created_at' | 'updated_at'> & { id?: string };
// Schema addition kept separate until the deployment regenerates the shared database types.
type ProgramDatabase = Omit<Database, 'public'> & { public: Omit<Database['public'], 'Tables'> & {
  Tables: Database['public']['Tables'] & {
    program_products: { Row: ProgramProduct; Insert: ProductInsert; Update: Partial<ProductInsert>; Relationships: [] };
    program_sessions: { Row: SessionRow; Insert: SessionInsert; Update: Partial<SessionInsert>; Relationships: [] };
  };
} };
const client = () => getSupabaseClient() as unknown as SupabaseClient<ProgramDatabase>;

export function safeProgramLink(value: string): boolean {
  if (/^\/(?!\/)[^\s\\]*$/.test(value)) return true;
  try { const url = new URL(value); return url.protocol === 'https:' && !url.username && !url.password && !/[\s\\]/.test(value); } catch { return false; }
}
const photoSource = (src: string) => /^\/images\/[\w/.-]+$/.test(src) || /^[\w-]+\/[\w.-]+$/.test(src);
export const sessionPath = (session: Pick<ProgramSession, 'slug'>) => `/programs/sessions/${session.slug}`;
export const localizedField = (zh: string, en: string, lang: 'zh' | 'en') => lang === 'en' ? en || zh : zh;

export function decodeSession(row: SessionRow): ProgramSession {
  const photos = Array.isArray(row.photos) ? row.photos.filter((p): p is Record<string, Json> => !!p && typeof p === 'object' && !Array.isArray(p)) : [];
  const links = Array.isArray(row.links) ? row.links.filter((p): p is Record<string, Json> => !!p && typeof p === 'object' && !Array.isArray(p)) : [];
  return { ...row,
    photos: photos.filter(p => typeof p.src === 'string' && photoSource(p.src)).map(p => ({ src: String(p.src), alt_zh: String(p.alt_zh || ''), alt_en: String(p.alt_en || '') })),
    links: links.filter(p => typeof p.href === 'string' && safeProgramLink(p.href) && ['recruitment','registration','review','reference'].includes(String(p.kind))).map(p => ({ kind: p.kind as SessionLink['kind'], href: String(p.href), label_zh: String(p.label_zh || ''), label_en: String(p.label_en || '') })),
  };
}

export async function getProgramCatalog(admin = false) {
  const db = client();
  let productsQuery = db.from('program_products').select('*').order('sort_order');
  let sessionsQuery = db.from('program_sessions').select('*').order('starts_on', { ascending: false, nullsFirst: false }).order('created_at', { ascending: false });
  if (!admin) { productsQuery = productsQuery.eq('is_active', true); sessionsQuery = sessionsQuery.eq('status', 'published'); }
  const [products, sessions] = await Promise.all([productsQuery, sessionsQuery]);
  if (products.error || sessions.error) throw new Error('营期资料暂时无法读取，请稍后重试。 / Could not load sessions.');
  return { products: products.data, sessions: sessions.data.map(decodeSession) };
}

export function validateSession(session: ProgramSession) {
  if (!session.title_zh.trim() || !session.product_id || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(session.slug)) throw new Error('请填写中文标题、产品分类和有效链接名称。');
  if (session.starts_on && session.ends_on && session.ends_on < session.starts_on) throw new Error('结束日期不能早于开始日期。');
  if (session.photos.length > 8 || session.links.length > 20) throw new Error('每期最多 8 张照片、20 个资料链接。');
  if (session.photos.some(p => !photoSource(p.src) || !p.alt_zh.trim())) throw new Error('请为每张照片填写说明，并使用已上传的照片。');
  if (session.links.some(l => !safeProgramLink(l.href) || !l.label_zh.trim())) throw new Error('资料链接需填写标题，并使用站内路径或 HTTPS 地址。');
  if (session.phase === 'past' && session.registration_state !== 'closed') throw new Error('历史活动必须关闭报名。');
  if (session.status === 'published' && (!session.location_zh.trim() || (!session.starts_on && !session.date_label_zh.trim()))) throw new Error('发布前请填写地点和时间。尚未确定日期时可填写时间说明。');
  if (session.status === 'published' && session.registration_state === 'open' && !session.links.some(l => l.kind === 'registration')) throw new Error('开放报名时请添加报名链接。');
}

export async function saveProgramSession(session: ProgramSession) {
  validateSession(session);
  const { id, updated_at, created_at: _createdAt, ...fields } = session;
  const payload = { ...fields, photos: fields.photos as unknown as Json, links: fields.links as unknown as Json };
  const query = id
    ? client().from('program_sessions').update(payload).eq('id', id).eq('updated_at', updated_at)
    : client().from('program_sessions').insert(payload);
  const result = await query.select('*').maybeSingle();
  if (result.error) throw new Error(result.error.code === '23505' ? '链接名称已被使用，请换一个。' : '保存失败，请检查权限、字段和网络后重试。');
  if (!result.data) throw new Error('内容已被其他管理员修改，请重新打开后再编辑。');
  return decodeSession(result.data);
}

export async function saveProgramProduct(product: ProgramProduct) {
  if (!actionProgramIds.has(product.program_id) || !product.name_zh.trim()) throw new Error('请选择项目并填写分类名称。');
  const { id, updated_at, ...payload } = product;
  const query = id ? client().from('program_products').update(payload).eq('id', id).eq('updated_at', updated_at) : client().from('program_products').insert(payload);
  const { data, error } = await query.select('*').maybeSingle();
  if (error || !data) throw new Error('分类保存失败，名称可能重复或已被其他管理员修改。');
  return data;
}

export async function resolveProgramPhotos(photos: SessionPhoto[]): Promise<Record<string, string>> {
  const paths = [...new Set(photos.map(p => p.src).filter(src => !src.startsWith('/')))];
  const urls = Object.fromEntries(photos.filter(p => p.src.startsWith('/')).map(p => [p.src, p.src]));
  if (!paths.length) return urls;
  const { data, error } = await client().storage.from('program-media').createSignedUrls(paths, 300);
  if (error) throw new Error('照片暂时无法读取。');
  if (data?.some(item => item.error || !item.signedUrl)) throw new Error('部分照片暂时无法读取。');
  for (const item of data ?? []) if (item.path && item.signedUrl) urls[item.path] = item.signedUrl;
  return urls;
}

export async function uploadProgramPhoto(file: File): Promise<SessionPhoto> {
  if (!['image/jpeg','image/png','image/webp'].includes(file.type) || file.size > 10 * 1024 * 1024) throw new Error('请上传不超过 10 MB 的 JPG、PNG 或 WebP 图片。');
  const { data: { user }, error } = await client().auth.getUser();
  if (error || !user) throw new Error('请先登录。');
  const extension = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' }[file.type];
  const path = `${user.id}/${crypto.randomUUID()}.${extension}`;
  const result = await client().storage.from('program-media').upload(path, file, { contentType: file.type, upsert: false });
  if (result.error) throw new Error('图片上传失败，请检查营期管理权限或稍后重试。');
  return { src: path, alt_zh: '', alt_en: '' };
}

export function emptySession(productId = ''): ProgramSession {
  return { id: '', product_id: productId, slug: '', title_zh: '', title_en: '', status: 'draft', phase: 'upcoming', registration_state: 'interest', starts_on: null, ends_on: null, date_label_zh: '', date_label_en: '', location_zh: '', location_en: '', description_zh: '', description_en: '', highlights_zh: [], highlights_en: [], photos: [], links: [], created_at: '', updated_at: '' };
}

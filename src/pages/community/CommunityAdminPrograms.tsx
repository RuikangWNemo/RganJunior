import { useEffect, useState, type FormEvent } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useCommunityUi } from '@/lib/communityUi';
import { CommunitySurface, communityInputClass, communityTextareaClass, communityPrimaryButtonClass } from '@/components/community/CommunitySurface';
import { actionPrograms } from '@/content/actionPrograms';
import { emptySession, localizedField, saveProgramProduct, saveProgramSession, sessionPath, uploadProgramPhoto, type ProgramProduct, type ProgramSession, type SessionLink } from '@/services/programs';
import { SessionPhotos, SessionCard, useProgramCatalog } from '@/components/programs/ProgramSessions';

const input = `${communityInputClass} w-full`;
const textarea = `${communityTextareaClass} w-full`;
const emptyProduct = (): ProgramProduct => ({ id: '', program_id: 'life-experience-camp', name_zh: '', name_en: '', is_active: true, sort_order: 0, updated_at: '' });

export default function CommunityAdminPrograms() {
  const { permissions } = useAuth();
  const { t } = useCommunityUi();
  // The route guard handles this too; retain defense for direct component reuse.
  if (!permissions.includes('programs.manage')) return <p role="alert">{t('你没有营期管理权限。', 'You do not have permission to manage sessions.')}</p>;
  return <ProgramManager />;
}

function ProgramManager() {
  const { lang, t } = useCommunityUi();
  const cache = useQueryClient();
  const catalog = useProgramCatalog(true);
  const [draft, setDraft] = useState<ProgramSession | null>(null);
  const [product, setProduct] = useState<ProgramProduct>(emptyProduct);
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [preview, setPreview] = useState(false);

  useEffect(() => {
    if (!dirty) return;
    const prevent = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ''; };
    window.addEventListener('beforeunload', prevent);
    return () => window.removeEventListener('beforeunload', prevent);
  }, [dirty]);

  function open(session: ProgramSession) {
    if (dirty && !window.confirm(t('有未保存的修改，确定切换？', 'Discard unsaved changes and switch?'))) return;
    setDraft(structuredClone(session)); setDirty(false); setError(''); setNotice(''); setPreview(false);
  }
  function change<K extends keyof ProgramSession>(key: K, value: ProgramSession[K]) {
    setDraft(current => current ? { ...current, [key]: value } : current); setDirty(true); setNotice('');
  }
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft || busy) return;
    const submitter = (event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
    const status = (submitter?.value || draft.status) as ProgramSession['status'];
    setBusy(true); setError(''); setNotice('');
    try {
      if (status === 'published' && !catalog.data?.products.some(p => p.id === draft.product_id && p.is_active)) throw new Error(t('请先启用所选产品分类。', 'Activate the selected category before publishing.'));
      const saved = await saveProgramSession({ ...draft, status });
      setDraft(saved); setDirty(false);
      await cache.invalidateQueries({ queryKey: ['program-catalog'] });
      setNotice(status === 'published' ? t('营期已发布，项目页已更新。', 'Session published. The program page is updated.') : t('内容已保存，当前未公开。', 'Saved. This session is not public.'));
    } catch (e) { setError(e instanceof Error ? e.message : t('保存失败', 'Save failed')); }
    finally { setBusy(false); }
  }
  async function saveCategory(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError(''); setNotice('');
    try { setProduct(await saveProgramProduct(product)); await cache.invalidateQueries({ queryKey: ['program-catalog'] }); setNotice(t('分类已保存。', 'Category saved.')); }
    catch (e) { setError(e instanceof Error ? e.message : t('保存失败', 'Save failed')); }
    finally { setBusy(false); }
  }
  async function upload(file: File | undefined) {
    if (!file || !draft || busy) return;
    if (draft.photos.length >= 8) { setError(t('每期最多 8 张照片。', 'A session can have up to 8 photos.')); return; }
    setBusy(true); setError('');
    try { const photo = await uploadProgramPhoto(file); change('photos', [...draft.photos, photo]); }
    catch (e) { setError(e instanceof Error ? e.message : t('上传失败', 'Upload failed')); }
    finally { setBusy(false); }
  }
  const textFields = [
    ['title_zh', '活动标题（中文）', 'Session title (Chinese)'], ['title_en', '活动标题（英文，可选）', 'Session title (English, optional)'],
    ['date_label_zh', '时间说明（中文）', 'Date description (Chinese)'], ['date_label_en', '时间说明（英文）', 'Date description (English)'],
    ['location_zh', '地点（中文）', 'Location (Chinese)'], ['location_en', '地点（英文）', 'Location (English)'],
  ] as const;

  return <CommunitySurface title={t('营期管理', 'Manage sessions')} eyebrow="Programs" description={t('编辑营期、照片与招募回顾资料，预览后发布到项目页。', 'Edit sessions, photos, recruitment and review resources, then preview and publish them.')} backTo="/community" backLabel={t('返回社群', 'Back to community')} width="wide">
    {error && <p role="alert" className="mb-5 rounded-lg border border-destructive p-4 text-destructive">{error}</p>}
    {notice && <p role="status" className="mb-5 rounded-lg bg-secondary p-4">{notice}</p>}
    {catalog.isPending ? <p role="status">{t('正在读取营期…', 'Loading sessions…')}</p> : catalog.isError ? <div role="alert"><p>{t('营期管理暂时无法读取，请确认数据库已完成更新或稍后重试。', 'Session management is unavailable. Check the database update or try again later.')}</p><button type="button" className="min-h-11 underline" onClick={() => void catalog.refetch()}>{t('重试', 'Retry')}</button></div> : <>
      <details className="mb-8 rounded-xl border p-5">
        <summary className="cursor-pointer py-2 text-lg">{t('主题／产品分类', 'Themes and product categories')}</summary>
        <form onSubmit={saveCategory} className="mt-5 space-y-4"><fieldset disabled={busy} className="grid gap-4 sm:grid-cols-2">
          <label>{t('选择分类', 'Select category')}<select className={input} value={product.id} onChange={e => setProduct(catalog.data?.products.find(p => p.id === e.target.value) ?? emptyProduct())}><option value="">{t('新增分类', 'New category')}</option>{catalog.data?.products.map(p => <option key={p.id} value={p.id}>{actionPrograms.find(a => a.id === p.program_id)?.navTitle[lang]} · {localizedField(p.name_zh, p.name_en, lang)}</option>)}</select></label>
          <label>{t('所属项目', 'Program')}<select className={input} value={product.program_id} disabled={Boolean(product.id)} onChange={e => setProduct({ ...product, program_id: e.target.value as ProgramProduct['program_id'] })}>{actionPrograms.map(p => <option key={p.id} value={p.id}>{p.navTitle[lang]}</option>)}</select></label>
          <label>{t('分类名称（中文）', 'Category name (Chinese)')}<input className={input} required maxLength={100} value={product.name_zh} onChange={e => setProduct({ ...product, name_zh: e.target.value })} /></label>
          <label>{t('分类名称（英文）', 'Category name (English)')}<input className={input} maxLength={160} value={product.name_en} onChange={e => setProduct({ ...product, name_en: e.target.value })} /></label>
          <label>{t('排列顺序', 'Sort order')}<input className={input} type="number" step="1" value={product.sort_order} onChange={e => setProduct({ ...product, sort_order: Number(e.target.value) })} /></label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={product.is_active} onChange={e => setProduct({ ...product, is_active: e.target.checked })} />{t('启用分类（关闭后该分类及营期不再公开）', 'Active category (turning this off hides its sessions)')}</label>
          <button className={communityPrimaryButtonClass} type="submit">{t('保存分类', 'Save category')}</button>
        </fieldset></form>
      </details>
      <div className="grid items-start gap-8 lg:grid-cols-[16rem_minmax(0,1fr)]">
        <aside className="space-y-3"><button disabled={busy} type="button" className={communityPrimaryButtonClass} onClick={() => open(emptySession(catalog.data?.products.find(p => p.is_active)?.id))}>{t('新增营期', 'New session')}</button>
          {catalog.data?.sessions.map(s => <button key={s.id} type="button" disabled={busy} onClick={() => open(s)} aria-pressed={draft?.id === s.id} className="block w-full rounded-lg border p-4 text-left aria-pressed:border-primary aria-pressed:bg-secondary"><span className="block">{localizedField(s.title_zh, s.title_en, lang)}</span><span className="mt-2 block text-xs text-muted-foreground">{s.status === 'published' ? t('已发布', 'Published') : s.status === 'archived' ? t('已归档', 'Archived') : t('草稿', 'Draft')}</span></button>)}
        </aside>
        {draft ? <form onSubmit={save} className="min-w-0"><fieldset disabled={busy} className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <label>{t('产品分类', 'Product category')}<select required className={input} value={draft.product_id} onChange={e => change('product_id', e.target.value)}><option value="">{t('请选择', 'Select')}</option>{catalog.data?.products.map(p => <option key={p.id} value={p.id}>{actionPrograms.find(a => a.id === p.program_id)?.navTitle[lang]} · {localizedField(p.name_zh, p.name_en, lang)}{!p.is_active ? t('（已停用）', ' (inactive)') : ''}</option>)}</select></label>
            <label>{t('活动链接名称（小写英文及短横线，保存后固定）', 'URL name (lowercase and hyphens; fixed after saving)')}<input required className={input} maxLength={100} pattern="[a-z0-9]+(-[a-z0-9]+)*" readOnly={Boolean(draft.id)} value={draft.slug} onChange={e => change('slug', e.target.value)} /></label>
            {textFields.map(([key, zh, en]) => <label key={key}>{t(zh, en)}<input className={input} required={key === 'title_zh'} maxLength={key === 'title_zh' ? 160 : 240} value={draft[key]} onChange={e => change(key, e.target.value)} /></label>)}
            <label>{t('开始日期（可选）', 'Start date (optional)')}<input type="date" className={input} value={draft.starts_on ?? ''} onChange={e => change('starts_on', e.target.value || null)} /></label>
            <label>{t('结束日期（可选）', 'End date (optional)')}<input type="date" className={input} value={draft.ends_on ?? ''} onChange={e => change('ends_on', e.target.value || null)} /></label>
            <label>{t('活动阶段', 'Session stage')}<select className={input} value={draft.phase} onChange={e => { const phase = e.target.value as ProgramSession['phase']; setDraft({ ...draft, phase, registration_state: phase === 'past' ? 'closed' : draft.registration_state }); setDirty(true); }}><option value="upcoming">{t('下一期', 'Upcoming')}</option><option value="past">{t('以往活动', 'Past')}</option></select></label>
            <label>{t('报名状态', 'Registration')}<select className={input} value={draft.registration_state} disabled={draft.phase === 'past'} onChange={e => change('registration_state', e.target.value as ProgramSession['registration_state'])}><option value="interest">{t('登记意向', 'Register interest')}</option><option value="open">{t('开放报名', 'Registration open')}</option><option value="closed">{t('报名关闭', 'Closed')}</option></select></label>
          </div>
          {(['zh','en'] as const).map(language => <div key={language} className="space-y-4">
            <label className="block">{language === 'zh' ? t('活动详情（中文）', 'Details (Chinese)') : t('活动详情（英文）', 'Details (English)')}<textarea rows={5} className={textarea} value={draft[`description_${language}`]} onChange={e => change(`description_${language}`, e.target.value)} /></label>
            <label className="block">{language === 'zh' ? t('亮点（中文，每行一条）', 'Highlights (Chinese, one per line)') : t('亮点（英文，每行一条）', 'Highlights (English, one per line)')}<textarea rows={3} className={textarea} value={draft[`highlights_${language}`].join('\n')} onChange={e => change(`highlights_${language}`, e.target.value.split('\n'))} /></label>
          </div>)}
          <section aria-label={t('活动照片', 'Session photos')}><h2 className="text-xl">{t('照片', 'Photos')}</h2><p className="my-2 text-sm">{t('最多 8 张，每张不超过 10 MB。移除照片仅从本期展示中移除。', 'Up to 8 photos, 10 MB each. Removing a photo removes it from this session only.')}</p>
            <label>{t('上传照片', 'Upload photo')}<input type="file" accept="image/jpeg,image/png,image/webp" disabled={busy || draft.photos.length >= 8} onChange={e => { void upload(e.target.files?.[0]); e.target.value = ''; }} className="my-3 block max-w-full" /></label>
            <SessionPhotos session={draft} />
            {draft.photos.map((photo, i) => <div className="mb-3 grid gap-2 rounded-lg border p-3" key={photo.src}>
              <label>{t(`照片 ${i + 1} 说明（中文）`, `Photo ${i + 1} description (Chinese)`)}<input className={input} value={photo.alt_zh} onChange={e => change('photos', draft.photos.map((p, j) => j === i ? { ...p, alt_zh: e.target.value } : p))} /></label>
              <label>{t(`照片 ${i + 1} 说明（英文）`, `Photo ${i + 1} description (English)`)}<input className={input} value={photo.alt_en} onChange={e => change('photos', draft.photos.map((p, j) => j === i ? { ...p, alt_en: e.target.value } : p))} /></label>
              <button type="button" className="min-h-11 text-left underline" onClick={() => change('photos', draft.photos.filter((_, j) => i !== j))}>{t('移除此照片', 'Remove photo')}</button>
            </div>)}
          </section>
          <section aria-label={t('活动资料链接', 'Session resource links')}><h2 className="text-xl">{t('招募、报名、回顾与参考资料', 'Recruitment, registration, reviews, and references')}</h2>
            {draft.links.map((link, i) => <div key={i} className="my-4 grid gap-3 rounded-lg border p-4 sm:grid-cols-2">
              <label>{t(`资料 ${i + 1} 类型`, `Resource ${i + 1} type`)}<select className={input} value={link.kind} onChange={e => change('links', draft.links.map((l, j) => i === j ? { ...l, kind: e.target.value as SessionLink['kind'] } : l))}>{(['recruitment','registration','review','reference'] as const).map((kind, k) => <option key={kind} value={kind}>{t(['历史招募／邀请','报名入口','往期回顾','参考资料'][k], ['Recruitment / invitation','Registration','Review','Reference'][k])}</option>)}</select></label>
              {(['label_zh','label_en','href'] as const).map(key => <label key={key}>{t(`资料 ${i + 1} ${key === 'href' ? '链接' : key === 'label_zh' ? '中文标题' : '英文标题'}`, `Resource ${i + 1} ${key === 'href' ? 'URL' : key === 'label_zh' ? 'Chinese title' : 'English title'}`)}<input className={input} value={link[key]} onChange={e => change('links', draft.links.map((l, j) => i === j ? { ...l, [key]: e.target.value } : l))} /></label>)}
              <button type="button" className="min-h-11 text-left underline" onClick={() => change('links', draft.links.filter((_, j) => i !== j))}>{t('移除此链接', 'Remove link')}</button>
            </div>)}
            <button type="button" className="min-h-11 underline" disabled={draft.links.length >= 20} onClick={() => change('links', [...draft.links, { kind: 'reference', label_zh: '', label_en: '', href: '' }])}>{t('添加资料链接', 'Add resource link')}</button>
          </section>
          <div className="flex flex-wrap gap-4 border-t pt-6">
            <button type="button" className="min-h-11 underline" onClick={() => setPreview(!preview)}>{t('预览营期卡片', 'Preview session card')}</button>
            <button type="submit" value="draft" className={communityPrimaryButtonClass}>{draft.status === 'published' ? t('撤回并存为草稿', 'Unpublish and save draft') : t('保存草稿', 'Save draft')}</button>
            <button type="submit" value="published" className={communityPrimaryButtonClass}>{t('发布到项目页', 'Publish to program page')}</button>
            {draft.id && <button type="submit" value="archived" className="min-h-11 underline">{t('归档并下架', 'Archive and unpublish')}</button>}
          </div>
          {dirty && <p className="text-sm">{t('有未保存的修改', 'Unsaved changes')}</p>}
          {draft.status === 'published' && draft.id && <Link to={sessionPath(draft)} className="inline-block py-3 underline" target="_blank">{t('查看公开活动页', 'View published session')}</Link>}
        </fieldset>
          {busy && <p role="status">{t('正在保存或上传…', 'Saving or uploading…')}</p>}
          {preview && <div className="mt-8"><p className="mb-3 text-sm">{t('当前草稿预览，保存发布后才会更新官网。', 'Draft preview. Publish to update the website.')}</p><SessionCard session={draft} /></div>}
        </form> : <p>{t('选择一条营期编辑，或新增营期。', 'Select a session to edit, or create a new one.')}</p>}
      </div>
    </>}
  </CommunitySurface>;
}

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { getActionInquiryPath, type ActionProgramId } from '@/content/actionPrograms';
import { getProgramCatalog, localizedField, resolveProgramPhotos, sessionPath, type ProgramSession } from '@/services/programs';

export function isPastSession(session: ProgramSession, today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date())) {
  return session.phase === 'past' || Boolean(session.ends_on && session.ends_on < today);
}

export function useProgramCatalog(admin = false) {
  return useQuery({ queryKey: ['program-catalog', admin ? 'admin' : 'public'], queryFn: () => getProgramCatalog(admin), staleTime: 30_000, retry: 1 });
}

export function SessionPhotos({ session, coverOnly = false }: { session: ProgramSession; coverOnly?: boolean }) {
  const { lang, t } = useLanguage();
  const photos = coverOnly ? session.photos.slice(0, 1) : session.photos;
  const resolved = useQuery({ queryKey: ['program-photos', photos.map(p => p.src).join('|')], queryFn: () => resolveProgramPhotos(photos), staleTime: 2 * 60_000, refetchInterval: 2 * 60_000, enabled: photos.length > 0 });
  if (!photos.length) return null;
  if (resolved.isError) return <p className="text-sm">{t('照片暂时无法显示', 'Photos are temporarily unavailable')}</p>;
  return <div className={coverOnly ? '' : 'grid gap-4 sm:grid-cols-2'}>{photos.map(photo => {
    const url = photo.src.startsWith('/') ? photo.src : resolved.data?.[photo.src];
    return url ? <img key={photo.src} src={url} alt={localizedField(photo.alt_zh, photo.alt_en, lang)} loading="lazy" className={coverOnly ? 'aspect-[3/2] w-full rounded-xl object-cover' : 'h-auto w-full rounded-xl'} /> : <div key={photo.src} className="aspect-[3/2] rounded-xl bg-secondary" aria-label={t('照片加载中', 'Loading photo')} />;
  })}</div>;
}

export function SessionShare({ session }: { session: ProgramSession }) {
  const { t } = useLanguage();
  const [notice, setNotice] = useState('');
  const [manualUrl, setManualUrl] = useState('');
  async function copy() {
    const url = `${window.location.origin}${sessionPath(session)}`;
    try { await navigator.clipboard.writeText(url); setNotice(t('链接已复制', 'Link copied')); setManualUrl(''); }
    catch { setManualUrl(url); setNotice(t('请选中下方链接复制', 'Select the link below to copy it')); }
  }
  return <div><button type="button" onClick={() => void copy()} className="min-h-11 underline underline-offset-4">{t('复制转发链接', 'Copy share link')}</button>
    {notice && <p role="status" className="text-sm">{notice}</p>}
    {manualUrl && <input aria-label={t('转发链接', 'Share link')} readOnly value={manualUrl} onFocus={e => e.target.select()} className="w-full border p-2 text-sm" />}
  </div>;
}

export function SessionLinks({ session }: { session: ProgramSession }) {
  const { lang, t } = useLanguage();
  return <ul className="flex flex-wrap gap-x-5 gap-y-2" aria-label={t('招募、回顾与参考资料', 'Recruitment, reviews, and resources')}>
    {session.links.filter(link => link.kind !== 'registration' || (!isPastSession(session) && session.registration_state === 'open')).map(link => <li key={`${link.kind}:${link.href}`}>
      <a href={link.href} target={link.href.startsWith('https:') ? '_blank' : undefined} rel="noreferrer" className="inline-block py-2 underline underline-offset-4">{localizedField(link.label_zh, link.label_en, lang)}</a>
    </li>)}
  </ul>;
}

export function SessionCard({ session }: { session: ProgramSession }) {
  const { lang, t } = useLanguage();
  const title = localizedField(session.title_zh, session.title_en, lang);
  const date = localizedField(session.date_label_zh, session.date_label_en, lang) || [session.starts_on, session.ends_on].filter(Boolean).join(' – ');
  return <article className="min-w-0 rounded-xl border border-border bg-background p-5 sm:p-6">
    <Link to={sessionPath(session)} aria-label={t(`查看活动：${title}`, `View session: ${title}`)}><SessionPhotos session={session} coverOnly /></Link>
    <p className="mt-5 text-sm text-muted-foreground">{date} · {localizedField(session.location_zh, session.location_en, lang)}</p>
    <h4 className="mt-3 text-2xl text-primary"><Link to={sessionPath(session)}>{title}</Link></h4>
    <p className="mt-3 text-sm text-primary">{isPastSession(session) ? t('已结束 · 报名关闭', 'Past session · Registration closed') : session.registration_state === 'open' ? t('正在招募', 'Registration open') : session.registration_state === 'closed' ? t('报名已关闭', 'Registration closed') : t('接受参与意向', 'Expressions of interest welcome')}</p>
    <ul className="my-4 list-inside list-disc space-y-2 leading-7">{(lang === 'en' && session.highlights_en.length ? session.highlights_en : session.highlights_zh).map((line, i) => <li key={i}>{line}</li>)}</ul>
    <SessionLinks session={session} />
    <div className="mt-4 flex flex-wrap items-center gap-x-5"><Link to={sessionPath(session)} className="py-2 underline underline-offset-4">{t('活动详情', 'Session details')} →</Link><SessionShare session={session} /></div>
  </article>;
}

export default function ProgramSessions({ programId }: { programId: ActionProgramId }) {
  const { lang, t } = useLanguage();
  const catalog = useProgramCatalog();
  const [category, setCategory] = useState('all');
  const products = catalog.data?.products.filter(p => p.program_id === programId) ?? [];
  const productIds = new Set(products.map(p => p.id));
  const sessions = (catalog.data?.sessions ?? []).filter(s => productIds.has(s.product_id) && (category === 'all' || category === s.product_id));
  return <section className="my-12 border-t border-border pt-8" aria-label={t('营期与活动', 'Sessions and activities')}>
    <h2 className="text-3xl text-primary">{t('营期与活动', 'Sessions and activities')}</h2>
    {catalog.isPending ? <p role="status" className="mt-4">{t('正在读取营期…', 'Loading sessions…')}</p> : catalog.isError ? <div role="alert" className="mt-4"><p>{t('营期资料暂时无法读取，请稍后重试或联系我们。', 'Session information is temporarily unavailable. Please retry or contact us.')}</p><button className="min-h-11 underline" onClick={() => void catalog.refetch()}>{t('重试', 'Retry')}</button></div> : <>
      {products.length > 0 && <div role="group" aria-label={t('主题与产品分类', 'Themes and products')} className="my-6 flex flex-wrap gap-2">
        {[{ id: 'all', name_zh: '全部主题', name_en: 'All themes' }, ...products].map(p => <button key={p.id} type="button" onClick={() => setCategory(p.id)} aria-pressed={category === p.id} className="min-h-11 rounded-full border border-border px-4 text-sm aria-pressed:border-primary aria-pressed:bg-primary aria-pressed:text-primary-foreground">{localizedField(p.name_zh, p.name_en, lang)}</button>)}
      </div>}
      {(['upcoming','past'] as const).map(phase => {
        const group = sessions.filter(s => isPastSession(s) === (phase === 'past')).sort((a, b) => phase === 'upcoming' ? (a.starts_on ?? '9999').localeCompare(b.starts_on ?? '9999') : (b.starts_on ?? '').localeCompare(a.starts_on ?? ''));
        return <div key={phase} className="mt-8"><h3 className="mb-5 text-2xl text-primary">{phase === 'upcoming' ? t('下一期活动', 'Upcoming sessions') : t('以往活动', 'Past sessions')}</h3>
          {group.length ? <div className="grid gap-6 lg:grid-cols-2">{group.map(session => <SessionCard key={session.id} session={session} />)}</div> : <p className="leading-8 text-muted-foreground">{phase === 'upcoming' ? <>{t('下一期待公布。', 'The next session will be announced here.')} <Link className="underline underline-offset-4" to={getActionInquiryPath(programId)}>{t('登记下一期意向', 'Register interest in the next session')}</Link></> : t('这一分类的活动记录正在整理中。', 'Past sessions in this category are being documented.')}</p>}
        </div>;
      })}
    </>}
  </section>;
}

import { Link, useParams } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { getActionInquiryPath } from '@/content/actionPrograms';
import { localizedField } from '@/services/programs';
import { isPastSession, SessionLinks, SessionPhotos, SessionShare, useProgramCatalog } from '@/components/programs/ProgramSessions';
import ContactChannels from '@/components/ContactChannels';

export default function ProgramSession() {
  const { slug } = useParams();
  const { lang, t } = useLanguage();
  const catalog = useProgramCatalog();
  const session = catalog.data?.sessions.find(s => s.slug === slug);
  const product = catalog.data?.products.find(p => p.id === session?.product_id);
  return <article className="mx-auto max-w-5xl px-6 pb-20 pt-32">
    <Link className="inline-block py-3 text-primary underline underline-offset-4" to={product ? `/programs/${product.program_id}` : '/programs'}>{t('返回项目介绍', 'Back to the program')}</Link>
    {catalog.isPending ? <p role="status">{t('正在读取活动…', 'Loading session…')}</p> : catalog.isError ? <div role="alert"><p>{t('暂时无法读取活动', 'Could not load this session')}</p><button className="min-h-11 underline" onClick={() => void catalog.refetch()}>{t('重试', 'Retry')}</button></div> : session && product ? <>
      <p className="mt-8 text-sm text-primary">{localizedField(product.name_zh, product.name_en, lang)}</p>
      <h1 className="mt-4 text-balance text-4xl leading-snug text-primary">{localizedField(session.title_zh, session.title_en, lang)}</h1>
      <p className="my-6 leading-8">{localizedField(session.date_label_zh, session.date_label_en, lang) || [session.starts_on, session.ends_on].filter(Boolean).join(' – ')}<br />{localizedField(session.location_zh, session.location_en, lang)}</p>
      <SessionPhotos session={session} />
      <p className="my-8 whitespace-pre-line leading-8">{localizedField(session.description_zh, session.description_en, lang)}</p>
      <ul className="my-8 list-inside list-disc space-y-3">{(lang === 'en' && session.highlights_en.length ? session.highlights_en : session.highlights_zh).map((line, i) => <li key={i}>{line}</li>)}</ul>
      <h2 className="mt-10 text-2xl text-primary">{t('招募、回顾与参考资料', 'Recruitment, reviews, and resources')}</h2>
      {isPastSession(session) && <p className="my-4 text-sm">{t('本期活动已结束，以下招募资料保留用于回看。', 'This session has ended. The original recruitment material is retained for reference.')}</p>}
      <SessionLinks session={session} />
      {!isPastSession(session) && session.registration_state === 'interest' && <Link className="inline-block py-3 underline" to={getActionInquiryPath(product.program_id)}>{t('登记参与意向', 'Register interest')}</Link>}
      <SessionShare session={session} /><ContactChannels />
    </> : <h1 className="mt-10 text-3xl">{t('未找到已发布的活动', 'Published session not found')}</h1>}
  </article>;
}

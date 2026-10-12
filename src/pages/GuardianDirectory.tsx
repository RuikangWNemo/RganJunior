import { Link, useParams } from 'react-router-dom';
import { guardianMembers, guardianProfilePath } from '@/content/guardians';
import { useLanguage } from '@/contexts/LanguageContext';

const linkClass = 'inline-flex items-center gap-2 rounded-sm py-3 text-primary underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4';

export default function GuardianDirectory() {
  const { memberId } = useParams<{ memberId: string }>();
  const { t, lang } = useLanguage();
  const member = guardianMembers.find((entry) => entry.id === memberId);

  return (
    <div className="about-v2-page px-6 pb-20 pt-28 sm:px-8 sm:pt-36">
      <div className="mx-auto max-w-6xl">
        <nav aria-label={t('守护团页面导航', 'Guardian circle navigation')}>
          <Link className={linkClass} to={memberId ? '/about/guardians' : '/about#team-guardian-title'}>
            <span aria-hidden="true">←</span>
            {memberId ? t('查看全部成员', 'View all members') : t('返回关于我们', 'Back to About')}
          </Link>
        </nav>

        {memberId ? (
          member ? (
            <article className="mt-10 grid items-start gap-8 md:grid-cols-2 md:gap-16">
              <img
                className="aspect-[4/5] w-full max-w-md rounded-2xl object-cover"
                src={member.photo}
                alt={member.name?.[lang] ?? t('守护团成员肖像', 'Guardian circle member portrait')}
                width="1067" height="1600" decoding="async"
              />
              <div className="py-4">
                <p className="mb-4 text-sm text-muted-foreground">{t('守护团', 'Guardian Circle')}</p>
                <h1 className="text-balance text-4xl text-primary sm:text-5xl">
                  {member.name?.[lang] ?? t('守护团成员', 'Guardian Circle Member')}
                </h1>
                {member.bio ? (
                  <p className="mt-8 whitespace-pre-line text-pretty text-lg leading-relaxed">{member.bio[lang]}</p>
                ) : (
                  <div className="mt-8 space-y-3">
                    <h2 className="text-2xl text-primary">{t('敬请期待', 'Coming soon')}</h2>
                    <p className="text-pretty leading-relaxed text-muted-foreground">
                      {t('成员介绍正在整理中，更多故事将在这里与大家见面。', 'This member’s profile is being prepared. More stories will be shared here soon.')}
                    </p>
                  </div>
                )}
                <div className="mt-10">
                  <Link className={linkClass} to="/about/guardians">{t('认识更多守护团成员', 'Meet more members')} <span aria-hidden="true">→</span></Link>
                </div>
              </div>
            </article>
          ) : (
            <div className="py-16">
              <h1 className="text-3xl text-primary">{t('未找到这位成员', 'Member not found')}</h1>
              <p className="mt-4 text-muted-foreground">{t('请返回全部成员页面查看。', 'Please return to the member directory.')}</p>
            </div>
          )
        ) : (
          <>
            <header className="mb-12 mt-10 max-w-2xl">
              <h1 className="text-balance text-4xl text-primary sm:text-6xl">{t('守护团', 'Guardian Circle')}</h1>
              <p className="mt-6 text-pretty text-lg leading-relaxed text-muted-foreground">
                {t('陪伴青少年走进真实世界的伙伴们。点击照片，了解每一位成员。', 'Meet the people supporting young people in the real world. Select a portrait to explore each member’s profile.')}
              </p>
            </header>
            <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4" aria-label={t('全部守护团成员', 'All guardian circle members')}>
              {guardianMembers.map((entry, index) => (
                <Link
                  key={entry.id}
                  to={guardianProfilePath(entry)}
                  className="block min-w-0 rounded-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
                  aria-label={t(`查看守护团成员 ${index + 1} 资料`, `View guardian circle member ${index + 1} profile`)}
                >
                  <img
                    className="aspect-[4/5] w-full rounded-2xl object-cover"
                    src={entry.photo}
                    alt={entry.name?.[lang] ?? t(`守护团成员 ${index + 1}`, `Guardian circle member ${index + 1}`)}
                    width="1067" height="1600" loading={index < 4 ? 'eager' : 'lazy'} decoding="async"
                  />
                  <h2 className="mt-4 text-xl text-primary">{entry.name?.[lang] ?? t('敬请期待', 'Coming soon')}</h2>
                  <p className="mt-2 text-sm text-muted-foreground">{t('查看详情', 'View profile')} <span aria-hidden="true">→</span></p>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowDownRight, ArrowRight, Mail } from 'lucide-react';
import { joinAudiences, type JoinAudienceId } from '@/content/siteContent';
import { useLanguage } from '@/contexts/LanguageContext';
import { BRAND, CONTACT_EMAIL, type LocalizedText, pickLocalized } from '@/lib/brand';

interface ContactLedgerItem {
  label: LocalizedText;
  status?: LocalizedText;
  value?: string;
  href?: string;
}

const contactLedger: ContactLedgerItem[] = [
  { label: { zh: '邮箱', en: 'Email' }, value: CONTACT_EMAIL, href: `mailto:${CONTACT_EMAIL}` },
  { label: { zh: '微信 / 表单', en: 'WeChat / Form' }, status: { zh: '待发布', en: 'To be published' } },
  { label: { zh: '当前阶段', en: 'Current Stage' }, status: { zh: '小规模深度探索', en: 'Small-scale deep exploration' } },
];

const contentById = new Map(joinAudiences.map((item) => [item.id, item]));

const panelTransition = {
  initial: { opacity: 0, y: 10 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.28,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  },
};

export default function JoinUs() {
  const { lang, t } = useLanguage();
  const brandName = pickLocalized(BRAND.name, lang);
  const [activeId, setActiveId] = useState<JoinAudienceId>('join-youth');

  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    if (joinAudiences.some((item) => item.id === hash)) {
      setActiveId(hash as JoinAudienceId);
    }
  }, []);

  const activeContent = useMemo(
    () => contentById.get(activeId) ?? joinAudiences[0],
    [activeId]
  );

  return (
    <div className="pt-20">
      <section className="pt-20 pb-12 sm:pt-32 sm:pb-16 md:pt-40 md:pb-20 lg:pt-48">
        <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p data-page-motion="title" className="text-xs uppercase tracking-[0.22em] text-primary/70">
              {t('Join', 'Join')}
            </p>
            <h1 data-page-motion="title" className="mt-5 font-serif text-4xl text-foreground md:text-5xl lg:text-6xl">
              {t('加入阿柑少年', `Join ${brandName}`)}
            </h1>
            <div className="mt-6 h-px w-12 bg-primary" />
            <p data-page-motion="lead" className="mt-8 max-w-2xl break-words text-base leading-8 text-muted-foreground md:text-lg">
              {t(
                '选择适合你的加入方式。当前阶段保持小规模深度探索，通过官方渠道统一沟通；真实伙伴故事会在整理完成后单独发布。',
                `Choose how you want to join ${brandName}. We are currently in a small-scale deep exploration stage and communicate through official channels; real partner stories will be published separately once they are ready.`
              )}
            </p>
          </div>
        </div>
      </section>

      <section id="voices" className="join-voices-section border-y border-border/70 py-16 md:py-20">
        <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
            <div className="max-w-2xl min-w-0">
              <p className="join-motion join-stage-kicker text-xs uppercase tracking-[0.22em] text-primary/70">
                {t('Voices', 'Voices')}
              </p>
              <h2 className="join-motion join-stage-title mt-5 font-serif text-3xl text-foreground md:text-4xl">
                {t('伙伴之声', 'Partner Voices')}
              </h2>
              <p className="join-motion join-stage-intro mt-6 break-words text-base leading-8 text-muted-foreground">
                {t(
                  '这里先保留为一个安静入口。访谈文字、真实音频、播客片段或短片整理完成后，会放在独立页面中逐步更新。',
                  'This stays as a quiet entry point for now. Interview notes, real audio, podcast clips, or short films will move into a dedicated page as they become ready.'
                )}
              </p>
            </div>
            <Link
              to="/voices"
              className="cursor-target join-motion join-motion-link inline-flex items-center gap-2 text-sm text-foreground transition-organic hover:text-primary md:justify-self-end"
            >
              <span>{t('打开展开页', 'Open the full page')}</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div data-page-motion="actions" className="border-b border-border/80">
            <div
              role="tablist"
              aria-label={t('加入身份选择', 'Join identity selector')}
              className="flex flex-wrap gap-6 md:gap-10"
            >
              {joinAudiences.map((identity) => {
                const isActive = activeId === identity.id;

                return (
                  <button
                    key={identity.id}
                    type="button"
                    id={identity.id}
                    role="tab"
                    aria-selected={isActive}
                    data-active={isActive}
                    aria-controls={`join-panel-${identity.id}`}
                    onClick={() => setActiveId(identity.id)}
                    className={`cursor-target join-identity-tab -mb-px border-b pb-4 text-left font-serif text-lg transition-organic md:text-xl ${
                      isActive
                        ? 'border-primary text-foreground'
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {pickLocalized(identity.trigger, lang)}
                  </button>
                );
              })}
            </div>
          </div>

          <motion.div
            key={activeId}
            id={`join-panel-${activeId}`}
            role="tabpanel"
            aria-labelledby={activeId}
            variants={panelTransition}
            initial="initial"
            animate="animate"
            className="join-panel mt-14 max-w-3xl"
          >
            <p className="join-motion join-motion-kicker text-xs uppercase tracking-[0.22em] text-primary/70">
              {t('Identity', 'Identity')}
            </p>
            <h2 className="join-motion join-motion-title mt-5 font-serif text-3xl text-foreground md:text-4xl">
              {pickLocalized(activeContent.heading, lang)}
            </h2>
            <p className="join-motion join-motion-intro mt-8 max-w-xl text-base leading-8 text-muted-foreground">
              {pickLocalized(activeContent.intro, lang)}
            </p>

            <dl className="join-motion join-motion-rows mt-10 border-t border-border/80">
              {activeContent.rows.map((row) => (
                <div
                  key={pickLocalized(row.label, lang)}
                  className="join-detail-row grid gap-2 border-b border-border/80 py-5 md:grid-cols-[120px_minmax(0,1fr)] md:gap-8"
                >
                  <dt className="join-detail-label text-xs uppercase tracking-[0.18em] text-primary/70">
                    {pickLocalized(row.label, lang)}
                  </dt>
                  <dd className="join-detail-value text-sm leading-7 text-foreground/88">
                    {pickLocalized(row.value, lang)}
                  </dd>
                </div>
              ))}
            </dl>

            <a
              href="#contact-ledger"
              className="cursor-target join-motion join-motion-link mt-8 inline-flex items-center gap-2 text-sm text-foreground transition-organic hover:text-primary"
            >
              <span>{pickLocalized(activeContent.closing, lang)}</span>
              <ArrowDownRight className="h-4 w-4" />
            </a>
          </motion.div>
        </div>
      </section>

      <section id="contact-ledger" className="border-t border-border/80 py-20 md:py-24">
        <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="join-motion join-contact-kicker text-xs uppercase tracking-[0.22em] text-primary/70">
              {t('Contact', 'Contact')}
            </p>
            <h2 className="join-motion join-contact-title mt-5 font-serif text-3xl text-foreground md:text-4xl">
              {t('统一联系方式', 'Shared Contact')}
            </h2>
            <p className="join-motion join-contact-intro mt-8 max-w-2xl text-base leading-8 text-muted-foreground">
              {t(
                '当前统一通过邮箱联系。微信、表单与更多公开渠道整理完成后，会更新在这一处。',
                'For now, contact is unified through email. WeChat, forms, and additional public channels will be added here when ready.'
              )}
            </p>
          </div>

          <div className="mt-12 border-t border-border/80">
            {contactLedger.map((item) => (
              <div
                key={pickLocalized(item.label, lang)}
                className="join-contact-row grid gap-3 border-b border-border/80 py-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:gap-4"
              >
                <p className="join-contact-label font-serif text-xl text-foreground">
                  {pickLocalized(item.label, lang)}
                </p>
                {item.href && item.value ? (
                  <a
                    href={item.href}
                    className="cursor-target join-contact-status inline-flex min-w-0 items-center gap-2 break-all text-sm text-foreground transition-colors hover:text-primary"
                  >
                    <Mail className="h-4 w-4 text-primary" />
                    {item.value}
                  </a>
                ) : (
                  <p className="join-contact-status text-sm text-muted-foreground">
                    {pickLocalized(item.status!, lang)}
                  </p>
                )}
              </div>
            ))}
          </div>

          <p className="mt-6 text-sm leading-7 text-muted-foreground">
            {t(
              '面向青少年、家长与合作伙伴的正式联络入口，将统一发布在这一处。',
              'The formal contact entry for youth, parents, and partners will be kept here as one shared source.'
            )}
          </p>
        </div>
      </section>
    </div>
  );
}

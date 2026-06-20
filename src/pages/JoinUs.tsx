import { lazy, Suspense, useEffect, useMemo, useState, type CSSProperties } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { joinAudiences, type JoinAudienceId } from '@/content/siteContent';
import { useLanguage } from '@/contexts/LanguageContext';
import { BRAND, type LocalizedText, pickLocalized } from '@/lib/brand';

const Lanyard = lazy(() => import('@/components/ui/lanyard/Lanyard'));

interface JoinIdentityVisual {
  eyebrow: LocalizedText;
  card: string;
  cardAlt: LocalizedText;
}

const contentById = new Map(joinAudiences.map((item) => [item.id, item]));

const identityVisuals: Record<JoinAudienceId, JoinIdentityVisual> = {
  'join-youth': {
    eyebrow: { zh: '山野与田野', en: 'Mountain & Field' },
    card: '/images/join/youth-card.webp',
    cardAlt: { zh: '成为阿柑少年的悬挂卡片插图', en: "Hanging card illustration for R'gan Junior youth" },
  },
  'join-parents': {
    eyebrow: { zh: '陪伴与边界', en: 'Care & Boundaries' },
    card: '/images/join/parents-card.webp',
    cardAlt: { zh: '成为阿柑家长的悬挂卡片插图', en: "Hanging card illustration for R'gan Junior parents" },
  },
  'join-partners': {
    eyebrow: { zh: '共创与行动', en: 'Co-creation & Action' },
    card: '/images/join/partners-card.webp',
    cardAlt: { zh: '成为合作伙伴的悬挂卡片插图', en: 'Hanging card illustration for partners' },
  },
};

const panelTransition = {
  initial: { opacity: 0, y: 12 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.32,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  },
};

const burstParticles = Array.from({ length: 12 }, (_, index) => index);

function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setPrefersReducedMotion(query.matches);

    sync();
    query.addEventListener('change', sync);
    return () => query.removeEventListener('change', sync);
  }, []);

  return prefersReducedMotion;
}

function canCreateWebGLContext() {
  if (typeof document === 'undefined') return false;

  try {
    const canvas = document.createElement('canvas');
    return Boolean(
      window.WebGLRenderingContext &&
        (canvas.getContext('webgl2') ||
          canvas.getContext('webgl') ||
          canvas.getContext('experimental-webgl'))
    );
  } catch {
    return false;
  }
}

function useWebGLAvailable() {
  const [webGLAvailable, setWebGLAvailable] = useState(false);

  useEffect(() => {
    setWebGLAvailable(canCreateWebGLContext());
  }, []);

  return webGLAvailable;
}

function StaticJoinCard({
  visual,
  title,
  subtitle,
  lang,
}: {
  visual: JoinIdentityVisual;
  title: string;
  subtitle: string;
  lang: 'zh' | 'en';
}) {
  return (
    <div className="join-static-lanyard">
      <span className="join-static-lanyard__pin" aria-hidden="true" />
      <span className="join-static-lanyard__cord" aria-hidden="true" />
      <div className="join-static-lanyard__card">
        <img src={visual.card} alt={pickLocalized(visual.cardAlt, lang)} />
        <span className="join-static-lanyard__identity">{title}</span>
        <span className="join-static-lanyard__eyebrow">{subtitle}</span>
      </div>
    </div>
  );
}

function MobileJoinIdentityCard({
  visual,
  title,
  subtitle,
  lang,
}: {
  visual: JoinIdentityVisual;
  title: string;
  subtitle: string;
  lang: 'zh' | 'en';
}) {
  return (
    <motion.div
      key={`${title}-${subtitle}`}
      className="join-mobile-card"
      aria-hidden="true"
      initial={{ opacity: 0, y: 10, scale: 0.985 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="join-mobile-card__image">
        <img src={visual.card} alt="" />
      </div>
      <div className="min-w-0">
        <p className="join-mobile-card__eyebrow">{subtitle}</p>
        <p className="join-mobile-card__title">{title}</p>
      </div>
    </motion.div>
  );
}

function MagicBurst({ burstKey }: { burstKey: number }) {
  return (
    <motion.div
      key={burstKey}
      className="join-magic-burst"
      aria-hidden="true"
      initial={{ opacity: 0, scale: 0.66 }}
      animate={{ opacity: [0, 1, 0], scale: [0.7, 1.05, 1.32] }}
      transition={{ duration: 0.78, ease: [0.22, 1, 0.36, 1] }}
    >
      {burstParticles.map((index) => (
        <span
          key={index}
          style={
            {
              '--angle': `${index * 30}deg`,
              '--distance': `${36 + (index % 4) * 13}px`,
              '--delay': `${index * 24}ms`,
            } as CSSProperties
          }
        />
      ))}
    </motion.div>
  );
}

export default function JoinUs() {
  const { lang, t } = useLanguage();
  const brandName = pickLocalized(BRAND.name, lang);
  const prefersReducedMotion = usePrefersReducedMotion();
  const webGLAvailable = useWebGLAvailable();
  const [activeId, setActiveId] = useState<JoinAudienceId>('join-youth');
  const [burstKey, setBurstKey] = useState(0);

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
  const activeVisual = identityVisuals[activeId];
  const activeTitle = pickLocalized(activeContent.trigger, lang);
  const activeEyebrow = pickLocalized(activeVisual.eyebrow, lang);
  const shouldRenderLanyard = webGLAvailable && !prefersReducedMotion && import.meta.env.MODE !== 'test';

  const handleIdentitySelect = (nextId: JoinAudienceId) => {
    if (nextId === activeId) return;
    setActiveId(nextId);
    if (!prefersReducedMotion) {
      setBurstKey((value) => value + 1);
    }
  };

  return (
    <div className="join-page pt-20">
      <div className="join-floating-lanyard-layer" aria-hidden={false}>
        {burstKey > 0 && !prefersReducedMotion && <MagicBurst burstKey={burstKey} />}
        <div className="join-floating-lanyard-card">
          <p className="sr-only">{pickLocalized(activeVisual.cardAlt, lang)}</p>
          {shouldRenderLanyard ? (
            <Suspense fallback={<StaticJoinCard visual={activeVisual} title={activeTitle} subtitle={activeEyebrow} lang={lang} />}>
              <Lanyard
                key={activeId}
                position={[0, 0, 18]}
                gravity={[0, -32, 0]}
                fov={17}
                frontImage={activeVisual.card}
                backImage={activeVisual.card}
                imageFit="contain"
                imageZoom={1}
                cardTitle={activeTitle}
                cardSubtitle={activeEyebrow}
                cardScale={2.85}
                bandColor="#9a633e"
                lanyardWidth={0.24}
                showHardware={false}
                draggable
                layout="vertical"
                className="join-lanyard"
              />
            </Suspense>
          ) : (
            <StaticJoinCard visual={activeVisual} title={activeTitle} subtitle={activeEyebrow} lang={lang} />
          )}
        </div>
      </div>

      <section className="pt-24 pb-16 sm:pt-32 sm:pb-20 md:pt-40 md:pb-24 lg:pt-48 lg:pb-28">
        <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p data-page-motion="title" className="text-xs uppercase tracking-[0.22em] text-primary/70">
              {t('Join', 'Join')}
            </p>
            <h1 data-page-motion="title" className="mt-5 font-serif text-4xl text-foreground md:text-5xl lg:text-6xl">
              {t('加入阿柑少年', `Join ${brandName}`)}
            </h1>
            <div className="mt-6 h-px w-12 bg-primary" />
            <p data-page-motion="lead" className="mt-8 max-w-[22rem] text-base leading-8 text-muted-foreground sm:max-w-2xl md:text-lg">
              {t(
                '选择适合你的加入方式。当前阶段保持小规模深度探索，通过官方渠道统一沟通；真实伙伴故事会在整理完成后单独发布。',
                `Choose how you want to join ${brandName}. We are currently in a small-scale deep exploration stage and communicate through official channels; real partner stories will be published separately once they are ready.`
              )}
            </p>
          </div>
        </div>
      </section>

      <section id="voices" className="join-voices-section border-y border-border/70 py-10 md:py-12">
        <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
            <div className="max-w-2xl min-w-0">
              <p className="join-motion join-stage-kicker text-xs uppercase tracking-[0.22em] text-primary/70">
                {t('Voices', 'Voices')}
              </p>
              <h2 className="join-motion join-stage-title mt-5 font-serif text-3xl text-foreground md:text-4xl">
                {t('伙伴之声', 'Partner Voices')}
              </h2>
              <p className="join-motion join-stage-intro mt-6 max-w-[22rem] text-base leading-8 text-muted-foreground sm:max-w-2xl">
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

      <section id="join-identities" className="join-identity-section py-10 md:py-12">
        <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div data-page-motion="actions" className="join-identity-stage">
            <h2 className="sr-only">{t('选择你的加入身份', 'Choose your way in')}</h2>
            <div
              role="tablist"
              aria-label={t('加入身份选择', 'Join identity selector')}
              className="join-minimal-tabs"
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
                    onClick={() => handleIdentitySelect(identity.id)}
                    className="cursor-target join-minimal-tab"
                  >
                    {pickLocalized(identity.trigger, lang)}
                  </button>
                );
              })}
            </div>

            <MobileJoinIdentityCard
              visual={activeVisual}
              title={activeTitle}
              subtitle={activeEyebrow}
              lang={lang}
            />

            <motion.div
              key={activeId}
              id={`join-panel-${activeId}`}
              role="tabpanel"
              aria-labelledby={activeId}
              variants={panelTransition}
              initial="initial"
              animate="animate"
              className="join-minimal-panel"
            >
              <p className="join-motion join-motion-kicker text-xs uppercase tracking-[0.3em] text-primary/70">
                {t('Identity', 'Identity')}
              </p>
              <h3 className="join-motion join-motion-title mt-5 font-serif text-3xl leading-tight text-foreground md:text-4xl">
                {pickLocalized(activeContent.heading, lang)}
              </h3>
              <p className="join-motion join-motion-intro mt-6 max-w-2xl text-base leading-8 text-muted-foreground">
                {pickLocalized(activeContent.intro, lang)}
              </p>

              <dl className="join-motion join-motion-rows join-minimal-rows">
                {activeContent.rows.map((row) => (
                  <div
                    key={pickLocalized(row.label, lang)}
                    className="join-minimal-row"
                  >
                    <dt className="join-minimal-label">
                      {pickLocalized(row.label, lang)}
                    </dt>
                    <dd className="join-minimal-value">
                      {pickLocalized(row.value, lang)}
                    </dd>
                  </div>
                ))}
              </dl>

              <Button
                asChild
                className="cursor-target join-motion join-motion-link join-minimal-cta"
              >
                <Link to={`/join/apply?audience=${activeId}`}>
                  <span className="min-w-0 break-words">{pickLocalized(activeContent.closing, lang)}</span>
                  <ArrowRight className="h-5 w-5 shrink-0" />
                </Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}

import { lazy, Suspense, useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import SeedCommunityStage from '@/components/home/SeedCommunityStage';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { joinAudiences, type JoinAudienceId } from '@/content/siteContent';
import { useLanguage } from '@/contexts/LanguageContext';
import { type LocalizedText, pickLocalized } from '@/lib/brand';
import { cn } from '@/lib/utils';

const Lanyard = lazy(() => import('@/components/ui/lanyard/Lanyard'));

// The lanyard remains available for restoration, but is intentionally not rendered.
const JOIN_LANYARD_VISIBLE = false;

interface JoinIdentityVisual {
  eyebrow: LocalizedText;
  card: string;
  cardAlt: LocalizedText;
}

interface JoinIdentityEditorial {
  id: JoinAudienceId;
  issue: string;
  code: string;
  label: LocalizedText;
  hint: LocalizedText;
  guide: LocalizedText;
}

const contentById = new Map(joinAudiences.map((item) => [item.id, item]));

const identityVisuals: Record<JoinAudienceId, JoinIdentityVisual> = {
  'join-youth': {
    eyebrow: { zh: '山野与田野', en: 'Mountain & Field' },
    card: '/images/join/youth-card.webp',
    cardAlt: {
      zh: '成为阿柑少年的悬挂卡片插图',
      en: "Hanging card illustration for R-Gan Junior youth",
    },
  },
  'join-parents': {
    eyebrow: { zh: '陪伴与边界', en: 'Care & Boundaries' },
    card: '/images/join/parents-card.webp',
    cardAlt: {
      zh: '成为阿柑家长的悬挂卡片插图',
      en: "Hanging card illustration for R-Gan Junior parents",
    },
  },
  'join-partners': {
    eyebrow: { zh: '共创与行动', en: 'Co-creation & Action' },
    card: '/images/join/partners-card.webp',
    cardAlt: {
      zh: '成为合作伙伴的悬挂卡片插图',
      en: 'Hanging card illustration for partners',
    },
  },
};

const identityPathItems: JoinIdentityEditorial[] = [
  {
    id: 'join-youth',
    issue: '01',
    code: 'YOUTH',
    label: { zh: '阿柑少年', en: 'Youth' },
    hint: { zh: '带着问题，走进真实世界', en: 'Carry a question into the real world' },
    guide: { zh: '我想去真实世界看看', en: 'I want to explore the real world' },
  },
  {
    id: 'join-parents',
    issue: '02',
    code: 'PARENTS',
    label: { zh: '家长', en: 'Parents' },
    hint: { zh: '在陪伴与边界之间同行', en: 'Walk together with care and boundaries' },
    guide: { zh: '我正在陪伴一个孩子', en: 'I am accompanying a young person' },
  },
  {
    id: 'join-partners',
    issue: '03',
    code: 'PARTNERS',
    label: { zh: '伙伴', en: 'Partners' },
    hint: { zh: '把资源与能力变成共同行动', en: 'Turn resources and skills into shared action' },
    guide: { zh: '我有资源或能力想共创', en: 'I have resources or skills to co-create' },
  },
];

const identityMetaById = new Map(identityPathItems.map((item) => [item.id, item]));

const pathHighlightOffsets: Record<JoinAudienceId, number> = {
  'join-youth': 0,
  'join-parents': -0.35,
  'join-partners': -0.79,
};

const mascotPrompts: LocalizedText[] = [
  {
    zh: '如果你想把好奇心带进山野，就来找我。',
    en: 'Want to carry your curiosity into the wild? Come find me.',
  },
  {
    zh: '不知道自己适合哪一种？先聊聊也可以。',
    en: 'Not sure which role fits? We can simply talk first.',
  },
  {
    zh: '不必准备好所有答案，带着一个问题来就好。',
    en: 'You do not need every answer. Bring one honest question.',
  },
  {
    zh: '你可以先问一个问题，再决定要不要加入。',
    en: 'Ask one question first. Decide about joining later.',
  },
  {
    zh: '有一片土地、一个问题或一种能力？我们也许能共创。',
    en: 'Have land, a question, or a skill? Perhaps we can co-create.',
  },
  {
    zh: '每一种身份，都可以从一次真诚的对话开始。',
    en: 'Every role can begin with one sincere conversation.',
  },
];

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

function useWebGLAvailable(enabled: boolean) {
  const [webGLAvailable, setWebGLAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    if (!enabled) return;
    setWebGLAvailable(canCreateWebGLContext());
  }, [enabled]);

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
}: {
  visual: JoinIdentityVisual;
  title: string;
  subtitle: string;
}) {
  return (
    <motion.div
      key={`${title}-${subtitle}`}
      className="join-mobile-card join-island-mobile-card"
      aria-hidden="true"
      initial={{ opacity: 0, y: 8, scale: 0.99 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
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

export default function JoinUs() {
  const { lang, t } = useLanguage();
  const prefersReducedMotion = Boolean(useReducedMotion());
  const webGLAvailable = useWebGLAvailable(JOIN_LANYARD_VISIBLE);
  const [selectedId, setSelectedId] = useState<JoinAudienceId>('join-youth');
  const [previewId, setPreviewId] = useState<JoinAudienceId | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const [promptIndex, setPromptIndex] = useState(0);

  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    if (joinAudiences.some((item) => item.id === hash)) {
      setSelectedId(hash as JoinAudienceId);
    }
  }, []);

  useEffect(() => {
    if (!JOIN_LANYARD_VISIBLE) return;

    Object.values(identityVisuals).forEach(({ card }) => {
      const image = new Image();
      image.src = card;
    });
  }, []);

  useEffect(() => {
    if (prefersReducedMotion || dialogOpen) return undefined;

    const timer = window.setInterval(() => {
      setPromptIndex((current) => (current + 1) % mascotPrompts.length);
    }, 6500);

    return () => window.clearInterval(timer);
  }, [dialogOpen, prefersReducedMotion]);

  const activeContent = contentById.get(selectedId) ?? joinAudiences[0];
  const activeVisual = identityVisuals[selectedId];
  const activeMeta = identityMetaById.get(selectedId) ?? identityPathItems[0];
  const highlightedId = previewId ?? selectedId;
  const activeTitle = pickLocalized(activeContent.trigger, lang);
  const activeEyebrow = pickLocalized(activeVisual.eyebrow, lang);
  const activePrompt = pickLocalized(mascotPrompts[promptIndex], lang);
  const shouldRenderLanyard =
    webGLAvailable === true && !prefersReducedMotion && import.meta.env.MODE !== 'test';
  const shouldRenderStaticCard =
    webGLAvailable === false || prefersReducedMotion || import.meta.env.MODE === 'test';

  const openRoleDetails = (nextId: JoinAudienceId) => {
    setSelectedId(nextId);
    setDialogOpen(true);
    setGuideOpen(false);
  };

  const toggleGuide = () => {
    setGuideOpen((current) => !current);
  };

  const mascotOverlay = (
    <div
      className="join-editorial-mascot-controls absolute inset-0 z-20"
      data-open={guideOpen}
    >
      <button
        type="button"
        onClick={toggleGuide}
        className="join-editorial-mascot-hit cursor-target pointer-events-auto absolute z-10 rounded-[48%] outline-none focus-visible:ring-4 focus-visible:ring-[#ffb17f]"
        aria-label={t('向阿柑提问', 'Ask R-Gan Junior')}
        aria-expanded={guideOpen}
        aria-controls="join-mascot-guide"
      />

      <div className="join-editorial-guide pointer-events-auto absolute z-20">
        <motion.svg
          key={`${lang}-${promptIndex}`}
          viewBox="0 0 460 170"
          preserveAspectRatio="xMidYMid meet"
          data-lang={lang}
          className="join-editorial-guide__prompt-arc"
          aria-hidden="true"
          initial={prefersReducedMotion ? false : { opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.24 }}
        >
          <defs>
            <path
              id="join-mascot-prompt-arc-desktop"
              d="M 24 144 C 128 84 286 76 436 116"
            />
            <path
              id="join-mascot-prompt-arc-mobile"
              d="M 24 132 C 130 96 286 94 430 124"
            />
          </defs>
          <text className="join-editorial-guide__arc-text join-editorial-guide__arc-text--desktop">
            <textPath href="#join-mascot-prompt-arc-desktop" startOffset="2%">
              {activePrompt}
            </textPath>
          </text>
          <text className="join-editorial-guide__arc-text join-editorial-guide__arc-text--mobile">
            <textPath href="#join-mascot-prompt-arc-mobile" startOffset="2%">
              {activePrompt}
            </textPath>
          </text>
        </motion.svg>

        <span key={`status-${lang}-${promptIndex}`} role="status" aria-live="polite" className="sr-only">
          {activePrompt}
        </span>

        <button
          type="button"
          onClick={toggleGuide}
          className="join-editorial-guide__note cursor-target outline-none focus-visible:ring-2 focus-visible:ring-[#ffb17f] focus-visible:ring-offset-4 focus-visible:ring-offset-forest"
          aria-expanded={guideOpen}
          aria-controls="join-mascot-guide"
        >
          {t('还不知道选谁？问问我', 'Not sure who you are here as? Ask me')}
          <ArrowRight aria-hidden="true" />
        </button>

        <div id="join-mascot-guide" className="join-editorial-guide__panel">
          <p className="join-editorial-guide__question">
            {t('此刻的你，更像——', 'Right now, you are closer to—')}
          </p>
          <div className="join-editorial-guide__choices">
            {identityPathItems.map((identity) => (
              <button
                key={identity.id}
                type="button"
                onClick={() => openRoleDetails(identity.id)}
                className="cursor-target group/guide-choice"
              >
                <span>{identity.issue}</span>
                <span>{pickLocalized(identity.guide, lang)}</span>
                <ArrowRight aria-hidden="true" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="join-page join-editorial-page bg-background pt-20">
      <section className="join-editorial-cover paper-texture" aria-labelledby="join-editorial-title">
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="join-editorial-cover__shell container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8"
        >
          <div className="join-editorial-cover__copy">
            <h1 id="join-editorial-title" className="join-editorial-cover__title">
              {t('成为阿柑少年', 'Become an R-Gan Junior')}
            </h1>
            <p className="join-editorial-cover__subtitle">
              {t('与我们同行', 'Walk with us')}
            </p>
          </div>
        </motion.div>

        <svg
          viewBox="0 0 1200 96"
          preserveAspectRatio="none"
          className="join-editorial-cover__thread"
          aria-hidden="true"
        >
          <motion.path
            d="M -20 78 C 210 78 290 24 510 42 S 875 94 1220 36"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            initial={prefersReducedMotion ? false : { pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.82 }}
            transition={{ duration: prefersReducedMotion ? 0 : 1.1, delay: 0.3, ease: 'easeOut' }}
          />
        </svg>
      </section>

      <SeedCommunityStage
        id="join-community"
        lang={lang}
        variant="join"
        stageClassName="join-editorial-stage"
        mascotClassName="join-editorial-mascot"
        mascotOverlay={mascotOverlay}
      >
        {JOIN_LANYARD_VISIBLE ? (
          <div className="join-island-lanyard-layer" aria-hidden={false}>
            <p className="sr-only">{pickLocalized(activeVisual.cardAlt, lang)}</p>
            {shouldRenderLanyard ? (
              <Suspense fallback={null}>
                <Lanyard
                  position={[0, 0, 18]}
                  gravity={[0, -32, 0]}
                  fov={19}
                  frontImage={activeVisual.card}
                  backImage={activeVisual.card}
                  imageFit="contain"
                  imageZoom={1}
                  cardTitle={activeTitle}
                  cardSubtitle={activeEyebrow}
                  cardScale={2.15}
                  bandColor="#9a633e"
                  lanyardWidth={0.2}
                  showHardware={false}
                  draggable
                  layout="vertical"
                  className="join-lanyard"
                />
              </Suspense>
            ) : shouldRenderStaticCard ? (
              <StaticJoinCard
                visual={activeVisual}
                title={activeTitle}
                subtitle={activeEyebrow}
                lang={lang}
              />
            ) : null}
          </div>
        ) : null}

        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.62, delay: 0.08, ease: 'easeOut' }}
          className="join-editorial-index relative z-30"
        >
          <h2 className="sr-only">{t('选择你的加入身份', 'Choose your way in')}</h2>

          <div
            className="join-editorial-path-map relative"
            role="group"
            aria-label={t('加入身份选择', 'Join identity selector')}
          >
            <svg
              viewBox="0 0 1000 430"
              preserveAspectRatio="none"
              className="join-editorial-path join-editorial-path--desktop"
              aria-hidden="true"
            >
              <motion.path
                className="join-editorial-path__base"
                d="M 42 300 C 190 300 218 88 425 108 S 650 360 936 214"
                fill="none"
                stroke="currentColor"
                strokeWidth="3.5"
                strokeLinecap="round"
                opacity="0.9"
                vectorEffect="non-scaling-stroke"
                initial={prefersReducedMotion ? false : { pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: prefersReducedMotion ? 0 : 1.05, delay: 0.18, ease: 'easeOut' }}
              />
              <motion.path
                className="join-editorial-path__highlight"
                key={`desktop-${highlightedId}`}
                d="M 42 300 C 190 300 218 88 425 108 S 650 360 936 214"
                pathLength="1"
                fill="none"
                stroke="currentColor"
                strokeWidth="4.5"
                strokeLinecap="round"
                strokeDasharray="0.18 0.82"
                vectorEffect="non-scaling-stroke"
                initial={{ opacity: 0, strokeDashoffset: pathHighlightOffsets[highlightedId] }}
                animate={{ opacity: 1, strokeDashoffset: pathHighlightOffsets[highlightedId] }}
                transition={{ duration: prefersReducedMotion ? 0 : 0.38, ease: 'easeOut' }}
              />
            </svg>

            <svg
              viewBox="0 0 340 610"
              preserveAspectRatio="none"
              className="join-editorial-path join-editorial-path--mobile"
              aria-hidden="true"
            >
              <motion.path
                className="join-editorial-path__base"
                d="M 54 70 C 54 188 286 172 270 310 S 62 410 74 560"
                fill="none"
                stroke="currentColor"
                strokeWidth="3.5"
                strokeLinecap="round"
                opacity="0.9"
                vectorEffect="non-scaling-stroke"
                initial={prefersReducedMotion ? false : { pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: prefersReducedMotion ? 0 : 1.05, delay: 0.18, ease: 'easeOut' }}
              />
              <motion.path
                className="join-editorial-path__highlight"
                key={`mobile-${highlightedId}`}
                d="M 54 70 C 54 188 286 172 270 310 S 62 410 74 560"
                pathLength="1"
                fill="none"
                stroke="currentColor"
                strokeWidth="4.5"
                strokeLinecap="round"
                strokeDasharray="0.18 0.82"
                vectorEffect="non-scaling-stroke"
                initial={{ opacity: 0, strokeDashoffset: pathHighlightOffsets[highlightedId] }}
                animate={{ opacity: 1, strokeDashoffset: pathHighlightOffsets[highlightedId] }}
                transition={{ duration: prefersReducedMotion ? 0 : 0.38, ease: 'easeOut' }}
              />
            </svg>

            {identityPathItems.map((identity, index) => {
              const content = contentById.get(identity.id) ?? joinAudiences[index];
              const isSelected = selectedId === identity.id;
              const isPreviewed = previewId === identity.id;

              return (
                <motion.button
                  key={identity.id}
                  type="button"
                  onClick={() => openRoleDetails(identity.id)}
                  onPointerEnter={() => setPreviewId(identity.id)}
                  onPointerLeave={() => setPreviewId(null)}
                  onFocus={() => setPreviewId(identity.id)}
                  onBlur={() => setPreviewId(null)}
                  aria-label={t(
                    `了解${pickLocalized(content.trigger, 'zh')}`,
                    `Learn about ${pickLocalized(content.trigger, 'en')}`
                  )}
                  data-selected={isSelected}
                  data-previewed={isPreviewed}
                  initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: prefersReducedMotion ? 0 : 0.48,
                    delay: prefersReducedMotion ? 0 : 0.34 + index * 0.1,
                    ease: 'easeOut',
                  }}
                  className={cn(
                    'join-editorial-role cursor-target absolute z-20 text-left outline-none',
                    `join-editorial-role--${identity.id.replace('join-', '')}`
                  )}
                >
                  <span className="join-editorial-role__index">{identity.issue}</span>
                  <span className="join-editorial-role__copy">
                    <span className="join-editorial-role__title">
                      {pickLocalized(identity.label, lang)}
                    </span>
                    <span className="join-editorial-role__hint">
                      {pickLocalized(identity.hint, lang)}
                    </span>
                  </span>
                  <ArrowRight className="join-editorial-role__arrow" aria-hidden="true" />
                </motion.button>
              );
            })}
          </div>

          {JOIN_LANYARD_VISIBLE ? (
            <MobileJoinIdentityCard
              visual={activeVisual}
              title={activeTitle}
              subtitle={activeEyebrow}
            />
          ) : null}
        </motion.div>

        <Button asChild className="join-editorial-primary-cta btn-apple cursor-target group/join-cta">
          <Link to="/join/apply">
            {t('立即加入', 'Join Now')}
            <ArrowRight
              className="ml-2 transition-transform duration-200 group-hover/join-cta:translate-x-1 motion-reduce:transition-none"
              size={18}
              aria-hidden="true"
            />
          </Link>
        </Button>
      </SeedCommunityStage>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent
          overlayClassName="join-role-folio-overlay"
          className="join-role-folio overflow-y-auto border-0 bg-background p-0 shadow-2xl outline-none"
        >
          <article className="join-role-folio__article">
            <header className="join-role-folio__header">
              <p className="join-role-folio__issue">
                {activeMeta.issue} / {activeMeta.code}
              </p>
              <DialogTitle className="join-role-folio__title">
                {pickLocalized(activeContent.heading, lang)}
              </DialogTitle>
              <DialogDescription className="join-role-folio__intro">
                {pickLocalized(activeContent.intro, lang)}
              </DialogDescription>
            </header>

            <nav
              className="join-role-folio__switcher"
              aria-label={t('切换加入身份', 'Switch joining identity')}
            >
              {identityPathItems.map((identity) => (
                <button
                  key={identity.id}
                  type="button"
                  onClick={() => setSelectedId(identity.id)}
                  aria-pressed={selectedId === identity.id}
                  className="cursor-target"
                >
                  <span>{identity.issue}</span>
                  <span>{pickLocalized(identity.label, lang)}</span>
                </button>
              ))}
            </nav>

            <div className="join-role-folio__body">
              <p className="join-role-folio__kicker">
                {t('适合什么样的人', 'Who this is for')}
              </p>

              <dl className="join-role-folio__rows">
                {activeContent.rows.map((row) => (
                  <div key={pickLocalized(row.label, lang)}>
                    <dt>{pickLocalized(row.label, lang)}</dt>
                    <dd>{pickLocalized(row.value, lang)}</dd>
                  </div>
                ))}
              </dl>

              <Link
                to={`/join/apply?audience=${selectedId}`}
                aria-label={pickLocalized(activeContent.closing, lang)}
                className="join-role-folio__apply cursor-target group/apply"
              >
                <span>{pickLocalized(activeContent.closing, lang)}</span>
                <span aria-hidden="true">
                  {t('开始报名', 'Apply')}
                  <ArrowRight />
                </span>
              </Link>
            </div>

            <footer className="join-role-folio__footer" aria-hidden="true">
              <span>R-Gan Junior / SEED COMMUNITY</span>
              <span>{activeMeta.issue}—03</span>
            </footer>
          </article>
        </DialogContent>
      </Dialog>
    </div>
  );
}

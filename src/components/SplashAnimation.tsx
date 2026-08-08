import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';

interface SplashAnimationProps {
  onComplete: () => void;
}

type IntroPhase = 'video' | 'statement';

const INTRO_VIDEO_SRC = '/videos/home-scroll-video.mp4';
const INTRO_START_FRAME = '/videos/home-intro-start.webp';
const INTRO_END_FRAME = '/videos/home-intro-end.webp';
const VIDEO_LOAD_TIMEOUT_MS = 5200;
const VIDEO_SAFETY_TIMEOUT_MS = 20000;
const STATEMENT_HOLD_MS = 6200;

const statements = {
  zh: [
    '在一个高度焦虑、不确定的时代，青少年应该回到自然、走进社区，在真实世界中重新认识自己与社会。',
    '青少年在乡村与城市之间探索、疗愈、学习并行动，把自我成长与土地、社区和更大的生态系统重新连接起来。',
  ],
  en: [
    'At a time of profound anxiety and uncertainty, young people need to return to nature, step into their communities, and rediscover themselves and society in the real world.',
    'Exploring, healing, learning, and taking action between countryside and city, young people reconnect their growth with the land, their communities, and the wider ecosystem.',
  ],
};

function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return false;
    }

    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return;
    }

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updatePreference = () => setPrefersReducedMotion(mediaQuery.matches);

    mediaQuery.addEventListener('change', updatePreference);
    return () => mediaQuery.removeEventListener('change', updatePreference);
  }, []);

  return prefersReducedMotion;
}

export default function SplashAnimation({ onComplete }: SplashAnimationProps) {
  const { lang, t } = useLanguage();
  const videoRef = useRef<HTMLVideoElement>(null);
  const onCompleteRef = useRef(onComplete);
  const completedRef = useRef(false);
  const prefersReducedMotion = usePrefersReducedMotion();
  const [phase, setPhase] = useState<IntroPhase>('video');
  const [isMediaReady, setIsMediaReady] = useState(false);
  const [hasVideoStarted, setHasVideoStarted] = useState(false);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  const finishIntro = useCallback(() => {
    if (completedRef.current) {
      return;
    }

    completedRef.current = true;
    onCompleteRef.current();
  }, []);

  const showStatement = useCallback(() => {
    setPhase((currentPhase) => (currentPhase === 'statement' ? currentPhase : 'statement'));
  }, []);

  useEffect(() => {
    if (prefersReducedMotion) {
      videoRef.current?.pause();
      showStatement();
    }
  }, [prefersReducedMotion, showStatement]);

  useEffect(() => {
    if (phase !== 'video' || prefersReducedMotion || hasVideoStarted) {
      return;
    }

    const loadTimeout = window.setTimeout(showStatement, VIDEO_LOAD_TIMEOUT_MS);
    return () => window.clearTimeout(loadTimeout);
  }, [hasVideoStarted, phase, prefersReducedMotion, showStatement]);

  useEffect(() => {
    if (phase !== 'video' || prefersReducedMotion) {
      return;
    }

    const safetyTimeout = window.setTimeout(showStatement, VIDEO_SAFETY_TIMEOUT_MS);
    return () => window.clearTimeout(safetyTimeout);
  }, [phase, prefersReducedMotion, showStatement]);

  useEffect(() => {
    if (phase !== 'statement') {
      return;
    }

    const statementTimer = window.setTimeout(finishIntro, STATEMENT_HOLD_MS);
    return () => window.clearTimeout(statementTimer);
  }, [finishIntro, phase]);

  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }

    const root = document.documentElement;
    const body = document.body;
    const targetCursor = document.querySelector<HTMLElement>('.target-cursor-wrapper');
    const previousRootOverflow = root.style.overflow;
    const previousBodyOverflow = body.style.overflow;
    const previousBodyPaddingRight = body.style.paddingRight;
    const previousTargetCursorVisibility = targetCursor?.style.visibility ?? '';
    const scrollbarWidth = Math.max(window.innerWidth - root.clientWidth, 0);

    root.style.overflow = 'hidden';
    body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      body.style.paddingRight = `${scrollbarWidth}px`;
    }
    if (targetCursor) {
      targetCursor.style.visibility = 'hidden';
    }

    return () => {
      root.style.overflow = previousRootOverflow;
      body.style.overflow = previousBodyOverflow;
      body.style.paddingRight = previousBodyPaddingRight;
      if (targetCursor) {
        targetCursor.style.visibility = previousTargetCursorVisibility;
      }
    };
  }, []);

  const handleVideoCanPlay = useCallback(() => {
    setIsMediaReady(true);

    const playback = videoRef.current?.play();
    if (playback) {
      void playback.catch(showStatement);
    }
  }, [showStatement]);

  const transitionDuration = prefersReducedMotion ? 0.01 : 0.7;
  const statementVisible = phase === 'statement';

  const splashContent = (
    <motion.div
      data-splash-screen="cinematic-intro"
      data-intro-phase={phase}
      data-media-ready={isMediaReady ? 'true' : 'false'}
      className="fixed inset-0 z-[1000] isolate overflow-hidden bg-[#f3eadb] text-[#2d2a24]"
      style={{ zIndex: 1000 }}
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: prefersReducedMotion ? 1 : 1.006 }}
      transition={{ duration: prefersReducedMotion ? 0.2 : 0.9, ease: [0.4, 0, 0.2, 1] }}
      role="dialog"
      aria-modal="true"
      aria-label={t('阿柑少年开场影像', "R-Gan Junior opening film")}
    >
      <img
        src={INTRO_START_FRAME}
        alt=""
        aria-hidden="true"
        className={`absolute inset-0 h-full w-full scale-[1.015] object-cover object-center transition-opacity duration-700 ${
          hasVideoStarted || statementVisible ? 'opacity-0' : 'opacity-100'
        }`}
        draggable={false}
      />

      {!prefersReducedMotion && (
        <video
          ref={videoRef}
          className={`absolute inset-0 h-full w-full scale-[1.015] object-cover object-center transition-opacity duration-1000 ${
            hasVideoStarted && !statementVisible ? 'opacity-100' : 'opacity-0'
          }`}
          src={INTRO_VIDEO_SRC}
          poster={INTRO_START_FRAME}
          muted
          autoPlay
          playsInline
          preload="auto"
          disablePictureInPicture
          tabIndex={-1}
          aria-hidden="true"
          onLoadedData={() => setIsMediaReady(true)}
          onCanPlay={handleVideoCanPlay}
          onPlaying={() => setHasVideoStarted(true)}
          onEnded={showStatement}
          onError={showStatement}
        />
      )}

      <motion.img
        src={INTRO_END_FRAME}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full scale-[1.015] object-cover object-center"
        draggable={false}
        initial={false}
        animate={{ opacity: prefersReducedMotion && statementVisible ? 0.18 : 0 }}
        transition={{ duration: transitionDuration, ease: [0.22, 1, 0.36, 1] }}
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.13] mix-blend-soft-light"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='240'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.72' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='240' height='240' filter='url(%23noise)' opacity='0.22'/%3E%3C/svg%3E\")",
        }}
      />

      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(255,250,236,0.98)_0%,rgba(246,237,218,0.98)_48%,rgba(232,219,195,0.98)_100%)]"
        initial={false}
        animate={{ opacity: statementVisible ? 1 : 0 }}
        transition={{ duration: prefersReducedMotion ? 0.01 : 1.05, ease: [0.4, 0, 0.2, 1] }}
      />

      <div
        className="relative z-10 flex h-full min-h-[100svh] items-center justify-center px-5 py-24 sm:px-8 md:px-12"
        aria-hidden={!statementVisible}
        aria-live="polite"
      >
        <div className="mx-auto flex w-full max-w-5xl flex-col items-center text-center">
          <motion.div
            aria-hidden="true"
            className="mb-7 h-px w-16 origin-center bg-[#236d4f]/55 sm:mb-9 sm:w-20"
            initial={false}
            animate={{ opacity: statementVisible ? 1 : 0, scaleX: statementVisible ? 1 : 0.2 }}
            transition={{
              delay: statementVisible && !prefersReducedMotion ? 0.92 : 0,
              duration: prefersReducedMotion ? 0.01 : 0.7,
              ease: [0.22, 1, 0.36, 1],
            }}
          />

          {statements[lang].map((statement, index) => (
            <motion.p
              key={statement}
              className={`max-w-[46em] font-serif text-[clamp(1.12rem,2.25vw,2.1rem)] font-medium leading-[1.72] tracking-[0.015em] text-[#2d2a24] ${
                index === 0 ? '' : 'mt-6 sm:mt-8'
              }`}
              initial={false}
              animate={{
                opacity: statementVisible ? 1 : 0,
                y: statementVisible ? 0 : prefersReducedMotion ? 0 : 18,
              }}
              transition={{
                delay: statementVisible && !prefersReducedMotion ? 1.06 + index * 0.42 : 0,
                duration: prefersReducedMotion ? 0.01 : 0.82,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              {statement}
            </motion.p>
          ))}
        </div>
      </div>

      <motion.button
        type="button"
        className={`absolute right-5 top-[max(1.25rem,env(safe-area-inset-top))] z-20 rounded-full px-4 py-2 text-xs font-medium tracking-[0.18em] shadow-sm backdrop-blur-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent sm:right-7 sm:px-5 sm:text-sm ${
          statementVisible
            ? 'border border-[#2d2a24]/20 bg-white/25 text-[#2d2a24]/70 hover:border-[#2d2a24]/35 hover:text-[#2d2a24] focus-visible:ring-[#2d2a24]/55'
            : 'border border-white/25 bg-black/10 text-white/85 hover:border-white/45 hover:bg-black/20 hover:text-white focus-visible:ring-white/75'
        }`}
        onClick={finishIntro}
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: prefersReducedMotion ? 0 : 1, duration: prefersReducedMotion ? 0.01 : 0.5 }}
      >
        {t('跳过', 'Skip')}
      </motion.button>

      <div
        data-intro-progress
        className={`pointer-events-none absolute inset-x-0 bottom-0 z-20 h-[3px] bg-white/10 transition-opacity duration-500 ${
          statementVisible ? 'opacity-0' : 'opacity-100'
        }`}
        aria-hidden="true"
      >
        <motion.div
          className="h-full origin-left bg-[#ffb35d]/80"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: statementVisible ? 1 : hasVideoStarted ? 0.98 : 0.03 }}
          transition={
            statementVisible
              ? { duration: transitionDuration, ease: [0.22, 1, 0.36, 1] }
              : hasVideoStarted
                ? { duration: 15, ease: 'linear' }
                : { duration: 0.5, ease: 'easeOut' }
          }
        />
      </div>

      <AnimatePresence>
        {phase === 'video' && !hasVideoStarted && (
          <motion.p
            className="absolute bottom-7 left-1/2 z-20 -translate-x-1/2 text-xs tracking-[0.18em] text-white/65 sm:bottom-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 0.45, duration: 0.45 }}
          >
            {t('影像正在载入', 'Loading film')}
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  );

  if (typeof document === 'undefined') {
    return splashContent;
  }

  return createPortal(splashContent, document.body);
}

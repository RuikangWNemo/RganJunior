import { type CSSProperties, type RefObject, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import mascotFull from '@/assets/mascot-full.png';
import { useLanguage } from '@/contexts/LanguageContext';
import { useHeroMotion } from '@/hooks/useHeroMotion';
import { BRAND, pickLocalized } from '@/lib/brand';
import { getCommunityEntryUrl } from '@/lib/communityEntry';

interface HeroMascotStageProps {
  sectionRef: RefObject<HTMLElement | null>;
}

const TOOLTIP_INITIAL_DELAY_MS = 2_000;
const TOOLTIP_VISIBLE_MS = 3_000;
const TOOLTIP_HIDDEN_MS = 7_000;

export default function HeroMascotStage({ sectionRef }: HeroMascotStageProps) {
  const { lang } = useLanguage();
  const communityEntryUrl = getCommunityEntryUrl();
  const mascotAlt = pickLocalized(BRAND.mascotAlt, lang);
  const [tooltipScheduledVisible, setTooltipScheduledVisible] = useState(false);
  const [tooltipInteracting, setTooltipInteracting] = useState(false);
  const {
    stageRef,
    pointer,
    expansionProgress,
    handoffProgress,
    prefersReducedMotion,
    handlePointerMove,
    handlePointerLeave,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  } = useHeroMotion(sectionRef);

  useEffect(() => {
    let timeoutId = 0;
    let cancelled = false;

    const scheduleVisiblePhase = (hiddenDelay: number) => {
      timeoutId = window.setTimeout(() => {
        if (cancelled) {
          return;
        }

        setTooltipScheduledVisible(true);
        timeoutId = window.setTimeout(() => {
          if (cancelled) {
            return;
          }

          setTooltipScheduledVisible(false);
          scheduleVisiblePhase(TOOLTIP_HIDDEN_MS);
        }, TOOLTIP_VISIBLE_MS);
      }, hiddenDelay);
    };

    setTooltipScheduledVisible(false);
    scheduleVisiblePhase(TOOLTIP_INITIAL_DELAY_MS);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, []);

  const wrapperStyle: CSSProperties = {
    transform: `translate3d(0, ${-2 - expansionProgress * 10 - handoffProgress * 8}px, 0) scale(${1 - handoffProgress * 0.08})`,
    opacity: 1 - handoffProgress * 0.08,
  };

  const mascotShellStyle: CSSProperties = {
    transform: `translate3d(${pointer.x * 0.55}px, ${pointer.y * 0.35 - expansionProgress * 10 - handoffProgress * 6}px, 0) rotate(${pointer.rotateY * 0.35}deg)`,
  };

  const haloStyle: CSSProperties = {
    opacity: 0.16 + expansionProgress * 0.14 - handoffProgress * 0.06,
    transform: `translate3d(${pointer.x * -0.12}px, ${pointer.y * -0.12}px, 0) scale(${1 + expansionProgress * 0.04})`,
  };

  const arcOneStyle: CSSProperties = {
    opacity: 0.42 - handoffProgress * 0.08,
    transform: `translate3d(${pointer.x * -0.08}px, ${pointer.y * -0.06}px, 0) rotate(-14deg)`,
  };

  const arcTwoStyle: CSSProperties = {
    opacity: 0.26 - handoffProgress * 0.06,
    transform: `translate3d(${pointer.x * 0.06}px, ${pointer.y * 0.04}px, 0) rotate(12deg)`,
  };

  const dotStyle: CSSProperties = {
    transform: `translate3d(${pointer.x * 0.18}px, ${pointer.y * 0.12}px, 0)`,
  };

  return (
    <div className="home-hero-mascot-wrap relative order-1 flex justify-center lg:order-1 lg:justify-start">
      <a
        href={communityEntryUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="cursor-target group relative block rounded-[48%] outline-none focus-visible:ring-4 focus-visible:ring-primary/25"
        aria-label={lang === 'zh' ? '在新窗口进入阿柑少年社群' : 'Open R-Gan Junior Community in a new window'}
        data-tooltip-visible={tooltipScheduledVisible || tooltipInteracting ? 'true' : 'false'}
        onMouseEnter={() => setTooltipInteracting(true)}
        onMouseLeave={() => setTooltipInteracting(false)}
        onFocus={() => setTooltipInteracting(true)}
        onBlur={() => setTooltipInteracting(false)}
      >
        <span className="home-hero-community-tooltip pointer-events-none absolute left-1/2 top-0 z-30 w-max max-w-[15rem] -translate-x-1/2 -translate-y-[115%] rounded-3xl border px-4 py-3 text-center text-sm font-medium shadow-xl after:absolute after:left-1/2 after:top-full after:size-3 after:-translate-x-1/2 after:-translate-y-1/2 after:rotate-45 after:border-b after:border-r group-hover:-translate-y-[120%] group-focus-visible:-translate-y-[120%]">
          {lang === 'zh' ? '点我进入阿柑少年社群吧！' : 'Tap to enter the R-Gan Junior community!'}
        </span>
        <div
          ref={stageRef}
          className="home-hero-mascot-stage relative w-full max-w-[16.2rem] transition-transform duration-500 ease-out group-hover:scale-[1.025] sm:max-w-[19.2rem] lg:max-w-[22.2rem] xl:max-w-[23.4rem]"
          style={wrapperStyle}
          onMouseMove={handlePointerMove}
          onMouseLeave={handlePointerLeave}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <svg aria-hidden="true" className="absolute size-0" focusable="false">
            <defs>
              <filter
                id="home-hero-mascot-orange-filter"
                x="-10%"
                y="-10%"
                width="120%"
                height="120%"
                colorInterpolationFilters="sRGB"
              >
                <feColorMatrix
                  type="matrix"
                  values="0.86237 0.13763 0 0 0 0 0.9802 0 0.0198 0 0 0 0.9383 0.0617 0 0 0 0 1 0"
                />
              </filter>
            </defs>
          </svg>
          <div
            aria-hidden="true"
            className="hero-mascot-halo absolute inset-[12%] -z-10 rounded-full blur-3xl"
            style={haloStyle}
          />
          <div
            aria-hidden="true"
            className="hero-mascot-arc absolute inset-[10%] -z-10 rounded-full"
            style={arcOneStyle}
          />
          <div
            aria-hidden="true"
            className="hero-mascot-arc absolute inset-[18%] -z-10 rounded-full"
            style={arcTwoStyle}
          />
          <div
            aria-hidden="true"
            className="hero-mascot-dot absolute right-[9%] top-[14%] -z-10 h-3 w-3 rounded-full"
            style={dotStyle}
          />

          <motion.div
            className="relative z-10"
            style={mascotShellStyle}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
          >
            <div className={prefersReducedMotion ? '' : 'hero-mascot-idle'}>
              <img
                src={mascotFull}
                alt={mascotAlt}
                className="home-hero-mascot-image w-full"
                draggable={false}
              />
            </div>
          </motion.div>
        </div>
      </a>
    </div>
  );
}

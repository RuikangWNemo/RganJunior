import { type CSSProperties, type RefObject, useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import mascotFull from '@/assets/mascot-full.png';
import { useLanguage } from '@/contexts/LanguageContext';
import { useHeroMotion } from '@/hooks/useHeroMotion';
import { BRAND, pickLocalized } from '@/lib/brand';
import SplashAnimation from '@/components/SplashAnimation';

interface HeroMascotStageProps {
  sectionRef: RefObject<HTMLElement | null>;
}

const splashStorageKey = 'hasSeenSplashAnimation';
const splashVersion = 'brand-film-v8-paper-awakening';

function readSplashVersion() {
  try {
    return window.localStorage.getItem(splashStorageKey);
  } catch {
    return null;
  }
}

function writeSplashVersion() {
  try {
    window.localStorage.setItem(splashStorageKey, splashVersion);
  } catch {
    // If storage is unavailable, still let the page continue past the intro.
  }
}

export default function HeroMascotStage({ sectionRef }: HeroMascotStageProps) {
  const { lang } = useLanguage();
  const mascotAlt = pickLocalized(BRAND.mascotAlt, lang);
  const [showSplash, setShowSplash] = useState(false);
  const [splashComplete, setSplashComplete] = useState(false);
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

  // 检查是否应该显示开屏动画
  useEffect(() => {
    const isHomePage = window.location.pathname === '/';
    const seenSplashVersion = readSplashVersion();
    
    if (isHomePage && seenSplashVersion !== splashVersion) {
      setShowSplash(true);
    } else {
      setSplashComplete(true);
    }
  }, []);

  const handleSplashComplete = useCallback(() => {
    setShowSplash(false);
    setSplashComplete(true);
    writeSplashVersion();
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
    <>
      {/* 开屏动画 */}
      <AnimatePresence>
        {showSplash && (
          <SplashAnimation onComplete={handleSplashComplete} />
        )}
      </AnimatePresence>

      {/* 正常的吉祥物展示 */}
      {splashComplete && (
        <div className="relative order-1 flex justify-center lg:order-1 lg:justify-start">
          <div
            ref={stageRef}
            className="relative w-full max-w-[13.5rem] transition-transform duration-500 ease-out sm:max-w-[16rem] lg:max-w-[18.5rem] xl:max-w-[19.5rem]"
            style={wrapperStyle}
            onMouseMove={handlePointerMove}
            onMouseLeave={handlePointerLeave}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
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
                  className="w-full drop-shadow-[0_18px_30px_hsl(var(--foreground)/0.16)]"
                  draggable={false}
                />
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </>
  );
}

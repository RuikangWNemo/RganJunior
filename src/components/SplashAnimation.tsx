import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, type Variants } from 'framer-motion';
import mascotFull from '@/assets/mascot-full.png';
import { useLanguage } from '@/contexts/LanguageContext';
import { BRAND, pickLocalized } from '@/lib/brand';

interface SplashAnimationProps {
  onComplete: () => void;
}

const splashDuration = 5500;

const naturalMotes = [
  { left: '28%', top: '33%', size: 3, delay: 4.55, drift: -26, duration: 2.8 },
  { left: '63%', top: '38%', size: 2, delay: 4.72, drift: -34, duration: 3.1 },
  { left: '43%', top: '66%', size: 2, delay: 4.92, drift: -22, duration: 2.6 },
  { left: '58%', top: '62%', size: 3, delay: 5.05, drift: -30, duration: 2.9 },
  { left: '35%', top: '51%', size: 2, delay: 5.22, drift: -18, duration: 2.4 },
];

const textLineVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 12,
    filter: 'blur(8px)',
  },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      delay,
      duration: 0.78,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
};

function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) {
      return;
    }

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setPrefersReducedMotion(mediaQuery.matches);

    update();
    mediaQuery.addEventListener('change', update);
    return () => mediaQuery.removeEventListener('change', update);
  }, []);

  return prefersReducedMotion;
}

export default function SplashAnimation({ onComplete }: SplashAnimationProps) {
  const { lang } = useLanguage();
  const prefersReducedMotion = usePrefersReducedMotion();
  const onCompleteRef = useRef(onComplete);
  const completedRef = useRef(false);
  const brandName = pickLocalized(BRAND.name, lang);
  const mascotAlt = pickLocalized(BRAND.mascotAlt, lang);
  const subtitle = lang === 'zh' ? '当代青少年的生命觉醒之路' : 'A Path of Awakening for Young People';
  const quietLine = lang === 'zh' ? '对内疗愈人心 · 对外修复土壤' : 'Healing within · Restoring the soil beyond';

  const completionDelay = prefersReducedMotion ? 1800 : splashDuration;

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    const complete = () => {
      if (completedRef.current) {
        return;
      }

      completedRef.current = true;
      onCompleteRef.current();
    };

    const timer = window.setTimeout(complete, completionDelay);
    return () => window.clearTimeout(timer);
  }, [completionDelay]);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-[#241a15] text-white"
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.72, ease: [0.4, 0, 0.2, 1] }}
      >
        <motion.div
          aria-hidden="true"
          className="absolute inset-0"
          initial={{ opacity: 0.42 }}
          animate={{ opacity: prefersReducedMotion ? 0.82 : [0.42, 0.78, 0.88] }}
          transition={{ delay: 0.08, duration: prefersReducedMotion ? 0.01 : 2.2, ease: 'easeOut' }}
          style={{
            background:
              'radial-gradient(circle at 50% 44%, rgba(244,126,45,0.22), transparent 34%), radial-gradient(circle at 50% 78%, rgba(28,93,68,0.28), transparent 38%), linear-gradient(180deg, #1f1713 0%, #2a1f18 48%, #221a15 100%)',
          }}
        />

        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='180' height='180' filter='url(%23n)' opacity='0.46'/%3E%3C/svg%3E\")",
          }}
        />

        <div className="relative flex min-h-screen w-full flex-col items-center justify-center px-6 pb-20 pt-12">
          <div className="relative flex h-[19rem] w-[19rem] items-center justify-center sm:h-[23rem] sm:w-[23rem] md:h-[27rem] md:w-[27rem]">
            <motion.div
              aria-hidden="true"
              className="absolute h-[42%] w-[42%] rounded-full bg-[#f27b2d]"
              initial={{ opacity: 0.35, scale: 0.96, filter: 'blur(10px)' }}
              animate={{
                opacity: prefersReducedMotion ? 0.9 : [0.35, 0.92, 0.9, 0.82],
                scale: prefersReducedMotion ? 1 : [0.96, 1, 1.018, 0.98],
                filter: prefersReducedMotion ? 'blur(0px)' : ['blur(10px)', 'blur(0px)', 'blur(0px)', 'blur(2px)'],
              }}
              transition={{
                delay: prefersReducedMotion ? 0 : 0.35,
                duration: prefersReducedMotion ? 0.01 : 1.8,
                times: [0, 0.46, 0.78, 1],
                ease: [0.22, 1, 0.36, 1],
              }}
              style={{
                boxShadow: '0 0 76px rgba(242, 123, 45, 0.32), inset 0 -18px 42px rgba(110, 43, 18, 0.22)',
              }}
            />

            <motion.div
              aria-hidden="true"
              className="absolute h-[66%] w-[66%] rounded-full border border-white/10"
              initial={{ opacity: 0, scale: 0.82 }}
              animate={{ opacity: prefersReducedMotion ? 0.24 : [0, 0.26, 0.12], scale: [0.82, 1, 1.06] }}
              transition={{ delay: 1.55, duration: 3.6, ease: [0.22, 1, 0.36, 1] }}
            />

            <motion.div
              className="absolute h-[82%] w-[82%]"
              initial={{ opacity: 0, scale: 0.985, y: 8, filter: 'blur(10px)' }}
              animate={{
                opacity: prefersReducedMotion ? 1 : [0, 0.72, 0.94, 1],
                scale: prefersReducedMotion ? 1 : [0.985, 1.012, 1.018, 1],
                y: prefersReducedMotion ? 0 : [8, 2, -2, 0],
                filter: prefersReducedMotion
                  ? 'blur(0px)'
                  : ['blur(10px)', 'blur(3px)', 'blur(0px)', 'blur(0px)'],
              }}
              transition={{
                delay: prefersReducedMotion ? 0 : 0.9,
                duration: prefersReducedMotion ? 0.01 : 1.6,
                times: [0, 0.35, 0.72, 1],
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <motion.img
                src={mascotFull}
                alt={mascotAlt}
                className="h-full w-full object-contain drop-shadow-[0_34px_58px_rgba(0,0,0,0.34)]"
                draggable={false}
                animate={
                  prefersReducedMotion
                    ? undefined
                    : {
                        scale: [1, 1.026, 1, 1.01, 1],
                        y: [0, -4, 0, -2, 0],
                      }
                }
                transition={{
                  delay: 3.2,
                  duration: 4.8,
                  times: [0, 0.25, 0.5, 0.75, 1],
                  ease: [0.37, 0, 0.2, 1],
                }}
              />
            </motion.div>

            <motion.div
              aria-hidden="true"
              className="absolute left-[28%] top-[17%] h-10 w-6 rounded-[60%_40%_70%_30%] border border-[#f9b26c]/45 bg-[#f27b2d]/20"
              initial={{ opacity: 0, scale: 0.55, rotate: -18 }}
              animate={{ opacity: prefersReducedMotion ? 0.55 : [0, 0.62, 0.42], scale: [0.55, 1.04, 1], rotate: [-18, -9, -12] }}
              transition={{ delay: 1.1, duration: 1.18, ease: [0.22, 1, 0.36, 1] }}
            />
            <motion.div
              aria-hidden="true"
              className="absolute right-[24%] top-[18%] h-12 w-8 rounded-[45%_55%_40%_70%] border border-[#f9b26c]/40 bg-[#f27b2d]/16"
              initial={{ opacity: 0, scale: 0.6, rotate: 14 }}
              animate={{ opacity: prefersReducedMotion ? 0.5 : [0, 0.56, 0.36], scale: [0.6, 1.08, 1], rotate: [14, 4, 8] }}
              transition={{ delay: 1.28, duration: 1.08, ease: [0.22, 1, 0.36, 1] }}
            />
            <motion.div
              aria-hidden="true"
              className="absolute bottom-[23%] right-[16%] h-3 w-16 rounded-full bg-[#f27b2d]/24 blur-[1px]"
              initial={{ opacity: 0, scaleX: 0.25, rotate: 4, transformOrigin: 'left center' }}
              animate={{ opacity: prefersReducedMotion ? 0.38 : [0, 0.45, 0.3], scaleX: [0.25, 1.06, 1], rotate: [4, -6, 2] }}
              transition={{ delay: 1.45, duration: 1.12, ease: [0.22, 1, 0.36, 1] }}
            />

            {!prefersReducedMotion && (
              <>
                <motion.div
                  aria-hidden="true"
                  className="absolute left-[34%] top-[38%] h-6 w-9 rounded-full border-t-2 border-white/70"
                  initial={{ opacity: 0, scaleX: 0.72, y: 5 }}
                  animate={{ opacity: [0, 0.82, 0.64], scaleX: [0.72, 1, 0.96], y: [5, 0, 0] }}
                  transition={{ delay: 3.22, duration: 0.92, ease: [0.22, 1, 0.36, 1] }}
                />
                <motion.div
                  aria-hidden="true"
                  className="absolute right-[34%] top-[38%] h-6 w-9 rounded-full border-t-2 border-white/70"
                  initial={{ opacity: 0, scaleX: 0.72, y: 5 }}
                  animate={{ opacity: [0, 0.82, 0.64], scaleX: [0.72, 1, 0.96], y: [5, 0, 0] }}
                  transition={{ delay: 3.34, duration: 0.92, ease: [0.22, 1, 0.36, 1] }}
                />
                <motion.div
                  aria-hidden="true"
                  className="absolute bottom-[33%] h-5 w-14 rounded-b-full border-b-2 border-white/72"
                  initial={{ opacity: 0, scaleX: 0.75, y: 3 }}
                  animate={{ opacity: [0, 0.78, 0.58], scaleX: [0.75, 1, 0.94], y: [3, 0, 0] }}
                  transition={{ delay: 3.48, duration: 0.86, ease: [0.22, 1, 0.36, 1] }}
                />
              </>
            )}

            {!prefersReducedMotion &&
              naturalMotes.map((mote) => (
                <motion.span
                  key={`${mote.left}-${mote.top}`}
                  aria-hidden="true"
                  className="absolute rounded-full bg-white"
                  style={{
                    left: mote.left,
                    top: mote.top,
                    width: mote.size,
                    height: mote.size,
                    boxShadow: '0 0 16px rgba(255,255,255,0.36)',
                  }}
                  initial={{ opacity: 0, y: 0, scale: 0.4 }}
                  animate={{ opacity: [0, 0.48, 0], y: [0, mote.drift], scale: [0.4, 1, 0.72] }}
                  transition={{ delay: mote.delay, duration: mote.duration, ease: 'easeOut' }}
                />
              ))}

            {!prefersReducedMotion && (
              <>
                <motion.svg
                  aria-hidden="true"
                  className="absolute left-[18%] top-[45%] h-8 w-8 text-[#9bcf9b]"
                  viewBox="0 0 32 32"
                  initial={{ opacity: 0, x: -14, y: 6, rotate: -20 }}
                  animate={{ opacity: [0, 0.52, 0], x: [0, 24, 42], y: [0, -10, -18], rotate: [-20, 8, 18] }}
                  transition={{ delay: 4.6, duration: 2.7, ease: [0.22, 1, 0.36, 1] }}
                >
                  <path
                    d="M26 6C16 6 8 11 7 23c10 1 17-5 19-17Z"
                    fill="currentColor"
                    fillOpacity="0.42"
                  />
                  <path d="M9 22c5-5 9-8 16-14" stroke="currentColor" strokeOpacity="0.55" strokeWidth="1.3" />
                </motion.svg>
                <motion.span
                  aria-hidden="true"
                  className="absolute right-[22%] top-[42%] h-3 w-3 rounded-full bg-cyan-100/40"
                  initial={{ opacity: 0, x: 0, y: 0, scale: 0.5 }}
                  animate={{ opacity: [0, 0.64, 0], x: [0, 16, 36], y: [0, 8, 18], scale: [0.5, 1, 0.72] }}
                  transition={{ delay: 4.95, duration: 1.9, ease: [0.22, 1, 0.36, 1] }}
                />
              </>
            )}
          </div>

          <motion.div
            className="absolute bottom-[13vh] left-0 right-0 mx-auto flex max-w-3xl flex-col items-center px-6 text-center"
            initial="hidden"
            animate="visible"
          >
            <motion.p
              className="font-serif text-3xl font-medium tracking-[0.16em] text-white sm:text-4xl md:text-5xl"
              variants={textLineVariants}
              custom={prefersReducedMotion ? 0.2 : 3.6}
            >
              {brandName}
            </motion.p>
            <motion.p
              className="mt-4 text-base font-light tracking-[0.18em] text-white/76 sm:text-lg"
              variants={textLineVariants}
              custom={prefersReducedMotion ? 0.34 : 4.0}
            >
              {subtitle}
            </motion.p>
            <motion.p
              className="mt-3 text-xs tracking-[0.22em] text-white/46 sm:text-sm"
              variants={textLineVariants}
              custom={prefersReducedMotion ? 0.48 : 4.35}
            >
              {quietLine}
            </motion.p>
          </motion.div>

          {!prefersReducedMotion && (
            <motion.div
              aria-hidden="true"
              className="absolute bottom-7 left-1/2 h-px w-28 -translate-x-1/2 overflow-hidden bg-white/10"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0] }}
              transition={{ delay: 1.2, duration: 6.3, ease: 'easeInOut' }}
            >
              <motion.div
                className="h-full bg-white/50"
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                transition={{ delay: 1.2, duration: 6.3, ease: 'linear' }}
              />
            </motion.div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

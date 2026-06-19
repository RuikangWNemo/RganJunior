import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, type Variants } from 'framer-motion';
import mascotFull from '@/assets/mascot-full.png';
import { useLanguage } from '@/contexts/LanguageContext';
import { BRAND, pickLocalized } from '@/lib/brand';

interface SplashAnimationProps {
  onComplete: () => void;
}

const splashDuration = 6800;

const naturalMotes = [
  { left: '24%', top: '34%', size: 3, delay: 2.55, drift: -22, duration: 2.9 },
  { left: '68%', top: '31%', size: 2, delay: 2.8, drift: -28, duration: 3.1 },
  { left: '39%', top: '66%', size: 2, delay: 3.05, drift: -20, duration: 2.7 },
  { left: '61%', top: '62%', size: 3, delay: 3.18, drift: -26, duration: 2.9 },
  { left: '33%', top: '52%', size: 2, delay: 3.42, drift: -18, duration: 2.6 },
];

const awakeningLines = {
  zh: ['在真实世界中，长成自己', '山野恢复感知', '田野理解问题', '城乡行动中长成自己'],
  en: [
    'Grow into yourself in the real world',
    'Restore the senses in the wild',
    'Understand real questions in the field',
    'Grow through urban-rural action',
  ],
};

const textLineVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 10,
    filter: 'blur(8px)',
  },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      delay,
      duration: 0.72,
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

  const completionDelay = prefersReducedMotion ? 3200 : splashDuration;
  const textStartDelay = prefersReducedMotion ? 0.28 : 2.58;

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

  const splashContent = (
    <AnimatePresence>
      <motion.div
        data-splash-screen="paper-awakening"
        className="fixed inset-0 z-[1000] flex items-center justify-center overflow-hidden bg-[#f6efdf] text-[#2c261f]"
        style={{ zIndex: 1000 }}
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.72, ease: [0.4, 0, 0.2, 1] }}
      >
        <motion.div
          aria-hidden="true"
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: prefersReducedMotion ? 0.01 : 1.1, ease: 'easeOut' }}
          style={{
            background:
              'radial-gradient(circle at 50% 38%, rgba(255, 130, 47, 0.22), transparent 31%), radial-gradient(circle at 18% 82%, rgba(34, 109, 78, 0.14), transparent 34%), radial-gradient(circle at 82% 74%, rgba(219, 168, 89, 0.18), transparent 34%), linear-gradient(180deg, #faf4e7 0%, #f1e4cf 55%, #e8ddc9 100%)',
          }}
        />

        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-[0.13] mix-blend-multiply"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.72' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='180' height='180' filter='url(%23n)' opacity='0.34'/%3E%3C/svg%3E\")",
          }}
        />

        <motion.svg
          aria-hidden="true"
          className="absolute inset-0 h-full w-full text-[#226d4e]"
          viewBox="0 0 1440 900"
          preserveAspectRatio="none"
          initial={{ opacity: 0 }}
          animate={{ opacity: prefersReducedMotion ? 0.34 : [0, 0.3, 0.24] }}
          transition={{ duration: prefersReducedMotion ? 0.01 : 2.2, ease: 'easeOut' }}
        >
          <path
            d="M-80 610C190 480 288 700 514 552C720 417 860 265 1120 388C1275 462 1374 430 1526 326"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.1"
            strokeOpacity="0.22"
          />
          <path
            d="M-110 318C124 236 288 302 440 382C613 473 756 520 936 410C1114 302 1252 248 1542 286"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.9"
            strokeOpacity="0.16"
          />
          <motion.path
            d="M-80 610C190 480 288 700 514 552C720 417 860 265 1120 388C1275 462 1374 430 1526 326"
            fill="none"
            stroke="#f47d2c"
            strokeLinecap="round"
            strokeWidth="1.4"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={
              prefersReducedMotion
                ? { pathLength: 0.48, opacity: 0.2 }
                : { pathLength: [0, 0.45, 0.62], opacity: [0, 0.36, 0.18] }
            }
            transition={{ delay: 0.7, duration: prefersReducedMotion ? 0.01 : 3.6, ease: [0.22, 1, 0.36, 1] }}
          />
        </motion.svg>

        <div className="relative z-10 flex min-h-screen w-full flex-col items-center justify-center px-5 py-10 sm:px-8">
          <div className="relative flex h-[18rem] w-[18rem] items-center justify-center sm:h-[22rem] sm:w-[22rem] md:h-[25rem] md:w-[25rem]">
            <motion.div
              aria-hidden="true"
              className="absolute inset-[16%] rounded-full bg-[#ff7d2d]/18 blur-3xl"
              initial={{ opacity: 0, scale: 0.82 }}
              animate={{
                opacity: prefersReducedMotion ? 0.48 : [0, 0.52, 0.38],
                scale: prefersReducedMotion ? 1 : [0.82, 1.06, 1],
              }}
              transition={{ delay: prefersReducedMotion ? 0 : 0.35, duration: prefersReducedMotion ? 0.01 : 2.4, ease: [0.22, 1, 0.36, 1] }}
            />

            <motion.div
              aria-hidden="true"
              className="absolute h-[72%] w-[72%] rounded-full border border-[#226d4e]/12"
              initial={{ opacity: 0, scale: 0.84 }}
              animate={{ opacity: prefersReducedMotion ? 0.24 : [0, 0.32, 0.16], scale: prefersReducedMotion ? 1 : [0.84, 1.04, 1.08] }}
              transition={{ delay: 1.05, duration: prefersReducedMotion ? 0.01 : 3.2, ease: [0.22, 1, 0.36, 1] }}
            />

            <motion.div
              className="absolute h-[82%] w-[82%]"
              initial={{ opacity: 0, scale: 0.92, y: 18, rotate: -1.2, filter: 'blur(10px)' }}
              animate={{
                opacity: prefersReducedMotion ? 1 : [0, 0.86, 1],
                scale: prefersReducedMotion ? 1 : [0.92, 1.025, 1],
                y: prefersReducedMotion ? 0 : [18, -4, 0],
                rotate: prefersReducedMotion ? 0 : [-1.2, 0.8, 0],
                filter: prefersReducedMotion ? 'blur(0px)' : ['blur(10px)', 'blur(1px)', 'blur(0px)'],
              }}
              transition={{
                delay: prefersReducedMotion ? 0 : 0.65,
                duration: prefersReducedMotion ? 0.01 : 1.72,
                times: [0, 0.72, 1],
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <motion.img
                src={mascotFull}
                alt={mascotAlt}
                className="h-full w-full object-contain drop-shadow-[0_30px_54px_rgba(71,48,29,0.18)]"
                draggable={false}
                animate={
                  prefersReducedMotion
                    ? undefined
                    : {
                        scale: [1, 1.018, 1, 1.01, 1],
                        y: [0, -5, 0, -2, 0],
                        rotate: [0, -0.35, 0, 0.28, 0],
                      }
                }
                transition={{
                  delay: 2.18,
                  duration: 4.4,
                  times: [0, 0.28, 0.56, 0.78, 1],
                  ease: [0.37, 0, 0.2, 1],
                }}
              />
            </motion.div>

            {!prefersReducedMotion &&
              naturalMotes.map((mote) => (
                <motion.span
                  key={`${mote.left}-${mote.top}`}
                  aria-hidden="true"
                  className="absolute rounded-full bg-[#fff9ed]"
                  style={{
                    left: mote.left,
                    top: mote.top,
                    width: mote.size,
                    height: mote.size,
                    boxShadow: '0 0 18px rgba(255, 134, 49, 0.32)',
                  }}
                  initial={{ opacity: 0, y: 0, scale: 0.4 }}
                  animate={{ opacity: [0, 0.72, 0], y: [0, mote.drift], scale: [0.4, 1, 0.74] }}
                  transition={{ delay: mote.delay, duration: mote.duration, ease: 'easeOut' }}
                />
              ))}

            {!prefersReducedMotion && (
              <>
                <motion.svg
                  aria-hidden="true"
                  className="absolute left-[19%] top-[38%] h-8 w-8 text-[#226d4e]"
                  viewBox="0 0 32 32"
                  initial={{ opacity: 0, x: -12, y: 8, rotate: -18 }}
                  animate={{ opacity: [0, 0.42, 0], x: [0, 22, 38], y: [0, -8, -14], rotate: [-18, 8, 16] }}
                  transition={{ delay: 3.2, duration: 2.7, ease: [0.22, 1, 0.36, 1] }}
                >
                  <path
                    d="M26 6C16 6 8 11 7 23c10 1 17-5 19-17Z"
                    fill="currentColor"
                    fillOpacity="0.28"
                  />
                  <path d="M9 22c5-5 9-8 16-14" stroke="currentColor" strokeOpacity="0.4" strokeWidth="1.3" />
                </motion.svg>
                <motion.span
                  aria-hidden="true"
                  className="absolute right-[21%] top-[42%] h-3 w-3 rounded-full bg-[#226d4e]/18"
                  initial={{ opacity: 0, x: 0, y: 0, scale: 0.5 }}
                  animate={{ opacity: [0, 0.5, 0], x: [0, 16, 34], y: [0, 8, 16], scale: [0.5, 1, 0.72] }}
                  transition={{ delay: 3.45, duration: 2, ease: [0.22, 1, 0.36, 1] }}
                />
              </>
            )}
          </div>

          <motion.div
            className="relative -mt-2 flex max-w-3xl flex-col items-center text-center sm:-mt-5"
            initial="hidden"
            animate="visible"
          >
            <motion.p
              data-splash-brand
              className="font-serif text-3xl font-semibold text-[#2c261f] sm:text-4xl md:text-5xl"
              variants={textLineVariants}
              custom={textStartDelay}
            >
              {brandName}
            </motion.p>
            <motion.p
              data-splash-subtitle
              className="mt-3 text-sm font-medium text-[#226d4e] sm:text-base"
              variants={textLineVariants}
              custom={textStartDelay + 0.24}
            >
              {subtitle}
            </motion.p>
            <div className="mt-5 flex flex-col items-center gap-1.5 text-sm leading-6 text-[#4d4438] sm:text-base">
              {awakeningLines[lang].map((line, index) => (
                <motion.p
                  key={line}
                  data-splash-line
                  variants={textLineVariants}
                  custom={textStartDelay + 0.54 + index * 0.16}
                >
                  {line}
                </motion.p>
              ))}
            </div>
          </motion.div>

          {!prefersReducedMotion && (
            <motion.div
              aria-hidden="true"
              className="absolute bottom-7 left-1/2 h-px w-28 -translate-x-1/2 overflow-hidden bg-[#226d4e]/12"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0] }}
              transition={{ delay: 1.2, duration: 6.1, ease: 'easeInOut' }}
            >
              <motion.div
                className="h-full bg-[#f47d2c]/55"
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                transition={{ delay: 1.2, duration: 6.1, ease: 'linear' }}
              />
            </motion.div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );

  if (typeof document === 'undefined') {
    return splashContent;
  }

  return createPortal(splashContent, document.body);
}

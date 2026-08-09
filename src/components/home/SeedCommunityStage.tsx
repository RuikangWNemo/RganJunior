import type { ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import mascotWide from '@/assets/mascot-wide.png';
import { cn } from '@/lib/utils';

type SeedCommunityStageVariant = 'home' | 'join';

interface SeedCommunityStageProps {
  children: ReactNode;
  id?: string;
  lang: 'zh' | 'en';
  variant?: SeedCommunityStageVariant;
  className?: string;
  stageClassName?: string;
  mascotClassName?: string;
  mascotOverlay?: ReactNode;
}

export default function SeedCommunityStage({
  children,
  id,
  lang,
  variant = 'home',
  className,
  stageClassName,
  mascotClassName,
  mascotOverlay,
}: SeedCommunityStageProps) {
  const prefersReducedMotion = useReducedMotion();
  const isJoin = variant === 'join';
  const mascotReveal = isJoin
    ? { animate: { opacity: 1, y: 0, rotate: 0 } }
    : {
        whileInView: { opacity: 1, y: 0, rotate: 0 },
        viewport: { once: true, amount: 0.2 },
      };

  return (
    <section
      id={id}
      className={cn(
        'paper-texture relative isolate overflow-hidden border-b border-forest-foreground/10 bg-forest text-forest-foreground',
        isJoin && 'join-community-section',
        className
      )}
    >
      {!isJoin && (
        <>
          <div
            className="pointer-events-none absolute -right-48 -top-64 size-[44rem] rounded-full border border-forest-foreground/10"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute -bottom-64 left-[18%] size-[32rem] rounded-full border border-forest-foreground/5"
            aria-hidden="true"
          />
        </>
      )}

      <div
        className={cn(
          'relative z-10 mx-auto',
          isJoin ? 'container max-w-6xl px-4 sm:px-6 lg:px-8' : 'home-editorial-shell'
        )}
      >
        <div
          className={cn(
            'group/stage relative',
            isJoin
              ? 'join-community-stage min-h-[62rem] py-16 sm:min-h-[66rem] sm:py-24 lg:min-h-[56rem] lg:py-28'
              : 'min-h-[54rem] py-20 sm:min-h-[58rem] sm:py-28 lg:min-h-[46rem] lg:py-28',
            lang === 'en' &&
              (isJoin
                ? 'min-h-[67rem] sm:min-h-[70rem] lg:min-h-[60rem]'
                : 'min-h-[59rem] sm:min-h-[61rem] lg:min-h-[50rem]'),
            stageClassName
          )}
        >
          {children}

          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 48, rotate: 2 }}
            {...mascotReveal}
            transition={{
              duration: prefersReducedMotion ? 0 : 0.75,
              delay: 0.34,
              ease: 'easeOut',
            }}
            className={cn(
              'pointer-events-none absolute bottom-0 z-10 origin-bottom transition-transform duration-200 group-hover/stage:-rotate-1 group-focus-within/stage:-rotate-1 motion-reduce:transition-none',
              isJoin
                ? 'join-community-mascot right-[-7rem] w-[30rem] sm:right-[-4rem] sm:w-[36rem] md:right-[-14rem] md:w-[28rem] lg:right-[-14rem] lg:w-[36rem] xl:right-[-12rem] xl:w-[42rem]'
                : 'right-[-7rem] w-[31rem] sm:right-[-4rem] sm:w-[37rem] lg:right-[-9rem] lg:w-[48rem] xl:right-[-6rem] xl:w-[50rem]',
              mascotClassName
            )}
            aria-hidden={mascotOverlay ? undefined : true}
          >
            <img
              src={mascotWide}
              alt=""
              width={1125}
              height={705}
              loading="lazy"
              decoding="async"
              className="h-auto w-full select-none"
            />
            {mascotOverlay}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import mascotWide from '@/assets/mascot-wide.png';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

const communityRoles = [
  { zh: '阿柑少年', en: 'Youth', className: 'left-0 top-[5.1rem]' },
  { zh: '家长', en: 'Parents', className: 'left-[42%] top-[1.4rem] -translate-x-1/2' },
  { zh: '伙伴', en: 'Partners', className: 'right-0 top-[3.65rem]' },
] as const;

export default function SeedCommunity() {
  const { lang, t } = useLanguage();
  const prefersReducedMotion = useReducedMotion();

  return (
    <section
      id="seed-community"
      className="paper-texture relative isolate overflow-hidden border-b border-forest-foreground/10 bg-forest text-forest-foreground"
    >
      <div className="pointer-events-none absolute -right-48 -top-64 size-[44rem] rounded-full border border-forest-foreground/10" aria-hidden="true" />
      <div className="pointer-events-none absolute -bottom-64 left-[18%] size-[32rem] rounded-full border border-forest-foreground/5" aria-hidden="true" />

      <div className="container relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div
          className={cn(
            'group/stage relative min-h-[54rem] py-20 sm:min-h-[58rem] sm:py-28 lg:min-h-[46rem] lg:py-28',
            lang === 'en' && 'min-h-[59rem] sm:min-h-[61rem] lg:min-h-[50rem]'
          )}
        >
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.65, ease: 'easeOut' }}
            className="relative z-20 max-w-2xl lg:max-w-[38rem]"
          >
            <p className="seed-community-kicker text-xs uppercase tracking-[0.28em] text-forest-foreground/65">
              {t('种子社群', 'Seed Community')}
            </p>
            <h2 className="mt-6 text-balance font-serif text-4xl leading-[1.16] text-forest-foreground sm:text-5xl md:text-6xl">
              {t(
                '成为阿柑少年、家长或伙伴。',
                "Become an R'gan youth, parent, or partner."
              )}
            </h2>
            <p className="mt-6 max-w-lg text-pretty text-base leading-8 text-forest-foreground/70 sm:text-lg">
              {t(
                '种下一段长期同行的关系，一起走进真实世界。',
                'Plant a lasting relationship and step into the real world together.'
              )}
            </p>

            <div className="relative mt-8 h-40 max-w-xl sm:mt-10 sm:h-44" aria-label={t('加入身份', 'Ways to join')}>
              <svg
                viewBox="0 0 600 150"
                preserveAspectRatio="none"
                className="pointer-events-none absolute inset-0 size-full overflow-visible text-[#ff6a1f]"
                aria-hidden="true"
              >
                <motion.path
                  d="M 12 92 C 118 92 130 28 250 34 S 420 112 588 68"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  vectorEffect="non-scaling-stroke"
                  initial={prefersReducedMotion ? false : { pathLength: 0, opacity: 0 }}
                  whileInView={{ pathLength: 1, opacity: 0.72 }}
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{ duration: prefersReducedMotion ? 0 : 0.9, delay: 0.18, ease: 'easeOut' }}
                />
              </svg>

              <ul>
                {communityRoles.map((role, index) => (
                  <motion.li
                    key={role.en}
                    initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.5 }}
                    transition={{
                      duration: prefersReducedMotion ? 0 : 0.45,
                      delay: prefersReducedMotion ? 0 : 0.34 + index * 0.1,
                      ease: 'easeOut',
                    }}
                    className={cn(
                      'absolute flex items-center gap-2.5 whitespace-nowrap text-sm font-medium text-forest-foreground sm:text-base',
                      role.className
                    )}
                  >
                    <span className="size-3 rounded-full border-2 border-forest bg-[#ff6a1f] shadow-sm" aria-hidden="true" />
                    <span>{t(role.zh, role.en)}</span>
                  </motion.li>
                ))}
              </ul>
            </div>

            <Link
              to="/join"
              className="cursor-target group/join mt-4 inline-flex min-h-14 items-center gap-4 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-[#ff6a1f] focus-visible:ring-offset-4 focus-visible:ring-offset-forest sm:mt-6"
            >
              <span className="border-b border-forest-foreground/35 pb-1 text-base font-medium transition-colors duration-200 group-hover/join:border-[#ff6a1f] group-focus-visible/join:border-[#ff6a1f] sm:text-lg">
                {t('进入加入入口', 'Enter the Join Page')}
              </span>
              <span className="flex size-12 items-center justify-center rounded-full bg-[#ff6a1f] text-white shadow-sm" aria-hidden="true">
                <ArrowRight className="size-5 transition-transform duration-200 group-hover/join:translate-x-1 group-focus-visible/join:translate-x-1 motion-reduce:transition-none" />
              </span>
            </Link>
          </motion.div>

          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 48, rotate: 2 }}
            whileInView={{ opacity: 1, y: 0, rotate: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.75, delay: 0.34, ease: 'easeOut' }}
            className="pointer-events-none absolute bottom-0 right-[-7rem] z-10 w-[31rem] origin-bottom transition-transform duration-200 group-hover/stage:-rotate-1 group-focus-within/stage:-rotate-1 motion-reduce:transition-none sm:right-[-4rem] sm:w-[37rem] lg:right-[-9rem] lg:w-[48rem] xl:right-[-6rem] xl:w-[50rem]"
            aria-hidden="true"
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
          </motion.div>
        </div>
      </div>
    </section>
  );
}

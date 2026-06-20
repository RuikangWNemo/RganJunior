import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import ScrollProgressReveal from '@/components/ui/ScrollProgressReveal';

export default function SeedCommunity() {
  const { t } = useLanguage();

  return (
    <section id="seed-community" className="section-breathing relative isolate overflow-hidden bg-secondary/30">
      <div className="pointer-events-none absolute inset-0 z-0 motion-reduce:hidden" aria-hidden="true">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_52%_48%,transparent_0%,hsl(var(--secondary)/0.18)_42%,hsl(var(--secondary)/0.66)_72%,hsl(var(--secondary)/0.94)_100%)]" />
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[hsl(var(--secondary)/0.72)] to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[hsl(var(--secondary)/0.72)] to-transparent" />
      </div>

      <div className="container relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <ScrollProgressReveal direction="up" distance={48}>
          <div className="mx-auto max-w-4xl text-center">
            <p className="text-xs uppercase tracking-[0.28em] text-primary/70">
              {t('种子社群', 'Seed Community')}
            </p>
            <h2 className="seed-community-label isolate mt-7 inline-flex max-w-full items-center justify-center rounded-full border border-primary/20 bg-background/75 px-7 py-4 text-center font-serif text-2xl leading-tight text-foreground shadow-[0_24px_70px_hsl(var(--primary)/0.12)] backdrop-blur-md sm:px-10 sm:py-5 sm:text-3xl md:px-12 md:text-4xl">
              <span>{t('成为阿柑少年 / 家长 / 伙伴', 'Youth / Parents / Partners')}</span>
            </h2>
          </div>
        </ScrollProgressReveal>

        <ScrollProgressReveal direction="up" distance={40} className="mt-10 md:mt-12">
          <div className="relative mx-auto max-w-4xl">
            <div className="flex justify-center">
              <div className="seed-community-entry relative inline-flex items-center justify-center">
                <span className="seed-community-entry-field" aria-hidden="true" />
                <Link
                  to="/join"
                  className="cursor-target group relative z-10 inline-flex min-h-12 items-center justify-center rounded-full bg-primary px-7 py-3 text-sm font-medium text-primary-foreground shadow-[0_18px_60px_hsl(var(--primary)/0.22)] transition-organic hover:-translate-y-0.5 hover:bg-primary/95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-secondary"
                >
                  {t('进入加入入口', 'Enter the Join Page')}
                  <ArrowRight className="ml-2 h-4 w-4 transition-organic group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          </div>
        </ScrollProgressReveal>
      </div>
    </section>
  );
}

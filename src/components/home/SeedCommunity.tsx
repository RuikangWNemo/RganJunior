import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { joinAudiences } from '@/content/siteContent';
import { useLanguage } from '@/contexts/LanguageContext';
import { pickLocalized } from '@/lib/brand';
import ScrollProgressReveal from '@/components/ui/ScrollProgressReveal';
import Strands from '@/components/ui/Strands';

export default function SeedCommunity() {
  const { lang, t } = useLanguage();

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
            <h2 className="mt-5 font-serif text-4xl leading-tight text-foreground md:text-5xl">
              {t('成为阿柑少年 / 家长 / 伙伴', 'For Youth, Parents, and Partners')}
            </h2>
            <div className="pointer-events-none mx-auto mt-3 h-24 w-[min(820px,92vw)] motion-reduce:hidden" aria-hidden="true">
              <Strands
                colors={['#F97316', '#005A43', '#95A6A9']}
                count={4}
                speed={0.2}
                amplitude={0.86}
                waviness={0.86}
                thickness={0.5}
                glow={2.2}
                taper={4.8}
                spread={1.08}
                hueShift={0.03}
                intensity={0.46}
                saturation={1.12}
                opacity={0.56}
                scale={1.12}
              />
            </div>
          </div>
        </ScrollProgressReveal>

        <ScrollProgressReveal direction="up" distance={40} className="mt-4">
          <div className="relative mx-auto max-w-4xl">
            <div className="grid gap-3 sm:grid-cols-3">
              {joinAudiences.map((audience, index) => (
                <div
                  key={audience.id}
                  className="seed-community-label rounded-full border border-primary/20 bg-background/60 px-5 py-3 text-center text-sm font-medium text-foreground shadow-[0_18px_60px_hsl(var(--primary)/0.08)] backdrop-blur-md"
                  style={{ animationDelay: `${index * 0.85}s` }}
                >
                  {pickLocalized(audience.trigger, lang)}
                </div>
              ))}
            </div>

            <div className="mt-9 flex justify-center md:mt-12">
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

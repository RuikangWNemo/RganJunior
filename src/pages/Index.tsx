import { useRef } from 'react';
import ActionLayerStory from '@/components/home/ActionLayerStory';
import HeroCopy from '@/components/home/HeroCopy';
import HomeHeroFlow from '@/components/home/HomeHeroFlow';
import HomeScrollVideo from '@/components/home/HomeScrollVideo';
import HeroMascotStage from '@/components/home/HeroMascotStage';
import SeedCommunity from '@/components/home/SeedCommunity';
import { siteBeliefs } from '@/content/siteContent';
import { useLanguage } from '@/contexts/LanguageContext';
import { pickLocalized } from '@/lib/brand';
import BlobCursor from '@/components/ui/BlobCursor';
import ScrollProgressReveal from '@/components/ui/ScrollProgressReveal';

export default function Index() {
  const heroRef = useRef<HTMLElement>(null);
  const { lang, t } = useLanguage();

  return (
    <>
      <section ref={heroRef} className="relative isolate overflow-hidden bg-background">
        <HomeHeroFlow />
        <div className="pointer-events-none absolute inset-0 z-[1] hidden lg:block" aria-hidden="true">
          <BlobCursor />
        </div>
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-b from-transparent to-[hsl(42_28%_96%)]"
          aria-hidden="true"
        />
        <div className="container relative z-10 mx-auto grid min-h-[min(760px,84svh)] items-center gap-10 px-4 pb-16 pt-24 sm:px-6 sm:pt-28 lg:grid-cols-[minmax(200px,0.42fr)_minmax(0,1fr)] lg:gap-10 lg:px-8 lg:pb-20 lg:pt-28 xl:min-h-[min(820px,84svh)]">
          <HeroMascotStage sectionRef={heroRef} />
          <HeroCopy onJoin={() => { window.location.href = '/join'; }} />
        </div>
      </section>

      <HomeScrollVideo />

      <section className="section-breathing bg-background">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 max-w-3xl">
            <ScrollProgressReveal direction="up" distance={48} scale={false} blur={false}>
              <p className="text-xs uppercase tracking-[0.28em] text-primary/70">
                {t('我们相信什么', 'What We Believe')}
              </p>
              <h2 className="mt-5 font-serif text-4xl leading-tight text-foreground md:text-5xl">
                {t('我们相信这些简单的事', 'A few things we keep returning to')}
              </h2>
            </ScrollProgressReveal>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {siteBeliefs.map((belief, index) => (
              <ScrollProgressReveal
                key={belief.title.en}
                direction="up"
                distance={36}
                scale={false}
                blur={false}
                delay={index * 0.04}
              >
                <article className="border-t border-border pt-6">
                  <p className="mb-4 text-xs uppercase tracking-[0.2em] text-primary/70">
                    {String(index + 1).padStart(2, '0')}
                  </p>
                  <h3 className="font-serif text-2xl leading-snug text-foreground">
                    {pickLocalized(belief.title, lang)}
                  </h3>
                  <p className="mt-5 text-sm leading-7 text-muted-foreground md:text-base md:leading-8">
                    {pickLocalized(belief.description, lang)}
                  </p>
                </article>
              </ScrollProgressReveal>
            ))}
          </div>
        </div>
      </section>

      <ActionLayerStory />
      <SeedCommunity />
    </>
  );
}

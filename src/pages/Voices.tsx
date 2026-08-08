import { VoiceStoryCard } from '@/components/voices/VoiceStoryCard';
import { voiceStories } from '@/content/voiceStories';
import { useLanguage } from '@/contexts/LanguageContext';

const growthStoryLayouts = [
  'md:col-span-7',
  'md:col-span-5 md:pt-16',
  'md:col-span-5',
  'md:col-span-7 md:pt-10',
];

export default function Voices() {
  const { t } = useLanguage();
  const projectLetter = voiceStories[0];
  const growthStories = voiceStories.slice(1);

  return (
    <div className="voices-page pt-20">
      <header className="voices-hero pb-14 pt-16 sm:pb-20 sm:pt-24 md:pb-24 md:pt-28">
        <div className="voices-hero-shell container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="voices-hero-copy max-w-3xl min-w-0">
            <p data-page-motion="title" className="voices-mobile-kicker text-xs uppercase tracking-[0.22em] text-primary/70">
              {t('Voices', 'Voices')}
            </p>
            <h1 data-page-motion="title" className="mt-5 font-serif text-4xl leading-tight text-foreground md:text-5xl lg:text-6xl">
              {t('伙伴之声', 'Partner Voices')}
            </h1>
            <div className="voices-mobile-rule mt-6 h-px w-12 bg-primary" />
            <p data-page-motion="lead" className="mt-8 max-w-2xl text-base leading-8 text-muted-foreground md:text-lg">
              {t(
                '从土地、茶、厨房与科技出发，听见少年如何在真实生活中找到自己的位置，也一起发起新的行动。',
                'Stories of young people finding their place through land, tea, cooking, technology, and action in the real world.'
              )}
            </p>
          </div>
        </div>
      </header>

      <section className="voices-archive border-t border-border/70 pb-20 pt-10 md:pb-28 md:pt-16" aria-label={t('文章列表', 'Story archive')}>
        <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <VoiceStoryCard story={projectLetter} variant="feature" />

          <section className="mt-20 border-t border-border/70 pt-14 md:mt-28 md:pt-20" aria-labelledby="growth-stories-heading">
            <div className="max-w-2xl">
              <h2 id="growth-stories-heading" className="font-serif text-3xl text-foreground md:text-4xl">
                {t('成长故事', 'Growth Stories')}
              </h2>
              <p className="mt-5 text-base leading-8 text-muted-foreground">
                {t(
                  '四个不同的生活方向，汇成阿柑少年的共同经验。',
                  "Four different paths become part of R-Gan Junior's shared experience."
                )}
              </p>
            </div>

            <div className="mt-12 grid gap-x-10 gap-y-16 md:grid-cols-12 md:gap-y-20">
              {growthStories.map((story, index) => (
                <VoiceStoryCard
                  key={story.slug}
                  story={story}
                  className={growthStoryLayouts[index]}
                />
              ))}
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}

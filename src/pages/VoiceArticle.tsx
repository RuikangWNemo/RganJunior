import { ArrowLeft, ArrowRight, ExternalLink } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { VoiceStoryCard } from '@/components/voices/VoiceStoryCard';
import { getNextVoiceStory, getVoiceStory } from '@/content/voiceStories';
import { useLanguage } from '@/contexts/LanguageContext';
import { pickLocalized } from '@/lib/brand';
import { cn } from '@/lib/utils';
import NotFound from './NotFound';

export default function VoiceArticle() {
  const { slug } = useParams<{ slug: string }>();
  const { lang, t } = useLanguage();
  const story = getVoiceStory(slug);

  if (!story) {
    return <NotFound />;
  }

  const nextStory = getNextVoiceStory(story);
  const isGrowthStory = story.kind === 'growth-story';

  return (
    <div
      className={cn(
        'voice-article-page pt-20',
        isGrowthStory && 'voice-article-page--growth-story'
      )}
    >
      <article>
        <header className="voice-article-header border-b border-border/70 pb-12 pt-14 sm:pb-16 sm:pt-20 md:pb-20 md:pt-24">
          <div className="voice-article-header__inner container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <Link
              to="/voices"
              className="voice-article-back cursor-target inline-flex items-center gap-2 text-sm text-muted-foreground transition-organic hover:text-primary"
            >
              <ArrowLeft aria-hidden="true" className="h-4 w-4" />
              <span>{t('返回伙伴之声', 'Back to Partner Voices')}</span>
            </Link>

            <div className="voice-article-intro mt-12 max-w-4xl">
              <div className="voice-article-meta flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-primary/75">
                <span>{pickLocalized(story.kindLabel, lang)}</span>
                <time dateTime={story.displayDate}>{story.displayDate}</time>
              </div>
              <h1 className="voice-article-title mt-6 text-balance font-serif text-4xl leading-[1.16] text-foreground md:text-5xl lg:text-6xl">
                {pickLocalized(story.title, lang)}
              </h1>
              <p className="voice-article-deck mt-7 max-w-3xl text-base leading-8 text-muted-foreground md:text-lg md:leading-9">
                {pickLocalized(story.description, lang)}
              </p>
              <p className="voice-article-author mt-6 text-sm text-foreground/75">
                {t('作者：', 'By: ')}{pickLocalized(story.author, lang)}
              </p>
            </div>
          </div>
        </header>

        <div className="voice-article-cover-wrap container mx-auto max-w-6xl px-4 pt-8 sm:px-6 md:pt-12 lg:px-8">
          <figure className="voice-article-cover overflow-hidden rounded-lg bg-secondary/50">
            <img
              src={story.cover}
              alt={pickLocalized(story.coverAlt, lang)}
              width={story.coverWidth}
              height={story.coverHeight}
              loading="eager"
              className="aspect-[16/7] h-auto w-full object-cover"
            />
          </figure>
        </div>

        <div className="voice-article-reading container mx-auto max-w-[47rem] px-4 py-14 sm:px-6 md:py-20 lg:px-8">
          {lang === 'en' && (
            <p className="mb-10 border-l-2 border-primary/45 pl-5 text-sm leading-7 text-muted-foreground">
              This story is presented in its original Chinese text.
            </p>
          )}
          <div
            className="voice-article-body"
            lang="zh-CN"
            dangerouslySetInnerHTML={{ __html: story.bodyHtml }}
          />

          <div className="voice-article-source mt-16 border-t border-border pt-8">
            <a
              href={story.originalUrl}
              target="_blank"
              rel="noreferrer"
              className="cursor-target inline-flex items-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition duration-300 hover:bg-primary/90 active:translate-y-px"
            >
              <span>{t('阅读微信原文', 'Open the original WeChat article')}</span>
              <ExternalLink aria-hidden="true" className="h-4 w-4" />
            </a>
          </div>
        </div>
      </article>

      <section className="voice-article-next border-t border-border/70 bg-card/35 py-16 md:py-24" aria-labelledby="next-voice-story">
        <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="mb-9 flex items-end justify-between gap-6">
            <h2 id="next-voice-story" className="font-serif text-3xl text-foreground md:text-4xl">
              {t('继续阅读', 'Continue reading')}
            </h2>
            <Link to="/voices" className="hidden items-center gap-2 text-sm text-primary sm:inline-flex">
              {t('查看全部', 'View all')}
              <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </Link>
          </div>
          <VoiceStoryCard story={nextStory} headingLevel="h3" variant="feature" />
        </div>
      </section>
    </div>
  );
}

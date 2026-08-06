import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { VoiceStory } from '@/content/voiceStories';
import { useLanguage } from '@/contexts/LanguageContext';
import { pickLocalized } from '@/lib/brand';
import { cn } from '@/lib/utils';

interface VoiceStoryCardProps {
  story: VoiceStory;
  className?: string;
  headingLevel?: 'h2' | 'h3';
  variant?: 'feature' | 'standard';
}

export function VoiceStoryCard({
  story,
  className,
  headingLevel = 'h2',
  variant = 'standard',
}: VoiceStoryCardProps) {
  const { lang, t } = useLanguage();
  const Heading = headingLevel;
  const isFeature = variant === 'feature';

  return (
    <article className={cn('voice-story-card min-w-0', className)}>
      <Link
        to={`/voices/${story.slug}`}
        className={cn(
          'group block rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background',
          isFeature && 'md:grid md:grid-cols-[minmax(0,1.15fr)_minmax(18rem,0.85fr)] md:items-stretch'
        )}
        aria-label={t(`阅读：${story.title.zh}`, `Read: ${story.title.en}`)}
      >
        <figure className="overflow-hidden rounded-lg bg-secondary/55">
          <img
            src={story.cover}
            alt={pickLocalized(story.coverAlt, lang)}
            width={story.coverWidth}
            height={story.coverHeight}
            loading={isFeature ? 'eager' : 'lazy'}
            className={cn(
              'h-full w-full object-cover transition duration-500 ease-out group-hover:scale-[1.018]',
              isFeature ? 'aspect-[16/8] md:aspect-auto md:min-h-[24rem]' : 'aspect-video'
            )}
          />
        </figure>

        <div
          className={cn(
            'py-6',
            isFeature
              ? 'md:flex md:flex-col md:justify-between md:px-10 md:py-10'
              : 'md:pr-6'
          )}
        >
          <div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-primary/75">
              <span>{pickLocalized(story.kindLabel, lang)}</span>
              <time dateTime={story.displayDate}>{story.displayDate}</time>
            </div>
            <Heading
              className={cn(
                'mt-4 text-balance font-serif leading-tight text-foreground transition-colors group-hover:text-primary',
                isFeature ? 'text-3xl md:text-4xl' : 'text-2xl md:text-3xl'
              )}
            >
              {pickLocalized(story.title, lang)}
            </Heading>
            <p className="mt-5 line-clamp-3 text-sm leading-7 text-muted-foreground md:text-base">
              {pickLocalized(story.description, lang)}
            </p>
          </div>

          <div className={cn('mt-6 flex items-center justify-between gap-5', isFeature && 'md:mt-10')}>
            <p className="text-sm text-foreground/75">{pickLocalized(story.author, lang)}</p>
            <span className="inline-flex shrink-0 items-center gap-2 text-sm font-medium text-primary">
              {t('阅读全文', 'Read story')}
              <ArrowRight aria-hidden="true" className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}

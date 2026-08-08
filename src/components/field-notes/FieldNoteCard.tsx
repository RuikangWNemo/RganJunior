import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  getFieldNotePerson,
  getFieldNoteTopic,
  type FieldNote,
  type FieldNotePerson,
  type FieldNoteTopic,
} from '@/content/fieldNotes';
import { useLanguage } from '@/contexts/LanguageContext';
import { pickLocalized } from '@/lib/brand';
import { cn } from '@/lib/utils';

function formatDate(date: string, language: 'zh' | 'en') {
  return new Intl.DateTimeFormat(language === 'zh' ? 'zh-CN' : 'en-GB', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(`${date}T00:00:00`));
}

function resolveAuthors(note: FieldNote): FieldNotePerson[] {
  if (note.authors) return note.authors;
  return note.authorSlugs
    .map(getFieldNotePerson)
    .filter((person): person is FieldNotePerson => Boolean(person));
}

function resolveTopics(note: FieldNote): FieldNoteTopic[] {
  if (note.topics) return note.topics;
  return note.topicSlugs
    .map(getFieldNoteTopic)
    .filter((topic): topic is FieldNoteTopic => Boolean(topic));
}

interface FieldNoteCardProps {
  note: FieldNote;
  variant?: 'lead' | 'side' | 'row';
  index?: number;
  className?: string;
}

export function FieldNoteCard({
  note,
  variant = 'row',
  index,
  className,
}: FieldNoteCardProps) {
  const { lang, t } = useLanguage();
  const authors = resolveAuthors(note);
  const topics = resolveTopics(note);
  const title = pickLocalized(note.title, lang);
  const href = `/field-notes/${note.slug}`;
  const meta = (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs leading-6 text-muted-foreground">
      <span className="font-medium text-primary/80">
        {authors.map((person) => pickLocalized(person.name, lang)).join(', ')}
      </span>
      <span aria-hidden="true" className="h-3 w-px bg-border" />
      <time dateTime={note.publishedAt}>{formatDate(note.publishedAt, lang)}</time>
      <span aria-hidden="true" className="h-3 w-px bg-border" />
      <span>{topics.map((topic) => pickLocalized(topic.shortName, lang)).join(', ')}</span>
    </div>
  );

  if (variant === 'lead') {
    return (
      <article className={cn('group', className)}>
        <Link
          to={href}
          aria-label={t(`阅读：${title}`, `Read: ${title}`)}
          className="cursor-target block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background"
        >
          <div className="overflow-hidden rounded-lg bg-secondary/50">
            <img
              src={note.cover}
              alt={pickLocalized(note.coverAlt, lang)}
              loading="eager"
              decoding="async"
              className="aspect-[16/10] w-full object-cover transition duration-700 ease-out group-hover:scale-[1.025] motion-reduce:transition-none"
            />
          </div>
          <div className="mt-7 max-w-3xl">
            {meta}
            <h2 className="mt-4 text-balance font-serif text-3xl leading-[1.22] text-foreground transition-colors group-hover:text-primary sm:text-4xl lg:text-5xl">
              {title}
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-8 text-muted-foreground">
              {pickLocalized(note.excerpt, lang)}
            </p>
            <span className="mt-6 inline-flex min-h-11 items-center gap-2 text-sm font-medium text-primary">
              {t('阅读全文', 'Read the article')}
              <ArrowRight aria-hidden="true" className="h-4 w-4 transition-transform group-hover:translate-x-1 motion-reduce:transition-none" />
            </span>
          </div>
        </Link>
      </article>
    );
  }

  if (variant === 'side') {
    return (
      <article className={cn('group border-t border-border pt-6', className)}>
        <Link
          to={href}
          aria-label={t(`阅读：${title}`, `Read: ${title}`)}
          className="cursor-target grid min-h-44 grid-cols-[minmax(0,1fr)_7.5rem] gap-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background sm:grid-cols-[minmax(0,1fr)_9rem]"
        >
          <div className="min-w-0">
            <p className="text-xs text-primary/70">{String((index ?? 0) + 1).padStart(2, '0')}</p>
            <h3 className="mt-3 text-balance font-serif text-xl leading-8 text-foreground transition-colors group-hover:text-primary sm:text-2xl">
              {title}
            </h3>
            <p className="mt-3 line-clamp-2 text-sm leading-7 text-muted-foreground">
              {pickLocalized(note.excerpt, lang)}
            </p>
            <div className="mt-4">{meta}</div>
          </div>
          <div className="overflow-hidden rounded-lg bg-secondary/50">
            <img
              src={note.cover}
              alt=""
              loading="lazy"
              decoding="async"
              className="h-full min-h-40 w-full object-cover transition duration-700 ease-out group-hover:scale-[1.04] motion-reduce:transition-none"
            />
          </div>
        </Link>
      </article>
    );
  }

  return (
    <article className={cn('group', className)}>
      <Link
        to={href}
        aria-label={t(`阅读：${title}`, `Read: ${title}`)}
        className="cursor-target grid gap-5 py-7 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background sm:grid-cols-[3rem_minmax(0,1fr)_9rem] sm:items-start md:grid-cols-[4rem_minmax(0,1fr)_12rem] md:gap-7 md:py-9"
      >
        <span className="hidden pt-1 text-xs tabular-nums text-primary/55 sm:block">
          {String((index ?? 0) + 1).padStart(2, '0')}
        </span>
        <div className="min-w-0">
          {meta}
          <h3 className="mt-3 text-balance font-serif text-2xl leading-[1.35] text-foreground transition-colors group-hover:text-primary md:text-3xl">
            {title}
          </h3>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground md:text-base md:leading-8">
            {pickLocalized(note.excerpt, lang)}
          </p>
        </div>
        <div className="overflow-hidden rounded-lg bg-secondary/50 sm:order-none">
          <img
            src={note.cover}
            alt=""
            loading="lazy"
            decoding="async"
            className="aspect-[16/9] w-full object-cover transition duration-700 ease-out group-hover:scale-[1.04] motion-reduce:transition-none sm:aspect-[4/3]"
          />
        </div>
      </Link>
    </article>
  );
}

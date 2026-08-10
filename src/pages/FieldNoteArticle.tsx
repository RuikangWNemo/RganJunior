import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, ArrowRight, Clock } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { FieldNoteCard } from '@/components/field-notes/FieldNoteCard';
import { useLanguage } from '@/contexts/LanguageContext';
import { pickLocalized } from '@/lib/brand';
import { fieldNotesRepository } from '@/services/field-notes/publicRepository';
import NotFound from './NotFound';

function formatDate(date: string, language: 'zh' | 'en') {
  return new Intl.DateTimeFormat(language === 'zh' ? 'zh-CN' : 'en-GB', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(`${date}T00:00:00`));
}

export default function FieldNoteArticle() {
  const { slug } = useParams<{ slug: string }>();
  const { lang, t } = useLanguage();
  const noteQuery = useQuery({
    queryKey: ['field-notes', 'article', slug],
    queryFn: () => fieldNotesRepository.getPublishedNoteBySlug(slug ?? ''),
  });
  const relatedQuery = useQuery({
    queryKey: ['field-notes', 'related', slug, lang],
    queryFn: () => fieldNotesRepository.listPublishedNotes({ language: lang }),
  });

  if (noteQuery.isPending) {
    return (
      <div className="container mx-auto max-w-5xl animate-pulse px-4 pb-24 pt-40 sm:px-6 lg:px-8" aria-label={t('正在读取文章', 'Loading article')}>
        <div className="h-4 w-32 rounded bg-secondary" />
        <div className="mt-14 h-14 w-4/5 rounded bg-secondary" />
        <div className="mt-6 h-6 w-2/3 rounded bg-secondary" />
        <div className="mt-14 aspect-[16/8] rounded-lg bg-secondary" />
      </div>
    );
  }

  if (noteQuery.isError) {
    return (
      <div className="container mx-auto max-w-3xl px-4 pb-24 pt-40 text-center sm:px-6 lg:px-8" role="alert">
        <h1 className="font-serif text-3xl text-foreground">{t('文章暂时没有加载出来', 'The article could not be loaded')}</h1>
        <p className="mt-4 text-sm leading-7 text-muted-foreground">{t('请稍后再试。', 'Please try again in a moment.')}</p>
        <button
          type="button"
          onClick={() => void noteQuery.refetch()}
          className="mt-6 min-h-11 rounded-lg border border-primary/35 px-5 text-sm font-medium text-primary transition hover:bg-primary/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {t('重新加载', 'Try again')}
        </button>
      </div>
    );
  }

  const note = noteQuery.data;
  if (!note) return <NotFound />;

  const authors = note.authors;
  const topics = note.topics;
  const related = (relatedQuery.data ?? [])
    .filter((candidate) => candidate.slug !== note.slug)
    .filter((candidate) => (
      candidate.authorSlugs.some((author) => note.authorSlugs.includes(author))
      || candidate.topicSlugs.some((topic) => note.topicSlugs.includes(topic))
    ))
    .slice(0, 2);

  return (
    <div className="field-note-article pt-20">
      <article>
        <header className="pb-12 pt-14 sm:pb-16 sm:pt-20 md:pb-20 md:pt-24">
          <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <Link
              to="/field-notes"
              className="cursor-target inline-flex min-h-11 items-center gap-2 text-sm text-muted-foreground transition hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <ArrowLeft aria-hidden="true" className="h-4 w-4" />
              {t('返回田野笔记', 'Back to Field Notes')}
            </Link>

            <div className="mt-11 max-w-5xl">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-primary/75">
                <span>{topics.map((topic) => pickLocalized(topic.name, lang)).join(', ')}</span>
                <span aria-hidden="true" className="h-4 w-px bg-border" />
                <time dateTime={note.publishedAt}>{formatDate(note.publishedAt, lang)}</time>
                <span aria-hidden="true" className="h-4 w-px bg-border" />
                <span className="inline-flex items-center gap-1.5">
                  <Clock aria-hidden="true" className="h-3.5 w-3.5" />
                  {t(`${note.readingMinutes} 分钟阅读`, `${note.readingMinutes} min read`)}
                </span>
              </div>
              <h1
                className={`mt-6 text-balance font-serif leading-[1.14] text-foreground ${
                  lang === 'en'
                    ? 'max-w-5xl text-4xl sm:text-5xl lg:text-[3.5rem]'
                    : 'max-w-[18ch] text-4xl sm:text-5xl lg:text-6xl'
                }`}
              >
                {pickLocalized(note.title, lang)}
              </h1>
              <p className="mt-7 max-w-3xl text-base leading-8 text-muted-foreground md:text-lg md:leading-9">
                {pickLocalized(note.excerpt, lang)}
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <div className="flex -space-x-2" aria-hidden="true">
                  {authors.map((author) => (
                    <img key={author.slug} src={author.avatar} alt="" className="size-10 rounded-full border-2 border-background object-cover" />
                  ))}
                </div>
                <p className="text-sm text-foreground/75">
                  {t('作者：', 'By: ')}{authors.map((author) => pickLocalized(author.name, lang)).join(', ')}
                </p>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <figure className="overflow-hidden rounded-lg bg-secondary/50">
            <img
              src={note.cover}
              alt={pickLocalized(note.coverAlt, lang)}
              className="aspect-[16/8] w-full object-cover"
            />
          </figure>
        </div>

        <div className="container mx-auto max-w-[46rem] px-4 py-14 sm:px-6 md:py-20 lg:px-8">
          {note.contentHtml ? (
            <div className="field-note-prose field-note-rich-content text-[1.0625rem] leading-[2.05] text-foreground/85" dangerouslySetInnerHTML={{ __html: note.contentHtml }} />
          ) : (
            <div className="field-note-prose whitespace-pre-wrap text-[1.0625rem] leading-[2.05] text-foreground/85">{note.plainContent}</div>
          )}

          <div className="mt-16 border-t border-border pt-8">
            <Link
              to="/field-notes/all"
              className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-primary transition hover:text-primary/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {t('查看文章档案', 'View the article archive')}
              <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </article>

      {related.length ? (
        <section className="border-t border-border/80 bg-card/30 py-16 md:py-24" aria-labelledby="related-field-notes">
          <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <h2 id="related-field-notes" className="font-serif text-3xl text-foreground md:text-4xl">
              {t('继续阅读', 'Continue reading')}
            </h2>
            <div className="mt-9 divide-y divide-border/80 border-t border-border/80">
              {related.map((candidate, index) => (
                <FieldNoteCard key={candidate.slug} note={candidate} index={index} />
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}

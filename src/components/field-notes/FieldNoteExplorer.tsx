import { Search, X } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import type { FieldNote, FieldNotePerson, FieldNoteTopic } from '@/types/field-notes';
import { useLanguage } from '@/contexts/LanguageContext';
import { pickLocalized } from '@/lib/brand';
import { FieldNoteCard } from './FieldNoteCard';

export type ExplorerDimension = 'people' | 'topics';

interface FieldNoteExplorerProps {
  notes: FieldNote[];
  allNotes: FieldNote[];
  people: FieldNotePerson[];
  topics: FieldNoteTopic[];
  dimension: ExplorerDimension;
  search: string;
  personSlug: string;
  topicSlug: string;
  isLoading?: boolean;
  hasError?: boolean;
  onDimensionChange: (dimension: ExplorerDimension) => void;
  onSearchChange: (search: string) => void;
  onPersonChange: (slug: string) => void;
  onTopicChange: (slug: string) => void;
  onClear: () => void;
  onRetry: () => void;
  compact?: boolean;
}

function ExplorerSkeleton() {
  return (
    <div className="space-y-5 py-8" aria-hidden="true">
      {[0, 1, 2].map((item) => (
        <div key={item} className="grid animate-pulse gap-5 sm:grid-cols-[3rem_minmax(0,1fr)_9rem]">
          <div className="h-4 rounded bg-secondary" />
          <div className="space-y-3">
            <div className="h-4 w-1/3 rounded bg-secondary" />
            <div className="h-7 w-4/5 rounded bg-secondary" />
            <div className="h-4 w-2/3 rounded bg-secondary" />
          </div>
          <div className="h-28 rounded-lg bg-secondary" />
        </div>
      ))}
    </div>
  );
}

export function FieldNoteExplorer({
  notes,
  allNotes,
  people,
  topics,
  dimension,
  search,
  personSlug,
  topicSlug,
  isLoading = false,
  hasError = false,
  onDimensionChange,
  onSearchChange,
  onPersonChange,
  onTopicChange,
  onClear,
  onRetry,
  compact = false,
}: FieldNoteExplorerProps) {
  const { lang, t } = useLanguage();
  const reduceMotion = useReducedMotion();
  const hasFilters = Boolean(search || personSlug || topicSlug);

  return (
    <div>
      <div className="grid gap-8 border-b border-border pb-9 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,28rem)] lg:items-end">
        <div>
          <div className="flex gap-7" role="tablist" aria-label={t('浏览方式', 'Browse by')}>
            {(['people', 'topics'] as const).map((item) => {
              const selected = dimension === item;
              const label = item === 'people' ? t('按人物', 'By people') : t('按题材', 'By topic');
              return (
                <button
                  key={item}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  onClick={() => onDimensionChange(item)}
                  className={`relative min-h-11 pb-2 text-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background ${
                    selected ? 'font-medium text-primary' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {label}
                  {selected ? (
                    <motion.span
                      layoutId="field-notes-explorer-tab"
                      className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-primary"
                      transition={reduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 360, damping: 32 }}
                    />
                  ) : null}
                </button>
              );
            })}
          </div>
          <p className="mt-4 max-w-xl text-sm leading-7 text-muted-foreground">
            {dimension === 'people'
              ? t('选择一个人物，沿着他的观察继续阅读。', 'Choose a person and follow their observations across the archive.')
              : t('从生活、共创与研究进入同一片真实现场。', 'Enter the same lived setting through reflection, co-creation, or research.')}
          </p>
        </div>

        <div>
          <label htmlFor="field-note-search" className="mb-2 block text-lg font-medium text-foreground">
            {t('搜索文章或人物', 'Search articles or people')}
          </label>
          <div className="relative">
            <Search aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              id="field-note-search"
              type="search"
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder={t('输入标题、作者或题材', 'Enter a title, author, or topic')}
              className="min-h-12 w-full rounded-lg border border-input bg-card/70 py-3 pl-11 pr-12 text-sm text-foreground outline-none transition focus:border-primary/55 focus:ring-2 focus:ring-ring/25 placeholder:text-muted-foreground/80"
            />
            {search ? (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="absolute right-1.5 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label={t('清除搜索', 'Clear search')}
              >
                <X aria-hidden="true" className="h-4 w-4" />
              </button>
            ) : null}
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {dimension === 'people' ? (
          <motion.div
            key="people"
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -4 }}
            className="-mx-4 overflow-x-auto px-4 py-7 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0"
          >
            <div className="flex min-w-max gap-3" role="group" aria-label={t('人物筛选', 'People filters')}>
              <button
                type="button"
                aria-pressed={!personSlug}
                onClick={() => onPersonChange('')}
                className={`flex min-h-20 w-28 flex-col justify-center rounded-lg border px-4 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                  !personSlug
                    ? 'border-primary/45 bg-primary/[0.08] text-primary'
                    : 'border-border bg-card/45 text-muted-foreground hover:border-primary/30 hover:text-foreground'
                }`}
              >
                <span className="text-lg font-medium">{t('全部人物', 'All people')}</span>
                <span className="mt-1 text-lg">{t(`${allNotes.length} 篇`, `${allNotes.length} articles`)}</span>
              </button>
              {people.map((person) => {
                const selected = personSlug === person.slug;
                const articleCount = allNotes.filter((note) => note.authorSlugs.includes(person.slug)).length;
                return (
                  <button
                    key={person.slug}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => onPersonChange(selected ? '' : person.slug)}
                    className={`grid min-h-20 w-48 grid-cols-[3.25rem_1fr] items-center gap-3 rounded-lg border px-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                      selected
                        ? 'border-primary/45 bg-primary/[0.08] text-primary'
                        : 'border-border bg-card/45 text-foreground hover:border-primary/30'
                    }`}
                  >
                    <img
                      src={person.avatar}
                      alt=""
                      className="size-13 rounded-full bg-secondary object-cover"
                    />
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium">{pickLocalized(person.name, lang)}</span>
                      <span className="mt-1 block truncate text-xs text-muted-foreground">
                        {pickLocalized(person.identityLabel, lang)} {t(`${articleCount} 篇`, `${articleCount}`)}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="topics"
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -4 }}
            className="grid gap-3 py-7 md:grid-cols-[1.08fr_0.96fr_0.96fr]"
            role="group"
            aria-label={t('题材筛选', 'Topic filters')}
          >
            {topics.map((topic) => {
              const selected = topicSlug === topic.slug;
              const articleCount = allNotes.filter((note) => note.topicSlugs.includes(topic.slug)).length;
              return (
                <button
                  key={topic.slug}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => onTopicChange(selected ? '' : topic.slug)}
                  className={`min-h-32 rounded-lg border p-5 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                    selected
                      ? 'border-primary/45 bg-primary/[0.08] text-primary'
                      : 'border-border bg-card/45 text-foreground hover:border-primary/30'
                  }`}
                >
                  <span className="block font-serif text-xl">{pickLocalized(topic.shortName, lang)}</span>
                  <span className="mt-3 block text-sm leading-6 text-muted-foreground">
                    {pickLocalized(topic.description, lang)}
                  </span>
                  <span className="mt-4 block text-xs text-primary/70">
                    {t(`${articleCount} 篇文章`, `${articleCount} articles`)}
                  </span>
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex min-h-12 items-center justify-between gap-4 border-b border-border pb-4" aria-live="polite">
        <p className="text-sm text-muted-foreground">
          {isLoading ? t('正在整理文章', 'Gathering articles') : t(`找到 ${notes.length} 篇文章`, `${notes.length} articles found`)}
        </p>
        {hasFilters ? (
          <button
            type="button"
            onClick={onClear}
            className="min-h-11 text-sm text-primary transition hover:text-primary/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {t('清除筛选', 'Clear filters')}
          </button>
        ) : null}
      </div>

      {hasError ? (
        <div className="py-20 text-center" role="alert">
          <h3 className="font-serif text-2xl text-foreground">{t('文章暂时没有加载出来', 'The articles could not be loaded')}</h3>
          <p className="mx-auto mt-4 max-w-md text-lg leading-8 text-muted-foreground">
            {t('请稍后再试。你的搜索与筛选条件会保留。', 'Please try again. Your search and filters will be preserved.')}
          </p>
          <button
            type="button"
            onClick={onRetry}
            className="mt-6 min-h-11 rounded-lg border border-primary/35 px-5 text-lg font-medium text-primary transition hover:bg-primary/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {t('重新加载', 'Try again')}
          </button>
        </div>
      ) : isLoading ? (
        <ExplorerSkeleton />
      ) : notes.length ? (
        <div className={compact ? 'divide-y divide-border/80' : 'divide-y divide-border/80'}>
          {notes.map((note, index) => (
            <FieldNoteCard key={note.slug} note={note} index={index} />
          ))}
        </div>
      ) : (
        <div className="py-20 text-center">
          <h3 className="font-serif text-2xl text-foreground">
            {hasFilters ? t('暂时没有匹配的文章', 'No matching articles yet') : t('还没有正式发布的文章', 'No stories have been published yet')}
          </h3>
          <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-muted-foreground">
            {hasFilters
              ? t('换一个人物、题材或关键词，再看看这片档案。', 'Try another person, topic, or keyword to explore the archive again.')
              : t('真实投稿经过审核并公开发布后，会出现在这里。', 'Real submissions will appear here after review and public publication.')}
          </p>
          {hasFilters ? (
            <button
              type="button"
              onClick={onClear}
              className="mt-6 min-h-11 rounded-lg border border-primary/35 px-5 text-sm font-medium text-primary transition hover:bg-primary/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {t('查看全部文章', 'View all articles')}
            </button>
          ) : null}
        </div>
      )}
    </div>
  );
}

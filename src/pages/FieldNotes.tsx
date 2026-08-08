import { useQuery } from '@tanstack/react-query';
import { useDeferredValue } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { FieldNoteCard } from '@/components/field-notes/FieldNoteCard';
import {
  FieldNoteExplorer,
  type ExplorerDimension,
} from '@/components/field-notes/FieldNoteExplorer';
import { useLanguage } from '@/contexts/LanguageContext';
import { localFieldNotesRepository } from '@/services/field-notes/publicRepository';

export default function FieldNotes() {
  const { lang, t } = useLanguage();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const isAll = location.pathname === '/field-notes/all';
  const dimension: ExplorerDimension = searchParams.get('browse') === 'topics' ? 'topics' : 'people';
  const search = searchParams.get('q') ?? '';
  const deferredSearch = useDeferredValue(search);
  const personSlug = searchParams.get('person') ?? '';
  const topicSlug = searchParams.get('topic') ?? '';

  const featuredQuery = useQuery({
    queryKey: ['field-notes', 'featured', lang],
    queryFn: () => localFieldNotesRepository.listPublishedNotes({ language: lang, featuredOnly: true }),
    enabled: !isAll,
  });
  const notesQuery = useQuery({
    queryKey: ['field-notes', 'public', lang, deferredSearch, personSlug, topicSlug],
    queryFn: () => localFieldNotesRepository.listPublishedNotes({
      language: lang,
      search: deferredSearch,
      personSlug: personSlug || undefined,
      topicSlug: topicSlug || undefined,
    }),
  });
  const allNotesQuery = useQuery({
    queryKey: ['field-notes', 'counts', lang],
    queryFn: () => localFieldNotesRepository.listPublishedNotes({ language: lang }),
  });
  const peopleQuery = useQuery({
    queryKey: ['field-notes', 'people'],
    queryFn: () => localFieldNotesRepository.listPublicPeople(),
  });
  const topicsQuery = useQuery({
    queryKey: ['field-notes', 'topics'],
    queryFn: () => localFieldNotesRepository.listActiveTopics(),
  });

  const updateParams = (changes: Record<string, string | null>) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(changes).forEach(([key, value]) => {
      if (value) next.set(key, value);
      else next.delete(key);
    });
    setSearchParams(next, { replace: true });
  };

  const clearFilters = () => {
    const next = new URLSearchParams();
    if (dimension === 'topics') next.set('browse', 'topics');
    setSearchParams(next, { replace: true });
  };

  const featured = featuredQuery.data ?? [];
  const notes = notesQuery.data ?? [];
  const allNotes = allNotesQuery.data ?? [];
  const people = peopleQuery.data ?? [];
  const topics = topicsQuery.data ?? [];

  return (
    <div className="field-notes-page pt-20">
      <header className="border-b border-border/80 pb-12 pt-14 sm:pb-16 sm:pt-20 md:pb-20 md:pt-24">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-end">
            <div className="max-w-4xl">
              <h1 className="text-balance font-serif text-5xl leading-[1.08] text-foreground sm:text-6xl lg:text-7xl">
                {isAll ? t('全部文章', 'All Field Notes') : t('田野笔记', 'Field Notes')}
              </h1>
              <p className="mt-7 max-w-2xl text-base leading-8 text-muted-foreground md:text-lg md:leading-9">
                {isAll
                  ? t('从人物、题材与关键词进入正在生长的共同经验。', 'Explore a growing shared record through people, topics, and keywords.')
                  : t('把生活、共创与研究中仍值得追问的时刻，留在这里。', 'A place for moments in life, co-creation, and research that still deserve questions.')}
              </p>
            </div>
            <div className="border-l border-primary/30 pl-6">
              <p className="font-serif text-xl leading-8 text-foreground">
                {t('经验先发生，理解随后慢慢长出来。', 'Experience happens first. Understanding grows afterward.')}
              </p>
            </div>
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-border/75 pt-5">
            <p className="max-w-3xl text-xs leading-6 text-muted-foreground">
              {t(
                '当前为接入前的内容样稿。后台接入后，这里只展示审核通过并公开发布的真实文章。',
                'This is a pre-integration content preview. After connection, only reviewed and publicly published articles will appear here.',
              )}
            </p>
            <nav className="flex gap-5 text-sm" aria-label={t('田野笔记栏目', 'Field Notes sections')}>
              <Link
                to="/field-notes"
                aria-current={!isAll ? 'page' : undefined}
                className={!isAll ? 'font-medium text-primary' : 'text-muted-foreground transition hover:text-foreground'}
              >
                {t('精选文章', 'Featured')}
              </Link>
              <Link
                to="/field-notes/all"
                aria-current={isAll ? 'page' : undefined}
                className={isAll ? 'font-medium text-primary' : 'text-muted-foreground transition hover:text-foreground'}
              >
                {t('全部文章', 'All articles')}
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {!isAll ? (
        <section className="py-16 md:py-24" aria-labelledby="featured-field-notes">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-10 flex items-end justify-between gap-6">
              <h2 id="featured-field-notes" className="font-serif text-3xl text-foreground md:text-4xl">
                {t('本期精选', 'Featured this time')}
              </h2>
              <Link
                to="/field-notes/all"
                className="hidden min-h-11 items-center gap-2 text-sm font-medium text-primary transition hover:text-primary/70 sm:inline-flex"
              >
                {t('浏览全部', 'Browse all')}
                <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </Link>
            </div>

            {featuredQuery.isPending ? (
              <div className="grid animate-pulse gap-12 lg:grid-cols-[minmax(0,1.35fr)_minmax(20rem,0.65fr)]">
                <div>
                  <div className="aspect-[16/10] rounded-lg bg-secondary" />
                  <div className="mt-7 h-10 w-4/5 rounded bg-secondary" />
                </div>
                <div className="space-y-12">
                  <div className="h-52 rounded-lg bg-secondary" />
                  <div className="h-52 rounded-lg bg-secondary" />
                </div>
              </div>
            ) : featured.length ? (
              <div className="grid gap-14 lg:grid-cols-[minmax(0,1.35fr)_minmax(20rem,0.65fr)] lg:gap-12">
                <FieldNoteCard note={featured[0]} variant="lead" />
                <div className="space-y-10 lg:pt-2">
                  {featured.slice(1).map((note, index) => (
                    <FieldNoteCard key={note.slug} note={note} variant="side" index={index + 1} />
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      <section
        className={`${isAll ? 'py-14 md:py-20' : 'border-t border-border/80 bg-card/25 py-16 md:py-24'}`}
        aria-labelledby="field-note-archive"
      >
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 max-w-2xl">
            <h2 id="field-note-archive" className="font-serif text-3xl text-foreground md:text-4xl">
              {isAll ? t('文章档案', 'Article archive') : t('沿着人物与题材继续', 'Continue through people and topics')}
            </h2>
          </div>
          <FieldNoteExplorer
            notes={notes}
            allNotes={allNotes}
            people={people}
            topics={topics}
            dimension={dimension}
            search={search}
            personSlug={personSlug}
            topicSlug={topicSlug}
            isLoading={notesQuery.isPending || allNotesQuery.isPending || peopleQuery.isPending || topicsQuery.isPending}
            hasError={notesQuery.isError || allNotesQuery.isError || peopleQuery.isError || topicsQuery.isError}
            compact={isAll}
            onDimensionChange={(nextDimension) => updateParams({
              browse: nextDimension === 'topics' ? 'topics' : null,
              person: null,
              topic: null,
            })}
            onSearchChange={(nextSearch) => updateParams({ q: nextSearch || null })}
            onPersonChange={(slug) => updateParams({ person: slug || null, topic: null })}
            onTopicChange={(slug) => updateParams({ topic: slug || null, person: null })}
            onClear={clearFilters}
            onRetry={() => {
              void Promise.all([
                notesQuery.refetch(),
                allNotesQuery.refetch(),
                peopleQuery.refetch(),
                topicsQuery.refetch(),
              ]);
            }}
          />
        </div>
      </section>
    </div>
  );
}

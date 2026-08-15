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
import {
  fieldNotesRepository,
  filterPublishedNotes,
  peopleFromPublishedNotes,
  topicsFromPublishedNotes,
} from '@/services/field-notes/publicRepository';

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

  const allNotesQuery = useQuery({
    queryKey: ['field-notes', 'public', lang],
    queryFn: () => fieldNotesRepository.listPublishedNotes({ language: lang }),
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

  const allNotes = allNotesQuery.data ?? [];
  const featured = filterPublishedNotes(allNotes, { language: lang, featuredOnly: true });
  const notes = filterPublishedNotes(allNotes, {
    language: lang,
    search: deferredSearch,
    personSlug: personSlug || undefined,
    topicSlug: topicSlug || undefined,
  });
  const people = peopleFromPublishedNotes(allNotes);
  const topics = topicsFromPublishedNotes(allNotes);

  return (
    <div className="field-notes-page pt-20">
      <header className="border-b border-border/80 pb-12 pt-14 sm:pb-16 sm:pt-20 md:pb-20 md:pt-24">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-end">
            <div className="max-w-4xl">
              <h1 className="text-balance font-serif text-5xl leading-[1.08] text-[#ea6a2a] sm:text-6xl lg:text-7xl">
                {isAll ? t('全部文章', 'All Field Notes') : t('田野笔记', 'Field Notes')}
              </h1>
              <p className="mt-7 max-w-2xl text-base leading-8 text-muted-foreground md:text-lg md:leading-9">
                {isAll
                  ? t('从人物、题材与关键词进入正在生长的共同经验。', 'Explore a growing shared record through people, topics, and keywords.')
                  : t('把生活、共创与研究中仍值得追问的时刻，留在这里。', 'A place for moments in life, co-creation, and research that still deserve questions.')}
              </p>
            </div>
            <div className="border-l border-primary/30 pl-6">
              <p className="font-serif text-lg leading-8 text-foreground lg:whitespace-nowrap">
                {t('经验先发生，理解随后慢慢长出来。', 'Experience happens first. Understanding grows afterward.')}
              </p>
            </div>
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-border/75 pt-5">
            <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
              {t(
                '这里只展示作者真实提交、经过审核并正式公开的社群文章。',
                'Only real community stories submitted by their authors, reviewed, and published for everyone appear here.',
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
              <h2 id="featured-field-notes" className="font-serif text-3xl text-[#ea6a2a] md:text-4xl">
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

            {allNotesQuery.isPending ? (
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
            ) : allNotesQuery.isError ? (
              <div className="rounded-lg border border-border bg-card/50 px-6 py-12 text-center" role="alert">
                <p className="font-serif text-2xl text-foreground">{t('精选文章暂时没有加载出来', 'Featured stories could not be loaded')}</p>
                <button type="button" className="mt-5 min-h-11 text-sm font-medium text-primary" onClick={() => void allNotesQuery.refetch()}>{t('重新加载', 'Try again')}</button>
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
            ) : (
              <div className="rounded-lg border border-dashed border-border bg-card/40 px-6 py-12 text-center">
                <h3 className="font-serif text-2xl text-foreground">{t('本期精选正在准备中', 'The next featured selection is being prepared')}</h3>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">{t('管理员精选真实发布文章后，它们会出现在这里。', 'Real published stories will appear here after an editor features them.')}</p>
              </div>
            )}
          </div>
        </section>
      ) : null}

      <section
        className={`${isAll ? 'py-14 md:py-20' : 'border-t border-border/80 bg-card/25 py-16 md:py-24'}`}
        aria-labelledby="field-note-archive"
      >
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 max-w-2xl">
            <h2 id="field-note-archive" className="font-serif text-3xl text-[#ea6a2a] md:text-4xl">
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
            isLoading={allNotesQuery.isPending}
            hasError={allNotesQuery.isError}
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
            onRetry={() => void allNotesQuery.refetch()}
          />
        </div>
      </section>
    </div>
  );
}

import { useQuery } from '@tanstack/react-query';
import { useDeferredValue } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FieldNoteExplorer, type ExplorerDimension } from '@/components/field-notes/FieldNoteExplorer';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  fieldNotesRepository,
  filterPublishedNotes,
  peopleFromPublishedNotes,
  topicsFromPublishedNotes,
} from '@/services/field-notes/publicRepository';

export default function FieldNotes() {
  const { lang, t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
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
      <header className="container mx-auto max-w-7xl px-4 pb-8 pt-10 sm:px-6 sm:pb-10 sm:pt-14 lg:px-8">
        <h1 className="text-balance font-serif text-5xl leading-tight text-[#ea6a2a] sm:text-6xl">
          {t('社区故事', 'Community Stories')}
        </h1>
      </header>

      <section className="border-t border-border/80 py-14 md:py-20" aria-labelledby="field-note-archive">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 max-w-2xl">
            <h2 id="field-note-archive" className="font-serif text-3xl text-[#ea6a2a] md:text-4xl">
              {t('文章档案', 'Article archive')}
            </h2>
          </div>
          <FieldNoteExplorer
            notes={notes}
            allNotes={allNotes}
            dimension={dimension}
            compact
            people={people}
            topics={topics}
            search={search}
            personSlug={personSlug}
            topicSlug={topicSlug}
            isLoading={allNotesQuery.isPending}
            hasError={allNotesQuery.isError}
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

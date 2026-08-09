import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowUpRight, BookOpenText, ChevronDown, Newspaper, Search, Sparkles, Tag } from 'lucide-react';
import { Link } from 'react-router-dom';

import villageIllustration from '@/assets/village-illustration.webp';
import {
  CommunityEmptyState,
  CommunityErrorState,
  CommunityLoadingState,
  CommunitySurface,
  communitySecondaryButtonClass,
} from '@/components/community/CommunitySurface';
import { useCommunityUi } from '@/lib/communityUi';
import { getSupabaseClient } from '@/lib/supabase/client';
import {
  listArticleCategories,
  listCommunitySquareFieldNotes,
  type CommunitySquareFieldNote,
} from '@/services/field-notes';

function noteTags(note: CommunitySquareFieldNote) {
  return note.field_note_topics
    .map((relation) => relation.topics)
    .filter((topic): topic is NonNullable<typeof topic> => Boolean(topic));
}

function noteAuthor(note: CommunitySquareFieldNote) {
  const person = [...note.field_note_authors]
    .sort((left, right) => left.author_order - right.author_order)
    .find((relation) => relation.people)?.people;
  return person?.nature_name || person?.display_name || person?.name_zh || person?.name_en || null;
}

function noteCover(note: CommunitySquareFieldNote) {
  const asset = note.field_note_media.find((relation) => relation.usage_role === 'cover')?.media_assets;
  if (!asset || asset.storage_bucket !== 'public-media') return villageIllustration;
  return getSupabaseClient().storage.from(asset.storage_bucket).getPublicUrl(asset.storage_path).data.publicUrl;
}

export default function CommunityStorySquare() {
  const { lang, t, formatDate } = useCommunityUi();
  const [notes, setNotes] = useState<Awaited<ReturnType<typeof listCommunitySquareFieldNotes>>>([]);
  const [categories, setCategories] = useState<Awaited<ReturnType<typeof listArticleCategories>>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [categoryId, setCategoryId] = useState('all');
  const [tagId, setTagId] = useState('all');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [nextNotes, nextCategories] = await Promise.all([
        listCommunitySquareFieldNotes(),
        listArticleCategories(),
      ]);
      setNotes(nextNotes);
      setCategories(nextCategories);
    } catch (readError) {
      setError(readError instanceof Error ? readError.message : t('文章广场暂时无法打开。', 'The story square is temporarily unavailable.'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => { void load(); }, [load]);

  const visibleTags = useMemo(() => {
    const unique = new Map<number, ReturnType<typeof noteTags>[number]>();
    notes.forEach((note) => noteTags(note).forEach((tag) => unique.set(tag.id, tag)));
    return [...unique.values()].sort((left, right) => left.name_zh.localeCompare(right.name_zh, 'zh-CN'));
  }, [notes]);

  const filteredNotes = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase();
    return notes.filter((note) => {
      if (categoryId !== 'all' && note.category_id !== Number(categoryId)) return false;
      if (tagId !== 'all' && !note.field_note_topics.some((relation) => relation.topic_id === Number(tagId))) return false;
      if (!normalized) return true;
      const text = [
        note.title,
        note.excerpt || '',
        note.article_categories?.name_zh || '',
        note.article_categories?.name_en || '',
        noteAuthor(note) || '',
        ...noteTags(note).flatMap((tag) => [tag.name_zh, tag.name_en || '']),
      ].join(' ').toLocaleLowerCase();
      return text.includes(normalized);
    });
  }, [categoryId, notes, query, tagId]);

  const featured = filteredNotes[0];
  const feed = filteredNotes.slice(1);
  const categoryLabel = (note: CommunitySquareFieldNote) => note.article_categories
    ? (lang === 'zh' ? note.article_categories.name_zh : (note.article_categories.name_en || note.article_categories.name_zh))
    : t('社群文章', 'Community story');

  return (
    <CommunitySurface
      eyebrow="Story square"
      title={t('从彼此的故事里，看见更多可能。', 'Discover what becomes possible through each other’s stories.')}
      description={t('这里收集社群成员愿意公开分享的观察、行动与成长。', 'A living collection of observations, action, and growth shared publicly by community members.')}
      width="wide"
      action={<Link to="/community/stories" className={`${communitySecondaryButtonClass} gap-2`}><BookOpenText className="size-4" />{t('管理我的文章', 'My stories')}</Link>}
    >
      {loading ? <CommunityLoadingState label={t('正在铺开文章广场…', 'Opening the story square…')} variant="cards" /> : null}
      {!loading && error ? <CommunityErrorState message={error} onRetry={() => void load()} /> : null}
      {!loading && !error ? (
        <div className="community-story-square">
          <section className="community-square-intro" aria-labelledby="community-square-intro-title">
            <div>
              <p><Sparkles className="size-4" />{t('公开的社群记忆', 'A public community memory')}</p>
              <h2 id="community-square-intro-title">{t('大家最近在写什么？', 'What is the community writing now?')}</h2>
            </div>
            <span>{t(`${notes.length} 篇公开文章`, `${notes.length} public ${notes.length === 1 ? 'story' : 'stories'}`)}</span>
          </section>

          <section className="community-square-filters" aria-label={t('筛选广场文章', 'Filter square stories')}>
            <div className="community-square-categories" role="group" aria-label={t('按分类查看', 'Browse by category')}>
              <button type="button" className={categoryId === 'all' ? 'is-active' : ''} onClick={() => setCategoryId('all')}>{t('全部', 'All')}</button>
              {categories.map((category) => (
                <button type="button" className={categoryId === String(category.id) ? 'is-active' : ''} key={category.id} onClick={() => setCategoryId(String(category.id))}>
                  {lang === 'zh' ? category.name_zh : (category.name_en || category.name_zh)}
                </button>
              ))}
            </div>
            <div className="community-square-filter-row">
              <label className="community-story-search">
                <Search className="size-4" aria-hidden="true" />
                <span className="sr-only">{t('搜索广场文章', 'Search square stories')}</span>
                <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t('搜索故事、作者或标签', 'Search story, author, or tag')} />
              </label>
              <label className="community-story-select">
                <Tag className="size-4" aria-hidden="true" />
                <span className="sr-only">{t('按标签筛选', 'Filter by tag')}</span>
                <select value={tagId} onChange={(event) => setTagId(event.target.value)}>
                  <option value="all">{t('全部标签', 'All tags')}</option>
                  {visibleTags.map((tag) => <option value={tag.id} key={tag.id}>{lang === 'zh' ? tag.name_zh : (tag.name_en || tag.name_zh)}</option>)}
                </select>
                <ChevronDown className="size-3.5" aria-hidden="true" />
              </label>
            </div>
          </section>

          {featured ? (
            <>
              <article className="community-square-feature">
                <Link to={`/field-notes/${featured.slug}`} className="community-square-feature__image">
                  <img src={noteCover(featured)} alt="" />
                  <span>{categoryLabel(featured)}</span>
                </Link>
                <div className="community-square-feature__copy">
                  <p className="community-eyebrow">{t('最近发布', 'Latest story')}</p>
                  <h2><Link to={`/field-notes/${featured.slug}`}>{featured.title}</Link></h2>
                  <p>{featured.excerpt || t('一段来自社群现场的真实记录。', 'A real account from within the community.')}</p>
                  <div className="community-square-story-meta">
                    <span>{noteAuthor(featured) || t('社群作者', 'Community author')}</span>
                    <time>{formatDate(featured.published_at || featured.updated_at)}</time>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {noteTags(featured).slice(0, 4).map((tag) => <span className="community-story-tag" key={tag.id}>{lang === 'zh' ? tag.name_zh : (tag.name_en || tag.name_zh)}</span>)}
                  </div>
                  <Link to={`/field-notes/${featured.slug}`} className="community-square-read-link">{t('阅读这篇文章', 'Read this story')}<ArrowUpRight className="size-4" /></Link>
                </div>
              </article>

              {feed.length ? (
                <section className="community-square-feed" aria-labelledby="community-square-feed-title">
                  <div className="community-square-feed__heading">
                    <h2 id="community-square-feed-title">{t('更多公开文章', 'More public stories')}</h2>
                    <span>{feed.length}</span>
                  </div>
                  <div className="community-square-feed__list">
                    {feed.map((note, index) => (
                      <article className={`community-square-story ${index % 3 === 0 ? 'is-wide' : ''}`} key={note.id}>
                        <Link to={`/field-notes/${note.slug}`} className="community-square-story__image"><img src={noteCover(note)} alt="" /></Link>
                        <div className="community-square-story__copy">
                          <div className="community-square-story__kicker"><span>{String(index + 2).padStart(2, '0')}</span><span>{categoryLabel(note)}</span></div>
                          <h3><Link to={`/field-notes/${note.slug}`}>{note.title}</Link></h3>
                          <p>{note.excerpt || t('一段来自社群现场的真实记录。', 'A real account from within the community.')}</p>
                          <div className="community-square-story-meta"><span>{noteAuthor(note) || t('社群作者', 'Community author')}</span><time>{formatDate(note.published_at || note.updated_at)}</time></div>
                          <div className="flex flex-wrap gap-1.5">{noteTags(note).slice(0, 3).map((tag) => <span className="community-story-tag" key={tag.id}>{lang === 'zh' ? tag.name_zh : (tag.name_en || tag.name_zh)}</span>)}</div>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              ) : null}
            </>
          ) : (
            <CommunityEmptyState
              title={notes.length ? t('没有符合条件的文章', 'No matching stories') : t('广场正在等待第一篇文章', 'The square is waiting for its first story')}
              description={notes.length ? t('换一个分类、标签或关键词试试。', 'Try another category, tag, or keyword.') : t('当社群成员发布公开文章后，它会出现在这里。', 'Public stories will appear here when community members publish them.')}
            />
          )}
        </div>
      ) : null}
    </CommunitySurface>
  );
}

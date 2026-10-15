import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CommunityErrorState, CommunityLoadingState, communityInputClass } from '@/components/community/CommunitySurface';
import { useCommunityUi } from '@/lib/communityUi';
import {
  importAuthorArticle, linkPendingArticleAuthor, listArticleAuthors,
  type ArticleAuthor, type EditorialFieldNote, type ImportableArticle,
} from '@/services/field-notes';

function authorLabel(author: ArticleAuthor) {
  return [author.display_name, author.nature_name, author.username ? `@${author.username}` : author.slug]
    .filter(Boolean).join(' · ');
}

export default function ArticleAuthorManager({ notes, onChanged }: {
  notes: EditorialFieldNote[];
  onChanged: () => Promise<void>;
}) {
  const { t } = useCommunityUi();
  const [open, setOpen] = useState(false);
  const [articles, setArticles] = useState<ImportableArticle[]>([]);
  const [authors, setAuthors] = useState<ArticleAuthor[]>([]);
  const [selected, setSelected] = useState<Record<string, string>>({});
  const [sourceId, setSourceId] = useState('');
  const [targetId, setTargetId] = useState('');
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    if (!open) return;
    let active = true;
    setLoading(true);
    setError(null);
    Promise.all([listArticleAuthors(), import('@/content/article-imports/catalog.json')])
      .then(([people, catalog]) => {
        if (!active) return;
        setAuthors(people);
        setArticles(catalog.default);
      })
      .catch((readError) => {
        if (active) setError(readError instanceof Error ? readError.message : t('无法读取作者档案。', 'Could not load author records.'));
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [open, retry, t]);

  const run = async (key: string, action: () => Promise<string>) => {
    if (busy) return;
    setBusy(key);
    setError(null);
    setNotice(null);
    try {
      const message = await action();
      setNotice(message);
      setAuthors(await listArticleAuthors());
      await onChanged();
    } catch (mutationError) {
      setError(mutationError instanceof Error ? mutationError.message : t('操作失败，请重试。', 'The action failed. Try again.'));
    } finally {
      setBusy(null);
    }
  };

  const bySlug = new Map(notes.map((note) => [note.slug, note]));
  const relatedPeople = new Set(notes.flatMap((note) => note.field_note_authors.flatMap((row) => row.people ? [row.people.id] : [])));
  const pendingAuthors = authors.filter((author) => !author.has_account && relatedPeople.has(author.person_id));
  const accounts = authors.filter((author) => author.has_account);
  const associatedCount = notes.filter((note) => note.field_note_authors.some((row) => row.people?.id === Number(sourceId))).length;

  return <>
    <button type="button" className="community-button community-button--secondary min-h-11" onClick={() => setOpen(true)}>
      {t('导入文章与关联帐号', "Import articles and link accounts")}
    </button>
    <Dialog open={open} onOpenChange={(next) => { if (!busy) setOpen(next); }}>
      <DialogContent className="max-h-[90dvh] max-w-4xl overflow-y-auto bg-[hsl(var(--community-paper))] p-6 sm:p-8">
        <DialogHeader className="pr-6 text-left">
          <DialogTitle className="text-balance font-serif text-2xl">{t('文章与真实作者', "Articles and their authors")}</DialogTitle>
          <DialogDescription className="text-pretty leading-6">{t('已有帐号的作者请选择对应帐号。尚未注册的作者先保留档案，注册后核实身份并关联，文章会出现在作者的“我的文章”中。', "Select the correct account for registered authors. Keep a record for authors who have not registered, then verify and link their account so their articles appear in My articles.")}</DialogDescription>
        </DialogHeader>
        {loading ? <CommunityLoadingState label={t('正在读取文章与作者…', "Loading articles and authors…")} /> : null}
        {error ? <CommunityErrorState message={error} onRetry={() => setRetry((value) => value + 1)} /> : null}
        {notice ? <p role="status" className="text-sm leading-6">{notice}</p> : null}
        {!loading && articles.length > 0 ? <div className="space-y-8">
          <section aria-label={t('导入原文', 'Import original stories')} className="divide-y divide-border">
            {articles.map((article) => {
              const imported = bySlug.get(article.slug);
              const candidates = article.requiresAccount ? accounts : authors;
              return <article key={article.slug} className="space-y-3 py-5">
                <h3 className="text-balance font-serif text-lg">{article.title}</h3>
                <p className="text-sm text-muted-foreground">{t('原文作者：', 'Original author: ')}{article.authorName}</p>
                {imported ? <Link className="community-button community-button--secondary min-h-10" to={`/community/stories/${imported.id}/edit`} onClick={() => setOpen(false)}>{t('已导入 · 打开文章', "Imported · Open article")}</Link> : <div className="flex flex-col gap-3 sm:flex-row">
                  <label className="min-w-0 flex-1">
                    <span className="sr-only">{t('关联作者：', 'Link author: ')}{article.title}</span>
                    <select className={communityInputClass} disabled={Boolean(busy)} value={selected[article.slug] || ''} onChange={(event) => setSelected((current) => ({ ...current, [article.slug]: event.target.value }))}>
                      <option value="">{article.requiresAccount ? t('请选择作者现有帐号', 'Select the existing author account') : t('作者尚未注册 · 保留作者档案', 'Not registered · Keep author record')}</option>
                      {candidates.map((author) => <option key={author.person_id} value={author.person_id}>{authorLabel(author)} · {author.has_account ? t('已有帐号', 'Registered') : t('待注册', 'Not registered')}</option>)}
                    </select>
                  </label>
                  <button type="button" className="community-button community-button--primary min-h-11" disabled={Boolean(busy) || (article.requiresAccount && !selected[article.slug])} onClick={() => void run(article.slug, async () => {
                    await importAuthorArticle(article, selected[article.slug] ? Number(selected[article.slug]) : undefined);
                    return t('已导入为草稿，可在审核台整理并提交审核。', 'Imported as a draft. Edit and submit it from the editorial desk.');
                  })}>{busy === article.slug ? t('正在导入…', 'Importing…') : t('导入为草稿', 'Import draft')}</button>
                </div>}
              </article>;
            })}
          </section>
          <section className="space-y-4 border-t border-border pt-6" aria-label={t('注册后关联作者', 'Link an author after registration')}>
            <h3 className="text-balance font-serif text-xl">{t('作者注册后，关联已有文章', "Link existing articles after registration")}</h3>
            {pendingAuthors.length ? <>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="space-y-2 text-sm"><span>{t('待注册作者档案', 'Unregistered author record')}</span><select className={communityInputClass} disabled={Boolean(busy)} value={sourceId} onChange={(event) => setSourceId(event.target.value)}><option value="">{t('选择作者', 'Select author')}</option>{pendingAuthors.map((author) => <option key={author.person_id} value={author.person_id}>{authorLabel(author)}</option>)}</select></label>
                <label className="space-y-2 text-sm"><span>{t('作者已注册的帐号', 'The author’s registered account')}</span><select className={communityInputClass} disabled={Boolean(busy)} value={targetId} onChange={(event) => setTargetId(event.target.value)}><option value="">{t('选择已核实的帐号', 'Select the verified account')}</option>{accounts.map((author) => <option key={author.person_id} value={author.person_id}>{authorLabel(author)}</option>)}</select></label>
              </div>
              {sourceId && targetId ? <p className="text-pretty text-sm leading-6">{t(`关联后，该作者的 ${associatedCount} 篇文章会显示在所选帐号的“我的文章”中。请核对上方作者与帐号。`, `After linking, ${associatedCount} articles will appear in the selected account’s My articles. Verify the author and account above.`)}</p> : null}
              <button type="button" className="community-button community-button--primary min-h-11" disabled={Boolean(busy) || !sourceId || !targetId || !associatedCount} onClick={() => void run('link', async () => {
                const count = await linkPendingArticleAuthor(Number(sourceId), Number(targetId));
                setSourceId(''); setTargetId('');
                return t(`已关联 ${count} 篇文章，作者登录后可在“我的文章”中查看。`, `Linked ${count} articles. The author can find them in My articles after signing in.`);
              })}>{busy === 'link' ? t('正在关联…', 'Linking…') : t('确认关联这些文章', "Link these articles")}</button>
            </> : <p className="text-sm text-muted-foreground">{t('当前文章没有等待关联帐号的作者。', "No article authors are waiting to link an account.")}</p>}
          </section>
        </div> : null}
      </DialogContent>
    </Dialog>
  </>;
}

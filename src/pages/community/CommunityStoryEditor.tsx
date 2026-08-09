import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import type { BlockNoteEditor } from '@blocknote/core';
import {
  ArrowLeft,
  Check,
  Cloud,
  CloudOff,
  History,
  Loader2,
  LockKeyhole,
  Save,
  Send,
  Sparkles,
} from 'lucide-react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';

import { CommunityErrorState, CommunityLoadingState } from '@/components/community/CommunitySurface';
import StoryCollaborationPanel from '@/components/community/editor/StoryCollaborationPanel';
import StoryPublishingSettings from '@/components/community/editor/StoryPublishingSettings';
import { useAuth } from '@/contexts/AuthContext';
import type { FieldNoteSaveState } from '@/lib/field-note-document/types';
import { useCommunityUi } from '@/lib/communityUi';
import {
  checkpointFieldNote,
  getFieldNoteEditorBundle,
  type FieldNoteEditorBundle,
} from '@/services/field-note-editor';
import {
  createFieldNote,
  findOrCreateFieldNoteTag,
  getFieldNoteMetadata,
  listArticleCategories,
  listFieldNoteTags,
  saveFieldNoteMetadata,
  type FieldNoteMetadata,
} from '@/services/field-notes';

const CollaborativeStoryEditor = lazy(
  () => import('@/components/community/editor/CollaborativeStoryEditor'),
);

function slugForDraft() {
  return `story-${crypto.randomUUID().slice(0, 12)}`;
}

function saveStateCopy(state: FieldNoteSaveState, t: (zh: string, en: string) => string) {
  if (state === 'saving') return { label: t('正在保存', 'Saving'), icon: Loader2, spin: true };
  if (state === 'offline') return { label: t('离线，已保存在本机', 'Offline · saved on this device'), icon: CloudOff, spin: false };
  if (state === 'reconnecting' || state === 'connecting') return { label: t('正在连接', 'Connecting'), icon: Cloud, spin: true };
  if (state === 'failed') return { label: t('同步遇到问题', 'Sync needs attention'), icon: CloudOff, spin: false };
  return { label: t('所有更改已保存', 'All changes saved'), icon: Check, spin: false };
}

function editorErrorCopy(
  error: unknown,
  t: (zh: string, en: string) => string,
): string {
  const message = error instanceof Error ? error.message : '';
  if (
    message === 'FIELD_NOTE_EDITOR_API_UNAVAILABLE'
    || message === 'FIELD_NOTE_EDITOR_API_INVALID_RESPONSE'
  ) {
    return t(
      '编辑器 API 没有正常运行，请重启本地开发服务器。',
      'The editor API is not running correctly. Restart the local development server.',
    );
  }
  if (message === 'COMMUNITY_EDITOR_SERVER_NOT_CONFIGURED') {
    return t(
      '协作编辑器尚未配置服务器密钥，请完成本地服务器配置后重试。',
      'The collaborative editor is missing its server key. Complete the local server configuration and try again.',
    );
  }
  return message || t('文章编辑器暂时不可用。', 'The story editor is temporarily unavailable.');
}

export default function CommunityStoryEditor() {
  const { noteId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { session } = useAuth();
  const { t, status: statusLabel, formatDateTime } = useCommunityUi();
  const numericNoteId = noteId ? Number(noteId) : null;
  const existingId = numericNoteId && Number.isSafeInteger(numericNoteId) ? numericNoteId : null;
  const shareToken = searchParams.get('share')?.trim() || undefined;
  const accessToken = session?.access_token || '';
  const creatingRef = useRef(false);
  const editorRef = useRef<BlockNoteEditor | null>(null);
  const titleRef = useRef('');
  const excerptRef = useRef('');
  const dirtyVersionRef = useRef(0);
  const savedVersionRef = useRef(0);
  const autoSaveTimerRef = useRef<number | null>(null);
  const metadataRef = useRef<FieldNoteMetadata>({ categoryId: null, topicIds: [], visibility: 'private' });
  const metadataDirtyRef = useRef(false);

  const [bundle, setBundle] = useState<FieldNoteEditorBundle | null>(null);
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [metadata, setMetadata] = useState<FieldNoteMetadata>(metadataRef.current);
  const [categories, setCategories] = useState<Awaited<ReturnType<typeof listArticleCategories>>>([]);
  const [tags, setTags] = useState<Awaited<ReturnType<typeof listFieldNoteTags>>>([]);
  const [creatingTag, setCreatingTag] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<FieldNoteSaveState>('connecting');

  useEffect(() => {
    if (existingId || !accessToken || creatingRef.current) return;
    creatingRef.current = true;
    setLoading(true);
    createFieldNote({
      slug: slugForDraft(),
      title: t('未命名文章', 'Untitled story'),
      excerpt: '',
      content: '',
      status: 'draft',
      visibility: 'private',
      language: 'zh',
    })
      .then((created) => navigate(`/community/stories/${created.id}/edit`, { replace: true }))
      .catch((createError) => {
        setError(createError instanceof Error ? createError.message : t('无法创建文章。', 'Could not create the story.'));
        setLoading(false);
      });
  }, [accessToken, existingId, navigate, t]);

  const refreshBundle = useCallback(async () => {
    if (!existingId || !accessToken) return;
    const nextBundle = await getFieldNoteEditorBundle(existingId, accessToken, shareToken);
    setBundle(nextBundle);
    setTitle((current) => {
      const value = current || nextBundle.access.title;
      titleRef.current = value;
      return value;
    });
    setExcerpt((current) => {
      const value = current || nextBundle.access.excerpt;
      excerptRef.current = value;
      return value;
    });
  }, [accessToken, existingId, shareToken]);

  useEffect(() => {
    if (!existingId || !accessToken) return;
    let active = true;
    setLoading(true);
    setError(null);
    Promise.all([
      getFieldNoteEditorBundle(existingId, accessToken, shareToken),
      getFieldNoteMetadata(existingId),
      listArticleCategories(),
      listFieldNoteTags(),
    ])
      .then(([nextBundle, nextMetadata, nextCategories, nextTags]) => {
        if (!active) return;
        setBundle(nextBundle);
        setTitle(nextBundle.access.title);
        setExcerpt(nextBundle.access.excerpt);
        setMetadata(nextMetadata);
        setCategories(nextCategories);
        setTags(nextTags);
        metadataRef.current = nextMetadata;
        metadataDirtyRef.current = false;
        titleRef.current = nextBundle.access.title;
        excerptRef.current = nextBundle.access.excerpt;
      })
      .catch((readError) => {
        if (active) setError(editorErrorCopy(readError, t));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [accessToken, existingId, shareToken, t]);

  const markDirty = useCallback(() => {
    dirtyVersionRef.current += 1;
  }, []);

  const persist = useCallback(async (mode: 'automatic' | 'manual' | 'submit') => {
    if (!existingId || !accessToken || !bundle?.access.canWrite || !editorRef.current) return;
    const versionAtStart = dirtyVersionRef.current;
    if (mode === 'automatic' && versionAtStart === savedVersionRef.current) return;
    if (!titleRef.current.trim()) {
      if (mode !== 'automatic') setError(t('请先填写标题。', 'Add a title before saving.'));
      return;
    }
    if (mode === 'submit' && !metadataRef.current.categoryId) {
      setError(t('提交审核前，请先选择一个主分类。', 'Choose a primary category before submitting.'));
      return;
    }

    if (mode !== 'automatic' && autoSaveTimerRef.current) {
      window.clearTimeout(autoSaveTimerRef.current);
      autoSaveTimerRef.current = null;
    }

    if (mode !== 'automatic') setBusy(true);
    setSaveState('saving');
    if (mode !== 'automatic') {
      setError(null);
      setNotice(null);
    }
    try {
      if (bundle.access.isOwner && (metadataDirtyRef.current || mode === 'submit')) {
        await saveFieldNoteMetadata(existingId, metadataRef.current);
        metadataDirtyRef.current = false;
      }
      const result = await checkpointFieldNote({
        noteId: existingId,
        accessToken,
        shareToken,
        title: titleRef.current,
        excerpt: excerptRef.current,
        blocks: editorRef.current.document,
        automatic: mode === 'automatic',
        submit: mode === 'submit',
      });
      savedVersionRef.current = versionAtStart;
      setSaveState('saved');
      if (mode === 'submit') {
        setBundle((current) => current ? {
          ...current,
          access: { ...current.access, status: result.status, canWrite: false },
        } : current);
        setNotice(t('已提交审核，正文现在为只读状态。', 'Submitted for review. The document is now read-only.'));
      } else if (mode === 'manual') {
        setNotice(t('已创建一个可追溯的版本。', 'A restorable version was saved.'));
        await refreshBundle();
      }
    } catch (saveError) {
      setSaveState(navigator.onLine ? 'failed' : 'offline');
      if (mode !== 'automatic') {
        setError(editorErrorCopy(saveError, t));
      }
    } finally {
      if (mode !== 'automatic') setBusy(false);
    }
  }, [accessToken, bundle?.access.canWrite, bundle?.access.isOwner, existingId, refreshBundle, shareToken, t]);

  const scheduleAutoSave = useCallback(() => {
    markDirty();
    if (autoSaveTimerRef.current) window.clearTimeout(autoSaveTimerRef.current);
    autoSaveTimerRef.current = window.setTimeout(() => {
      void persist('automatic');
    }, 2_500);
  }, [markDirty, persist]);

  useEffect(() => () => {
    if (autoSaveTimerRef.current) window.clearTimeout(autoSaveTimerRef.current);
  }, []);

  useEffect(() => {
    const warnBeforeLeave = (event: BeforeUnloadEvent) => {
      if (dirtyVersionRef.current === savedVersionRef.current) return;
      event.preventDefault();
    };
    window.addEventListener('beforeunload', warnBeforeLeave);
    return () => window.removeEventListener('beforeunload', warnBeforeLeave);
  }, []);

  const handleTitleChange = (value: string) => {
    titleRef.current = value;
    setTitle(value);
    scheduleAutoSave();
  };
  const handleExcerptChange = (value: string) => {
    excerptRef.current = value;
    setExcerpt(value);
    scheduleAutoSave();
  };
  const handleMetadataChange = (nextMetadata: FieldNoteMetadata) => {
    metadataRef.current = nextMetadata;
    metadataDirtyRef.current = true;
    setMetadata(nextMetadata);
    scheduleAutoSave();
  };
  const handleCreateTag = async (name: string) => {
    if (creatingTag) return;
    setCreatingTag(true);
    setError(null);
    try {
      const tag = await findOrCreateFieldNoteTag(name);
      setTags((current) => current.some((item) => item.id === tag.id) ? current : [...current, tag]);
      handleMetadataChange({
        ...metadataRef.current,
        topicIds: metadataRef.current.topicIds.includes(tag.id)
          ? metadataRef.current.topicIds
          : [...metadataRef.current.topicIds, tag.id],
      });
    } catch (tagError) {
      setError(tagError instanceof Error ? tagError.message : t('无法新建标签。', 'Could not create the tag.'));
    } finally {
      setCreatingTag(false);
    }
  };
  const handleEditorReady = useCallback((editor: BlockNoteEditor) => {
    editorRef.current = editor;
  }, []);

  if (loading || (!existingId && !error)) {
    return <CommunityLoadingState label={t('正在准备协作空间…', 'Preparing the collaborative workspace…')} />;
  }
  if (error && !bundle) {
    return <CommunityErrorState message={error} onRetry={() => void refreshBundle()} />;
  }
  if (!bundle || !existingId) return null;

  const stateCopy = saveStateCopy(saveState, t);
  const SaveIcon = stateCopy.icon;
  const editable = bundle.access.canWrite;
  const canSubmit = bundle.access.isOwner && ['draft', 'changes_requested'].includes(bundle.access.status);
  const metadataEditable = editable && bundle.access.isOwner;

  return (
    <section className="community-story-editor" aria-label={t('文章协作编辑器', 'Collaborative story editor')}>
      <header className="community-story-editor__topbar">
        <div className="flex min-w-0 items-center gap-3">
          <Link to="/community/stories" className="community-icon-button" aria-label={t('返回文章列表', 'Back to stories')}>
            <ArrowLeft className="size-4" />
          </Link>
          <div className="min-w-0">
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-[hsl(var(--community-orange))]">Story workspace</p>
            <div className="mt-0.5 flex items-center gap-2 text-xs text-[hsl(var(--community-forest)/0.56)]">
              <span>{statusLabel(bundle.access.status)}</span>
              <span aria-hidden="true">·</span>
              <span className="inline-flex items-center gap-1.5"><SaveIcon className={`size-3.5 ${stateCopy.spin ? 'animate-spin' : ''}`} />{stateCopy.label}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <StoryCollaborationPanel noteId={existingId} accessToken={accessToken} bundle={bundle} onRefresh={refreshBundle} />
          {editable ? (
            <button type="button" className="community-button community-button--secondary hidden min-h-10 sm:inline-flex" disabled={busy} onClick={() => void persist('manual')}>
              {busy ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}{t('保存版本', 'Save version')}
            </button>
          ) : null}
          {canSubmit && editable ? (
            <button type="button" className="community-button community-button--primary min-h-10" disabled={busy || !title.trim() || !metadata.categoryId} onClick={() => void persist('submit')}>
              <Send className="size-4" />{t('提交审核', 'Submit')}
            </button>
          ) : null}
        </div>
      </header>

      {notice ? <div className="community-story-editor__notice" role="status"><Sparkles className="size-4" />{notice}</div> : null}
      {error ? <div className="px-3 pt-3 sm:px-5"><CommunityErrorState message={error} /></div> : null}

      <div className="community-story-editor__layout">
        <main className="community-story-editor__canvas">
          <input
            className="community-story-editor__title"
            value={title}
            onChange={(event) => handleTitleChange(event.target.value)}
            placeholder={t('未命名文章', 'Untitled story')}
            aria-label={t('文章标题', 'Story title')}
            disabled={!editable}
            maxLength={240}
          />
          <Suspense fallback={<CommunityLoadingState label={t('正在加载高级编辑器…', 'Loading the advanced editor…')} />}>
            <CollaborativeStoryEditor
              key={`${existingId}-${editable ? 'write' : 'read'}`}
              noteId={existingId}
              accessToken={accessToken}
              shareToken={shareToken}
              access={bundle.access}
              onEditorReady={handleEditorReady}
              onChange={scheduleAutoSave}
              onSaveStateChange={setSaveState}
            />
          </Suspense>
        </main>

        <aside className="community-story-editor__sidebar">
          <section>
            <p className="community-story-editor__section-label">{t('文章说明', 'Story details')}</p>
            <textarea
              className="community-field mt-3 min-h-28 w-full resize-y px-3 py-3 text-sm leading-6"
              value={excerpt}
              onChange={(event) => handleExcerptChange(event.target.value)}
              placeholder={t('写一段简短摘要…', 'Add a short summary…')}
              disabled={!editable}
              maxLength={2_000}
            />
            <div className="mt-3 text-xs">
              <div className="community-story-editor__meta-card"><span>{t('语言', 'Language')}</span><strong>{bundle.access.language === 'zh' ? '中文' : 'English'}</strong></div>
            </div>
            {!editable ? (
              <p className="mt-3 flex items-start gap-2 rounded-xl bg-[hsl(var(--community-forest)/0.055)] p-3 text-xs leading-5 text-[hsl(var(--community-forest)/0.62)]">
                <LockKeyhole className="mt-0.5 size-3.5 shrink-0" />{t('当前阶段正文为只读；你仍可查看评论与版本。', 'Content is read-only at this stage; comments and versions remain available.')}
              </p>
            ) : null}
          </section>

          <section className="border-t border-[hsl(var(--community-forest)/0.1)] pt-5">
            <p className="community-story-editor__section-label">{t('发布设置', 'Publishing settings')}</p>
            <div className="mt-3">
              <StoryPublishingSettings
                categories={categories}
                tags={tags}
                metadata={metadata}
                language={bundle.access.language === 'en' ? 'en' : 'zh'}
                editable={metadataEditable}
                creatingTag={creatingTag}
                t={t}
                onChange={handleMetadataChange}
                onCreateTag={handleCreateTag}
              />
            </div>
            {editable && !bundle.access.isOwner ? (
              <p className="mt-3 flex items-start gap-2 rounded-xl bg-[hsl(var(--community-forest)/0.055)] p-3 text-xs leading-5 text-[hsl(var(--community-forest)/0.62)]">
                <LockKeyhole className="mt-0.5 size-3.5 shrink-0" />{t('协作者可以编辑正文；分类、标签和可见范围由文章作者管理。', 'Collaborators can edit the body; the owner manages category, tags, and visibility.')}
              </p>
            ) : null}
          </section>

          <section className="border-t border-[hsl(var(--community-forest)/0.1)] pt-5">
            <p className="community-story-editor__section-label"><History className="size-4" />{t('版本记录', 'Version history')}</p>
            <div className="mt-3 space-y-2">
              {bundle.revisions.slice(0, 8).map((revision) => (
                <article key={revision.id} className="community-story-editor__revision">
                  <div className="flex items-center justify-between gap-3"><strong>v{revision.revisionNumber}</strong><time>{revision.createdAt ? formatDateTime(revision.createdAt) : ''}</time></div>
                  <p>{revision.changedByName || t('系统', 'System')} · {revision.source === 'manual' ? t('手动保存', 'Manual save') : revision.source === 'submitted' ? t('提交审核', 'Submitted') : revision.source}</p>
                </article>
              ))}
              {!bundle.revisions.length ? <p className="text-xs leading-5 text-[hsl(var(--community-forest)/0.5)]">{t('保存第一个版本后会显示在这里。', 'Your first saved version will appear here.')}</p> : null}
            </div>
          </section>
        </aside>
      </div>
    </section>
  );
}

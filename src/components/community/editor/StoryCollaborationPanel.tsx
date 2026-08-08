import { useEffect, useState } from 'react';
import { Check, Copy, Link2, Loader2, Plus, UserMinus, Users } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useCommunityUi } from '@/lib/communityUi';
import type {
  EligibleFieldNoteMember,
  FieldNoteEditorBundle,
} from '@/services/field-note-editor';
import {
  createFieldNoteShareLink,
  inviteFieldNoteCollaborator,
  listEligibleFieldNoteMembers,
  revokeFieldNoteCollaborator,
  revokeFieldNoteShareLink,
} from '@/services/field-note-editor';

interface StoryCollaborationPanelProps {
  noteId: number;
  accessToken: string;
  bundle: FieldNoteEditorBundle;
  onRefresh(): Promise<void>;
}

export default function StoryCollaborationPanel({
  noteId,
  accessToken,
  bundle,
  onRefresh,
}: StoryCollaborationPanelProps) {
  const { t } = useCommunityUi();
  const [open, setOpen] = useState(false);
  const [members, setMembers] = useState<EligibleFieldNoteMember[]>([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [role, setRole] = useState<'editor' | 'commenter'>('editor');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open || !bundle.access.canManageCollaboration) return;
    let active = true;
    setError(null);
    listEligibleFieldNoteMembers(noteId, accessToken)
      .then((result) => {
        if (active) {
          setMembers(result.filter((member) => member.userId !== bundle.access.user.id));
        }
      })
      .catch((readError) => {
        if (active) setError(readError instanceof Error ? readError.message : 'MEMBERS_READ_FAILED');
      });
    return () => { active = false; };
  }, [accessToken, bundle.access.canManageCollaboration, bundle.access.user.id, noteId, open]);

  const invite = async () => {
    if (!selectedUserId) return;
    setBusy(true);
    setError(null);
    try {
      await inviteFieldNoteCollaborator({ noteId, accessToken, userId: selectedUserId, role });
      setSelectedUserId('');
      await onRefresh();
      setMembers((current) => current.filter((member) => member.userId !== selectedUserId));
    } catch (inviteError) {
      setError(inviteError instanceof Error ? inviteError.message : 'COLLABORATOR_INVITE_FAILED');
    } finally {
      setBusy(false);
    }
  };

  const revoke = async (userId: string) => {
    setBusy(true);
    setError(null);
    try {
      await revokeFieldNoteCollaborator(noteId, accessToken, userId);
      await onRefresh();
    } catch (revokeError) {
      setError(revokeError instanceof Error ? revokeError.message : 'COLLABORATOR_REVOKE_FAILED');
    } finally {
      setBusy(false);
    }
  };

  const createShareLink = async () => {
    setBusy(true);
    setError(null);
    try {
      const result = await createFieldNoteShareLink(noteId, accessToken);
      const url = new URL(`/community/stories/${noteId}/edit`, window.location.origin);
      url.searchParams.set('share', result.shareToken);
      setShareUrl(url.toString());
      await onRefresh();
    } catch (shareError) {
      setError(shareError instanceof Error ? shareError.message : 'SHARE_LINK_CREATE_FAILED');
    } finally {
      setBusy(false);
    }
  };

  const revokeShareLink = async () => {
    setBusy(true);
    setError(null);
    try {
      await revokeFieldNoteShareLink(noteId, accessToken);
      setShareUrl('');
      await onRefresh();
    } catch (shareError) {
      setError(shareError instanceof Error ? shareError.message : 'SHARE_LINK_REVOKE_FAILED');
    } finally {
      setBusy(false);
    }
  };

  const copyShareLink = async () => {
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1_500);
  };

  const preview = bundle.collaborators.slice(0, 3);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button type="button" className="community-story-editor__collaboration-trigger">
          <span className="flex -space-x-2">
            <span className="community-story-editor__avatar bg-[hsl(var(--community-orange))]">
              {bundle.access.user.displayName.slice(0, 1)}
            </span>
            {preview.map((collaborator) => (
              <span key={collaborator.userId} className="community-story-editor__avatar bg-[hsl(var(--community-forest))]">
                {collaborator.displayName.slice(0, 1)}
              </span>
            ))}
          </span>
          <span>
            <strong>{t('协作', 'Collaborate')}</strong>
            <small>{t(`${bundle.collaborators.length + 1} 位成员`, `${bundle.collaborators.length + 1} members`)}</small>
          </span>
        </button>
      </DialogTrigger>

      <DialogContent className="max-h-[86vh] overflow-y-auto rounded-[1.6rem] border-[hsl(var(--community-forest)/0.12)] bg-[#fffdf8] sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl text-[hsl(var(--community-forest))]">
            {t('一起完成这篇文章', 'Shape this story together')}
          </DialogTitle>
          <DialogDescription>
            {t('邀请正式成员编辑或评论。分享链接仍要求登录并拥有有效成员身份。', 'Invite active members to edit or comment. Share links still require sign-in and active membership.')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pt-3">
          <section>
            <p className="community-story-editor__section-label"><Users className="size-4" />{t('成员', 'People')}</p>
            <div className="mt-3 space-y-2">
              <div className="community-story-editor__person-row">
                <span className="community-story-editor__avatar bg-[hsl(var(--community-orange))]">{bundle.access.user.displayName.slice(0, 1)}</span>
                <span className="min-w-0 flex-1"><strong>{bundle.access.user.displayName}</strong><small>{t('你', 'You')}</small></span>
                <span className="community-story-editor__role">{bundle.access.isOwner ? t('所有者', 'Owner') : t('参与者', 'Participant')}</span>
              </div>
              {bundle.collaborators.map((collaborator) => (
                <div key={collaborator.userId} className="community-story-editor__person-row">
                  <span className="community-story-editor__avatar bg-[hsl(var(--community-forest))]">{collaborator.displayName.slice(0, 1)}</span>
                  <span className="min-w-0 flex-1"><strong>{collaborator.displayName}</strong><small>{collaborator.role === 'editor' ? t('可以编辑正文', 'Can edit content') : t('仅评论', 'Comments only')}</small></span>
                  {bundle.access.canManageCollaboration ? (
                    <button type="button" className="community-icon-button" disabled={busy} onClick={() => void revoke(collaborator.userId)} aria-label={t('移除协作者', 'Remove collaborator')}>
                      <UserMinus className="size-4" />
                    </button>
                  ) : null}
                </div>
              ))}
            </div>

            {bundle.access.canManageCollaboration ? (
              <div className="mt-4 grid gap-2 sm:grid-cols-[minmax(0,1fr)_8rem_auto]">
                <select className="community-field h-11 px-3" value={selectedUserId} onChange={(event) => setSelectedUserId(event.target.value)}>
                  <option value="">{t('选择一位成员', 'Choose a member')}</option>
                  {members.map((member) => <option key={member.userId} value={member.userId}>{member.displayName}</option>)}
                </select>
                <select className="community-field h-11 px-3" value={role} onChange={(event) => setRole(event.target.value as 'editor' | 'commenter')}>
                  <option value="editor">{t('可编辑', 'Editor')}</option>
                  <option value="commenter">{t('仅评论', 'Commenter')}</option>
                </select>
                <button type="button" className="community-button community-button--primary min-h-11 px-4" disabled={busy || !selectedUserId} onClick={() => void invite()}>
                  {busy ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}{t('邀请', 'Invite')}
                </button>
              </div>
            ) : null}
          </section>

          {bundle.access.canManageCollaboration ? (
            <section className="border-t border-[hsl(var(--community-forest)/0.1)] pt-5">
              <p className="community-story-editor__section-label"><Link2 className="size-4" />{t('成员分享链接', 'Member share link')}</p>
              <p className="mt-2 text-xs leading-5 text-[hsl(var(--community-forest)/0.58)]">{t('获得链接的正式成员可以编辑。撤销后，已打开的协作连接也会立即断开。', 'Active members with the link can edit. Revoking it also disconnects open collaboration sessions.')}</p>
              {shareUrl ? (
                <div className="mt-3 flex gap-2">
                  <input className="community-field h-11 min-w-0 flex-1 px-3 text-xs" readOnly value={shareUrl} />
                  <button type="button" className="community-button community-button--secondary min-h-11 px-4" onClick={() => void copyShareLink()}>
                    {copied ? <Check className="size-4" /> : <Copy className="size-4" />}{copied ? t('已复制', 'Copied') : t('复制', 'Copy')}
                  </button>
                </div>
              ) : (
                <button type="button" className="community-button community-button--secondary mt-3 min-h-11" disabled={busy} onClick={() => void createShareLink()}>
                  <Link2 className="size-4" />{bundle.shareLink.active ? t('生成新的链接', 'Generate a new link') : t('创建分享链接', 'Create share link')}
                </button>
              )}
              {bundle.shareLink.active ? (
                <button type="button" className="mt-3 block text-xs font-semibold text-destructive underline underline-offset-4" disabled={busy} onClick={() => void revokeShareLink()}>
                  {t('撤销当前链接', 'Revoke current link')}
                </button>
              ) : null}
            </section>
          ) : null}

          {error ? <p className="rounded-xl bg-destructive/8 px-4 py-3 text-sm text-destructive" role="alert">{error}</p> : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}

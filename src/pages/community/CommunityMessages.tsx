import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Ban, Flag, MessageCircle, Send, ShieldCheck, UserRound } from 'lucide-react';

import { CommunityErrorState, CommunityLoadingState, CommunitySurface, communityInputClass, communityPrimaryButtonClass, communitySecondaryButtonClass, communityTextareaClass } from '@/components/community/CommunitySurface';
import { useAuth } from '@/contexts/AuthContext';
import { useCommunityUi } from '@/lib/communityUi';
import {
  blockCommunityMember,
  listDirectConversations,
  listDirectMessages,
  markConversationRead,
  reportDirectMessage,
  sendDirectMessage,
  subscribeToDirectMessages,
  unblockCommunityMember,
} from '@/services/messages';

type Conversation = Awaited<ReturnType<typeof listDirectConversations>>[number];
type Message = Awaited<ReturnType<typeof listDirectMessages>>[number];

export default function CommunityMessages() {
  const { user } = useAuth();
  const { t, status, formatTime } = useCommunityUi();
  const [searchParams, setSearchParams] = useSearchParams();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [body, setBody] = useState('');
  const [reporting, setReporting] = useState<number | null>(null);
  const [reportForm, setReportForm] = useState({ category: 'unsafe_contact', details: '' });
  const [blockConfirm, setBlockConfirm] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const selectedId = searchParams.get('conversation');
  const selected = useMemo(() => conversations.find((item) => item.conversation_id === selectedId) || null, [conversations, selectedId]);

  const loadConversations = useCallback(() => {
    setLoadingConversations(true);
    setError(null);
    return listDirectConversations()
      .then(setConversations)
      .catch((readError) => setError(readError instanceof Error ? readError.message : t('会话读取失败。', 'Could not load conversations.')))
      .finally(() => setLoadingConversations(false));
  }, [t]);

  const loadMessages = useCallback((conversationId: string) => {
    setLoadingMessages(true);
    setError(null);
    return listDirectMessages(conversationId)
      .then(setMessages)
      .catch((readError) => setError(readError instanceof Error ? readError.message : t('消息读取失败。', 'Could not load messages.')))
      .finally(() => setLoadingMessages(false));
  }, [t]);

  useEffect(() => { void loadConversations(); }, [loadConversations]);
  useEffect(() => {
    setBlockConfirm(false);
    setBlocked(false);
    if (!selectedId) { setMessages([]); return; }
    void loadMessages(selectedId);
    void markConversationRead(selectedId).then(loadConversations).catch(() => undefined);
    return subscribeToDirectMessages(selectedId, () => {
      void loadMessages(selectedId);
      void markConversationRead(selectedId);
    });
  }, [loadConversations, loadMessages, selectedId]);

  const send = async (event: FormEvent) => {
    event.preventDefault();
    if (!selectedId || !body.trim() || sending) return;
    setSending(true);
    setError(null);
    try {
      await sendDirectMessage(selectedId, body.trim());
      setBody('');
      await Promise.all([loadMessages(selectedId), loadConversations()]);
    } catch (sendError) {
      setError(sendError instanceof Error ? sendError.message : t('消息发送失败。', 'Could not send the message.'));
    } finally {
      setSending(false);
    }
  };

  const toggleBlock = async () => {
    if (!selected) return;
    setError(null);
    try {
      if (blocked) {
        await unblockCommunityMember(selected.other_user_id);
        setBlocked(false);
        setNotice(t('已解除拉黑。', 'This member has been unblocked.'));
      } else if (blockConfirm) {
        await blockCommunityMember(selected.other_user_id);
        setBlocked(true);
        setBlockConfirm(false);
        setNotice(t('已拉黑，对方不能继续向你发送消息。', 'Member blocked. They can no longer message you.'));
      } else setBlockConfirm(true);
      await loadConversations();
    } catch (blockError) {
      setError(blockError instanceof Error ? blockError.message : t('操作失败。', 'The action could not be completed.'));
    }
  };

  const submitReport = async () => {
    if (!reporting) return;
    setError(null);
    try {
      await reportDirectMessage(reporting, reportForm.category, reportForm.details);
      setReporting(null);
      setReportForm({ category: 'unsafe_contact', details: '' });
      setNotice(t('举报已提交给社区管理员。', 'Your report was sent to the community team.'));
    } catch (reportError) {
      setError(reportError instanceof Error ? reportError.message : t('举报提交失败。', 'Could not submit the report.'));
    }
  };

  const conversationName = (conversation: Conversation) => conversation.other_nature_name || conversation.other_display_name || t('社群伙伴', 'Community member');
  const canSend = Boolean(selected && !blocked && selected.conversation_status === 'active');

  return (
    <CommunitySurface eyebrow="Messages" title={t('留下一段真诚的对话。', 'Continue a thoughtful conversation.')} description={t('消息只发生在正式成员之间。你可以随时停止联系、拉黑或举报不安全内容。', 'Messages stay within the active member community. You can stop contact, block, or report unsafe content at any time.')} width="wide">
      {notice ? <p className="mb-4 rounded-2xl bg-[hsl(var(--community-forest)/0.07)] p-4 text-sm font-medium" role="status">{notice}</p> : null}
      {error ? <div className="mb-4"><CommunityErrorState message={error} onRetry={() => void (selectedId ? loadMessages(selectedId) : loadConversations())} /></div> : null}

      <div className="grid min-h-[36rem] overflow-hidden rounded-[1.45rem] border border-[hsl(var(--community-forest)/0.12)] bg-white/55 md:grid-cols-[18rem_minmax(0,1fr)]">
        <aside className={`${selected ? 'hidden md:block' : 'block'} border-[hsl(var(--community-forest)/0.1)] bg-[hsl(var(--community-paper-deep)/0.48)] p-3 md:border-r`} aria-label={t('会话列表', 'Conversation list')}>
          <div className="px-3 pb-3 pt-2"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-[hsl(var(--community-orange))]">{t('最近会话', 'Recent conversations')}</p></div>
          {loadingConversations ? <CommunityLoadingState label={t('正在读取会话…', 'Loading conversations…')} variant="list" items={5} /> : null}
          {!loadingConversations ? conversations.map((conversation) => (
            <button key={conversation.conversation_id} type="button" className={`mb-1 flex min-h-16 w-full items-center gap-3 rounded-2xl p-3 text-left transition ${selectedId === conversation.conversation_id ? 'bg-[hsl(var(--community-forest))] text-white' : 'hover:bg-white/75'}`} onClick={() => setSearchParams({ conversation: conversation.conversation_id })}>
              <span className="grid size-10 shrink-0 place-items-center rounded-xl rounded-bl-sm bg-white/72 text-[hsl(var(--community-forest))]"><UserRound className="size-4" aria-hidden="true" /></span>
              <span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold">{conversationName(conversation)}</span><span className="mt-0.5 block truncate text-xs opacity-65">{conversation.last_message_body || t('开始一段对话', 'Start a conversation')}</span></span>
              {conversation.unread_count > 0 ? <span className="grid size-5 shrink-0 place-items-center rounded-full bg-[hsl(var(--community-orange))] text-[10px] font-bold text-white">{conversation.unread_count}</span> : null}
            </button>
          )) : null}
          {!loadingConversations && !conversations.length ? <div className="p-4 text-sm text-[hsl(var(--community-forest)/0.58)]"><MessageCircle className="mb-3 size-5 text-[hsl(var(--community-orange))]" /><p>{t('还没有会话。', 'No conversations yet.')}</p><Link className="mt-3 inline-flex min-h-10 items-center font-semibold text-[hsl(var(--community-orange))] underline underline-offset-4" to="/community/people">{t('去伙伴页发起', 'Meet someone in People')}</Link></div> : null}
        </aside>

        <div className={`${selected ? 'flex' : 'hidden md:flex'} min-h-[36rem] flex-col`}>
          {selected ? (
            <>
              <header className="flex items-center justify-between gap-3 border-b border-[hsl(var(--community-forest)/0.1)] px-4 py-3 sm:px-5 sm:py-4">
                <div className="flex min-w-0 items-center gap-3">
                  <button type="button" className="community-icon-button md:hidden" onClick={() => setSearchParams({})} aria-label={t('返回会话列表', 'Back to conversations')}><ArrowLeft className="size-4" /></button>
                  <div className="min-w-0"><p className="truncate font-semibold text-[hsl(var(--community-forest))]">{conversationName(selected)}</p><p className="text-xs text-[hsl(var(--community-forest)/0.5)]">{status(selected.conversation_status)}</p></div>
                </div>
                <button type="button" className={`inline-flex min-h-10 shrink-0 items-center gap-2 rounded-full border px-3 text-xs font-semibold ${blocked ? 'border-[hsl(var(--community-forest)/0.2)] text-[hsl(var(--community-forest))]' : 'border-destructive/25 text-destructive'}`} onClick={() => void toggleBlock()}><Ban className="size-4" />{blocked ? t('解除拉黑', 'Unblock') : blockConfirm ? t('再次点击确认', 'Confirm block') : t('拉黑', 'Block')}</button>
              </header>

              <div className="flex-1 space-y-3 overflow-y-auto p-4 sm:p-5">
                {loadingMessages ? <CommunityLoadingState label={t('正在读取消息…', 'Loading messages…')} /> : null}
                {!loadingMessages && !messages.length ? <div className="flex h-full items-center justify-center text-center text-sm text-[hsl(var(--community-forest)/0.52)]"><div><ShieldCheck className="mx-auto mb-4 size-8 text-[hsl(var(--community-orange))]" /><p>{t('从一句真诚的问候开始。', 'Begin with a thoughtful hello.')}</p></div></div> : null}
                {!loadingMessages ? messages.map((message) => {
                  const mine = message.sender_user_id === user?.id;
                  return (
                    <div key={message.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[86%] rounded-3xl px-4 py-3 text-sm leading-6 sm:max-w-[75%] ${mine ? 'rounded-br-md bg-[hsl(var(--community-forest))] text-white' : 'rounded-bl-md bg-[hsl(var(--community-paper-deep))] text-[hsl(var(--community-forest))]'}`}>
                        <p>{message.body || t('消息已删除', 'Message deleted')}</p>
                        <div className="mt-1 flex items-center justify-between gap-4 text-[10px] opacity-65"><span>{formatTime(message.created_at)}</span>{!mine ? <button type="button" className="inline-flex min-h-7 items-center gap-1" onClick={() => setReporting(message.id)}><Flag className="size-3" />{t('举报', 'Report')}</button> : null}</div>
                      </div>
                    </div>
                  );
                }) : null}
              </div>

              {reporting ? (
                <div className="border-t border-destructive/10 bg-destructive/[0.035] p-4">
                  <p className="mb-3 text-sm font-semibold text-destructive">{t('举报这条消息', 'Report this message')}</p>
                  <div className="grid gap-3 sm:grid-cols-[12rem_minmax(0,1fr)]">
                    <select className={communityInputClass} value={reportForm.category} onChange={(event) => setReportForm({ ...reportForm, category: event.target.value })}><option value="unsafe_contact">{t('不安全联系', 'Unsafe contact')}</option><option value="harassment">{t('骚扰', 'Harassment')}</option><option value="privacy">{t('隐私', 'Privacy')}</option><option value="spam">{t('垃圾信息', 'Spam')}</option><option value="self_harm">{t('自伤风险', 'Self-harm risk')}</option><option value="other">{t('其他', 'Other')}</option></select>
                    <textarea className={communityTextareaClass} placeholder={t('补充说明', 'Add details')} value={reportForm.details} onChange={(event) => setReportForm({ ...reportForm, details: event.target.value })} />
                  </div>
                  <div className="mt-3 flex gap-2"><button type="button" className={communityPrimaryButtonClass} onClick={() => void submitReport()}>{t('提交举报', 'Submit report')}</button><button type="button" className={communitySecondaryButtonClass} onClick={() => setReporting(null)}>{t('取消', 'Cancel')}</button></div>
                </div>
              ) : null}

              <form className="flex gap-3 border-t border-[hsl(var(--community-forest)/0.1)] p-3 sm:p-4" onSubmit={send}>
                <label className="sr-only" htmlFor="community-message-body">{t('消息内容', 'Message')}</label>
                <input id="community-message-body" className={communityInputClass} value={body} onChange={(event) => setBody(event.target.value)} placeholder={!canSend ? t('当前会话不可发送', 'Sending is unavailable') : t('写一条消息…', 'Write a message…')} disabled={!canSend || sending} />
                <button className={`${communityPrimaryButtonClass} size-12 shrink-0 px-0`} aria-label={t('发送消息', 'Send message')} disabled={!canSend || sending || !body.trim()}><Send className="size-4" /></button>
              </form>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center p-8 text-center text-sm text-[hsl(var(--community-forest)/0.54)]"><div><ShieldCheck className="mx-auto mb-4 size-8 text-[hsl(var(--community-orange))]" /><p>{t('选择一段会话，或从伙伴页发起。', 'Choose a conversation, or start one from People.')}</p></div></div>
          )}
        </div>
      </div>
    </CommunitySurface>
  );
}

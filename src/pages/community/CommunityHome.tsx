import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, BellRing, BookOpenText, MessageCircle, Sparkles, Users } from 'lucide-react';

import { CommunityEmptyState, CommunityErrorState, CommunityLoadingState, CommunitySurface } from '@/components/community/CommunitySurface';
import { useAuth } from '@/contexts/AuthContext';
import { useCommunityUi } from '@/lib/communityUi';
import { listMyNotifications } from '@/services/notifications';

export default function CommunityHome() {
  const { user } = useAuth();
  const { lang, t } = useCommunityUi();
  const [notifications, setNotifications] = useState<Awaited<ReturnType<typeof listMyNotifications>>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const destinations = [
    { to: '/community/stories/new', title: t('写一篇文章', 'Write a story'), body: t('记录观察、行动与成长，让经验成为彼此的路标。', 'Turn observations, action, and growth into a marker for others.'), icon: BookOpenText, index: '01' },
    { to: '/community/people', title: t('认识伙伴', 'Meet people'), body: t('找到愿意被看见、也愿意彼此支持的正式成员。', 'Find members who are open to being seen and supporting one another.'), icon: Users, index: '02' },
    { to: '/community/practice', title: t('参加共练', 'Join a practice'), body: t('在固定的时间里一起练习、交流与复盘。', 'Practice, exchange, and reflect together at a shared time.'), icon: Sparkles, index: '03' },
    { to: '/community/messages', title: t('查看消息', 'Open messages'), body: t('在正式社群边界内，继续一段真诚的对话。', 'Continue a thoughtful conversation within the member community.'), icon: MessageCircle, index: '04' },
  ];

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    listMyNotifications(5)
      .then(setNotifications)
      .catch((readError) => setError(readError instanceof Error ? readError.message : t('通知读取失败。', 'Could not load notifications.')))
      .finally(() => setLoading(false));
  }, [t]);

  useEffect(() => { load(); }, [load]);

  return (
    <CommunitySurface
      eyebrow="Community hub"
      title={t('欢迎回来，继续生长。', 'Welcome back. Keep growing.')}
      description={t(
        `这里是创作、连接与共练发生的地方。${user?.email ? ` 当前账号：${user.email}` : ''}`,
        `This is where stories, connection, and shared practice take shape.${user?.email ? ` Signed in as ${user.email}.` : ''}`,
      )}
      width="wide"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {destinations.map(({ to, title, body, icon: Icon, index }) => (
          <Link key={to} to={to} className="group relative overflow-hidden rounded-[1.45rem] border border-[hsl(var(--community-forest)/0.11)] bg-[hsl(var(--community-paper-deep)/0.55)] p-5 transition duration-200 hover:-translate-y-1 hover:border-[hsl(var(--community-orange)/0.4)] hover:bg-white hover:shadow-[0_20px_50px_hsl(var(--community-forest)/0.09)] sm:p-6">
            <div className="flex items-start justify-between">
              <span className="grid size-11 place-items-center rounded-2xl rounded-bl-md bg-[hsl(var(--community-forest))] text-white"><Icon className="size-5" aria-hidden="true" /></span>
              <span className="flex items-center gap-2 text-[0.65rem] font-semibold tracking-[0.18em] text-[hsl(var(--community-forest)/0.42)]">{index}<ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" /></span>
            </div>
            <h2 className="mt-8 font-serif text-2xl text-[hsl(var(--community-forest))] sm:text-3xl">{title}</h2>
            <p className="mt-2 max-w-sm text-sm leading-6 text-[hsl(var(--community-forest)/0.62)]">{body}</p>
          </Link>
        ))}
      </div>

      <section className="mt-8 border-t border-[hsl(var(--community-forest)/0.11)] pt-7" aria-labelledby="community-notifications-title">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-xl bg-[hsl(var(--community-orange)/0.1)] text-[hsl(var(--community-orange))]"><BellRing className="size-4" aria-hidden="true" /></span>
            <h2 id="community-notifications-title" className="font-serif text-2xl text-[hsl(var(--community-forest))]">{t('最近通知', 'Recent notices')}</h2>
          </div>
          {notifications.length ? <span className="text-xs font-semibold text-[hsl(var(--community-forest)/0.48)]">{notifications.length}</span> : null}
        </div>
        {loading ? <CommunityLoadingState label={t('正在读取最近通知…', 'Loading recent notices…')} /> : null}
        {!loading && error ? <div className="mt-5"><CommunityErrorState message={error} onRetry={load} /></div> : null}
        {!loading && !error && notifications.length ? (
          <ul className="mt-5 grid gap-3 sm:grid-cols-2">
            {notifications.map((notification) => (
              <li key={notification.id} className="rounded-2xl border border-[hsl(var(--community-forest)/0.09)] bg-white/60 px-4 py-4">
                <p className="text-sm font-semibold text-[hsl(var(--community-forest))]">{lang === 'zh' ? notification.title_zh : (notification.title_en || notification.title_zh)}</p>
                {(lang === 'zh' ? notification.body_zh : (notification.body_en || notification.body_zh)) ? <p className="mt-1 text-sm leading-6 text-[hsl(var(--community-forest)/0.6)]">{lang === 'zh' ? notification.body_zh : (notification.body_en || notification.body_zh)}</p> : null}
              </li>
            ))}
          </ul>
        ) : null}
        {!loading && !error && !notifications.length ? <CommunityEmptyState title={t('暂时没有新通知', 'You are all caught up')} description={t('新的审核、共练或消息提醒会出现在这里。', 'New review, practice, and message updates will appear here.')} /> : null}
      </section>
    </CommunitySurface>
  );
}

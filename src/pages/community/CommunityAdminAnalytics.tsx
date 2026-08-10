import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Activity,
  CalendarDays,
  ChartLine,
  Clock3,
  Eye,
  RefreshCw,
  Route,
  Signal,
  UsersRound,
} from 'lucide-react';
import { Area, AreaChart, CartesianGrid, Line, XAxis, YAxis } from 'recharts';

import {
  CommunityEmptyState,
  CommunityErrorState,
  CommunityLoadingState,
  CommunitySurface,
  communityInputClass,
  communityPrimaryButtonClass,
  communitySecondaryButtonClass,
} from '@/components/community/CommunitySurface';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { useCommunityUi } from '@/lib/communityUi';
import {
  analyticsRanges,
  formatEngagedSeconds,
  type AnalyticsDashboard,
  type AnalyticsRange,
  type AnalyticsSourceCategory,
} from '@/lib/websiteAnalytics';
import {
  getWebsiteAnalyticsDashboard,
  setWebsiteAnalyticsReportingStartDate,
} from '@/services/website-analytics';

const rangeLabels: Record<AnalyticsRange, { zh: string; en: string }> = {
  '24h': { zh: '24 小时', en: '24 hours' },
  '7d': { zh: '7 天', en: '7 days' },
  '30d': { zh: '30 天', en: '30 days' },
  '90d': { zh: '90 天', en: '90 days' },
};

const sourceLabels: Record<AnalyticsSourceCategory, { zh: string; en: string }> = {
  direct: { zh: '直接访问', en: 'Direct' },
  search: { zh: '搜索引擎', en: 'Search' },
  social: { zh: '社交媒体', en: 'Social' },
  referral: { zh: '外部链接', en: 'Referral' },
  campaign: { zh: '推广活动', en: 'Campaign' },
};

const chartConfig = {
  views: { label: 'Page views', color: 'hsl(var(--community-orange))' },
  sessions: { label: 'Sessions', color: 'hsl(var(--community-forest))' },
} satisfies ChartConfig;

function MetricCard({
  icon: Icon,
  label,
  value,
  note,
  live = false,
}: {
  icon: typeof Activity;
  label: string;
  value: string;
  note: string;
  live?: boolean;
}) {
  return (
    <article className="rounded-[1.35rem] border border-[hsl(var(--community-forest)/0.1)] bg-white/65 p-4 shadow-[0_16px_42px_hsl(var(--community-forest)/0.055)] sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <span className="flex size-9 items-center justify-center rounded-full bg-[hsl(var(--community-orange)/0.11)] text-[hsl(var(--community-orange))]">
          <Icon className="size-4" aria-hidden="true" />
        </span>
        {live ? <span className="flex items-center gap-1.5 text-[0.66rem] font-semibold uppercase tracking-[0.13em] text-primary/55"><span className="size-2 animate-pulse rounded-full bg-emerald-500 motion-reduce:animate-none" />Live</span> : null}
      </div>
      <p className="mt-5 text-xs font-medium text-foreground/55">{label}</p>
      <p className="mt-1 font-serif text-3xl tabular-nums text-primary sm:text-4xl">{value}</p>
      <p className="mt-2 text-xs leading-relaxed text-foreground/45">{note}</p>
    </article>
  );
}

export default function CommunityAdminAnalytics() {
  const { lang, locale, t, formatDate, formatDateTime, formatTime } = useCommunityUi();
  const [range, setRange] = useState<AnalyticsRange>('7d');
  const [dashboard, setDashboard] = useState<AnalyticsDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [stale, setStale] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [reportingStartDate, setReportingStartDate] = useState('');

  const load = useCallback(async (quiet = false) => {
    if (quiet) setRefreshing(true);
    else setLoading(true);
    try {
      const next = await getWebsiteAnalyticsDashboard(range);
      setDashboard(next);
      setReportingStartDate(next.settings.reportingStartDate);
      setError(null);
      setStale(false);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : t('网站统计读取失败。', 'Could not load website analytics.'));
      setStale(quiet);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [range, t]);

  useEffect(() => { void load(false); }, [load]);
  useEffect(() => {
    const intervalId = window.setInterval(() => void load(true), 15_000);
    return () => window.clearInterval(intervalId);
  }, [load]);

  const number = useMemo(() => new Intl.NumberFormat(locale), [locale]);
  const totalTrendViews = dashboard?.trend.reduce((sum, point) => sum + point.views, 0) || 0;
  const totalSourceViews = dashboard?.sources.reduce((sum, source) => sum + source.views, 0) || 0;

  const saveReportingStartDate = async () => {
    if (!reportingStartDate || saving) return;
    setSaving(true);
    setNotice(null);
    setError(null);
    try {
      await setWebsiteAnalyticsReportingStartDate(reportingStartDate);
      await load(true);
      setNotice(t('统计起算日期已更新，历史报表已重新计算。', 'Reporting start date updated. Historical reports have been recalculated.'));
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : t('统计起算日期保存失败。', 'Could not save the reporting start date.'));
    } finally {
      setSaving(false);
    }
  };

  const formatBucket = (value: string) => new Intl.DateTimeFormat(locale, range === '24h'
    ? { hour: '2-digit', minute: '2-digit' }
    : { month: 'short', day: 'numeric' }).format(new Date(value));

  return (
    <CommunitySurface
      eyebrow="Website pulse"
      title={t('看见网站正在发生什么。', 'See what is happening across the website.')}
      description={t('匿名统计公开页面的实时访问、有效停留与来源，不关联社群账号或个人身份。', 'Anonymous public-page analytics for live traffic, effective engagement, and acquisition sources—never linked to community accounts or personal identity.')}
      width="wide"
      action={dashboard ? (
        <div className="flex flex-col items-start gap-2 sm:items-end">
          <button type="button" className={communitySecondaryButtonClass} disabled={refreshing} onClick={() => void load(true)}>
            <RefreshCw className={`size-4 ${refreshing ? 'animate-spin motion-reduce:animate-none' : ''}`} aria-hidden="true" />
            {refreshing ? t('刷新中…', 'Refreshing…') : t('刷新数据', 'Refresh')}
          </button>
          <p className="text-xs text-foreground/45">{t('更新于', 'Updated')} {formatTime(dashboard.generatedAt)}</p>
        </div>
      ) : undefined}
    >
      {error && !dashboard ? <CommunityErrorState message={error} onRetry={() => void load(false)} /> : null}
      {loading && !dashboard ? <CommunityLoadingState label={t('正在汇总匿名访问…', 'Summarizing anonymous visits…')} variant="cards" items={4} /> : null}

      {dashboard ? (
        <div className="space-y-8">
          {stale || error ? (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[hsl(var(--community-orange)/0.22)] bg-[hsl(var(--community-orange)/0.07)] px-4 py-3 text-sm text-[hsl(var(--community-orange))]" role="status">
              <p>{t('实时刷新暂时失败，当前显示上次成功数据。', 'Live refresh failed. Showing the last successful data.')}</p>
              <button type="button" className="font-semibold underline underline-offset-4" onClick={() => void load(true)}>{t('重试', 'Retry')}</button>
            </div>
          ) : null}
          {notice ? <p className="rounded-2xl bg-primary/10 px-4 py-3 text-sm text-primary" role="status">{notice}</p> : null}

          <section aria-labelledby="analytics-live-title">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[hsl(var(--community-orange))]">Live overview</p>
                <h2 id="analytics-live-title" className="mt-1 font-serif text-2xl text-primary">{t('此刻与今天', 'Right now and today')}</h2>
              </div>
              <p className="text-xs text-foreground/45">{t('在线：最近 5 分钟仍有活动', 'Active: activity within the last 5 minutes')}</p>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <MetricCard icon={Signal} label={t('当前在线', 'Active now')} value={number.format(dashboard.summary.activeNow)} note={t('匿名会话，不代表可识别的人数', 'Anonymous sessions, not identifiable people')} live />
              <MetricCard icon={Eye} label={t('今日访问量', 'Page views today')} value={number.format(dashboard.summary.viewsToday)} note={t('公开页面被打开的次数', 'Public page loads')} />
              <MetricCard icon={UsersRound} label={t('今日访问会话', 'Sessions today')} value={number.format(dashboard.summary.sessionsToday)} note={t('短期匿名浏览会话', 'Short-lived anonymous visits')} />
              <MetricCard icon={Clock3} label={t('平均有效停留', 'Average engagement')} value={formatEngagedSeconds(dashboard.summary.averageEngagedSecondsToday, lang)} note={t('仅计算页面可见且聚焦的时间', 'Visible and focused time only')} />
            </div>
          </section>

          <section aria-labelledby="analytics-trend-title" className="rounded-[1.45rem] border border-primary/10 bg-white/45 p-4 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary"><ChartLine className="size-5" aria-hidden="true" /></span>
                <div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary/50">Traffic</p><h2 id="analytics-trend-title" className="font-serif text-2xl text-primary">{t('访问趋势', 'Traffic trend')}</h2></div>
              </div>
              <div className="flex flex-wrap gap-1 rounded-full border border-primary/10 bg-white/60 p-1" aria-label={t('统计时间范围', 'Analytics time range')}>
                {analyticsRanges.map((item) => (
                  <button
                    key={item}
                    type="button"
                    aria-pressed={range === item}
                    className={`min-h-9 rounded-full px-3 text-xs font-semibold transition-colors ${range === item ? 'bg-primary text-primary-foreground' : 'text-primary/58 hover:bg-primary/[0.06]'}`}
                    onClick={() => setRange(item)}
                  >
                    {rangeLabels[item][lang]}
                  </button>
                ))}
              </div>
            </div>
            {totalTrendViews ? (
              <div className="mt-6" role="img" aria-label={t(`访问趋势图，共 ${totalTrendViews} 次页面访问。`, `Traffic trend chart with ${totalTrendViews} page views.`)}>
                <ChartContainer config={chartConfig} className="h-[18rem] w-full aspect-auto sm:h-[22rem]">
                  <AreaChart data={dashboard.trend} margin={{ left: 0, right: 10, top: 10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="analyticsViewsFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--color-views)" stopOpacity={0.28} /><stop offset="100%" stopColor="var(--color-views)" stopOpacity={0.02} /></linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} strokeDasharray="3 5" />
                    <XAxis dataKey="bucket" tickLine={false} axisLine={false} minTickGap={28} tickFormatter={formatBucket} />
                    <YAxis tickLine={false} axisLine={false} allowDecimals={false} width={28} />
                    <ChartTooltip content={<ChartTooltipContent labelFormatter={(value) => formatBucket(String(value))} />} />
                    <Area type="monotone" dataKey="views" stroke="var(--color-views)" fill="url(#analyticsViewsFill)" strokeWidth={2.2} />
                    <Line type="monotone" dataKey="sessions" stroke="var(--color-sessions)" strokeWidth={2} dot={false} />
                  </AreaChart>
                </ChartContainer>
              </div>
            ) : (
              <div className="mt-5"><CommunityEmptyState title={t('起算日期后还没有访问数据', 'No traffic after the reporting start date')} description={t('统计会持续采集；第一条真实访问出现后，趋势会显示在这里。', 'Collection continues. The trend will appear after the first real visit.')} /></div>
            )}
          </section>

          <div className="grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(18rem,0.8fr)]">
            <section aria-labelledby="analytics-pages-title" className="rounded-[1.45rem] border border-primary/10 bg-white/45 p-4 sm:p-6">
              <div className="flex items-center gap-3"><span className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary"><Route className="size-5" aria-hidden="true" /></span><div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary/50">Pages</p><h2 id="analytics-pages-title" className="font-serif text-2xl text-primary">{t('热门页面', 'Popular pages')}</h2></div></div>
              {dashboard.popularPages.length ? (
                <div className="mt-5 overflow-x-auto">
                  <table className="w-full min-w-[34rem] text-left text-sm">
                    <thead className="text-xs text-foreground/45"><tr className="border-b border-primary/10"><th className="pb-3 font-medium">{t('页面', 'Page')}</th><th className="pb-3 text-right font-medium">{t('访问量', 'Views')}</th><th className="pb-3 text-right font-medium">{t('平均停留', 'Avg. engagement')}</th><th className="pb-3 text-right font-medium">{t('占比', 'Share')}</th></tr></thead>
                    <tbody>{dashboard.popularPages.map((page) => <tr key={page.path} className="border-b border-primary/[0.07] last:border-0"><td className="max-w-[19rem] truncate py-3.5 font-medium text-primary" title={page.path}>{page.path}</td><td className="py-3.5 text-right tabular-nums">{number.format(page.views)}</td><td className="py-3.5 text-right tabular-nums text-foreground/60">{formatEngagedSeconds(page.averageEngagedSeconds, lang)}</td><td className="py-3.5 text-right tabular-nums text-foreground/60">{page.share}%</td></tr>)}</tbody>
                  </table>
                </div>
              ) : <div className="mt-5"><CommunityEmptyState title={t('暂无热门页面', 'No popular pages yet')} /></div>}
            </section>

            <section aria-labelledby="analytics-sources-title" className="rounded-[1.45rem] border border-primary/10 bg-white/45 p-4 sm:p-6">
              <div className="flex items-center gap-3"><span className="flex size-10 items-center justify-center rounded-full bg-[hsl(var(--community-orange)/0.11)] text-[hsl(var(--community-orange))]"><Activity className="size-5" aria-hidden="true" /></span><div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-[hsl(var(--community-orange)/0.7)]">Sources</p><h2 id="analytics-sources-title" className="font-serif text-2xl text-primary">{t('访问来源', 'Traffic sources')}</h2></div></div>
              <div className="mt-5 space-y-4">
                {dashboard.sources.map((source) => {
                  const percent = totalSourceViews ? Math.round((source.views / totalSourceViews) * 100) : 0;
                  return <article key={`${source.category}-${source.label}`}><div className="flex items-end justify-between gap-4 text-sm"><div className="min-w-0"><p className="font-semibold text-primary">{sourceLabels[source.category][lang]}</p><p className="truncate text-xs text-foreground/45" title={source.label}>{source.label}</p></div><p className="shrink-0 tabular-nums">{number.format(source.views)} · {percent}%</p></div><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-primary/[0.08]"><span className="block h-full rounded-full bg-[hsl(var(--community-orange))]" style={{ width: `${Math.max(percent, 2)}%` }} /></div></article>;
                })}
                {!dashboard.sources.length ? <CommunityEmptyState title={t('暂无来源数据', 'No source data yet')} /> : null}
              </div>
            </section>
          </div>

          <div className="grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(19rem,0.9fr)]">
            <section aria-labelledby="analytics-recent-title" className="rounded-[1.45rem] border border-primary/10 bg-white/45 p-4 sm:p-6">
              <div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary/50">Anonymous activity</p><h2 id="analytics-recent-title" className="font-serif text-2xl text-primary">{t('最近访问', 'Recent activity')}</h2></div>
              <div className="mt-5 divide-y divide-primary/[0.08]">
                {dashboard.recentActivity.map((item, index) => <article key={`${item.occurredAt}-${item.path}-${index}`} className="grid gap-2 py-3.5 text-sm sm:grid-cols-[5.5rem_minmax(0,1fr)_8rem] sm:items-center"><time className="text-xs tabular-nums text-foreground/45" dateTime={item.occurredAt}>{formatTime(item.occurredAt)}</time><div className="min-w-0"><p className="truncate font-medium text-primary" title={item.path}>{item.path}</p><p className="truncate text-xs text-foreground/45">{sourceLabels[item.sourceCategory][lang]}{item.referrerHost ? ` · ${item.referrerHost}` : ''}</p></div><p className="text-xs text-foreground/50 sm:text-right">{formatEngagedSeconds(item.engagedSeconds, lang)}</p></article>)}
                {!dashboard.recentActivity.length ? <CommunityEmptyState title={t('还没有最近访问', 'No recent activity yet')} /> : null}
              </div>
            </section>

            <section aria-labelledby="analytics-settings-title" className="rounded-[1.45rem] border border-[hsl(var(--community-orange)/0.17)] bg-[hsl(var(--community-orange)/0.055)] p-4 sm:p-6">
              <div className="flex items-center gap-3"><span className="flex size-10 items-center justify-center rounded-full bg-white/75 text-[hsl(var(--community-orange))]"><CalendarDays className="size-5" aria-hidden="true" /></span><div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-[hsl(var(--community-orange)/0.72)]">Settings</p><h2 id="analytics-settings-title" className="font-serif text-2xl text-primary">{t('统计起算日期', 'Reporting start date')}</h2></div></div>
              <p className="mt-4 text-sm leading-7 text-foreground/60">{t('网站始终匿名采集。这里仅控制历史报表从哪一天开始计算，不会暂停采集或删除已有数据。', 'Anonymous collection always stays on. This date only controls where historical reporting begins; it never pauses collection or deletes existing data.')}</p>
              {dashboard.settings.canManage ? (
                <div className="mt-5 space-y-3"><label className="block space-y-2 text-sm font-semibold"><span>{t('起算日期', 'Start date')}</span><input type="date" className={communityInputClass} value={reportingStartDate} onChange={(event) => setReportingStartDate(event.target.value)} /></label><button type="button" className={communityPrimaryButtonClass} disabled={saving || !reportingStartDate} onClick={() => void saveReportingStartDate()}>{saving ? t('保存中…', 'Saving…') : t('保存起算日期', 'Save start date')}</button></div>
              ) : <p className="mt-5 rounded-xl bg-white/55 p-3 text-xs text-foreground/55">{t('你可以查看统计，但没有修改起算日期的权限。', 'You can view analytics but cannot change the reporting start date.')}</p>}
              <dl className="mt-5 space-y-3 border-t border-primary/10 pt-4 text-xs"><div className="flex justify-between gap-4"><dt className="text-foreground/45">{t('开始采集', 'Collection began')}</dt><dd className="text-right font-medium text-primary">{formatDateTime(dashboard.settings.collectionStartedAt)}</dd></div><div className="flex justify-between gap-4"><dt className="text-foreground/45">{t('最早可用数据', 'Earliest available')}</dt><dd className="text-right font-medium text-primary">{dashboard.settings.earliestAvailableAt ? formatDate(dashboard.settings.earliestAvailableAt) : t('等待首次访问', 'Awaiting first visit')}</dd></div><div className="flex justify-between gap-4"><dt className="text-foreground/45">{t('上次设置', 'Last setting change')}</dt><dd className="text-right font-medium text-primary">{formatDateTime(dashboard.settings.updatedAt)}</dd></div></dl>
            </section>
          </div>
        </div>
      ) : null}
    </CommunitySurface>
  );
}

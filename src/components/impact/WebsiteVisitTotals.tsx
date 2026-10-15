import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "@/contexts/LanguageContext";
import { getWebsiteVisitTotals } from "@/services/website-analytics/totals";

export default function WebsiteVisitTotals() {
  const { lang, t } = useLanguage();
  const query = useQuery({
    queryKey: ["website-visit-totals"],
    queryFn: getWebsiteVisitTotals,
    staleTime: 60_000,
    retry: 1,
  });
  const locale = lang === "zh" ? "zh-CN" : "en-US";
  const formatDate = (value: string, withTime = false) =>
    new Intl.DateTimeFormat(locale, {
      timeZone: "Asia/Shanghai",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      ...(withTime
        ? ({ hour: "2-digit", minute: "2-digit", hour12: false } as const)
        : {}),
    }).format(new Date(value));

  if (!query.data) {
    return (
      <div
        className="impact-data-status"
        role={query.isPending ? "status" : "alert"}
        aria-live="polite"
      >
        <p>
          {query.isPending
            ? t("正在读取累计访问记录…", "Loading cumulative visit records…")
            : t(
                "访问统计暂时无法读取，请稍后重试。",
                "Visit statistics are temporarily unavailable. Please try again.",
              )}
        </p>
        {query.isError && (
          <button
            className="impact-text-link"
            type="button"
            onClick={() => void query.refetch()}
          >
            {t("重新读取统计", "Retry statistics")}
          </button>
        )}
      </div>
    );
  }
  const totals = query.data;
  const number = new Intl.NumberFormat(locale);
  return (
    <div>
      <dl className="impact-number-row impact-number-row--totals">
        <div>
          <dt>{t("累计访问次数", "Total visits")}</dt>
          <dd>{number.format(totals.totalSessions)}</dd>
        </div>
        <div>
          <dt>{t("累计浏览量 PV", "Total page views (PV)")}</dt>
          <dd>{number.format(totals.totalPageViews)}</dd>
        </div>
      </dl>
      <div className="impact-source">
        <p>
          {t(
            `自 ${formatDate(totals.recordedSince)} 开始记录 · 更新于 ${formatDate(totals.updatedAt, true)}（北京时间）`,
            `Recorded since ${formatDate(totals.recordedSince)} · Updated ${formatDate(totals.updatedAt, true)} (China Standard Time)`,
          )}
        </p>
        <p>
          {t(
            "访问次数按匿名访问会话统计；浏览量记录公开页面被浏览的次数，包含同一次访问中的多页浏览。",
            "Visits count anonymous browsing sessions. Page views count views of public pages, including multiple pages during one visit.",
          )}
        </p>
        <p>
          {t(
            "数据来源：本站访问记录。仅展示汇总数据，不代表去重访客人数。",
            "Source: this website’s visit records. Only aggregate figures are shown; visits do not represent unique people.",
          )}
        </p>
        {query.isError && (
          <p role="status">
            {t(
              "刷新暂未成功，当前保留上一次成功读取的记录。",
              "Refresh failed. The last successfully loaded figures remain visible.",
            )}
          </p>
        )}
      </div>
    </div>
  );
}

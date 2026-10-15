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

  if (!query.data) {
    return (
      <div
        className="impact-data-status impact-visit-status"
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
  const formattedTotal = new Intl.NumberFormat(locale).format(query.data.totalPageViews);
  return (
    <div>
      <dl className="impact-visit-card">
        <div>
          <dt>{t("累计访问", "Total visits")}</dt>
          <dd className={formattedTotal.length > 9 ? "impact-visit-card__value--compact" : undefined}>
            {formattedTotal}
          </dd>
        </div>
      </dl>
      {query.isError && (
        <p className="impact-visit-refresh" role="status">
          {t(
            "刷新暂未成功，当前保留上一次成功读取的记录。",
            "Refresh failed. The last successfully loaded figures remain visible.",
          )}
        </p>
      )}
    </div>
  );
}

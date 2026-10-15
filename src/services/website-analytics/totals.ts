import { websiteVisitTotalsSchema } from "@/lib/websiteVisitTotals";

export async function getWebsiteVisitTotals() {
  const response = await fetch("/api/impact/visits", {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) throw new Error("WEBSITE_VISIT_TOTALS_UNAVAILABLE");
  const result: unknown = await response.json();
  return websiteVisitTotalsSchema.parse(result);
}

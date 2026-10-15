import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { getWebsiteVisitTotals } from "@/services/website-analytics/totals";
import WebsiteVisitTotals from "./WebsiteVisitTotals";

vi.mock("@/services/website-analytics/totals", () => ({
  getWebsiteVisitTotals: vi.fn(),
}));
const totals = {
  recordedSince: "2026-08-16T13:34:41Z",
  updatedAt: "2026-10-15T05:00:00Z",
  totalSessions: 132,
  totalPageViews: 594,
};
function show(lang: "zh" | "en" = "zh") {
  render(
    <QueryClientProvider
      client={
        new QueryClient({ defaultOptions: { queries: { retryDelay: 0 } } })
      }
    >
      <LanguageProvider initialLanguage={lang}>
        <WebsiteVisitTotals />
      </LanguageProvider>
    </QueryClientProvider>,
  );
}

describe("public lifetime visit figures", () => {
  beforeEach(() => vi.mocked(getWebsiteVisitTotals).mockReset());
  it("renders lifetime visits and PV with the collection date, without UV or range controls", async () => {
    vi.mocked(getWebsiteVisitTotals).mockResolvedValue(totals);
    show();
    expect(await screen.findByText("132")).toBeInTheDocument();
    expect(screen.getByText("594")).toBeInTheDocument();
    expect(screen.getByText(/2026\/08\/16/)).toHaveTextContent("开始记录");
    expect(screen.getByText(/不代表去重访客人数/)).toBeInTheDocument();
    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
    expect(screen.queryByText("近 30 天")).not.toBeInTheDocument();
  });
  it("shows genuine zero totals as zero", async () => {
    vi.mocked(getWebsiteVisitTotals).mockResolvedValue({
      ...totals,
      totalSessions: 0,
      totalPageViews: 0,
    });
    show();
    expect(await screen.findAllByText("0")).toHaveLength(2);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
  it("does not show zero on failure and supports retry", async () => {
    vi.mocked(getWebsiteVisitTotals).mockRejectedValue(
      new Error("unavailable"),
    );
    show();
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "访问统计暂时无法读取",
    );
    expect(screen.queryByText("0")).not.toBeInTheDocument();
    vi.mocked(getWebsiteVisitTotals).mockResolvedValue(totals);
    fireEvent.click(screen.getByRole("button", { name: "重新读取统计" }));
    expect(await screen.findByText("594")).toBeInTheDocument();
  });
  it("uses English labels with the same metric definitions", async () => {
    vi.mocked(getWebsiteVisitTotals).mockResolvedValue(totals);
    show("en");
    expect(await screen.findByText("Total visits")).toBeInTheDocument();
    expect(screen.getByText("Total page views (PV)")).toBeInTheDocument();
    expect(
      screen.getByText(/visits do not represent unique people/),
    ).toBeInTheDocument();
  });
});

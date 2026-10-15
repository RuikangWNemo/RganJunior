import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { impactSnapshot } from "@/content/impact";
import { localImpactRepository } from "@/services/impact/publicRepository";
import { getWebsiteVisitTotals } from "@/services/website-analytics/totals";
import Impact from "./Impact";

vi.mock("@/services/website-analytics/totals", () => ({
  getWebsiteVisitTotals: vi.fn(),
}));
function show(lang: "zh" | "en" = "zh") {
  return render(
    <QueryClientProvider
      client={
        new QueryClient({
          defaultOptions: { queries: { retry: false, retryDelay: 0 } },
        })
      }
    >
      <MemoryRouter initialEntries={["/impact"]}>
        <LanguageProvider initialLanguage={lang}>
          <Impact />
        </LanguageProvider>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}
describe("Impact", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.mocked(getWebsiteVisitTotals).mockResolvedValue({
      recordedSince: "2026-08-16T13:34:41Z",
      updatedAt: "2026-10-15T05:00:00Z",
      totalSessions: 132,
      totalPageViews: 594,
    });
  });
  afterEach(() => vi.restoreAllMocks());
  it("separates event participation, historical records, and lifetime website totals", async () => {
    show();
    await screen.findByText("28");
    const program = screen.getByRole("region", { name: "项目数据" });
    for (const value of ["11", "10", "7", "28"])
      expect(within(program).getByText(value)).toBeInTheDocument();
    expect(within(program).getByText(/以上为单期数据/)).toBeInTheDocument();
    expect(within(program).queryByText("594")).not.toBeInTheDocument();
    expect(within(program).queryByText("2,000+")).not.toBeInTheDocument();
    const visits = screen.getByRole("region", { name: "网站访问" });
    expect(await within(visits).findByText("594")).toBeInTheDocument();
    expect(within(visits).queryByText("132")).not.toBeInTheDocument();
    expect(within(visits).queryByText("近 30 天")).not.toBeInTheDocument();
  });
  it("uses one shared six-chapter navigation and preserves the permission notice", async () => {
    show();
    expect(
      screen.getByRole("heading", { level: 1, name: "影响与记录" }),
    ).toBeInTheDocument();
    const nav = screen.getByRole("navigation", { name: "影响页面章节" });
    expect(screen.getAllByRole("navigation")).toHaveLength(1);
    expect(within(nav).getAllByRole("link")).toHaveLength(6);
    for (const link of within(nav).getAllByRole("link")) {
      const id = link.getAttribute("data-editorial-section-id")!;
      expect(link).toHaveAttribute("href", `/impact#${id}`);
      expect(document.getElementById(id)).toHaveAttribute("aria-labelledby");
    }
    expect(screen.getByText(/获得本人和家庭许可后使用/)).toBeInTheDocument();
  });
  it("keeps complete story links, attributed family context, and invitations distinct", async () => {
    show();
    expect(screen.getByRole("link", { name: /走进营地伙伴名录/ })).toHaveAttribute("href", "/about/participants");
    await screen.findByText("28");
    const stories = screen.getByRole("region", { name: "成长故事" });
    expect(
      within(stories)
        .getAllByRole("link", { name: "阅读完整故事" })
        .map((link) => link.getAttribute("href")),
    ).toEqual([
      "/community-stories/technology-ecology-stars",
      "/community-stories/tea-connects-an-american-girl",
      "/community-stories/tea-kitchen-and-summer",
    ]);
    expect(screen.getByRole("region", { name: "家庭观察" })).toHaveTextContent(
      "营地发起时的家长寄语",
    );
    const action = screen.getByRole("region", { name: "持续行动" });
    expect(
      within(action).getByText(/这里呈现行动的方式与邀请/),
    ).toBeInTheDocument();
    expect(within(action).queryByRole("img")).not.toBeInTheDocument();
  });
  it("uses the same achievement naming and archive targets in English", async () => {
    show("en");
    await screen.findByText("28");
    expect(
      screen.getByRole("heading", { level: 1, name: "Impact & Records" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("region", { name: "Awards & Achievements" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", {
        name: "CTB Global Youth Research and Innovation Forum",
      }),
    ).toHaveAttribute("href", "/impact/awards#ctb-global-forum");
    expect(screen.queryByText("External Records")).not.toBeInTheDocument();
  });
  it("does not manufacture empty source records", async () => {
    vi.spyOn(localImpactRepository, "getPublicSnapshot").mockResolvedValue({
      ...impactSnapshot,
      metrics: [],
      evidence: [],
    });
    show();
    expect(
      await screen.findByText("成果会在资料整理完成后加入。"),
    ).toBeInTheDocument();
    expect(screen.queryByText("28")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "CTB 全球青年研究创新论坛" }),
    ).not.toBeInTheDocument();
  });
  it("keeps stories visible while source records fail, then retries", async () => {
    vi.spyOn(localImpactRepository, "getPublicSnapshot")
      .mockRejectedValueOnce(new Error("unavailable"))
      .mockResolvedValue(impactSnapshot);
    show();
    const program = screen.getByRole("region", { name: "项目数据" });
    expect(await within(program).findByRole("alert")).toHaveTextContent(
      "这部分记录暂时无法读取",
    );
    expect(
      screen.getByRole("region", { name: "成长故事" }),
    ).toBeInTheDocument();
    fireEvent.click(within(program).getByRole("button", { name: "重新读取" }));
    expect(await within(program).findByText("28")).toBeInTheDocument();
  });
});

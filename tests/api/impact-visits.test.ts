import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import handler from "../../api/impact/visits";
const { rpc, abortSignal, createPublicAuthSupabaseClient } = vi.hoisted(() => ({
  rpc: vi.fn(),
  abortSignal: vi.fn(),
  createPublicAuthSupabaseClient: vi.fn(),
}));
vi.mock("../../api/_lib/supabase.js", () => ({
  createPublicAuthSupabaseClient,
}));
const totals = {
  recordedSince: "2026-08-16T13:34:41Z",
  updatedAt: "2026-10-15T05:00:00Z",
  totalSessions: 132,
  totalPageViews: 594,
};
function harness() {
  let code = 0;
  let body: unknown;
  const headers: Record<string, string> = {};
  const response = {
    setHeader: (key: string, value: string) => {
      headers[key] = value;
    },
    status(value: number) {
      code = value;
      return response;
    },
    json(value: unknown) {
      body = value;
    },
  };
  return { response, result: () => ({ code, body, headers }) };
}
describe("public visit summary API", () => {
  afterEach(() => vi.unstubAllGlobals());
  beforeEach(() => {
    // jsdom lacks the Node runtime’s AbortSignal.timeout.
    vi.stubGlobal("AbortSignal", {
      timeout: vi.fn(() => new AbortController().signal),
    });
    vi.clearAllMocks();
    createPublicAuthSupabaseClient.mockReturnValue({ rpc });
    rpc.mockReturnValue({ abortSignal });
    abortSignal.mockResolvedValue({ data: totals, error: null });
  });
  it("serves only validated aggregates via an aggregate-only RPC and bounded shared caching", async () => {
    const h = harness();
    await handler({ method: "GET" } as never, h.response);
    expect(rpc).toHaveBeenCalledExactlyOnceWith(
      "get_public_website_visit_totals",
    );
    expect(h.result()).toEqual({
      code: 200,
      body: totals,
      headers: {
        "Cache-Control":
          "public, max-age=0, s-maxage=60, stale-while-revalidate=300",
      },
    });
  });
  it("does not expose data or database errors when the aggregate contains extra fields", async () => {
    abortSignal.mockResolvedValue({
      data: { ...totals, sessionId: "private-id" },
      error: null,
    });
    const h = harness();
    await handler({ method: "GET" } as never, h.response);
    expect(h.result()).toMatchObject({
      code: 503,
      body: { code: "WEBSITE_VISIT_TOTALS_UNAVAILABLE" },
      headers: { "Cache-Control": "no-store" },
    });
    expect(JSON.stringify(h.result())).not.toContain("private-id");
  });
  it("fails without invented zero figures when the database is unavailable", async () => {
    abortSignal.mockResolvedValue({
      data: null,
      error: new Error("internal database detail"),
    });
    const h = harness();
    await handler({ method: "GET" } as never, h.response);
    expect(h.result()).toMatchObject({
      code: 503,
      body: { code: "WEBSITE_VISIT_TOTALS_UNAVAILABLE" },
    });
    expect(JSON.stringify(h.result())).not.toContain("internal");
  });
  it("rejects mutations before opening the database client", async () => {
    const h = harness();
    await handler({ method: "POST" } as never, h.response);
    expect(h.result()).toMatchObject({ code: 405, headers: { Allow: "GET" } });
    expect(createPublicAuthSupabaseClient).not.toHaveBeenCalled();
  });
});

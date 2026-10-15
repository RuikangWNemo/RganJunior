import { act, cleanup, renderHook } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useImpactChapter } from "./useImpactChapter";

const originalObserver = globalThis.IntersectionObserver;
const originalHeight = window.innerHeight;

describe("Impact reading position", () => {
  let notifyIntersection: IntersectionObserverCallback;
  let visibleChapter: "growth-stories" | "family-observation";
  const disconnect = vi.fn();

  beforeEach(() => {
    disconnect.mockClear();
    vi.useFakeTimers();
    visibleChapter = "growth-stories";
    globalThis.IntersectionObserver = class {
      constructor(callback: IntersectionObserverCallback) {
        notifyIntersection = callback;
      }
      observe() {}
      disconnect = disconnect;
    } as unknown as typeof IntersectionObserver;
    for (const id of ["growth-stories", "family-observation"]) {
      const section = document.createElement("section");
      section.id = id;
      section.dataset.impactChapter = "";
      section.getBoundingClientRect = () =>
        ({
          top:
            id === "growth-stories"
              ? visibleChapter === "growth-stories"
                ? 100
                : -900
              : visibleChapter === "family-observation"
                ? 100
                : 1200,
        }) as DOMRect;
      document.body.append(section);
    }
  });
  afterEach(() => {
    cleanup();
    document
      .querySelectorAll("[data-impact-chapter]")
      .forEach((e) => e.remove());
    vi.useRealTimers();
    globalThis.IntersectionObserver = originalObserver;
    window.innerHeight = originalHeight;
    vi.clearAllMocks();
  });

  function show() {
    return renderHook(() => useImpactChapter(), {
      wrapper: ({ children }) => (
        <MemoryRouter initialEntries={["/impact"]}>{children}</MemoryRouter>
      ),
    });
  }

  it("recovers an update skipped when the reader scrolls during a chapter jump", () => {
    const { result } = show();
    act(() => result.current.onSelect("growth-stories"));
    visibleChapter = "family-observation";
    act(() => notifyIntersection([], {} as IntersectionObserver));
    expect(result.current.activeId).toBe("growth-stories");
    act(() => vi.advanceTimersByTime(900));
    expect(result.current.activeId).toBe("family-observation");
  });

  it("keeps the latest chapter selected while a second jump is in progress", () => {
    const { result } = show();
    act(() => result.current.onSelect("growth-stories"));
    act(() => vi.advanceTimersByTime(600));
    act(() => result.current.onSelect("family-observation"));
    act(() => vi.advanceTimersByTime(300));
    expect(result.current.activeId).toBe("family-observation");
    visibleChapter = "family-observation";
    act(() => vi.advanceTimersByTime(600));
    expect(result.current.activeId).toBe("family-observation");
  });

  it("uses the shared chapter offset when the viewport is short", () => {
    window.innerHeight = 500;
    const first = document.createElement("section");
    first.id = "project-data";
    first.dataset.impactChapter = "";
    first.style.scrollMarginTop = "152px";
    first.getBoundingClientRect = () => ({ top: -1500 }) as DOMRect;
    document.body.append(first);
    document.getElementById("family-observation")!.getBoundingClientRect = () =>
      ({ top: 152 }) as DOMRect;
    const { result } = show();
    act(() => result.current.onSelect("family-observation"));
    act(() => vi.advanceTimersByTime(900));
    expect(result.current.activeId).toBe("family-observation");
  });

  it("cleans up the pending recovery when leaving the page", () => {
    const { result, unmount } = show();
    act(() => result.current.onSelect("growth-stories"));
    expect(vi.getTimerCount()).toBe(1);
    unmount();
    expect(vi.getTimerCount()).toBe(0);
    expect(disconnect).toHaveBeenCalledOnce();
  });
});

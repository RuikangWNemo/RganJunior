import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  impactChapters,
  readImpactChapterHash,
  type ImpactChapterId,
} from "@/lib/impactNavigation";

export function useImpactChapter() {
  const location = useLocation();
  const [activeId, setActiveId] = useState<ImpactChapterId>(
    () => readImpactChapterHash(location.hash) ?? "project-data",
  );
  const selectionLock = useRef(0);
  const selectionRecovery = useRef<number>();
  const syncVisibleChapter = useCallback(() => {
    const firstSection = document.getElementById(impactChapters[0].id);
    const chapterOffset = firstSection
      ? Number.parseFloat(
          window.getComputedStyle(firstSection).scrollMarginTop,
        ) || 0
      : 0;
    const readingLine = Math.max(window.innerHeight * 0.22, chapterOffset + 1);
    let current: ImpactChapterId = "project-data";
    for (const chapter of impactChapters) {
      const section = document.getElementById(chapter.id);
      if (section && section.getBoundingClientRect().top <= readingLine) {
        current = chapter.id;
      }
    }
    setActiveId(current);
  }, []);
  const onSelect = useCallback(
    (id: ImpactChapterId) => {
      selectionLock.current = Date.now() + 900;
      setActiveId(id);
      window.clearTimeout(selectionRecovery.current);
      // Recover an observer update skipped when the reader interrupts a jump.
      selectionRecovery.current = window.setTimeout(() => {
        selectionLock.current = 0;
        syncVisibleChapter();
      }, 900);
      document.getElementById(id)?.scrollIntoView?.({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "auto"
          : "smooth",
        block: "start",
      });
    },
    [syncVisibleChapter],
  );

  useEffect(() => {
    const id = readImpactChapterHash(location.hash);
    if (id) onSelect(id);
  }, [location.hash, onSelect]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      () => {
        if (Date.now() < selectionLock.current) return;
        syncVisibleChapter();
      },
      { rootMargin: "-22% 0px -68% 0px", threshold: 0 },
    );
    document
      .querySelectorAll("[data-impact-chapter]")
      .forEach((section) => observer.observe(section));
    return () => {
      observer.disconnect();
      window.clearTimeout(selectionRecovery.current);
    };
  }, [syncVisibleChapter]);

  return { activeId, onSelect };
}

import { useEffect } from 'react';

const SCROLL_SYNC_EVENT = 'rgan:smooth-scroll-sync';
const DESKTOP_QUERY = '(min-width: 768px) and (hover: hover) and (pointer: fine)';
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';
const EASE = 0.14;
const STOP_DISTANCE = 0.45;
const WHEEL_GAIN = 0.92;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function getMaxScroll() {
  const root = document.documentElement;
  return Math.max(0, root.scrollHeight - window.innerHeight);
}

function resolveDeltaY(event: WheelEvent) {
  if (event.deltaMode === WheelEvent.DOM_DELTA_LINE) {
    return event.deltaY * 16;
  }

  if (event.deltaMode === WheelEvent.DOM_DELTA_PAGE) {
    return event.deltaY * window.innerHeight;
  }

  return event.deltaY;
}

function isInteractiveTarget(target: EventTarget | null) {
  if (!(target instanceof Element)) {
    return false;
  }

  return Boolean(
    target.closest(
      [
        'input',
        'textarea',
        'select',
        'button',
        '[contenteditable="true"]',
        '[role="dialog"]',
        '[role="menu"]',
        '[role="listbox"]',
        '[data-radix-popper-content-wrapper]',
        '[data-scroll-damping-native]',
      ].join(',')
    )
  );
}

function hasScrollableAncestor(target: EventTarget | null, deltaY: number) {
  if (!(target instanceof Element)) {
    return false;
  }

  let element: Element | null = target;

  while (element && element !== document.body && element !== document.documentElement) {
    if (element instanceof HTMLElement) {
      const style = window.getComputedStyle(element);
      const overflowY = `${style.overflowY} ${style.overflow}`;
      const isScrollable = /(auto|scroll|overlay)/.test(overflowY) && element.scrollHeight > element.clientHeight + 1;

      if (isScrollable) {
        const canScrollDown = deltaY > 0 && element.scrollTop + element.clientHeight < element.scrollHeight - 1;
        const canScrollUp = deltaY < 0 && element.scrollTop > 1;

        if (canScrollDown || canScrollUp) {
          return true;
        }
      }
    }

    element = element.parentElement;
  }

  return false;
}

function mediaMatches(query: string) {
  return typeof window.matchMedia === 'function' && window.matchMedia(query).matches;
}

export default function SmoothScrollDamping() {
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const desktopMedia = window.matchMedia?.(DESKTOP_QUERY);
    const reducedMotionMedia = window.matchMedia?.(REDUCED_MOTION_QUERY);
    const root = document.documentElement;
    const previousScrollBehavior = root.style.scrollBehavior;
    let frameId = 0;
    let enabled = false;
    let documentStateEnabled = false;
    let currentScroll = window.scrollY;
    let targetScroll = window.scrollY;

    const setDocumentState = (nextEnabled: boolean) => {
      if (documentStateEnabled === nextEnabled) {
        return;
      }

      documentStateEnabled = nextEnabled;

      if (nextEnabled) {
        root.dataset.scrollDamping = 'active';
        root.style.scrollBehavior = 'auto';
        return;
      }

      delete root.dataset.scrollDamping;
      root.style.scrollBehavior = previousScrollBehavior;
    };

    const cancelAnimation = () => {
      if (frameId) {
        window.cancelAnimationFrame(frameId);
        frameId = 0;
      }

      currentScroll = window.scrollY;
      targetScroll = currentScroll;
    };

    const jumpTo = (top: number) => {
      window.scrollTo({ top, left: 0, behavior: 'auto' });
    };

    const animate = () => {
      const maxScroll = getMaxScroll();
      targetScroll = clamp(targetScroll, 0, maxScroll);
      const distance = targetScroll - currentScroll;

      if (Math.abs(distance) <= STOP_DISTANCE) {
        currentScroll = targetScroll;
        jumpTo(currentScroll);
        frameId = 0;
        return;
      }

      currentScroll += distance * EASE;
      jumpTo(currentScroll);
      frameId = window.requestAnimationFrame(animate);
    };

    const startAnimation = () => {
      if (!frameId) {
        frameId = window.requestAnimationFrame(animate);
      }
    };

    const syncEnabled = () => {
      enabled = mediaMatches(DESKTOP_QUERY) && !mediaMatches(REDUCED_MOTION_QUERY);
      setDocumentState(enabled);

      if (!enabled) {
        cancelAnimation();
      }
    };

    const syncToNativeScroll = () => {
      if (!frameId) {
        currentScroll = window.scrollY;
        targetScroll = currentScroll;
      }
    };

    const forceSync = () => {
      cancelAnimation();
      currentScroll = window.scrollY;
      targetScroll = currentScroll;
    };

    const onWheel = (event: WheelEvent) => {
      if (
        !enabled ||
        event.defaultPrevented ||
        event.ctrlKey ||
        event.shiftKey ||
        document.visibilityState === 'hidden' ||
        isInteractiveTarget(event.target)
      ) {
        return;
      }

      const deltaY = resolveDeltaY(event);
      const deltaX = event.deltaX;

      if (Math.abs(deltaY) < 0.5 || Math.abs(deltaX) > Math.abs(deltaY)) {
        return;
      }

      if (hasScrollableAncestor(event.target, deltaY)) {
        return;
      }

      const maxScroll = getMaxScroll();

      if (maxScroll <= 0) {
        return;
      }

      event.preventDefault();

      if (!frameId || Math.abs(window.scrollY - currentScroll) > 80) {
        currentScroll = window.scrollY;
        targetScroll = currentScroll;
      }

      targetScroll = clamp(targetScroll + deltaY * WHEEL_GAIN, 0, maxScroll);
      startAnimation();
    };

    syncEnabled();

    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('scroll', syncToNativeScroll, { passive: true });
    window.addEventListener('resize', forceSync, { passive: true });
    window.addEventListener(SCROLL_SYNC_EVENT, forceSync);
    desktopMedia?.addEventListener('change', syncEnabled);
    reducedMotionMedia?.addEventListener('change', syncEnabled);

    return () => {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('scroll', syncToNativeScroll);
      window.removeEventListener('resize', forceSync);
      window.removeEventListener(SCROLL_SYNC_EVENT, forceSync);
      desktopMedia?.removeEventListener('change', syncEnabled);
      reducedMotionMedia?.removeEventListener('change', syncEnabled);
      cancelAnimation();
      setDocumentState(false);
    };
  }, []);

  return null;
}

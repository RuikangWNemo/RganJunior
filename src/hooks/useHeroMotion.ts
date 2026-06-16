import {
  type MouseEvent as ReactMouseEvent,
  type RefObject,
  type TouchEvent as ReactTouchEvent,
  useEffect,
  useRef,
  useState,
} from 'react';

type HeroPhase = 'entry' | 'expansion' | 'handoff';

type PointerMotion = {
  x: number;
  y: number;
  rotateX: number;
  rotateY: number;
  glowX: number;
  glowY: number;
  active: boolean;
};

const DEFAULT_POINTER: PointerMotion = {
  x: 0,
  y: 0,
  rotateX: 0,
  rotateY: 0,
  glowX: 50,
  glowY: 38,
  active: false,
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function lerp(start: number, end: number, amount: number) {
  return start + (end - start) * amount;
}

function hasPointerChanged(current: PointerMotion, next: PointerMotion) {
  return (
    current.active !== next.active ||
    Math.abs(current.x - next.x) > 0.01 ||
    Math.abs(current.y - next.y) > 0.01 ||
    Math.abs(current.rotateX - next.rotateX) > 0.01 ||
    Math.abs(current.rotateY - next.rotateY) > 0.01 ||
    Math.abs(current.glowX - next.glowX) > 0.01 ||
    Math.abs(current.glowY - next.glowY) > 0.01
  );
}

export function useHeroMotion(sectionRef: RefObject<HTMLElement | null>) {
  const stageRef = useRef<HTMLDivElement>(null);
  const targetPointerRef = useRef<PointerMotion>(DEFAULT_POINTER);
  const currentPointerRef = useRef<PointerMotion>(DEFAULT_POINTER);
  const [pointer, setPointer] = useState<PointerMotion>(DEFAULT_POINTER);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) {
      return;
    }

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const syncPreference = () => setPrefersReducedMotion(mediaQuery.matches);

    syncPreference();

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', syncPreference);
      return () => mediaQuery.removeEventListener('change', syncPreference);
    }

    mediaQuery.addListener(syncPreference);
    return () => mediaQuery.removeListener(syncPreference);
  }, []);

  useEffect(() => {
    if (prefersReducedMotion) {
      targetPointerRef.current = DEFAULT_POINTER;
      currentPointerRef.current = DEFAULT_POINTER;
      setPointer(DEFAULT_POINTER);
      return;
    }

    let frameId = 0;

    const animate = () => {
      const current = currentPointerRef.current;
      const target = targetPointerRef.current;

      const next: PointerMotion = {
        x: lerp(current.x, target.x, 0.16),
        y: lerp(current.y, target.y, 0.16),
        rotateX: lerp(current.rotateX, target.rotateX, 0.16),
        rotateY: lerp(current.rotateY, target.rotateY, 0.16),
        glowX: lerp(current.glowX, target.glowX, 0.12),
        glowY: lerp(current.glowY, target.glowY, 0.12),
        active: target.active,
      };

      if (hasPointerChanged(current, next)) {
        currentPointerRef.current = next;
        setPointer(next);
      }

      frameId = window.requestAnimationFrame(animate);
    };

    frameId = window.requestAnimationFrame(animate);
    return () => window.cancelAnimationFrame(frameId);
  }, [prefersReducedMotion]);

  useEffect(() => {
    let frameId = 0;

    const updateScrollProgress = () => {
      const viewportHeight = window.innerHeight || 1;
      const section = sectionRef.current;

      if (!section) {
        setScrollProgress(clamp(window.scrollY / (viewportHeight * 0.85), 0, 1));
        return;
      }

      const rect = section.getBoundingClientRect();
      const sectionHeight = Math.max(section.offsetHeight, viewportHeight);
      const range = Math.max(sectionHeight - viewportHeight * 0.2, viewportHeight * 0.85);
      const nextProgress = clamp(-rect.top / range, 0, 1);

      setScrollProgress(nextProgress);
    };

    const scheduleUpdate = () => {
      window.cancelAnimationFrame(frameId);
      frameId = window.requestAnimationFrame(updateScrollProgress);
    };

    updateScrollProgress();
    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleUpdate);

    return () => {
      window.removeEventListener('scroll', scheduleUpdate);
      window.removeEventListener('resize', scheduleUpdate);
      window.cancelAnimationFrame(frameId);
    };
  }, [sectionRef]);

  const setPointerFromClientPosition = (clientX: number, clientY: number) => {
    if (prefersReducedMotion || !stageRef.current) {
      return;
    }

    const rect = stageRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const normalizedX = clamp((clientX - centerX) / (rect.width / 2), -1, 1);
    const normalizedY = clamp((clientY - centerY) / (rect.height / 2), -1, 1);

    targetPointerRef.current = {
      x: normalizedX * 14,
      y: normalizedY * 12,
      rotateX: -normalizedY * 5,
      rotateY: normalizedX * 6,
      glowX: 50 + normalizedX * 10,
      glowY: 38 + normalizedY * 8,
      active: true,
    };
  };

  const resetPointer = () => {
    targetPointerRef.current = DEFAULT_POINTER;
  };

  const handlePointerMove = (event: ReactMouseEvent<HTMLDivElement>) => {
    setPointerFromClientPosition(event.clientX, event.clientY);
  };

  const handleTouchStart = (event: ReactTouchEvent<HTMLDivElement>) => {
    const touch = event.touches[0];

    if (!touch) {
      return;
    }

    setPointerFromClientPosition(touch.clientX, touch.clientY);
  };

  const handleTouchMove = (event: ReactTouchEvent<HTMLDivElement>) => {
    const touch = event.touches[0];

    if (!touch) {
      return;
    }

    setPointerFromClientPosition(touch.clientX, touch.clientY);
  };

  const entryProgress = clamp(scrollProgress / 0.22, 0, 1);
  const expansionProgress = clamp((scrollProgress - 0.12) / 0.5, 0, 1);
  const handoffProgress = clamp((scrollProgress - 0.72) / 0.28, 0, 1);
  const phase: HeroPhase =
    scrollProgress < 0.2 ? 'entry' : scrollProgress < 0.78 ? 'expansion' : 'handoff';

  return {
    stageRef,
    pointer,
    scrollProgress,
    entryProgress,
    expansionProgress,
    handoffProgress,
    phase,
    prefersReducedMotion,
    handlePointerMove,
    handlePointerLeave: resetPointer,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd: resetPointer,
  };
}

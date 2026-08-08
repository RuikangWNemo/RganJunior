import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FocusEvent,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';

type CarouselControls = {
  activeIndex: number;
  goTo: (index: number) => void;
};

type HomeFadeCarouselProps<T> = {
  items: readonly T[];
  renderSlide: (item: T, index: number, active: boolean) => ReactNode;
  renderNavigation?: (controls: CarouselControls) => ReactNode;
  ariaLabel: string;
  previousLabel: string;
  nextLabel: string;
  intervalMs: number;
  className?: string;
  viewportClassName?: string;
  slideClassName?: string;
  showCounter?: boolean;
};

export default function HomeFadeCarousel<T>({
  items,
  renderSlide,
  renderNavigation,
  ariaLabel,
  previousLabel,
  nextLabel,
  intervalMs,
  className,
  viewportClassName,
  slideClassName,
  showCounter = false,
}: HomeFadeCarouselProps<T>) {
  const reducedMotion = useReducedMotion();
  const pointerStart = useRef<number | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [interactionPaused, setInteractionPaused] = useState(false);
  const [pageVisible, setPageVisible] = useState(
    () => typeof document === 'undefined' || document.visibilityState !== 'hidden',
  );

  const goTo = useCallback((index: number) => {
    if (items.length === 0) return;
    setActiveIndex((index + items.length) % items.length);
  }, [items.length]);

  const goPrevious = useCallback(() => goTo(activeIndex - 1), [activeIndex, goTo]);
  const goNext = useCallback(() => goTo(activeIndex + 1), [activeIndex, goTo]);

  useEffect(() => {
    const handleVisibility = () => setPageVisible(document.visibilityState !== 'hidden');
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  useEffect(() => {
    if (reducedMotion || interactionPaused || !pageVisible || items.length < 2) return;
    const timer = window.setTimeout(goNext, intervalMs);
    return () => window.clearTimeout(timer);
  }, [activeIndex, goNext, interactionPaused, intervalMs, items.length, pageVisible, reducedMotion]);

  const handleBlurCapture = useCallback((event: FocusEvent<HTMLElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget)) setInteractionPaused(false);
  }, []);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      goPrevious();
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      goNext();
    }
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    pointerStart.current = event.clientX;
  };

  const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
    if (pointerStart.current === null) return;
    const distance = event.clientX - pointerStart.current;
    pointerStart.current = null;
    if (Math.abs(distance) < 42) return;
    if (distance > 0) goPrevious();
    else goNext();
  };

  return (
    <div
      className={cn('home-fade-carousel', className)}
      role="region"
      aria-roledescription="carousel"
      aria-label={ariaLabel}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setInteractionPaused(true)}
      onMouseLeave={() => setInteractionPaused(false)}
      onFocusCapture={() => setInteractionPaused(true)}
      onBlurCapture={handleBlurCapture}
    >
      {renderNavigation?.({ activeIndex, goTo })}

      <div
        className={cn('home-fade-carousel__viewport', viewportClassName)}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerCancel={() => { pointerStart.current = null; }}
      >
        <div className="home-fade-carousel__slides">
          {items.map((item, index) => {
            const active = index === activeIndex;
            return (
              <div
                key={index}
                className={cn('home-fade-carousel__slide', slideClassName)}
                data-active={active ? 'true' : 'false'}
                aria-hidden={!active}
              >
                {renderSlide(item, index, active)}
              </div>
            );
          })}
        </div>

        <button
          type="button"
          className="home-fade-carousel__button home-fade-carousel__button--previous"
          onClick={goPrevious}
          aria-label={previousLabel}
        >
          <ArrowLeft aria-hidden="true" />
        </button>
        <button
          type="button"
          className="home-fade-carousel__button home-fade-carousel__button--next"
          onClick={goNext}
          aria-label={nextLabel}
        >
          <ArrowRight aria-hidden="true" />
        </button>

        {showCounter ? (
          <p className="home-fade-carousel__counter" aria-live="polite">
            {String(activeIndex + 1).padStart(2, '0')}
            <span aria-hidden="true"> / </span>
            {String(items.length).padStart(2, '0')}
          </p>
        ) : null}
      </div>
    </div>
  );
}

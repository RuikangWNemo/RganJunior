import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FocusEvent,
  type KeyboardEvent,
} from 'react';
import { useReducedMotion } from 'framer-motion';
import useEmblaCarousel from 'embla-carousel-react';
import { useLanguage } from '@/contexts/LanguageContext';

const defaultIntervalMs = 2000;

type ParentGuardianReelProps = {
  photos: readonly string[];
};

export default function ParentGuardianReel({ photos }: ParentGuardianReelProps) {
  const { t } = useLanguage();
  const reducedMotion = useReducedMotion();
  const reelRef = useRef<HTMLDivElement>(null);
  const [viewportRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    loop: true,
    skipSnaps: false,
    duration: 50,
  });
  const [activeIndex, setActiveIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [pageVisible, setPageVisible] = useState(
    () => typeof document === 'undefined' || document.visibilityState !== 'hidden',
  );
  const [reelVisible, setReelVisible] = useState(true);

  const selectProfile = useCallback((index: number) => {
    if (photos.length === 0) return;
    const normalizedIndex = (index + photos.length) % photos.length;
    setActiveIndex(normalizedIndex);
    emblaApi?.scrollTo(normalizedIndex, Boolean(reducedMotion));
  }, [emblaApi, photos.length, reducedMotion]);

  const selectPrevious = useCallback(() => {
    selectProfile(activeIndex - 1);
  }, [activeIndex, selectProfile]);

  const selectNext = useCallback(() => {
    selectProfile(activeIndex + 1);
  }, [activeIndex, selectProfile]);

  useEffect(() => {
    if (!emblaApi) return;

    const syncSelection = () => setActiveIndex(emblaApi.selectedScrollSnap());
    syncSelection();
    emblaApi.on('select', syncSelection);
    emblaApi.on('reInit', syncSelection);

    return () => {
      emblaApi.off('select', syncSelection);
      emblaApi.off('reInit', syncSelection);
    };
  }, [emblaApi]);

  useEffect(() => {
    const handleVisibility = () => setPageVisible(document.visibilityState !== 'hidden');
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  useEffect(() => {
    if (!reelRef.current || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      ([entry]) => setReelVisible(entry.isIntersecting),
      { threshold: 0.15 },
    );
    observer.observe(reelRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (
      reducedMotion
      || hovered
      || focused
      || dragging
      || !pageVisible
      || !reelVisible
      || photos.length < 2
    ) return;

    const timer = window.setTimeout(selectNext, defaultIntervalMs);
    return () => window.clearTimeout(timer);
  }, [activeIndex, dragging, focused, hovered, pageVisible, photos.length, reducedMotion, reelVisible, selectNext]);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      selectPrevious();
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      selectNext();
    }
  };

  const handleBlurCapture = (event: FocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false);
  };

  return (
    <div
      ref={reelRef}
      className="about-v2-parent-guardian-reel"
      role="region"
      aria-roledescription="carousel"
      aria-label={t('家长守护团成员名录', 'Parent guardian circle member directory')}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={handleBlurCapture}
      onPointerDown={() => setDragging(true)}
      onPointerUp={() => setDragging(false)}
      onPointerCancel={() => setDragging(false)}
    >
      <div ref={viewportRef} className="about-v2-parent-guardian-reel__viewport">
        <div className="about-v2-parent-guardian-reel__track">
          {photos.map((photo, index) => {
            const active = index === activeIndex;
            return (
              <article
                key={photo}
                className="about-v2-parent-guardian-reel__slide"
                role="group"
                aria-roledescription="slide"
                aria-label={`${index + 1} / ${photos.length}`}
                data-active={active ? 'true' : 'false'}
                onMouseEnter={() => {
                  setHovered(true);
                  if (!active) selectProfile(index);
                }}
              >
                <button
                  type="button"
                  className="about-v2-parent-guardian-reel__card"
                  aria-label={t(
                    `查看家长守护团成员 ${index + 1} 资料`,
                    `View parent guardian circle member ${index + 1} profile`,
                  )}
                  aria-pressed={active}
                  onClick={() => selectProfile(index)}
                >
                  <figure>
                    <img
                      src={photo}
                      alt={t(
                        `家长守护团成员 ${index + 1}`,
                        `Parent guardian circle member ${index + 1}`,
                      )}
                      width="1067"
                      height="1600"
                      loading={index < 3 ? 'eager' : 'lazy'}
                      decoding="async"
                    />
                  </figure>
                  <div className="about-v2-parent-guardian-reel__copy">
                    <h4>？？？</h4>
                    <p aria-hidden={!active}>？？？</p>
                  </div>
                </button>
              </article>
            );
          })}
        </div>
      </div>

      <div
        className="about-v2-parent-guardian-reel__progress"
        role="group"
        aria-label={t('选择家长守护团成员', 'Choose a parent guardian circle member')}
      >
        {photos.map((photo, index) => (
          <button
            key={photo}
            type="button"
            aria-label={t(
              `切换到家长守护团成员 ${index + 1}`,
              `Go to parent guardian circle member ${index + 1}`,
            )}
            aria-pressed={index === activeIndex}
            onClick={() => selectProfile(index)}
          >
            <span aria-hidden="true" />
          </button>
        ))}
      </div>
    </div>
  );
}

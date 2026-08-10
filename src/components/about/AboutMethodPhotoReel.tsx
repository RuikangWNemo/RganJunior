import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FocusEvent,
  type KeyboardEvent,
  type PointerEvent,
} from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { useReducedMotion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { pickLocalized, type LocalizedText } from '@/lib/brand';

export type AboutMethodPhoto = {
  src: string;
  width: number;
  height: number;
  alt: LocalizedText;
  position?: string;
};

type AboutMethodPhotoReelProps = {
  photos: readonly AboutMethodPhoto[];
  title: LocalizedText;
  methodIndex: number;
  active: boolean;
  onCycleComplete: (methodIndex: number) => void;
};

const methodPhotoIntervalMs = 4300;

export default function AboutMethodPhotoReel({
  photos,
  title,
  methodIndex,
  active,
  onCycleComplete,
}: AboutMethodPhotoReelProps) {
  const { lang, t } = useLanguage();
  const reducedMotion = useReducedMotion();
  const reelRef = useRef<HTMLDivElement>(null);
  const [viewportRef, emblaApi] = useEmblaCarousel({
    align: 'center',
    loop: true,
    skipSnaps: false,
    duration: 34,
  });
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [pageVisible, setPageVisible] = useState(
    () => typeof document === 'undefined' || document.visibilityState !== 'hidden',
  );
  const [reelVisible, setReelVisible] = useState(true);
  const localizedTitle = pickLocalized(title, lang);

  const selectPhoto = useCallback((index: number) => {
    if (photos.length === 0) return;
    const normalizedIndex = (index + photos.length) % photos.length;
    setActivePhotoIndex(normalizedIndex);
    emblaApi?.scrollTo(normalizedIndex, Boolean(reducedMotion));
  }, [emblaApi, photos.length, reducedMotion]);

  const selectPrevious = useCallback(() => {
    selectPhoto(activePhotoIndex - 1);
  }, [activePhotoIndex, selectPhoto]);

  const selectNext = useCallback(() => {
    selectPhoto(activePhotoIndex + 1);
  }, [activePhotoIndex, selectPhoto]);

  useEffect(() => {
    if (!emblaApi) return;

    const syncSelection = () => setActivePhotoIndex(emblaApi.selectedScrollSnap());
    syncSelection();
    emblaApi.on('select', syncSelection);
    emblaApi.on('reInit', syncSelection);

    return () => {
      emblaApi.off('select', syncSelection);
      emblaApi.off('reInit', syncSelection);
    };
  }, [emblaApi]);

  useEffect(() => {
    if (!active) return;
    setActivePhotoIndex(0);
    emblaApi?.scrollTo(0, true);
  }, [active, emblaApi]);

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
      !active
      || reducedMotion
      || hovered
      || focused
      || dragging
      || !pageVisible
      || !reelVisible
      || photos.length === 0
    ) return;

    const timer = window.setTimeout(() => {
      if (activePhotoIndex === photos.length - 1) onCycleComplete(methodIndex);
      else selectNext();
    }, methodPhotoIntervalMs);

    return () => window.clearTimeout(timer);
  }, [
    active,
    activePhotoIndex,
    dragging,
    focused,
    hovered,
    methodIndex,
    onCycleComplete,
    pageVisible,
    photos.length,
    reducedMotion,
    reelVisible,
    selectNext,
  ]);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    event.stopPropagation();
    if (event.key === 'ArrowLeft') selectPrevious();
    else selectNext();
  };

  const handleBlurCapture = (event: FocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false);
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    event.stopPropagation();
    setDragging(true);
  };

  const handlePointerEnd = (event: PointerEvent<HTMLDivElement>) => {
    event.stopPropagation();
    setDragging(false);
  };

  if (photos.length === 0) return null;

  return (
    <div
      ref={reelRef}
      className="about-method-photo-reel"
      role="region"
      aria-roledescription="carousel"
      aria-label={t(`${title.zh}照片轮播`, `${title.en} photo carousel`)}
      tabIndex={active ? 0 : -1}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={handleBlurCapture}
    >
      <div
        ref={viewportRef}
        className="about-method-photo-reel__viewport"
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
      >
        <div className="about-method-photo-reel__track">
          {photos.map((photo, index) => {
            const photoActive = index === activePhotoIndex;
            return (
              <div
                key={photo.src}
                className="about-method-photo-reel__slide"
                role="group"
                aria-roledescription="slide"
                aria-label={`${index + 1} / ${photos.length}`}
                aria-hidden={!photoActive}
                data-active={photoActive ? 'true' : 'false'}
                onClick={() => {
                  if (!photoActive) selectPhoto(index);
                }}
              >
                <figure>
                  <img
                    src={photo.src}
                    alt={pickLocalized(photo.alt, lang)}
                    width={photo.width}
                    height={photo.height}
                    loading={active && index === 0 ? 'eager' : 'lazy'}
                    decoding="async"
                    style={{ objectPosition: photo.position }}
                  />
                  {photoActive ? (
                    <div className="about-method-photo-reel__hit-zones">
                      <button
                        type="button"
                        tabIndex={active ? 0 : -1}
                        onClick={selectPrevious}
                        aria-label={t(
                          `查看${localizedTitle}上一张照片`,
                          `View the previous ${localizedTitle} photograph`,
                        )}
                      />
                      <button
                        type="button"
                        tabIndex={active ? 0 : -1}
                        onClick={selectNext}
                        aria-label={t(
                          `查看${localizedTitle}下一张照片`,
                          `View the next ${localizedTitle} photograph`,
                        )}
                      />
                    </div>
                  ) : null}
                </figure>
              </div>
            );
          })}
        </div>
      </div>

      <div
        className="about-method-photo-reel__progress"
        role="group"
        aria-label={t(`选择${title.zh}照片`, `Choose a ${title.en} photograph`)}
      >
        {photos.map((photo, index) => (
          <button
            key={photo.src}
            type="button"
            tabIndex={active ? 0 : -1}
            aria-label={t(
              `查看${title.zh}第 ${index + 1} 张照片`,
              `View ${title.en} photograph ${index + 1}`,
            )}
            aria-pressed={index === activePhotoIndex}
            onClick={() => selectPhoto(index)}
          >
            <span aria-hidden="true" />
          </button>
        ))}
      </div>
    </div>
  );
}

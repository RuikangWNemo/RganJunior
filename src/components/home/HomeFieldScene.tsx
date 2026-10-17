import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FocusEvent,
  type KeyboardEvent,
} from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { useReducedMotion } from 'framer-motion';
import { homeSceneImages } from '@/content/homepage';
import { useLanguage } from '@/contexts/LanguageContext';
import { pickLocalized } from '@/lib/brand';

const sceneIntervalMs = 4300;

function HomeSceneReel() {
  const { lang, t } = useLanguage();
  const reducedMotion = useReducedMotion();
  const reelRef = useRef<HTMLDivElement>(null);
  const [viewportRef, emblaApi] = useEmblaCarousel({
    align: 'center',
    loop: true,
    skipSnaps: false,
    duration: 34,
  });
  const [activeIndex, setActiveIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [pageVisible, setPageVisible] = useState(
    () => typeof document === 'undefined' || document.visibilityState !== 'hidden',
  );
  const [reelVisible, setReelVisible] = useState(true);

  const selectPhoto = useCallback((index: number) => {
    const normalizedIndex = (index + homeSceneImages.length) % homeSceneImages.length;
    setActiveIndex(normalizedIndex);
    emblaApi?.scrollTo(normalizedIndex, Boolean(reducedMotion));
  }, [emblaApi, reducedMotion]);

  const selectPrevious = useCallback(() => {
    selectPhoto(activeIndex - 1);
  }, [activeIndex, selectPhoto]);

  const selectNext = useCallback(() => {
    selectPhoto(activeIndex + 1);
  }, [activeIndex, selectPhoto]);

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
      || homeSceneImages.length < 2
    ) return;

    const timer = window.setTimeout(selectNext, sceneIntervalMs);
    return () => window.clearTimeout(timer);
  }, [activeIndex, dragging, focused, hovered, pageVisible, reducedMotion, reelVisible, selectNext]);

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

  const previousIndex = (activeIndex - 1 + homeSceneImages.length) % homeSceneImages.length;
  const nextIndex = (activeIndex + 1) % homeSceneImages.length;

  return (
    <div
      ref={reelRef}
      className="home-scene-reel"
      role="region"
      aria-roledescription="carousel"
      aria-label={t('生活共创营现场照片', 'Life Co-creation Camp photographs')}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={handleBlurCapture}
      onPointerDown={() => setDragging(true)}
      onPointerUp={() => setDragging(false)}
      onPointerCancel={() => setDragging(false)}
    >
      <div ref={viewportRef} className="home-scene-reel__viewport">
        <div className="home-scene-reel__track">
          {homeSceneImages.map((image, index) => {
            const active = index === activeIndex;
            const shouldLoad = active || index === previousIndex || index === nextIndex;
            return (
              <div
                key={image.src}
                className="home-scene-reel__slide"
                role="group"
                aria-roledescription="slide"
                aria-label={`${index + 1} / ${homeSceneImages.length}`}
                aria-hidden={!active}
                data-active={active ? 'true' : 'false'}
                onClick={() => {
                  if (!active) selectPhoto(index);
                }}
                >
                <figure>
                  {shouldLoad ? (
                    <img
                      src={image.src}
                      srcSet={image.srcSet}
                      sizes={image.sizes}
                      alt={pickLocalized(image.alt, lang)}
                      width={image.width}
                      height={image.height}
                      loading="lazy"
                      decoding="async"
                      style={{ objectPosition: image.position }}
                    />
                  ) : <span className="home-scene-reel__image-placeholder" aria-hidden="true" />}
                  {active ? (
                    <div className="home-scene-reel__hit-zones">
                      <button
                        type="button"
                        onClick={selectPrevious}
                        aria-label={t('点击照片左侧查看上一张', "Click the left side of the photograph to see the previous one.")}
                      />
                      <button
                        type="button"
                        onClick={selectNext}
                        aria-label={t('点击照片右侧查看下一张', "Click the right side of the photograph to see the next one.")}
                      />
                    </div>
                  ) : null}
                </figure>
              </div>
            );
          })}
        </div>
      </div>

      <div className="home-editorial-shell home-scene-reel__controls">
        <div
          className="home-scene-reel__progress"
          role="group"
          aria-label={t('选择照片', 'Choose photograph')}
        >
          {homeSceneImages.map((image, index) => (
            <button
              key={image.src}
              type="button"
              aria-label={t(`查看第 ${index + 1} 张照片`, `View photograph ${index + 1}`)}
              aria-pressed={index === activeIndex}
              onClick={() => selectPhoto(index)}
            >
              <span aria-hidden="true" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function HomeFieldScene() {
  const { lang, t } = useLanguage();

  return (
    <section id="home-field-scene" className="home-editorial-section home-field-scene">
      <div className="home-editorial-shell home-field-scene__topline">
        <h2
          className={`home-field-scene__headline home-field-scene__headline--${lang}`}
        >
          {t('精彩瞬间', 'Recent Highlights')}
        </h2>
      </div>

      <HomeSceneReel />

    </section>
  );
}

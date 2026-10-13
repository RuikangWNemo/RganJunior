import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FocusEvent,
  type KeyboardEvent,
} from 'react';
import { useReducedMotion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { guardianProfilePath, type GuardianMember } from '@/content/guardians';
import useEmblaCarousel from 'embla-carousel-react';
import { useLanguage } from '@/contexts/LanguageContext';

const defaultIntervalMs = 2000;

type ParentGuardianReelProps = {
  members: readonly GuardianMember[];
};

export default function ParentGuardianReel({ members }: ParentGuardianReelProps) {
  const { t, lang } = useLanguage();
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
    if (members.length === 0) return;
    const normalizedIndex = (index + members.length) % members.length;
    setActiveIndex(normalizedIndex);
    emblaApi?.scrollTo(normalizedIndex, Boolean(reducedMotion));
  }, [emblaApi, members.length, reducedMotion]);

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
      || members.length < 2
    ) return;

    const timer = window.setTimeout(selectNext, defaultIntervalMs);
    return () => window.clearTimeout(timer);
  }, [activeIndex, dragging, focused, hovered, pageVisible, members.length, reducedMotion, reelVisible, selectNext]);

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
      aria-label={t('守护团成员照片', 'Guardian circle member photos')}
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
          {members.map((member, index) => {
            const active = index === activeIndex;
            return (
              <article
                key={member.id}
                className="about-v2-parent-guardian-reel__slide"
                role="group"
                aria-roledescription="slide"
                aria-label={`${index + 1} / ${members.length}`}
                data-active={active ? 'true' : 'false'}
                onMouseEnter={() => setHovered(true)}
              >
                <Link
                  to={guardianProfilePath(member)}
                  className="about-v2-parent-guardian-reel__card"
                  aria-label={t(
                    `查看守护团成员 ${index + 1} 资料`,
                    `View guardian circle member ${index + 1} profile`,
                  )}
                >
                  <figure>
                    <img
                      src={member.photo}
                      style={member.cardScale ? { transform: `scale(${member.cardScale})`, transformOrigin: '50% 75%' } : undefined}
                      alt={t(
                        `守护团成员 ${index + 1}`,
                        `Guardian circle member ${index + 1}`,
                      )}
                      width="1067"
                      height="1600"
                      loading={index < 3 ? 'eager' : 'lazy'}
                      decoding="async"
                    />
                  </figure>
                  <div className="about-v2-parent-guardian-reel__copy">
                    <h4>{member.name?.[lang] ?? t('敬请期待', 'Coming soon')}</h4>
                    <p className="!mt-2 !max-h-none !translate-y-0 !opacity-100">
                      {t('查看详情', 'View profile')} <span aria-hidden="true">→</span>
                    </p>
                  </div>
                </Link>
              </article>
            );
          })}
        </div>
      </div>

      <div
        className="about-v2-parent-guardian-reel__progress"
        role="group"
        aria-label={t('选择守护团成员', 'Choose a guardian circle member')}
      >
        {members.map((member, index) => (
          <button
            key={member.id}
            type="button"
            aria-label={t(
              `切换到守护团成员 ${index + 1}`,
              `Go to guardian circle member ${index + 1}`,
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

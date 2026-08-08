import { ArrowLeft, ArrowRight } from 'lucide-react';
import type { ReactNode } from 'react';
import HomeFadeCarousel from '@/components/home/HomeFadeCarousel';
import { cn } from '@/lib/utils';

type AboutManualCarouselProps<T> = {
  items: readonly T[];
  ariaLabel: string;
  navigationLabel: string;
  previousLabel: string;
  nextLabel: string;
  getItemLabel: (item: T, index: number) => string;
  getSelectLabel: (item: T, index: number) => string;
  renderSlide: (item: T, index: number, active: boolean) => ReactNode;
  className?: string;
  viewportClassName?: string;
  slideClassName?: string;
};

export default function AboutManualCarousel<T>({
  items,
  ariaLabel,
  navigationLabel,
  previousLabel,
  nextLabel,
  getItemLabel,
  getSelectLabel,
  renderSlide,
  className,
  viewportClassName,
  slideClassName,
}: AboutManualCarouselProps<T>) {
  return (
    <HomeFadeCarousel
      items={items}
      intervalMs={0}
      autoPlay={false}
      ariaLabel={ariaLabel}
      previousLabel={previousLabel}
      nextLabel={nextLabel}
      showArrows={false}
      navigationPlacement="after"
      className={cn('about-fold-carousel', className)}
      viewportClassName={cn('about-fold-carousel__viewport', viewportClassName)}
      slideClassName={cn('about-fold-carousel__slide', slideClassName)}
      renderSlide={renderSlide}
      renderNavigation={({ activeIndex, goTo }) => (
        <div className="about-fold-carousel__navigation">
          <div
            className="about-fold-carousel__tabs"
            role="group"
            aria-label={navigationLabel}
          >
            {items.map((item, index) => (
              <button
                key={`${getItemLabel(item, index)}-${index}`}
                type="button"
                onClick={() => goTo(index)}
                aria-pressed={activeIndex === index}
                aria-label={getSelectLabel(item, index)}
              >
                <span>{String(index + 1).padStart(2, '0')}</span>
                <span>{getItemLabel(item, index)}</span>
              </button>
            ))}
          </div>

          <div className="about-fold-carousel__controls">
            <button type="button" onClick={() => goTo(activeIndex - 1)} aria-label={previousLabel}>
              <ArrowLeft aria-hidden="true" />
            </button>
            <p aria-live="polite">
              {String(activeIndex + 1).padStart(2, '0')}
              <span aria-hidden="true"> / </span>
              {String(items.length).padStart(2, '0')}
            </p>
            <button type="button" onClick={() => goTo(activeIndex + 1)} aria-label={nextLabel}>
              <ArrowRight aria-hidden="true" />
            </button>
          </div>
        </div>
      )}
    />
  );
}

import { useCallback, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { useCursorEffectsEnabled } from '@/hooks/useCursorEffectsEnabled';

import './BlobCursor.css';

interface BlobCursorProps {
  blobType?: 'circle' | 'square';
  fillColor?: string;
  trailCount?: number;
  sizes?: number[];
  innerSizes?: number[];
  innerColor?: string;
  opacities?: number[];
  shadowColor?: string;
  shadowBlur?: number;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
  filterId?: string;
  filterStdDeviation?: number;
  filterColorMatrixValues?: string;
  useFilter?: boolean;
  fastDuration?: number;
  slowDuration?: number;
  fastEase?: string;
  slowEase?: string;
  className?: string;
}

export default function BlobCursor({
  blobType = 'circle',
  fillColor = '#F97316',
  trailCount = 3,
  sizes = [42, 86, 56],
  innerSizes = [10, 18, 12],
  innerColor = 'rgba(255,255,255,0.72)',
  opacities = [0.18, 0.11, 0.13],
  shadowColor = 'rgba(249,115,22,0.18)',
  shadowBlur = 18,
  shadowOffsetX = 0,
  shadowOffsetY = 8,
  filterId = 'hero-blob-cursor',
  filterStdDeviation = 22,
  filterColorMatrixValues = '1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 28 -9',
  useFilter = true,
  fastDuration = 0.12,
  slowDuration = 0.48,
  fastEase = 'power3.out',
  slowEase = 'power1.out',
  className = '',
}: BlobCursorProps) {
  const enabled = useCursorEffectsEnabled();
  const containerRef = useRef<HTMLDivElement>(null);
  const blobsRef = useRef<Array<HTMLDivElement | null>>([]);

  const hideBlobs = useCallback(() => {
    blobsRef.current.forEach((el) => {
      if (!el) return;
      gsap.to(el, { autoAlpha: 0, duration: 0.18, ease: 'power2.out' });
    });
  }, []);

  const handleMove = useCallback(
    (event: MouseEvent) => {
      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const isInside = x >= 0 && x <= rect.width && y >= 0 && y <= rect.height;

      if (!isInside) {
        hideBlobs();
        return;
      }

      blobsRef.current.forEach((el, index) => {
        if (!el) return;

        const isLead = index === 0;
        gsap.to(el, {
          x,
          y,
          autoAlpha: opacities[index] ?? opacities[opacities.length - 1] ?? 0.12,
          duration: isLead ? fastDuration : slowDuration,
          ease: isLead ? fastEase : slowEase,
          overwrite: 'auto',
        });
      });
    },
    [fastDuration, fastEase, hideBlobs, opacities, slowDuration, slowEase]
  );

  useEffect(() => {
    if (!enabled) return;

    blobsRef.current.forEach((el) => {
      if (!el) return;
      gsap.set(el, { x: 0, y: 0, autoAlpha: 0 });
    });
    const controlledBlobs = blobsRef.current.slice();

    window.addEventListener('mousemove', handleMove, { passive: true });
    window.addEventListener('blur', hideBlobs);

    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('blur', hideBlobs);
      controlledBlobs.forEach((el) => {
        if (el) gsap.killTweensOf(el);
      });
    };
  }, [enabled, handleMove, hideBlobs]);

  if (!enabled) return null;

  return (
    <div ref={containerRef} className={`blob-cursor-container ${className}`}>
      {useFilter && (
        <svg aria-hidden="true" focusable="false" style={{ position: 'absolute', width: 0, height: 0 }}>
          <filter id={filterId}>
            <feGaussianBlur in="SourceGraphic" result="blur" stdDeviation={filterStdDeviation} />
            <feColorMatrix in="blur" values={filterColorMatrixValues} />
          </filter>
        </svg>
      )}

      <div className="blob-cursor-main" style={{ filter: useFilter ? `url(#${filterId})` : undefined }}>
        {Array.from({ length: trailCount }).map((_, index) => {
          const size = sizes[index] ?? sizes[sizes.length - 1] ?? 48;
          const innerSize = innerSizes[index] ?? innerSizes[innerSizes.length - 1] ?? 12;

          return (
            <div
              key={index}
              ref={(el) => {
                blobsRef.current[index] = el;
              }}
              className="blob-cursor-blob"
              style={{
                width: size,
                height: size,
                borderRadius: blobType === 'circle' ? '50%' : '0%',
                backgroundColor: fillColor,
                boxShadow: `${shadowOffsetX}px ${shadowOffsetY}px ${shadowBlur}px 0 ${shadowColor}`,
              }}
            >
              <div
                className="blob-cursor-inner-dot"
                style={{
                  width: innerSize,
                  height: innerSize,
                  top: (size - innerSize) / 2,
                  left: (size - innerSize) / 2,
                  backgroundColor: innerColor,
                  borderRadius: blobType === 'circle' ? '50%' : '0%',
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

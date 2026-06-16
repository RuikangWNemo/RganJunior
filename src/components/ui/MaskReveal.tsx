import { useRef, useEffect, useState } from 'react';
import { motion, useScroll, useTransform, useSpring, useInView } from 'framer-motion';

interface MaskRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  direction?: 'left' | 'right' | 'top' | 'bottom';
  gradient?: boolean;
  gradientColors?: string[];
}

export default function MaskReveal({
  children,
  className = '',
  delay = 0,
  duration = 1.2,
  direction = 'left',
  gradient = false,
  gradientColors = ['#000', '#fff'],
}: MaskRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  const clipPath = {
    left: 'inset(0 100% 0 0)',
    right: 'inset(0 0 0 100%)',
    top: 'inset(100% 0 0 0)',
    bottom: 'inset(0 0 100% 0)',
  };

  const clipPathVisible = 'inset(0 0 0 0)';

  return (
    <div ref={ref} className={`relative overflow-hidden ${className}`}>
      <motion.div
        initial={{ clipPath: clipPath[direction] }}
        animate={isInView ? { clipPath: clipPathVisible } : { clipPath: clipPath[direction] }}
        transition={{
          duration,
          delay,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="relative"
      >
        {gradient && (
          <div 
            className="absolute inset-0 z-0"
            style={{
              background: `linear-gradient(${direction === 'left' || direction === 'right' ? '90deg' : '180deg'}, ${gradientColors[0]}, ${gradientColors[1]})`,
            }}
          />
        )}
        <div className="relative z-10">
          {children}
        </div>
      </motion.div>
    </div>
  );
}
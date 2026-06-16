import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  distance?: number;
  once?: boolean;
  threshold?: number;
  blur?: boolean;
  scale?: boolean;
  scaleFrom?: number;
}

export default function ScrollReveal({
  children,
  className = '',
  delay = 0,
  duration = 0.8,
  direction = 'up',
  distance = 80,
  once = true,
  threshold = 0.15,
  blur = true,
  scale = true,
  scaleFrom = 0.92,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once, amount: threshold });

  const directionOffset = {
    up: { y: distance, x: 0 },
    down: { y: -distance, x: 0 },
    left: { x: distance, y: 0 },
    right: { x: -distance, y: 0 },
    none: { x: 0, y: 0 },
  };

  const variants = {
    hidden: {
      opacity: 0,
      filter: blur ? 'blur(12px)' : 'blur(0px)',
      scale: scale ? scaleFrom : 1,
      ...directionOffset[direction],
    },
    visible: {
      opacity: 1,
      filter: 'blur(0px)',
      scale: 1,
      x: 0,
      y: 0,
      transition: {
        duration,
        delay,
        ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
      },
    },
  };

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={variants}
      className={className}
    >
      {children}
    </motion.div>
  );
}
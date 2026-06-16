import { useRef, useEffect, useState } from 'react';
import { motion, useScroll, useTransform, useSpring, useInView } from 'framer-motion';

interface ScrollSequenceProps {
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
  distance?: number;
  duration?: number;
  once?: boolean;
  threshold?: number;
}

export default function ScrollSequence({
  children,
  className = '',
  staggerDelay = 0.1,
  direction = 'up',
  distance = 60,
  duration = 0.8,
  once = true,
  threshold = 0.1,
}: ScrollSequenceProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once, amount: threshold });

  const directionOffset = {
    up: { y: distance, x: 0 },
    down: { y: -distance, x: 0 },
    left: { x: distance, y: 0 },
    right: { x: -distance, y: 0 },
  };

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: {
      opacity: 0,
      filter: 'blur(15px)',
      scale: 0.9,
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
        ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
      },
    },
  };

  // 将 children 转换为数组
  const childrenArray = Array.isArray(children) ? children : [children];

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={containerVariants}
      className={className}
      style={{ perspective: '1000px' }}
    >
      {childrenArray.map((child, index) => (
        <motion.div key={index} variants={itemVariants}>
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}
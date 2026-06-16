import { useRef, useEffect, useState } from 'react';
import { motion, useScroll, useTransform, useSpring, useInView } from 'framer-motion';

interface ParallaxRevealProps {
  children: React.ReactNode;
  className?: string;
  speed?: number;
  direction?: 'up' | 'down';
  blur?: boolean;
  scale?: boolean;
  opacity?: boolean;
  rotateX?: boolean;
  rotateY?: boolean;
  perspective?: number;
}

export default function ParallaxReveal({
  children,
  className = '',
  speed = 0.5,
  direction = 'up',
  blur = true,
  scale = true,
  opacity = true,
  rotateX = false,
  rotateY = false,
  perspective = 1000,
}: ParallaxRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  // 创建弹簧动画，让效果更丝滑
  const springProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  // 根据滚动进度计算各种变换
  const y = useTransform(
    springProgress,
    [0, 1],
    direction === 'up' ? [100 * speed, -100 * speed] : [-100 * speed, 100 * speed]
  );

  const opacityValue = useTransform(
    springProgress,
    [0, 0.3, 0.7, 1],
    [0, 1, 1, 0]
  );

  const scaleValue = useTransform(
    springProgress,
    [0, 0.5, 1],
    [0.85, 1, 0.85]
  );

  const blurValue = useTransform(
    springProgress,
    [0, 0.3, 0.7, 1],
    [20, 0, 0, 20]
  );

  const rotateXValue = useTransform(
    springProgress,
    [0, 0.5, 1],
    rotateX ? [15, 0, -15] : [0, 0, 0]
  );

  const rotateYValue = useTransform(
    springProgress,
    [0, 0.5, 1],
    rotateY ? [15, 0, -15] : [0, 0, 0]
  );

  return (
    <motion.div
      ref={ref}
      className={`relative ${className}`}
      style={{
        y,
        opacity: opacity ? opacityValue : 1,
        scale: scale ? scaleValue : 1,
        filter: blur ? `blur(${blurValue}px)` : 'none',
        rotateX: rotateXValue,
        rotateY: rotateYValue,
        perspective,
        transformStyle: 'preserve-3d',
      }}
    >
      {children}
    </motion.div>
  );
}
import { useRef, useEffect, useState } from 'react';
import { motion, useScroll, useTransform, useSpring, useInView, useMotionValueEvent } from 'framer-motion';

interface ScrollProgressRevealProps {
  children: React.ReactNode;
  className?: string;
  direction?: 'up' | 'down' | 'left' | 'right';
  distance?: number;
  blur?: boolean;
  scale?: boolean;
  opacity?: boolean;
  rotateX?: boolean;
  rotateY?: boolean;
  perspective?: number;
}

export default function ScrollProgressReveal({
  children,
  className = '',
  direction = 'up',
  distance = 100,
  blur = true,
  scale = true,
  opacity = true,
  rotateX = false,
  rotateY = false,
  perspective = 1200,
}: ScrollProgressRevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'center center'],
  });

  // 创建弹簧动画，让效果更丝滑
  const springProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 25,
    restDelta: 0.001,
  });

  // 根据方向计算初始偏移
  const getInitialOffset = () => {
    switch (direction) {
      case 'up': return { x: 0, y: distance };
      case 'down': return { x: 0, y: -distance };
      case 'left': return { x: distance, y: 0 };
      case 'right': return { x: -distance, y: 0 };
      default: return { x: 0, y: distance };
    }
  };

  const initialOffset = getInitialOffset();

  // 根据滚动进度计算各种变换
  const x = useTransform(
    springProgress,
    [0, 1],
    [initialOffset.x, 0]
  );

  const y = useTransform(
    springProgress,
    [0, 1],
    [initialOffset.y, 0]
  );

  const opacityValue = useTransform(
    springProgress,
    [0, 0.3, 1],
    [0, 0.5, 1]
  );

  const scaleValue = useTransform(
    springProgress,
    [0, 1],
    scale ? [0.85, 1] : [1, 1]
  );

  const blurValue = useTransform(
    springProgress,
    [0, 1],
    blur ? [20, 0] : [0, 0]
  );

  const rotateXValue = useTransform(
    springProgress,
    [0, 1],
    rotateX ? [15, 0] : [0, 0]
  );

  const rotateYValue = useTransform(
    springProgress,
    [0, 1],
    rotateY ? [15, 0] : [0, 0]
  );

  return (
    <motion.div
      ref={ref}
      className={`relative ${className}`}
      style={{
        x,
        y,
        opacity: opacity ? opacityValue : 1,
        scale: scale ? scaleValue : 1,
        filter: blur ? `blur(${blurValue}px)` : 'none',
        rotateX: rotateXValue,
        rotateY: rotateYValue,
        perspective,
        transformStyle: 'preserve-3d',
        transformOrigin: 'center center',
      }}
    >
      {children}
    </motion.div>
  );
}
import { useRef, useEffect, useState } from 'react';
import { motion, useScroll, useTransform, useSpring, useInView, useMotionValueEvent } from 'framer-motion';

interface ImageRevealProps {
  src: string;
  alt: string;
  className?: string;
  containerClassName?: string;
  grayscaleToColor?: boolean;
  revealDirection?: 'left' | 'right' | 'top' | 'bottom';
}

export default function ImageReveal({
  src,
  alt,
  className = '',
  containerClassName = '',
  grayscaleToColor = true,
  revealDirection = 'bottom',
}: ImageRevealProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [filterValue, setFilterValue] = useState('grayscale(100%) brightness(0.8) contrast(0.8)');
  const isInView = useInView(containerRef, { once: true, amount: 0.2 });

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  // 创建弹簧动画，让效果更丝滑
  const springProgress = useSpring(scrollYProgress, {
    stiffness: 80,
    damping: 25,
    restDelta: 0.001,
  });

  // 根据滚动进度控制灰度
  const grayscale = useTransform(
    springProgress,
    [0, 0.25, 0.6, 1],
    grayscaleToColor ? [100, 100, 30, 0] : [0, 0, 0, 0]
  );

  // 根据滚动进度控制亮度
  const brightness = useTransform(
    springProgress,
    [0, 0.25, 0.6, 1],
    [0.7, 0.85, 1.05, 1.15]
  );

  // 根据滚动进度控制对比度
  const contrast = useTransform(
    springProgress,
    [0, 0.25, 0.6, 1],
    [0.8, 0.9, 1.05, 1.1]
  );

  // 根据滚动进度控制缩放
  const scale = useTransform(
    springProgress,
    [0, 0.5, 1],
    [1.08, 1, 0.96]
  );

  // 遮罩动画 - 从底部向上展开
  const clipPath = useTransform(springProgress, [0, 0.35], [
    revealDirection === 'left' ? 'inset(0 100% 0 0)' :
    revealDirection === 'right' ? 'inset(0 0 0 100%)' :
    revealDirection === 'top' ? 'inset(100% 0 0 0)' :
    'inset(0 0 100% 0)',
    'inset(0 0 0 0)'
  ]);

  // 渐变遮罩透明度
  const overlayOpacity = useTransform(springProgress, [0, 0.4, 0.8], [0.9, 0.5, 0]);

  // 监听滚动进度并更新滤镜值
  useMotionValueEvent(springProgress, "change", (latest) => {
    const grayscaleValue = grayscaleToColor ? 
      (latest < 0.25 ? 100 : latest < 0.6 ? 100 - ((latest - 0.25) / 0.35) * 70 : 30 - ((latest - 0.6) / 0.4) * 30) : 0;
    const brightnessValue = 0.7 + latest * 0.45;
    const contrastValue = 0.8 + latest * 0.3;
    
    setFilterValue(`grayscale(${grayscaleValue}%) brightness(${brightnessValue}) contrast(${contrastValue})`);
  });

  return (
    <div ref={containerRef} className={`relative overflow-hidden ${containerClassName}`}>
      <motion.div
        className={`relative ${className}`}
        style={{
          scale,
          clipPath,
        }}
      >
        <motion.img
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
          style={{
            filter: filterValue,
          }}
          onLoad={() => setIsLoaded(true)}
          initial={{ opacity: 0 }}
          animate={{ opacity: isLoaded ? 1 : 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        />
        
        {/* 渐变遮罩 - 从底部向上消失 */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-t from-background/60 via-background/20 to-transparent"
          style={{
            opacity: overlayOpacity,
          }}
        />

        {/* 彩色光晕效果 */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 mix-blend-overlay"
          style={{
            opacity: useTransform(springProgress, [0.3, 0.7], [0, 0.6]),
          }}
        />
      </motion.div>
    </div>
  );
}
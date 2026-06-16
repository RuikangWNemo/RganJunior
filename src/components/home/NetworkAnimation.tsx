import { useEffect, useRef, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

interface NetworkAnimationProps {
  className?: string;
}

interface Point {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  progress: number;
  speed: number;
  size: number;
  opacity: number;
  glowIntensity: number;
}

interface Line {
  startPoint: Point;
  endPoint: Point;
  progress: number;
  speed: number;
  opacity: number;
  glowIntensity: number;
}

export default function NetworkAnimation({ className = '' }: NetworkAnimationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();
  const [isVisible, setIsVisible] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const { t } = useLanguage();

  // 检查用户是否偏好减少动画
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) {
      return;
    }

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const syncPreference = () => setPrefersReducedMotion(mediaQuery.matches);

    syncPreference();

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', syncPreference);
      return () => mediaQuery.removeEventListener('change', syncPreference);
    }

    mediaQuery.addListener(syncPreference);
    return () => mediaQuery.removeListener(syncPreference);
  }, []);

  // 滚动触发检测
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      {
        threshold: 0.3,
        rootMargin: '0px 0px -10% 0px',
      }
    );

    observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, []);

  // Canvas动画
  useEffect(() => {
    if (!canvasRef.current || !isVisible || prefersReducedMotion) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 设置canvas尺寸
    const resizeCanvas = () => {
      const container = canvas.parentElement;
      if (!container) return;
      
      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      
      ctx.scale(dpr, dpr);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // 动画配置
    const config = {
      pointCount: 15,
      lineColor: 'hsl(142, 76%, 36%)', // 主色
      glowColor: 'hsla(142, 76%, 36%, 0.3)',
      centerColor: 'hsl(142, 76%, 36%)',
      animationSpeed: 0.008,
      glowIntensity: 0.6,
      lineWidth: 1.5,
      pointSize: 3,
      centerSize: 6,
    };

    // 创建点
    const createPoints = (): Point[] => {
      const points: Point[] = [];
      const container = canvas.parentElement;
      if (!container) return points;
      
      const rect = container.getBoundingClientRect();
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      for (let i = 0; i < config.pointCount; i++) {
        const angle = (i / config.pointCount) * Math.PI * 2;
        const radius = Math.min(rect.width, rect.height) * 0.4;
        
        points.push({
          x: centerX + Math.cos(angle) * radius * (0.8 + Math.random() * 0.4),
          y: centerY + Math.sin(angle) * radius * (0.8 + Math.random() * 0.4),
          targetX: centerX,
          targetY: centerY,
          progress: 0,
          speed: 0.005 + Math.random() * 0.01,
          size: config.pointSize + Math.random() * 2,
          opacity: 0.3 + Math.random() * 0.4,
          glowIntensity: 0.3 + Math.random() * 0.4,
        });
      }
      
      return points;
    };

    // 创建线
    const createLines = (points: Point[]): Line[] => {
      const lines: Line[] = [];
      
      points.forEach((point, i) => {
        // 连接到中心点
        lines.push({
          startPoint: point,
          endPoint: { ...point, x: point.targetX, y: point.targetY } as Point,
          progress: 0,
          speed: 0.003 + Math.random() * 0.005,
          opacity: 0.4 + Math.random() * 0.3,
          glowIntensity: 0.2 + Math.random() * 0.3,
        });
        
        // 连接到相邻点
        if (i < points.length - 1) {
          lines.push({
            startPoint: point,
            endPoint: points[i + 1],
            progress: 0,
            speed: 0.002 + Math.random() * 0.003,
            opacity: 0.2 + Math.random() * 0.2,
            glowIntensity: 0.1 + Math.random() * 0.2,
          });
        }
      });
      
      // 连接第一个点和最后一个点
      if (points.length > 1) {
        lines.push({
          startPoint: points[points.length - 1],
          endPoint: points[0],
          progress: 0,
          speed: 0.002 + Math.random() * 0.003,
          opacity: 0.2 + Math.random() * 0.2,
          glowIntensity: 0.1 + Math.random() * 0.2,
        });
      }
      
      return lines;
    };

    const points = createPoints();
    const lines = createLines(points);
    let time = 0;

    // 绘制函数
    const draw = () => {
      if (!canvas.parentElement) return;
      
      const rect = canvas.parentElement.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, rect.height);
      
      time += config.animationSpeed;
      
      // 更新点
      points.forEach(point => {
        point.progress += point.speed;
        if (point.progress > 1) {
          point.progress = 0;
          // 重新随机化点的位置
          const angle = Math.random() * Math.PI * 2;
          const radius = Math.min(rect.width, rect.height) * 0.4;
          point.x = rect.width / 2 + Math.cos(angle) * radius * (0.8 + Math.random() * 0.4);
          point.y = rect.height / 2 + Math.sin(angle) * radius * (0.8 + Math.random() * 0.4);
        }
        
        // 闪烁效果
        point.opacity = 0.3 + Math.sin(time * 2 + point.progress * Math.PI) * 0.2;
        point.glowIntensity = 0.3 + Math.sin(time * 3 + point.progress * Math.PI * 2) * 0.2;
      });
      
      // 更新线
      lines.forEach(line => {
        line.progress += line.speed;
        if (line.progress > 1) {
          line.progress = 0;
        }
        
        // 线条闪烁
        line.opacity = 0.2 + Math.sin(time * 1.5 + line.progress * Math.PI) * 0.15;
        line.glowIntensity = 0.1 + Math.sin(time * 2 + line.progress * Math.PI * 2) * 0.1;
      });
      
      // 绘制线
      lines.forEach(line => {
        const currentX = line.startPoint.x + (line.endPoint.x - line.startPoint.x) * line.progress;
        const currentY = line.startPoint.y + (line.endPoint.y - line.startPoint.y) * line.progress;
        
        // 发光效果
        ctx.save();
        ctx.shadowColor = config.glowColor;
        ctx.shadowBlur = 10 * line.glowIntensity;
        ctx.strokeStyle = config.lineColor;
        ctx.globalAlpha = line.opacity;
        ctx.lineWidth = config.lineWidth;
        ctx.lineCap = 'round';
        
        ctx.beginPath();
        ctx.moveTo(line.startPoint.x, line.startPoint.y);
        ctx.lineTo(currentX, currentY);
        ctx.stroke();
        ctx.restore();
      });
      
      // 绘制点
      points.forEach(point => {
        // 发光效果
        ctx.save();
        ctx.shadowColor = config.glowColor;
        ctx.shadowBlur = 8 * point.glowIntensity;
        ctx.fillStyle = config.lineColor;
        ctx.globalAlpha = point.opacity;
        
        ctx.beginPath();
        ctx.arc(point.x, point.y, point.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
      
      // 绘制中心点（铁牛村）
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const centerPulse = 1 + Math.sin(time * 2) * 0.2;
      
      ctx.save();
      ctx.shadowColor = config.glowColor;
      ctx.shadowBlur = 15 * centerPulse;
      ctx.fillStyle = config.centerColor;
      ctx.globalAlpha = 0.8;
      
      ctx.beginPath();
      ctx.arc(centerX, centerY, config.centerSize * centerPulse, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      
      // 中心点光环
      ctx.save();
      ctx.strokeStyle = config.centerColor;
      ctx.globalAlpha = 0.3 * centerPulse;
      ctx.lineWidth = 2;
      
      ctx.beginPath();
      ctx.arc(centerX, centerY, config.centerSize * 2 * centerPulse, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
      
      animationRef.current = requestAnimationFrame(draw);
    };

    // 开始动画
    animationRef.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isVisible, prefersReducedMotion]);

  // 如果用户偏好减少动画，显示静态版本
  if (prefersReducedMotion) {
    return (
      <div 
        ref={containerRef}
        className={`relative overflow-hidden rounded-lg bg-gradient-to-br from-primary/5 to-accent/5 ${className}`}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary/20" />
            <p className="text-sm text-muted-foreground">
              {t('网络连接中...', 'Network connecting...')}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className={`relative overflow-hidden rounded-lg bg-gradient-to-br from-primary/5 to-accent/5 ${className}`}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full"
        aria-hidden="true"
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <p className="text-sm font-medium text-foreground/80">
            {t('全球网络连接中', 'Global Network Connecting')}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {t('从世界各地汇聚到铁牛村', 'From around the world to Tie Niu Village')}
          </p>
        </div>
      </div>
    </div>
  );
}
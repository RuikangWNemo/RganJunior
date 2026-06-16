import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

interface TitleRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  as?: 'h1' | 'h2' | 'h3' | 'h4';
  underline?: boolean;
  underlineColor?: string;
}

export default function TitleReveal({
  children,
  className = '',
  delay = 0,
  as = 'h2',
  underline = true,
  underlineColor = 'bg-primary',
}: TitleRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  // 将文字拆分为字符
  const text = children?.toString() || '';
  const characters = text.split('');

  const Component = as;

  return (
    <div ref={ref} className={`overflow-hidden ${className}`}>
      <motion.div
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
        variants={{
          hidden: {},
          visible: {
            transition: {
              staggerChildren: 0.08,
              delayChildren: delay,
            },
          },
        }}
        style={{ perspective: '1000px' }}
      >
        <Component className="relative inline-block">
          {characters.map((char, index) => (
            <motion.span
              key={index}
              variants={{
                hidden: {
                  opacity: 0,
                  y: 60,
                  rotateX: -90,
                  filter: 'blur(15px)',
                },
                visible: {
                  opacity: 1,
                  y: 0,
                  rotateX: 0,
                  filter: 'blur(0px)',
                  transition: {
                    duration: 0.7,
                    ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
                  },
                },
              }}
              className="inline-block"
              style={{ transformOrigin: '50% 100%' }}
            >
              {char === ' ' ? '\u00A0' : char}
            </motion.span>
          ))}
        </Component>
        
        {underline && (
          <motion.div
            variants={{
              hidden: {
                scaleX: 0,
                opacity: 0,
              },
              visible: {
                scaleX: 1,
                opacity: 1,
                transition: {
                  duration: 0.6,
                  delay: delay + 0.3,
                  ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
                },
              },
            }}
            className={`h-1 ${underlineColor} mt-4 origin-left`}
            style={{ width: '60px' }}
          />
        )}
      </motion.div>
    </div>
  );
}
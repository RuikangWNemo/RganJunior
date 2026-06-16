import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

interface WordRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  staggerDelay?: number;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span' | 'div';
  gradient?: boolean;
  gradientFrom?: string;
  gradientTo?: string;
}

export default function WordReveal({
  children,
  className = '',
  delay = 0,
  staggerDelay = 0.08,
  as = 'p',
  gradient = false,
  gradientFrom = 'from-foreground',
  gradientTo = 'to-foreground/60',
}: WordRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  // 将文字拆分为单词
  const text = children?.toString() || '';
  const words = text.split(' ');

  const Component = as;

  if (gradient) {
    return (
      <div ref={ref} className={`${className} overflow-hidden`} style={{ perspective: '1000px' }}>
        <motion.div
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          variants={{
            hidden: {},
            visible: {
              transition: {
                staggerChildren: staggerDelay,
                delayChildren: delay,
              },
            },
          }}
        >
          <Component className={`bg-gradient-to-r ${gradientFrom} ${gradientTo} bg-clip-text text-transparent`}>
            {words.map((word, index) => (
              <motion.span
                key={index}
                variants={{
                  hidden: {
                    opacity: 0,
                    y: 50,
                    rotateX: -45,
                    filter: 'blur(12px)',
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
                className="inline-block mr-2"
                style={{ transformOrigin: '50% 100%' }}
              >
                {word}
              </motion.span>
            ))}
          </Component>
        </motion.div>
      </div>
    );
  }

  return (
    <div ref={ref} className={`${className} overflow-hidden`} style={{ perspective: '1000px' }}>
      <motion.div
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
        variants={{
          hidden: {},
          visible: {
            transition: {
              staggerChildren: staggerDelay,
              delayChildren: delay,
            },
          },
        }}
      >
        <Component>
          {words.map((word, index) => (
            <motion.span
              key={index}
              variants={{
                hidden: {
                  opacity: 0,
                  y: 50,
                  rotateX: -45,
                  filter: 'blur(12px)',
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
              className="inline-block mr-2"
              style={{ transformOrigin: '50% 100%' }}
            >
              {word}
            </motion.span>
          ))}
        </Component>
      </motion.div>
    </div>
  );
}
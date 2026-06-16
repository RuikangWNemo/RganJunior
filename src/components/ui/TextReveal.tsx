import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

interface TextRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span' | 'div';
  gradient?: boolean;
  gradientFrom?: string;
  gradientTo?: string;
}

export default function TextReveal({
  children,
  className = '',
  delay = 0,
  as = 'p',
  gradient = false,
  gradientFrom = 'from-foreground',
  gradientTo = 'to-foreground/60',
}: TextRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.08,
        delayChildren: delay,
      },
    },
  };

  const childVariants = {
    hidden: {
      opacity: 0,
      y: 60,
      rotateX: -40,
      filter: 'blur(10px)',
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
  };

  // 将文字拆分为单词或字符
  const text = children?.toString() || '';
  const words = text.split(' ');

  const Component = as;

  if (gradient) {
    return (
      <motion.div
        ref={ref}
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
        variants={containerVariants}
        className={`${className} overflow-hidden`}
        style={{ perspective: '1000px' }}
      >
        <Component className={`bg-gradient-to-r ${gradientFrom} ${gradientTo} bg-clip-text text-transparent`}>
          {words.map((word, index) => (
            <motion.span
              key={index}
              variants={childVariants}
              className="inline-block mr-2"
            >
              {word}
            </motion.span>
          ))}
        </Component>
      </motion.div>
    );
  }

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={containerVariants}
      className={`${className} overflow-hidden`}
      style={{ perspective: '1000px' }}
    >
      <Component>
        {words.map((word, index) => (
          <motion.span
            key={index}
            variants={childVariants}
            className="inline-block mr-2"
          >
            {word}
          </motion.span>
        ))}
      </Component>
    </motion.div>
  );
}
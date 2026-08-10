import type { ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

type HomeRevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
};

export default function HomeReveal({ children, className, delay = 0 }: HomeRevealProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reduceMotion ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.16 }}
      transition={{
        duration: reduceMotion ? 0 : 0.58,
        delay: reduceMotion ? 0 : delay,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </motion.div>
  );
}

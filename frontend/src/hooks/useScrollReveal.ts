import { useRef } from 'react';
import { useInView } from 'framer-motion';

export function useScrollReveal(options?: { once?: boolean; margin?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, {
    once: options?.once ?? true,
    margin: (options?.margin ?? '-100px') as any,
  });

  const animationProps = {
    initial: { opacity: 0, y: 50 },
    animate: isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 },
    transition: { duration: 0.6, ease: 'easeOut' as const },
  };

  return { ref, isInView, animationProps };
}

export function useStaggerReveal(staggerDelay: number = 0.1) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' as any });

  const containerProps = {
    initial: 'hidden' as const,
    animate: isInView ? 'visible' as const : 'hidden' as const,
    variants: {
      hidden: {},
      visible: {
        transition: {
          staggerChildren: staggerDelay,
        },
      },
    },
  };

  const itemProps = {
    variants: {
      hidden: { opacity: 0, y: 30 },
      visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
    },
  };

  return { ref, isInView, containerProps, itemProps };
}

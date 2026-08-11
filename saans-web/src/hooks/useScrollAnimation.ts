import { useEffect, useRef, useCallback } from 'react';

interface UseScrollAnimationOptions {
  threshold?: number;
  rootMargin?: string;
}

export const useScrollAnimation = (options: UseScrollAnimationOptions = {}) => {
  const { threshold = 0.1, rootMargin = '0px 0px -50px 0px' } = options;

  const ref = useRef<HTMLElement | null>(null);

  const animateOnScroll = useCallback(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
          }
        });
      },
      {
        threshold,
        rootMargin,
      }
    );

    // Observe all elements with scroll animation classes
    const animatedElements = document.querySelectorAll(
      '.scroll-fade-in, .scroll-fade-in-up, .scroll-fade-in-left, .scroll-fade-in-right, .scroll-zoom-in, .scroll-rotate-in'
    );

    animatedElements.forEach((el) => {
      observer.observe(el);
    });

    return () => {
      animatedElements.forEach((el) => {
        observer.unobserve(el);
      });
    };
  }, [threshold, rootMargin]);

  useEffect(() => {
    const cleanup = animateOnScroll();
    return cleanup;
  }, [animateOnScroll]);

  return ref;
};

export default useScrollAnimation;

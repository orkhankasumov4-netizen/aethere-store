import { useEffect, useRef, useState } from 'react';

interface UseLazyLoadOptions {
  rootMargin?: string;
  threshold?: number;
  triggerOnce?: boolean;
}

/**
 * Hook to lazy load components using Intersection Observer
 */
export const useLazyLoad = (options: UseLazyLoadOptions = {}) => {
  const {
    rootMargin = '50px',
    threshold = 0.1,
    triggerOnce = true
  } = options;

  const ref = useRef<HTMLElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (triggerOnce) {
            setHasLoaded(true);
            observer.unobserve(element);
          }
        } else if (!triggerOnce) {
          setIsVisible(false);
        }
      },
      {
        rootMargin,
        threshold
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [rootMargin, threshold, triggerOnce]);

  return { ref, isVisible, hasLoaded };
};

/**
 * Lazy Image component with Intersection Observer
 */
export const LazyImage: React.FC<{
  src: string;
  alt: string;
  className?: string;
  placeholder?: string;
}> = ({ src, alt, className = '', placeholder = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7' }) => {
  const { ref, isVisible } = useLazyLoad({ rootMargin: '100px' });

  return (
    <img
      ref={ref as any}
      src={isVisible ? src : placeholder}
      alt={alt}
      className={className}
      loading="lazy"
    />
  );
};

/**
 * Lazy Section component - renders children only when visible
 */
export const LazySection: React.FC<{
  children: React.ReactNode;
  fallback?: React.ReactNode;
  rootMargin?: string;
}> = ({ children, fallback = null, rootMargin = '50px' }) => {
  const { ref, isVisible } = useLazyLoad({ rootMargin, triggerOnce: true });

  return (
    <div ref={ref as any}>
      {isVisible ? children : fallback}
    </div>
  );
};

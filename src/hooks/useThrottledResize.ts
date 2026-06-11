import { useEffect, useRef, useCallback } from 'react';

interface ResizeEntry {
  width: number;
  height: number;
}

type ResizeCallback = (entry: ResizeEntry) => void;

export function useThrottledResize(
  targetRef: React.RefObject<HTMLElement | null>,
  callback: ResizeCallback
): void {
  const rafRef = useRef<number | null>(null);
  const latestEntry = useRef<ResizeEntry | null>(null);

  const flush = useCallback(() => {
    rafRef.current = null;
    if (latestEntry.current) {
      callback(latestEntry.current);
      latestEntry.current = null;
    }
  }, [callback]);

  useEffect(() => {
    const el = targetRef.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;

      const { width, height } = entry.contentRect;
      latestEntry.current = { width, height };

      if (rafRef.current === null) {
        rafRef.current = requestAnimationFrame(flush);
      }
    });

    observer.observe(el);

    return () => {
      observer.disconnect();
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [targetRef, flush]);
}
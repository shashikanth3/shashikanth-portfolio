import { useMemo } from 'react';

export type VisualizationMode = 'immersive' | 'simplified';

interface ModeResult {
  mode: VisualizationMode;
  reason: string;
}

function detectMode(): ModeResult {
  if (typeof window === 'undefined') {
    return { mode: 'simplified', reason: 'ssr' };
  }

  // Reduced motion preference — hard requirement
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return { mode: 'simplified', reason: 'reduced-motion' };
  }

  // Touch device proxy (not definitive but meaningful signal)
  const isTouch =
    navigator.maxTouchPoints > 0 ||
    window.matchMedia('(pointer: coarse)').matches;

  // Low-end heuristics
  const memory = (navigator as any).deviceMemory ?? 4;
  const cores = navigator.hardwareConcurrency ?? 4;
  const width = window.screen.width;

  const isLowEnd = memory < 2 || cores < 4 || width < 480;

  if (isLowEnd) {
    return { mode: 'simplified', reason: 'low-end-device' };
  }

  // Touch + small screen (phone) still gets simplified
  if (isTouch && width < 768) {
    return { mode: 'simplified', reason: 'mobile-touch' };
  }

  return { mode: 'immersive', reason: 'capable-device' };
}

export function useVisualizationMode(): ModeResult {
  return useMemo(() => detectMode(), []);
}
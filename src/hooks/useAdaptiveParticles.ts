import { useMemo } from 'react';

interface AdaptiveParticleConfig {
  count: number;
  size: number;
  opacity: number;
  tier: 'high' | 'mid' | 'low';
}

function getDeviceTier(): 'high' | 'mid' | 'low' {
  if (typeof window === 'undefined') return 'mid';

  const width = window.screen.width;
  const dpr = window.devicePixelRatio ?? 1;
  const cores = navigator.hardwareConcurrency ?? 4;
  const memory = (navigator as any).deviceMemory ?? 4; // GB, non-standard but widely supported
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReduced) return 'low';

  // Score system: 0-5 points
  let score = 0;

  // Screen width
  if (width >= 1440) score += 2;
  else if (width >= 768) score += 1;

  // Device pixel ratio (high DPR = more render cost)
  if (dpr <= 1) score += 1;
  else if (dpr <= 2) score += 0.5;

  // CPU cores
  if (cores >= 8) score += 1;
  else if (cores >= 4) score += 0.5;

  // Memory
  if (memory >= 8) score += 1;
  else if (memory >= 4) score += 0.5;

  if (score >= 3.5) return 'high';
  if (score >= 1.5) return 'mid';
  return 'low';
}

const TIER_CONFIG: Record<'high' | 'mid' | 'low', AdaptiveParticleConfig> = {
  high: { count: 1000, size: 0.03, opacity: 0.55, tier: 'high' },
  mid:  { count: 480,  size: 0.035, opacity: 0.5, tier: 'mid' },
  low:  { count: 200,  size: 0.04,  opacity: 0.45, tier: 'low' },
};

export function useAdaptiveParticles(): AdaptiveParticleConfig {
  return useMemo(() => {
    const tier = getDeviceTier();
    return TIER_CONFIG[tier];
  }, []);
}
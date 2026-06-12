import { useMemo } from 'react';

// ─── Global Type Extensions ─────────────────────────────────────────────────
// Safely extends the Window/Navigator objects for non-standard APIs
// without resorting to 'any' type casting.
declare global {
  interface Navigator {
    deviceMemory?: number;
  }
}

// ─── Types & Config ─────────────────────────────────────────────────────────

export interface AdaptiveParticleConfig {
  count: number;
  size: number;
  opacity: number;
  tier: 'high' | 'mid' | 'low';
}

const TIER_CONFIG: Record<'high' | 'mid' | 'low', AdaptiveParticleConfig> = {
  high: { count: 1000, size: 0.03, opacity: 0.55, tier: 'high' },
  mid:  { count: 480,  size: 0.035, opacity: 0.5, tier: 'mid' },
  low:  { count: 200,  size: 0.04,  opacity: 0.45, tier: 'low' },
};

// ─── Hardware Profiling Logic ───────────────────────────────────────────────

function getDeviceTier(): 'high' | 'mid' | 'low' {
  // SSR Guard
  if (typeof window === 'undefined') return 'mid';

  // Accessibility circuit breaker
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return 'low';

  // Safe hardware polling
  const width = window.screen.width;
  const dpr = window.devicePixelRatio ?? 1;
  const cores = navigator.hardwareConcurrency ?? 4;
  
  // Clean, strictly-typed access to deviceMemory (defaults to 4GB if blocked by privacy extensions)
  const memory = navigator.deviceMemory || 4; 

  // Score system: 0-5 points
  let score = 0;

  // 1. Screen width (Larger screens usually imply desktop/plugged-in power)
  if (width >= 1440) score += 2;
  else if (width >= 768) score += 1;

  // 2. Device Pixel Ratio (High DPR = massive fragment shader cost -> penalty applied)
  if (dpr <= 1) score += 1;
  else if (dpr <= 2) score += 0.5;

  // 3. CPU Cores (Proxy for parallel processing power)
  if (cores >= 8) score += 1;
  else if (cores >= 4) score += 0.5;

  // 4. Memory Cache Limit
  if (memory >= 8) score += 1;
  else if (memory >= 4) score += 0.5;

  // Tier Evaluation
  if (score >= 3.5) return 'high';
  if (score >= 1.5) return 'mid';
  return 'low';
}

// ─── React Hook ─────────────────────────────────────────────────────────────

/**
 * Assesses client hardware constraints to determine safe rendering thresholds.
 * Evaluates strictly on mount to prevent expensive WebGL buffer re-allocations 
 * during window resizing.
 */
export function useAdaptiveParticles(): AdaptiveParticleConfig {
  return useMemo(() => {
    const tier = getDeviceTier();
    return TIER_CONFIG[tier];
  }, []);
}
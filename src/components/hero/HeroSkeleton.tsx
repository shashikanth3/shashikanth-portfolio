import React from 'react';

// Animated shimmer bar
const Shimmer: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div
    className={`relative overflow-hidden rounded bg-slate-800/70 before:absolute before:inset-0 before:-translate-x-full before:bg-gradient-to-r before:from-transparent before:via-slate-600/20 before:to-transparent before:animate-[shimmer_1.6s_infinite] ${className}`}
  />
);

// Pulsing node circle
const NodeCircle: React.FC<{ size?: number; delay?: string; glow?: string }> = ({
  size = 12,
  delay = '0s',
  glow = 'rgba(0,212,255,0.2)',
}) => (
  <div
    className="rounded-full bg-slate-700/80 border border-slate-600/50 animate-pulse flex-shrink-0"
    style={{
      width: size,
      height: size,
      animationDelay: delay,
      boxShadow: `0 0 12px ${glow}`,
    }}
  />
);

const HeroSkeleton: React.FC = () => {
  const nodes = [
    { x: 22, y: 40, size: 14, delay: '0s' },
    { x: 65, y: 25, size: 18, delay: '0.3s' },
    { x: 78, y: 60, size: 14, delay: '0.6s' },
    { x: 35, y: 70, size: 10, delay: '0.9s' },
    { x: 52, y: 50, size: 10, delay: '0.15s' },
  ];

  const edges = [
    [0, 1], [0, 4], [1, 2], [1, 4], [2, 3], [3, 4],
  ];

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#0a0e17]">
      {/* Background network canvas */}
      <div className="absolute inset-0">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
          {/* Edge lines */}
          {edges.map(([a, b], i) => (
            <line
              key={i}
              x1={nodes[a].x} y1={nodes[a].y}
              x2={nodes[b].x} y2={nodes[b].y}
              stroke="#1e2d45"
              strokeWidth="0.3"
              strokeOpacity="0.6"
            />
          ))}
          {/* Node circles in SVG for bg layer */}
          {nodes.map((n, i) => (
            <circle
              key={i}
              cx={n.x} cy={n.y}
              r={n.size / 8}
              fill="none"
              stroke="#00d4ff"
              strokeWidth="0.15"
              strokeOpacity="0.25"
            />
          ))}
        </svg>
      </div>

      {/* Hero content skeleton */}
      <div className="relative z-10 text-center w-full max-w-3xl px-6 flex flex-col items-center gap-5">
        {/* Eyebrow label */}
        <div className="flex items-center gap-2">
          <div className="w-6 h-px bg-slate-700" />
          <Shimmer className="w-36 h-3" />
        </div>

        {/* H1 — two lines */}
        <div className="w-full flex flex-col items-center gap-3">
          <Shimmer className="w-[70%] h-10 md:h-14" />
          <Shimmer className="w-[85%] h-10 md:h-14" />
        </div>

        {/* Subtitle */}
        <div className="flex flex-col items-center gap-2 w-full">
          <Shimmer className="w-[60%] h-4" />
          <Shimmer className="w-[45%] h-4" />
        </div>

        {/* Buttons */}
        <div className="flex gap-4 mt-2">
          <Shimmer className="w-40 h-11 rounded-lg" />
          <Shimmer className="w-32 h-11 rounded-lg" />
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
        <div className="w-6 h-10 border-2 border-slate-700 rounded-full flex justify-center animate-pulse">
          <div className="w-1 h-2 bg-slate-600 rounded-full mt-2" />
        </div>
      </div>

      <style>{`
        @keyframes shimmer {
          100% { transform: translateX(200%); }
        }
      `}</style>
    </section>
  );
};

export default HeroSkeleton;
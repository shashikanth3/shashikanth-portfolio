import React, { useEffect, useRef } from 'react';

interface SkeletonNode {
  x: number;
  y: number;
  r: number;
  delay: number;
}

const NODES: SkeletonNode[] = [
  { x: 400, y: 240, r: 22, delay: 0 },
  { x: 160, y: 140, r: 18, delay: 0.3 },
  { x: 640, y: 140, r: 18, delay: 0.6 },
  { x: 160, y: 340, r: 18, delay: 0.2 },
  { x: 640, y: 340, r: 18, delay: 0.8 },
  { x: 400, y: 420, r: 14, delay: 0.45 },
];

const EDGES: [number, number][] = [
  [0, 1], [0, 2], [0, 3], [0, 4], [0, 5],
  [1, 3], [2, 4],
];

const GraphSkeleton: React.FC<{ height?: number }> = ({ height = 500 }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;
    const svg = svgRef.current;

    const lines = svg.querySelectorAll<SVGLineElement>('.skel-edge');
    lines.forEach((line, i) => {
      const len = line.getTotalLength?.() ?? 200;
      line.style.strokeDasharray = `${len}`;
      line.style.strokeDashoffset = `${len}`;
      line.style.animation = `dashIn 0.8s ease forwards`;
      line.style.animationDelay = `${i * 0.12}s`;
    });
  }, []);

  return (
    <div className="w-full bg-[#0f1520] rounded-xl overflow-hidden border border-[#1e2d45]">
      <svg
        ref={svgRef}
        viewBox={`0 0 800 ${height}`}
        className="w-full"
        style={{ height }}
        aria-hidden
      >
        {/* Hidden edge paths for packet motion (must be before packets) */}
        {EDGES.map(([a, b], i) => {
          const na = NODES[a];
          const nb = NODES[b];
          return (
            <path
              key={`path-${i}`}
              id={`edge-path-${i}`}
              d={`M${na.x},${na.y} L${nb.x},${nb.y}`}
              fill="none"
              stroke="none"
            />
          );
        })}

        {/* Edges (static lines) */}
        {EDGES.map(([a, b], i) => {
          const na = NODES[a];
          const nb = NODES[b];
          return (
            <line
              key={`edge-${i}`}
              className="skel-edge"
              x1={na.x}
              y1={na.y}
              x2={nb.x}
              y2={nb.y}
              stroke="#1e3a52"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          );
        })}

        {/* Travelling packet dots */}
        {EDGES.map((_, i) => (
          <circle key={`packet-${i}`} r="3" fill="#00d4ff" opacity="0.7">
            <animateMotion
              dur={`${1.8 + i * 0.3}s`}
              repeatCount="indefinite"
              begin={`${i * 0.4}s`}
            >
              <mpath href={`#edge-path-${i}`} />
            </animateMotion>
          </circle>
        ))}

        {/* Nodes */}
        {NODES.map((n, i) => (
          <g key={`node-${i}`}>
            {/* Outer pulse ring */}
            <circle
              cx={n.x}
              cy={n.y}
              r={n.r + 6}
              fill="none"
              stroke="#00d4ff"
              strokeWidth="1"
              opacity="0"
            >
              <animate
                attributeName="r"
                values={`${n.r};${n.r + 18}`}
                dur="2s"
                begin={`${n.delay}s`}
                repeatCount="indefinite"
              />
              <animate
                attributeName="opacity"
                values="0.4;0"
                dur="2s"
                begin={`${n.delay}s`}
                repeatCount="indefinite"
              />
            </circle>

            {/* Node body */}
            <circle
              cx={n.x}
              cy={n.y}
              r={n.r}
              fill="#0f1520"
              stroke="#1e3a52"
              strokeWidth="2"
            >
              <animate
                attributeName="stroke"
                values="#1e3a52;#00d4ff;#1e3a52"
                dur="2.4s"
                begin={`${n.delay}s`}
                repeatCount="indefinite"
              />
            </circle>

            {/* Shimmer bar inside node */}
            <rect
              x={n.x - n.r * 0.45}
              y={n.y - 3}
              width={n.r * 0.9}
              height={5}
              rx="2"
              fill="#1e3a52"
            >
              <animate
                attributeName="fill"
                values="#1e3a52;#2a4f6a;#1e3a52"
                dur="1.6s"
                begin={`${n.delay + 0.2}s`}
                repeatCount="indefinite"
              />
            </rect>
          </g>
        ))}
      </svg>

      <div className="px-4 pb-4 flex gap-3 items-center">
        <div className="w-24 h-3 rounded bg-slate-800 animate-pulse" />
        <div className="w-16 h-3 rounded bg-slate-800/60 animate-pulse" style={{ animationDelay: '0.3s' }} />
      </div>

      <style>{`
        @keyframes dashIn {
          to { stroke-dashoffset: 0; }
        }
      `}</style>
    </div>
  );
};

export default GraphSkeleton;
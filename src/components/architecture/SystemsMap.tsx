import React, { useState } from 'react';
import { Train, Gamepad2, FileMusic, Database, WifiOff, RefreshCw, Zap, Shield, GitMerge } from 'lucide-react';

// Color mapping (hex values for consistent styling)
const COLOR_MAP = {
  cyan: '#22d3ee',
  indigo: '#818cf8',
  teal: '#14b8a6',
};

// --- DATA LAYER ---
// Coordinates on a 1000x600 virtual grid; will scale responsively
const PROJECTS = [
  { id: 'freight', name: 'Freight Desk', type: 'Logistics', x: 150, y: 150, icon: <Train size={20} />, color: 'cyan' },
  { id: 'moonveil', name: 'Moonveil', type: 'Multiplayer', x: 150, y: 300, icon: <Gamepad2 size={20} />, color: 'indigo' },
  { id: 'lyrics', name: 'Shyam Vault', type: 'Storage', x: 150, y: 450, icon: <FileMusic size={20} />, color: 'teal' },
];

const PARADIGMS = [
  { id: 'offline', name: 'Offline-First DB', x: 850, y: 80, icon: <WifiOff size={18} /> },
  { id: 'realtime', name: 'Real-Time Net', x: 850, y: 190, icon: <Zap size={18} /> },
  { id: 'healing', name: 'Self-Healing GC', x: 850, y: 300, icon: <RefreshCw size={18} /> },
  { id: 'resolver', name: 'Action Resolver', x: 850, y: 410, icon: <GitMerge size={18} /> },
  { id: 'crypto', name: 'Crypto Sync', x: 850, y: 520, icon: <Shield size={18} /> },
];

const CONNECTIONS = [
  { from: 'freight', to: 'offline', color: 'cyan' },
  { from: 'freight', to: 'healing', color: 'cyan' },
  { from: 'moonveil', to: 'realtime', color: 'indigo' },
  { from: 'moonveil', to: 'resolver', color: 'indigo' },
  { from: 'lyrics', to: 'offline', color: 'teal' },
  { from: 'lyrics', to: 'healing', color: 'teal' },
  { from: 'lyrics', to: 'crypto', color: 'teal' },
];

const SystemsMap: React.FC = () => {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  const isConnectionActive = (from: string, to: string) => {
    if (!hoveredNode) return false;
    return hoveredNode === from || hoveredNode === to;
  };

  const isNodeActive = (id: string) => {
    if (!hoveredNode) return false;
    if (hoveredNode === id) return true;
    return CONNECTIONS.some(
      (conn) =>
        (conn.from === hoveredNode && conn.to === id) ||
        (conn.to === hoveredNode && conn.from === id)
    );
  };

  // Helper to get the hex color for a connection
  const getConnectionColor = (colorKey: string) => {
    return COLOR_MAP[colorKey as keyof typeof COLOR_MAP] || '#00d4ff';
  };

  // Generate SVG path for a smooth S-curve
  const getPathD = (from: { x: number; y: number }, to: { x: number; y: number }) => {
    const dx = to.x - from.x;
    const cp1x = from.x + dx * 0.4;
    const cp2x = to.x - dx * 0.4;
    return `M ${from.x} ${from.y} C ${cp1x} ${from.y}, ${cp2x} ${to.y}, ${to.x} ${to.y}`;
  };

  return (
    <div className="w-full max-w-6xl mx-auto bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-sm">
      {/* Header bar */}
      <div className="bg-slate-900/80 border-b border-slate-800 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Database className="text-cyan-400" size={18} />
          <h3 className="text-white font-bold tracking-wide">Ecosystem Topography</h3>
        </div>
        <span className="text-[10px] text-slate-500 font-mono tracking-widest uppercase">
          {hoveredNode ? 'Routing Active' : 'Hover any node'}
        </span>
      </div>

      {/* Interactive Map Canvas */}
      <div className="w-full overflow-x-auto custom-scrollbar">
        <div className="relative min-w-[800px] w-full aspect-[16/9] lg:aspect-[2/1] mx-auto select-none">
          {/* SVG Connections Layer */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox="0 0 1000 600"
            preserveAspectRatio="none"
          >
            {CONNECTIONS.map((conn, idx) => {
              const fromNode = PROJECTS.find(p => p.id === conn.from);
              const toNode = PARADIGMS.find(p => p.id === conn.to);
              if (!fromNode || !toNode) return null;
              
              const pathD = getPathD(fromNode, toNode);
              const active = isConnectionActive(conn.from, conn.to);
              const color = getConnectionColor(conn.color);
              
              return (
                <g key={idx}>
                  {/* Background faint line */}
                  <path
                    d={pathD}
                    fill="none"
                    stroke="#1e293b"
                    strokeWidth="2"
                    className="transition-opacity duration-300"
                  />
                  {/* Active animated line */}
                  {hoveredNode && (
                    <path
                      d={pathD}
                      fill="none"
                      stroke={active ? color : 'transparent'}
                      strokeWidth={active ? "2.5" : "1"}
                      strokeDasharray="8 8"
                      className={`transition-all duration-300 ${active ? 'animate-flow' : ''}`}
                      style={{ opacity: active ? 1 : 0.15 }}
                    />
                  )}
                </g>
              );
            })}
          </svg>

          {/* Project Nodes (Left side) */}
          {PROJECTS.map((project) => {
            const active = isNodeActive(project.id);
            const isHovered = hoveredNode === project.id;
            const colorHex = COLOR_MAP[project.color as keyof typeof COLOR_MAP];
            const bgActive = isHovered ? `${colorHex}20` : '#0f172a';
            const borderActive = isHovered ? colorHex : '#334155';
            const textActive = isHovered ? 'text-white' : 'text-slate-300';
            
            return (
              <div
                key={project.id}
                onMouseEnter={() => setHoveredNode(project.id)}
                onMouseLeave={() => setHoveredNode(null)}
                className={`absolute flex items-center gap-4 cursor-crosshair transition-all duration-500 ease-out`}
                style={{
                  left: `${(project.x / 1000) * 100}%`,
                  top: `${(project.y / 600) * 100}%`,
                  transform: `translate(-50%, -50%) scale(${isHovered ? 1.08 : 1})`,
                  opacity: hoveredNode ? (active ? 1 : 0.3) : 0.9,
                  zIndex: isHovered ? 50 : 10,
                }}
              >
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center border-2 shadow-lg transition-all"
                  style={{
                    backgroundColor: bgActive,
                    borderColor: borderActive,
                    color: isHovered ? colorHex : '#94a3b8',
                    boxShadow: isHovered ? `0 0 20px ${colorHex}40` : 'none',
                  }}
                >
                  {project.icon}
                </div>
                <div className="w-32">
                  <div
                    className="text-[10px] font-mono tracking-wider uppercase"
                    style={{ color: isHovered ? colorHex : '#64748b' }}
                  >
                    {project.type}
                  </div>
                  <div className={`font-bold whitespace-nowrap ${textActive}`}>
                    {project.name}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Paradigm Nodes (Right side) */}
          {PARADIGMS.map((paradigm) => {
            const active = isNodeActive(paradigm.id);
            const isHovered = hoveredNode === paradigm.id;
            
            // For paradigms, use white highlight when hovered (since they have no project color)
            
            return (
              <div
                key={paradigm.id}
                onMouseEnter={() => setHoveredNode(paradigm.id)}
                onMouseLeave={() => setHoveredNode(null)}
                className={`absolute flex items-center justify-end gap-3 cursor-crosshair transition-all duration-500 ease-out`}
                style={{
                  left: `${(paradigm.x / 1000) * 100}%`,
                  top: `${(paradigm.y / 600) * 100}%`,
                  transform: `translate(-50%, -50%) scale(${isHovered ? 1.05 : 1})`,
                  opacity: hoveredNode ? (active ? 1 : 0.3) : 0.9,
                  zIndex: isHovered ? 50 : 10,
                }}
              >
                <div className="text-right w-36">
                  <div className={`font-semibold text-sm whitespace-nowrap ${isHovered ? 'text-white' : 'text-slate-300'}`}>
                    {paradigm.name}
                  </div>
                </div>
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center border transition-all"
                  style={{
                    backgroundColor: isHovered ? '#f8fafc' : '#1e293b',
                    borderColor: isHovered ? '#cbd5e1' : '#334155',
                    color: isHovered ? '#0f172a' : '#94a3b8',
                    boxShadow: isHovered ? '0 0 15px rgba(255,255,255,0.3)' : 'none',
                  }}
                >
                  {paradigm.icon}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tailwind Animation Keyframes */}
      <style>{`
        @keyframes flow {
          to { stroke-dashoffset: -16; }
        }
        .animate-flow {
          animation: flow 1s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default SystemsMap;
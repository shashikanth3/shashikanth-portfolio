import React, { useState } from 'react';
import { Train, Gamepad2, FileMusic, Database, WifiOff, RefreshCw, Zap, Shield, GitMerge } from 'lucide-react';

// --- DATA LAYER ---
// We use a 1000x600 coordinate system. The UI will responsively scale to fit the screen.
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
  // Freight Desk connects to...
  { from: 'freight', to: 'offline', color: 'cyan' },
  { from: 'freight', to: 'healing', color: 'cyan' },
  // Moonveil connects to...
  { from: 'moonveil', to: 'realtime', color: 'indigo' },
  { from: 'moonveil', to: 'resolver', color: 'indigo' },
  // Shyam Vault connects to...
  { from: 'lyrics', to: 'offline', color: 'teal' },
  { from: 'lyrics', to: 'healing', color: 'teal' },
  { from: 'lyrics', to: 'crypto', color: 'teal' },
];

const SystemsMap: React.FC = () => {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  // Helper to determine if a line should be highlighted
  const isConnectionActive = (from: string, to: string) => {
    if (!hoveredNode) return true; // Show all lightly if nothing is hovered
    return hoveredNode === from || hoveredNode === to;
  };

  // Helper to determine if a node should be highlighted
  const isNodeActive = (id: string) => {
    if (!hoveredNode) return true;
    if (hoveredNode === id) return true;
    
    // Check if it's connected to the hovered node
    return CONNECTIONS.some(
      (conn) => (conn.from === hoveredNode && conn.to === id) || (conn.to === hoveredNode && conn.from === id)
    );
  };

  return (
    <div className="w-full max-w-6xl mx-auto bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-sm">
      
      {/* Header bar */}
      <div className="bg-slate-900/80 border-b border-slate-800 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Database className="text-cyan-400" size={18} />
          <h3 className="text-white font-bold tracking-wide">Ecosystem Topography</h3>
        </div>
        <span className="text-[10px] text-slate-500 font-mono tracking-widest uppercase animate-pulse">
          Live Routing Active
        </span>
      </div>

      {/* Interactive Map Canvas */}
      {/* We use overflow-x-auto so on mobile devices, the user can pan across the map without it shrinking too much to read */}
      <div className="w-full overflow-x-auto custom-scrollbar">
        <div className="relative min-w-[800px] w-full aspect-[16/9] lg:aspect-[2/1] mx-auto select-none">
          
          {/* 1. THE SVG CONNECTIONS (Drawn Behind) */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 1000 600" preserveAspectRatio="none">
            {CONNECTIONS.map((conn, idx) => {
              const fromNode = PROJECTS.find(p => p.id === conn.from)!;
              const toNode = PARADIGMS.find(p => p.id === conn.to)!;
              
              // Calculate a smooth S-curve (Bézier) between nodes
              const pathD = `M ${fromNode.x} ${fromNode.y} C ${fromNode.x + 300} ${fromNode.y}, ${toNode.x - 300} ${toNode.y}, ${toNode.x} ${toNode.y}`;
              const active = isConnectionActive(conn.from, conn.to);
              
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
                  {/* Highlighted animated line */}
                  <path 
                    d={pathD} 
                    fill="none" 
                    stroke={active ? `var(--color-${conn.color}-400, #00d4ff)` : 'transparent'} 
                    strokeWidth={active && hoveredNode ? "3" : "1"} 
                    strokeDasharray="8 8"
                    className={`transition-all duration-300 ${active && hoveredNode ? 'opacity-100 animate-[flow_1s_linear_infinite]' : 'opacity-20'}`}
                  />
                </g>
              );
            })}
          </svg>

          {/* 2. THE HTML NODES (Positioned absolutely over the SVG) */}
          
          {/* Project Nodes (Left) */}
          {PROJECTS.map((project) => {
            const active = isNodeActive(project.id);
            const isHoveredSelf = hoveredNode === project.id;
            
            return (
              <div 
                key={project.id}
                onMouseEnter={() => setHoveredNode(project.id)}
                onMouseLeave={() => setHoveredNode(null)}
                className={`absolute flex items-center gap-4 cursor-crosshair transition-all duration-500 ease-out`}
                style={{ 
                  left: `${(project.x / 1000) * 100}%`, 
                  top: `${(project.y / 600) * 100}%`,
                  transform: `translate(-50%, -50%) scale(${isHoveredSelf ? 1.1 : 1})`,
                  opacity: active ? 1 : 0.2,
                  zIndex: isHoveredSelf ? 50 : 10
                }}
              >
                <div className={`
                  w-14 h-14 rounded-xl flex items-center justify-center border-2 shadow-lg transition-colors
                  ${isHoveredSelf ? `bg-${project.color}-500/20 border-${project.color}-400 text-${project.color}-400 shadow-[0_0_20px_rgba(var(--color-${project.color}-500),0.3)]` : 'bg-slate-900 border-slate-700 text-slate-400'}
                `}>
                  {project.icon}
                </div>
                <div className="w-32">
                  <div className={`text-[10px] font-mono tracking-wider uppercase ${isHoveredSelf ? `text-${project.color}-400` : 'text-slate-500'}`}>
                    {project.type}
                  </div>
                  <div className={`font-bold whitespace-nowrap ${isHoveredSelf ? 'text-white' : 'text-slate-300'}`}>
                    {project.name}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Paradigm Nodes (Right) */}
          {PARADIGMS.map((paradigm) => {
            const active = isNodeActive(paradigm.id);
            const isHoveredSelf = hoveredNode === paradigm.id;
            
            return (
              <div 
                key={paradigm.id}
                onMouseEnter={() => setHoveredNode(paradigm.id)}
                onMouseLeave={() => setHoveredNode(null)}
                className={`absolute flex items-center justify-end gap-3 cursor-crosshair transition-all duration-500 ease-out`}
                style={{ 
                  left: `${(paradigm.x / 1000) * 100}%`, 
                  top: `${(paradigm.y / 600) * 100}%`,
                  transform: `translate(-50%, -50%) scale(${isHoveredSelf ? 1.05 : 1})`,
                  opacity: active ? 1 : 0.2,
                  zIndex: isHoveredSelf ? 50 : 10
                }}
              >
                <div className="text-right w-36">
                  <div className={`font-semibold text-sm whitespace-nowrap ${isHoveredSelf ? 'text-white' : 'text-slate-300'}`}>
                    {paradigm.name}
                  </div>
                </div>
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center border transition-colors
                  ${isHoveredSelf ? 'bg-slate-100 border-white text-slate-900 shadow-[0_0_15px_rgba(255,255,255,0.2)]' : 'bg-slate-800 border-slate-700 text-slate-400'}
                `}>
                  {paradigm.icon}
                </div>
              </div>
            );
          })}

        </div>
      </div>

      {/* SVG Animation Keyframes */}
      <style>{`
        @keyframes flow {
          to { stroke-dashoffset: -16; }
        }
      `}</style>
    </div>
  );
};

export default SystemsMap;
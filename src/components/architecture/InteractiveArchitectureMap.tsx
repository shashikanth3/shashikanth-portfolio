import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Smartphone, Database, RefreshCw, Cloud, ShieldCheck, Cpu } from 'lucide-react';

// --- DATA LAYER ---
const ARCHITECTURE_NODES = [
  {
    id: 'client',
    label: 'React Native UI',
    type: 'Frontend',
    icon: <Smartphone size={24} />,
    color: '#22d3ee', // cyan
    description: 'The offline-first presentation layer. Handles PDF streaming and user interactions without blocking the main thread.',
    tech: ['React Native', 'Reanimated', 'pdf-lib'],
    details: 'Implements a custom binary-search auto-fit algorithm to render heavy tabular PDFs without triggering Out-Of-Memory (OOM) crashes on low-end mobile devices.'
  },
  {
    id: 'database',
    label: 'Local SQLite Matrix',
    type: 'Persistence',
    icon: <Database size={24} />,
    color: '#14b8a6', // teal
    description: 'The single source of truth. A relational metadata matrix that physically decouples data from the binary filesystem.',
    tech: ['SQLite', 'Self-Healing Pragma'],
    details: 'Engineered with a self-healing diagnostic engine. If primary file anchors are deleted, the database automatically prunes orphaned child records to prevent UI lockups.'
  },
  {
    id: 'sync-engine',
    label: 'Warden GC & Sync',
    type: 'Middleware',
    icon: <RefreshCw size={24} />,
    color: '#f59e0b', // amber
    description: 'A background garbage collector and synchronization engine that reconciles local state with cloud state.',
    tech: ['Event Loop', 'MD5 Hashing', 'XOR Crypto'],
    details: 'Prevents storage bloat by using MD5 cryptographic hashing for strict deduplication. Only incrementally syncs modified bytes to conserve extreme bandwidth.'
  },
  {
    id: 'cloud',
    label: 'Google Drive AppData',
    type: 'Cloud',
    icon: <Cloud size={24} />,
    color: '#818cf8', // indigo
    description: 'The hidden, encrypted remote backup layer. Only accessible by the application via OAuth2 tokens.',
    tech: ['Google Drive API', 'REST'],
    details: 'Utilizes hidden AppData directories to ensure users cannot accidentally corrupt or delete backend sync files via their standard Google Drive interface.'
  }
];

const InteractiveArchitectureMap: React.FC = () => {
  const [activeNode, setActiveNode] = useState(ARCHITECTURE_NODES[1]); // Default to DB
  const containerRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [lineCoords, setLineCoords] = useState<{ x1: number; y1: number; x2: number; y2: number }[]>([]);

  // Update SVG line positions on resize and scroll
  const updateLines = () => {
    if (!containerRef.current) return;
    const rects = nodeRefs.current.map(ref => ref?.getBoundingClientRect());
    const containerRect = containerRef.current.getBoundingClientRect();
    const newCoords: { x1: number; y1: number; x2: number; y2: number }[] = [];
    for (let i = 0; i < rects.length - 1; i++) {
      const rectA = rects[i];
      const rectB = rects[i + 1];
      if (rectA && rectB) {
        newCoords.push({
          x1: rectA.left + rectA.width / 2 - containerRect.left,
          y1: rectA.bottom - containerRect.top,
          x2: rectB.left + rectB.width / 2 - containerRect.left,
          y2: rectB.top - containerRect.top,
        });
      }
    }
    setLineCoords(newCoords);
  };

  useEffect(() => {
    updateLines();
    window.addEventListener('resize', updateLines);
    window.addEventListener('scroll', updateLines);
    return () => {
      window.removeEventListener('resize', updateLines);
      window.removeEventListener('scroll', updateLines);
    };
  }, [activeNode]); // Re-run when active node changes (buttons may shift)

  // Helper to get color style (using inline styles to avoid Tailwind purging issues)

  return (
    <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* LEFT SIDE: Interactive Canvas */}
      <div ref={containerRef} className="lg:col-span-7 bg-slate-900/40 border border-slate-800 rounded-2xl p-4 sm:p-8 backdrop-blur-sm relative overflow-hidden min-h-[400px]">
        {/* Animated Background Grid */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
          <div className="w-full h-full bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:20px_20px]"></div>
        </div>

        {/* SVG Lines (only visible on desktop) */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none hidden lg:block"
          style={{ zIndex: 0 }}
        >
          {lineCoords.map((coords, idx) => {
            const colors = ['#22d3ee', '#f59e0b', '#818cf8'];
            return (
              <g key={idx}>
                <line
                  x1={coords.x1}
                  y1={coords.y1}
                  x2={coords.x2}
                  y2={coords.y2}
                  stroke="#334155"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                />
                <line
                  x1={coords.x1}
                  y1={coords.y1}
                  x2={coords.x2}
                  y2={coords.y2}
                  stroke={colors[idx % colors.length]}
                  strokeWidth="2"
                  strokeDasharray="4 4"
                  className="animate-flow"
                />
              </g>
            );
          })}
        </svg>

        {/* Node Buttons */}
        <div className="relative z-10 flex flex-col items-stretch gap-4 w-full max-w-md mx-auto">
          {ARCHITECTURE_NODES.map((node, idx) => {
            const isActive = activeNode.id === node.id;
            return (
              <button
                key={node.id}
                ref={(el) => { nodeRefs.current[idx] = el; }}
                onClick={() => setActiveNode(node)}
                className={`
                  relative flex items-center justify-between w-full p-4 rounded-xl border transition-all duration-300
                  ${isActive 
                    ? 'scale-[1.02] z-10' 
                    : 'bg-slate-900 border-slate-800 hover:border-slate-600 hover:bg-slate-800/80'
                  }
                `}
                style={{
                  backgroundColor: isActive ? `${node.color}10` : undefined,
                  borderColor: isActive ? node.color : undefined,
                  boxShadow: isActive ? `0 0 20px ${node.color}40` : undefined,
                }}
              >
                <div className="flex items-center gap-4">
                  <div 
                    className="p-3 rounded-lg transition-colors"
                    style={{
                      backgroundColor: isActive ? `${node.color}20` : '#1e293b',
                      color: isActive ? node.color : '#94a3b8'
                    }}
                  >
                    {node.icon}
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-mono text-slate-500 mb-0.5">{node.type}</div>
                    <div className={`font-bold ${isActive ? 'text-white' : 'text-slate-300'}`}>{node.label}</div>
                  </div>
                </div>
                {isActive && (
                  <div 
                    className="w-2 h-2 rounded-full animate-pulse"
                    style={{ backgroundColor: node.color }}
                  ></div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* RIGHT SIDE: Dynamic Info Panel */}
      <div className="lg:col-span-5 flex flex-col justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeNode.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col h-full"
          >
            <div 
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border w-fit mb-6"
              style={{
                backgroundColor: `${activeNode.color}10`,
                borderColor: `${activeNode.color}30`,
                color: activeNode.color
              }}
            >
              <Cpu size={14} />
              <span className="text-xs font-bold tracking-widest uppercase">Node Inspection</span>
            </div>
            <h3 className="text-3xl font-black text-white mb-2">{activeNode.label}</h3>
            <p className="text-slate-400 text-lg mb-8 leading-relaxed">{activeNode.description}</p>
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 relative overflow-hidden group">
              <div 
                className="absolute top-0 left-0 w-1 h-full"
                style={{ backgroundColor: activeNode.color }}
              ></div>
              <div className="flex items-center gap-2 mb-4 text-slate-300">
                <ShieldCheck size={18} style={{ color: activeNode.color }} />
                <h4 className="font-bold text-sm uppercase tracking-wider">Engineering Impact</h4>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">{activeNode.details}</p>
              <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-800">
                <span className="text-xs font-mono text-slate-500 py-1 mr-2">STACK:</span>
                {activeNode.tech.map(t => (
                  <span key={t} className="px-2.5 py-1 text-[10px] font-mono text-slate-300 bg-slate-800 rounded border border-slate-700">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Global animation for flow lines */}
      <style>{`
        @keyframes flow {
          to { stroke-dashoffset: -8; }
        }
        .animate-flow {
          animation: flow 2s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default InteractiveArchitectureMap;
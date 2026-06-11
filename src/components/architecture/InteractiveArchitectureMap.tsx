import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Smartphone, Database, RefreshCw, Cloud, ShieldCheck, Cpu } from 'lucide-react';

// --- DATA LAYER ---
const ARCHITECTURE_NODES = [
  {
    id: 'client',
    label: 'React Native UI',
    type: 'Frontend',
    icon: <Smartphone size={24} />,
    color: 'cyan',
    description: 'The offline-first presentation layer. Handles PDF streaming and user interactions without blocking the main thread.',
    tech: ['React Native', 'Reanimated', 'pdf-lib'],
    details: 'Implements a custom binary-search auto-fit algorithm to render heavy tabular PDFs without triggering Out-Of-Memory (OOM) crashes on low-end mobile devices.'
  },
  {
    id: 'database',
    label: 'Local SQLite Matrix',
    type: 'Persistence',
    icon: <Database size={24} />,
    color: 'teal',
    description: 'The single source of truth. A relational metadata matrix that physically decouples data from the binary filesystem.',
    tech: ['SQLite', 'Self-Healing Pragma'],
    details: 'Engineered with a self-healing diagnostic engine. If primary file anchors are deleted, the database automatically prunes orphaned child records to prevent UI lockups.'
  },
  {
    id: 'sync-engine',
    label: 'Warden GC & Sync',
    type: 'Middleware',
    icon: <RefreshCw size={24} />,
    color: 'amber',
    description: 'A background garbage collector and synchronization engine that reconciles local state with cloud state.',
    tech: ['Event Loop', 'MD5 Hashing', 'XOR Crypto'],
    details: 'Prevents storage bloat by using MD5 cryptographic hashing for strict deduplication. Only incrementally syncs modified bytes to conserve extreme bandwidth.'
  },
  {
    id: 'cloud',
    label: 'Google Drive AppData',
    type: 'Cloud',
    icon: <Cloud size={24} />,
    color: 'indigo',
    description: 'The hidden, encrypted remote backup layer. Only accessible by the application via OAuth2 tokens.',
    tech: ['Google Drive API', 'REST'],
    details: 'Utilizes hidden AppData directories to ensure users cannot accidentally corrupt or delete backend sync files via their standard Google Drive interface.'
  }
];

const InteractiveArchitectureMap: React.FC = () => {
  const [activeNode, setActiveNode] = useState(ARCHITECTURE_NODES[1]); // Default to DB

  return (
    <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
      
      {/* LEFT SIDE: The Interactive Canvas */}
      <div className="lg:col-span-7 bg-slate-900/40 border border-slate-800 rounded-2xl p-8 backdrop-blur-sm relative overflow-hidden flex flex-col items-center justify-center min-h-[400px]">
        
        {/* Animated Background Grid */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
          <div className="w-full h-full bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:20px_20px]"></div>
        </div>

        {/* --- THE TOPOLOGY MAP --- */}
        <div className="relative w-full max-w-md mx-auto aspect-square flex flex-col justify-between z-10">
          
          {/* Animated SVG Connections (Drawn behind the nodes) */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: -1 }}>
            {/* Vertical Line 1: App to DB */}
            <line x1="50%" y1="15%" x2="50%" y2="38%" stroke="#334155" strokeWidth="2" strokeDasharray="4 4" />
            <line x1="50%" y1="15%" x2="50%" y2="38%" stroke="#22d3ee" strokeWidth="2" strokeDasharray="4 4" className="animate-[flow_2s_linear_infinite]" />
            
            {/* Vertical Line 2: DB to Sync */}
            <line x1="50%" y1="38%" x2="50%" y2="62%" stroke="#334155" strokeWidth="2" strokeDasharray="4 4" />
            <line x1="50%" y1="38%" x2="50%" y2="62%" stroke="#f5a623" strokeWidth="2" strokeDasharray="4 4" className="animate-[flow_2s_linear_infinite]" />
            
            {/* Vertical Line 3: Sync to Cloud */}
            <line x1="50%" y1="62%" x2="50%" y2="85%" stroke="#334155" strokeWidth="2" strokeDasharray="4 4" />
            <line x1="50%" y1="62%" x2="50%" y2="85%" stroke="#818cf8" strokeWidth="2" strokeDasharray="4 4" className="animate-[flow_2s_linear_infinite]" />
          </svg>

          {/* Map the 4 Nodes Vertically */}
          {ARCHITECTURE_NODES.map((node) => {
            const isActive = activeNode.id === node.id;
            return (
              <button
                key={node.id}
                onClick={() => setActiveNode(node)}
                className={`
                  relative flex items-center justify-between w-full max-w-sm mx-auto p-4 rounded-xl border transition-all duration-300
                  ${isActive 
                    ? `bg-${node.color}-500/10 border-${node.color}-500 shadow-[0_0_20px_rgba(var(--color-${node.color}-500),0.15)] scale-105 z-10` 
                    : 'bg-slate-900 border-slate-800 hover:border-slate-600 hover:bg-slate-800/80'
                  }
                `}
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-lg ${isActive ? `bg-${node.color}-500/20 text-${node.color}-400` : 'bg-slate-800 text-slate-400'}`}>
                    {node.icon}
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-mono text-slate-500 mb-0.5">{node.type}</div>
                    <div className={`font-bold ${isActive ? 'text-white' : 'text-slate-300'}`}>{node.label}</div>
                  </div>
                </div>
                
                {/* Active Indicator Pulse */}
                {isActive && (
                  <div className={`w-2 h-2 rounded-full bg-${node.color}-400 animate-pulse`}></div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* RIGHT SIDE: Dynamic Information Panel */}
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
            {/* Header */}
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md border w-fit mb-6 bg-${activeNode.color}-500/10 border-${activeNode.color}-500/30 text-${activeNode.color}-400`}>
              <Cpu size={14} />
              <span className="text-xs font-bold tracking-widest uppercase">Node Inspection</span>
            </div>

            <h3 className="text-3xl font-black text-white mb-2">{activeNode.label}</h3>
            <p className="text-slate-400 text-lg mb-8 leading-relaxed">
              {activeNode.description}
            </p>

            {/* Architecture Details Card */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 relative overflow-hidden group">
              <div className={`absolute top-0 left-0 w-1 h-full bg-${activeNode.color}-500`}></div>
              
              <div className="flex items-center gap-2 mb-4 text-slate-300">
                <ShieldCheck size={18} className={`text-${activeNode.color}-400`} />
                <h4 className="font-bold text-sm uppercase tracking-wider">Engineering Impact</h4>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                {activeNode.details}
              </p>

              {/* Tech Stack Pills */}
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

      {/* Tailwind Animation for Data Flow Lines */}
      <style>{`
        @keyframes flow {
          to { stroke-dashoffset: -8; }
        }
      `}</style>

    </div>
  );
};

export default InteractiveArchitectureMap;
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Database, Network, Shield, Terminal, 
   ServerCrash, Activity, Zap, Cpu, RefreshCw 
} from 'lucide-react';
import { projectsData } from '../../data/projects';

// --- TYPES & ICONS ---
type ProjectId = 'freight-desk' | 'moonveil' | 'shyam-lyrics-vault';

const PROJECT_META = {
  'freight-desk': { icon: Database, color: 'cyan', hex: '#22d3ee', tag: 'RELATIONAL MATRIX' },
  'moonveil': { icon: Network, color: 'indigo', hex: '#818cf8', tag: 'DECENTRALIZED P2P' },
  'shyam-lyrics-vault': { icon: Shield, color: 'teal', hex: '#14b8a6', tag: 'SECURE OFFLINE-FIRST' }
};

const CHAOS_SCENARIOS = {
  'freight-desk': {
    button: 'Delete Primary Anchors',
    desc: 'Simulates orphaned records in SQLite',
    logs: [
      { t: 0, msg: 'CRITICAL: 408 primary PTP anchors deleted unexpectedly.', type: 'error' },
      { t: 800, msg: 'WARNING: 1,204 orphaned child records detected.', type: 'warn' },
      { t: 1600, msg: 'ACTION: Running PRAGMA integrity sweep...', type: 'info' },
      { t: 2400, msg: 'ACTION: Pruning orphaned nodes via foreign_key mismatch...', type: 'info' },
      { t: 3400, msg: 'SUCCESS: Matrix stabilized. Zero ghost records.', type: 'success' }
    ]
  },
  'moonveil': {
    button: 'Sever TCP Connection',
    desc: 'Simulates dropped packets during resolution',
    logs: [
      { t: 0, msg: 'CRITICAL: TCP Connection abruptly severed by client.', type: 'error' },
      { t: 800, msg: 'WARNING: Action Queue desynchronized. State mismatch imminent.', type: 'warn' },
      { t: 1600, msg: 'ACTION: Engaging Deterministic Resolver...', type: 'info' },
      { t: 2400, msg: 'ACTION: Replaying missed sequence events via UDP heartbeat...', type: 'info' },
      { t: 3400, msg: 'SUCCESS: Game state perfectly reconciled.', type: 'success' }
    ]
  },
  'shyam-lyrics-vault': {
    button: 'Corrupt File Metadata',
    desc: 'Simulates DB/Filesystem desync',
    logs: [
      { t: 0, msg: 'CRITICAL: Application terminated mid-transaction.', type: 'error' },
      { t: 800, msg: 'WARNING: Physical filesystem desynced from DB metadata.', type: 'warn' },
      { t: 1600, msg: 'ACTION: Booting Warden GC Service...', type: 'info' },
      { t: 2400, msg: 'ACTION: Reconciling binary MD5 hashes against SQLite manifest...', type: 'info' },
      { t: 3400, msg: 'SUCCESS: Orphans purged. Storage bloat eliminated.', type: 'success' }
    ]
  }
};

// --- MINI COMPONENTS ---
const TelemetryStrip = ({ colorHex }: { colorHex: string }) => (
  <div className="flex gap-4 p-3 bg-slate-900/50 border border-slate-800 rounded-lg overflow-hidden">
    <div className="flex items-center gap-2">
      <Activity size={14} style={{ color: colorHex }} className="animate-pulse" />
      <span className="text-[10px] font-mono text-slate-400">MEM: {(Math.random() * 40 + 120).toFixed(1)}MB</span>
    </div>
    <div className="flex items-center gap-2 border-l border-slate-700 pl-4">
      <Cpu size={14} style={{ color: colorHex }} />
      <span className="text-[10px] font-mono text-slate-400">CPU: {(Math.random() * 10 + 2).toFixed(1)}%</span>
    </div>
    <div className="flex items-center gap-2 border-l border-slate-700 pl-4">
      <Zap size={14} style={{ color: colorHex }} />
      <span className="text-[10px] font-mono text-slate-400">STATUS: NOMINAL</span>
    </div>
  </div>
);

// --- MAIN COMPONENT ---
export const EnterpriseShowcase: React.FC = () => {
  const [activeId, setActiveId] = useState<ProjectId>('freight-desk');
  const activeProject = projectsData.find(p => p.id === activeId)!;
  const meta = PROJECT_META[activeId];

  // Chaos Simulator State
  const [chaosState, setChaosState] = useState<'IDLE' | 'SIMULATING' | 'RECOVERED'>('IDLE');
  const [logs, setLogs] = useState<{ msg: string; type: string; time: string }[]>([]);
  const terminalRef = useRef<HTMLDivElement>(null);
  const simTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-scroll terminal
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [logs]);

  // Reset chaos when changing tabs
  useEffect(() => {
    setChaosState('IDLE');
    setLogs([{ msg: 'System idle. Awaiting interference...', type: 'info', time: getTimestamp() }]);
    if (simTimeout.current) clearTimeout(simTimeout.current);
  }, [activeId]);

  const getTimestamp = () => {
    const now = new Date();
    return `${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${now.getMilliseconds().toString().padStart(3, '0')}`;
  };

  const triggerChaos = () => {
    if (chaosState === 'SIMULATING') return;
    setChaosState('SIMULATING');
    setLogs([]);

    const scenario = CHAOS_SCENARIOS[activeId];
    
    scenario.logs.forEach(({ t, msg, type }, index) => {
      simTimeout.current = setTimeout(() => {
        setLogs(prev => [...prev, { msg, type, time: getTimestamp() }]);
        if (index === scenario.logs.length - 1) {
          setChaosState('RECOVERED');
        }
      }, t);
    });
  };

  return (
    <section id="engineering-showcase" className="py-24 px-6 bg-[#0a0e17]">
      <div className="max-w-6xl mx-auto">
        
        <div className="mb-12">
          <h2 className="text-sm font-mono text-cyan-400 tracking-widest uppercase mb-2">Architectural Deep Dives</h2>
          <h3 className="text-4xl md:text-5xl font-black text-white tracking-tight">Engineering Under Pressure.</h3>
        </div>

        {/* 1. NODE SELECTOR */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {projectsData.map((p) => {
            const isSelected = activeId === p.id;
            const pMeta = PROJECT_META[p.id as ProjectId];
            const Icon = pMeta.icon;
            
            return (
              <button
                key={p.id}
                onClick={() => setActiveId(p.id as ProjectId)}
                className={`relative flex flex-col items-start p-5 rounded-xl border text-left transition-all duration-300 ${
                  isSelected 
                    ? `bg-slate-900 border-${pMeta.color}-500 shadow-[0_0_20px_rgba(0,0,0,0.5)]` 
                    : 'bg-slate-900/40 border-slate-800 hover:bg-slate-800'
                }`}
                style={{ borderColor: isSelected ? pMeta.hex : undefined }}
              >
                {isSelected && (
                  <motion.div 
                    layoutId="activeTabOutline" 
                    className="absolute inset-0 rounded-xl border-2 pointer-events-none"
                    style={{ borderColor: pMeta.hex }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg" style={{ backgroundColor: isSelected ? `${pMeta.hex}20` : '#1e293b' }}>
                    <Icon size={20} style={{ color: isSelected ? pMeta.hex : '#64748b' }} />
                  </div>
                  <span className="text-[10px] font-mono tracking-widest uppercase" style={{ color: pMeta.hex }}>
                    {pMeta.tag}
                  </span>
                </div>
                <h4 className={`text-xl font-bold ${isSelected ? 'text-white' : 'text-slate-300'}`}>{p.title}</h4>
              </button>
            );
          })}
        </div>

        {/* 2. ACTIVE PROJECT DASHBOARD */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeId}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col gap-6"
          >
            {/* Header & Telemetry */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4 bg-slate-900 border border-slate-800 rounded-xl p-6">
              <div>
                <h3 className="text-3xl font-black text-white mb-2">{activeProject.title}</h3>
                <p className="text-slate-400 font-mono text-sm">{activeProject.role}  |  {activeProject.domain}</p>
              </div>
              <TelemetryStrip colorHex={meta.hex} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* PACSI MATRIX */}
              <div className="lg:col-span-7 flex flex-col gap-4">
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 h-full">
                  <h4 className="text-xs font-mono tracking-widest text-slate-500 mb-6 uppercase border-b border-slate-800 pb-2">
                    The PACSI Engineering Matrix
                  </h4>
                  
                  <div className="space-y-6">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-800 px-2 py-1 rounded">Problem</span>
                      <p className="text-slate-300 text-sm mt-2 leading-relaxed">{activeProject.pacsi.problem}</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-800 px-2 py-1 rounded">Architecture</span>
                      <p className="text-slate-300 text-sm mt-2 leading-relaxed">{activeProject.pacsi.architecture}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-red-500/5 border border-red-500/10">
                      <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest">Adversarial Challenges</span>
                      <p className="text-slate-300 text-sm mt-2 leading-relaxed">{activeProject.pacsi.challenges}</p>
                    </div>
                    <div className="p-4 rounded-lg" style={{ backgroundColor: `${meta.hex}0A`, borderColor: `${meta.hex}20`, borderWidth: '1px' }}>
                      <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: meta.hex }}>Engineered Solution</span>
                      <p className="text-slate-200 text-sm mt-2 leading-relaxed">{activeProject.pacsi.solution}</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-800 px-2 py-1 rounded">Impact</span>
                      <p className="text-white font-semibold text-sm mt-2 leading-relaxed">{activeProject.pacsi.impact}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. CHAOS INJECTOR */}
              <div className="lg:col-span-5 flex flex-col gap-4">
                <div className="bg-[#050505] border border-slate-800 rounded-xl overflow-hidden flex flex-col h-full shadow-2xl">
                  {/* Terminal Header */}
                  <div className="bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Terminal size={14} className="text-slate-500" />
                      <span className="text-xs font-mono text-slate-400">chaos_monkey_v2.sh</span>
                    </div>
                    {chaosState === 'SIMULATING' && <RefreshCw size={14} className="text-amber-400 animate-spin" />}
                  </div>

                  {/* Terminal Output */}
                  <div ref={terminalRef} className="p-5 h-[280px] overflow-y-auto font-mono text-xs flex flex-col gap-2 scroll-smooth">
                    {logs.map((log, i) => (
                      <div key={i} className="flex gap-3 items-start animate-[fadeSlideIn_0.2s_ease_forwards]">
                        <span className="text-slate-600 flex-shrink-0">[{log.time}]</span>
                        <span className={`
                          ${log.type === 'info' ? 'text-slate-300' : ''}
                          ${log.type === 'warn' ? 'text-amber-400' : ''}
                          ${log.type === 'error' ? 'text-red-400 font-bold' : ''}
                          ${log.type === 'success' ? 'text-teal-400 font-bold' : ''}
                        `}>
                          {log.msg}
                        </span>
                      </div>
                    ))}
                    {chaosState === 'SIMULATING' && (
                      <div className="flex gap-3 items-start mt-1">
                        <span className="text-slate-600">[{getTimestamp()}]</span>
                        <span className="text-slate-500 animate-pulse">_</span>
                      </div>
                    )}
                  </div>

                  {/* Chaos Control Button */}
                  <div className="p-4 bg-slate-900/50 border-t border-slate-800 mt-auto">
                    <button
                      onClick={triggerChaos}
                      disabled={chaosState === 'SIMULATING'}
                      className="w-full flex flex-col items-center justify-center p-3 rounded-lg border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                    >
                      <div className="flex items-center gap-2 text-red-400 font-bold text-sm uppercase tracking-wider mb-1">
                        <ServerCrash size={16} className={chaosState === 'IDLE' ? 'group-hover:animate-bounce' : ''} />
                        {CHAOS_SCENARIOS[activeId].button}
                      </div>
                      <div className="text-[10px] font-mono text-red-400/60">
                        {CHAOS_SCENARIOS[activeId].desc}
                      </div>
                    </button>
                  </div>
                </div>
                
                {/* Tech Stack Pills */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
                  <h4 className="text-[10px] font-mono tracking-widest text-slate-500 mb-3 uppercase">Runtime Environment</h4>
                  <div className="flex flex-wrap gap-2">
                    {activeProject.techStack.map(tech => (
                      <span key={tech} className="px-2.5 py-1 text-[11px] font-mono text-slate-300 bg-slate-800 rounded border border-slate-700">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          </motion.div>
        </AnimatePresence>

      </div>
    </section>
  );
};
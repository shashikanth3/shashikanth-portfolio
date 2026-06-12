import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Network, Smartphone, Server, Database, ShieldAlert, CheckCircle2 } from 'lucide-react';

// ─── Data ────────────────────────────────────────────────────────────────────
const PHASES = [
  {
    id: 'udp',
    title: 'UDP Discovery',
    subtitle: 'Zero-Config Local Networking',
    desc: 'The Host device broadcasts its IP address via UDP to the local subnet. Clients instantly detect the lobby without needing a centralized matchmaking server.',
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/30'
  },
  {
    id: 'tcp',
    title: 'TCP Handshake',
    subtitle: 'Persistent Session Layer',
    desc: 'Once discovered, clients upgrade to a reliable TCP/WebSocket connection. Heartbeat pings maintain the session, preventing disconnects if someone walks out of WiFi range.',
    color: 'text-teal-400',
    bg: 'bg-teal-500/10',
    border: 'border-teal-500/30'
  },
  {
    id: 'resolver',
    title: 'Action Resolver',
    subtitle: 'Deterministic State Machine',
    desc: 'To prevent race conditions (e.g., a Wolf kills at the exact millisecond a Bodyguard protects), the Host queues all packets and processes them via a strict logical hierarchy, ignoring physical network arrival times.',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30'
  },
  {
    id: 'sync',
    title: 'Asymmetric Sync',
    subtitle: 'Anti-Packet Sniffing',
    desc: 'The Host acts as the ultimate source of truth. It strips all hidden roles from the game state before broadcasting, ensuring tech-savvy players cannot intercept packets to cheat.',
    color: 'text-indigo-400',
    bg: 'bg-indigo-500/10',
    border: 'border-indigo-500/30'
  }
];

export const MoonveilImmersive: React.FC = () => {
  const [activePhase, setActivePhase] = useState(0);

  return (
    <div className="py-16 sm:py-24 px-4 sm:px-6 bg-[#05080f] min-h-screen flex items-center">
      <div className="max-w-6xl mx-auto w-full">
        
        {/* Header */}
        <div className="mb-8 sm:mb-12 text-center lg:text-left">
          <div className="text-cyan-400 text-xs sm:text-sm font-mono mb-2 tracking-widest uppercase">Decentralized Multiplayer</div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">Moonveil Network Engine</h2>
          <p className="text-slate-400 mt-3 sm:mt-4 max-w-2xl mx-auto lg:mx-0 text-sm sm:text-base">
            Interactive topology demonstrating zero-latency, authoritative offline multiplayer.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-12">
          
          {/* ── LEFT: INTERACTIVE TOPOLOGY VISUALIZER ── */}
          <div className="lg:col-span-7 bg-[#0a0e17] border border-slate-800 rounded-2xl p-4 sm:p-8 relative h-[400px] lg:h-[500px] flex items-center justify-center overflow-hidden shadow-2xl">
            
            {/* Background Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:20px_20px]" />

            {/* Host Node (Center Top) */}
            <div className="absolute top-10 sm:top-12 left-1/2 -translate-x-1/2 flex flex-col items-center z-20">
              <div className="relative">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-slate-900 border-2 border-cyan-400 rounded-xl flex items-center justify-center shadow-[0_0_30px_rgba(34,211,238,0.2)] relative z-10">
                  <Server className="text-cyan-400 w-6 h-6 sm:w-7 sm:h-7" />
                </div>
                
                {/* UDP Broadcast Ripples - Hardware Accelerated */}
                {activePhase === 0 && (
                  <>
                    <motion.div 
                      style={{ willChange: 'transform, opacity' }}
                      animate={{ scale: [1, 3.5], opacity: [0.8, 0] }} 
                      transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }} 
                      className="absolute inset-0 border-2 border-cyan-400 rounded-xl pointer-events-none" 
                    />
                    <motion.div 
                      style={{ willChange: 'transform, opacity' }}
                      animate={{ scale: [1, 3.5], opacity: [0.8, 0] }} 
                      transition={{ duration: 2, repeat: Infinity, ease: "easeOut", delay: 0.6 }} 
                      className="absolute inset-0 border-2 border-cyan-400 rounded-xl pointer-events-none" 
                    />
                  </>
                )}
                
                {/* Resolver Queue Indicator - Replaced with buttery smooth dashed circle */}
                {activePhase === 2 && (
                  <motion.div 
                    style={{ willChange: 'transform' }}
                    animate={{ rotate: 360 }} 
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }} 
                    className="absolute -inset-3 sm:-inset-4 border-2 border-dashed border-amber-400 rounded-full pointer-events-none opacity-80" 
                  />
                )}
              </div>
              <span className="mt-2 sm:mt-3 text-[10px] sm:text-xs font-mono text-cyan-400 bg-cyan-950/50 px-2 py-1 rounded backdrop-blur-sm">
                HOST_SERVER
              </span>
            </div>

            {/* Client Nodes (Bottom Row) */}
            <div className="absolute bottom-12 sm:bottom-16 w-full px-4 sm:px-12 flex justify-between z-20">
              {[1, 2, 3].map((client) => (
                <div key={client} className="flex flex-col items-center">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-900 border border-slate-600 rounded-lg flex items-center justify-center z-10 relative shadow-xl">
                    <Smartphone className="text-slate-400 w-4 h-4 sm:w-5 sm:h-5" />
                    
                    {/* UDP Receiving Blip */}
                    {activePhase === 0 && (
                      <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: [0, 1, 0] }} 
                        transition={{ duration: 2, repeat: Infinity, delay: 1 }} 
                        className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-cyan-400 rounded-full shadow-[0_0_10px_#22d3ee]" 
                      />
                    )}
                    
                    {/* Private State Shield */}
                    {activePhase === 3 && (
                      <motion.div 
                        initial={{ scale: 0 }} 
                        animate={{ scale: 1 }} 
                        className="absolute -top-2 -right-2 sm:-top-3 sm:-right-3 bg-indigo-500 rounded-full p-1 shadow-lg"
                      >
                        <ShieldAlert className="text-white w-2.5 h-2.5 sm:w-3 sm:h-3" />
                      </motion.div>
                    )}
                  </div>
                  <span className="mt-2 sm:mt-3 text-[8px] sm:text-[10px] font-mono text-slate-500 bg-[#0a0e17]/80 px-1 rounded">
                    CLIENT_0{client}
                  </span>
                </div>
              ))}
            </div>

            {/* SVG Connections (TCP & Sync Packets) */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
              {/* Clients are spaced roughly at 15%, 50%, 85% visually by flex-between, we map paths slightly inside */}
              {[15, 50, 85].map((x, i) => (
                <g key={i}>
                  {/* Base TCP Line */}
                  {(activePhase >= 1) && (
                    <motion.line 
                      x1="50%" y1="25%" x2={`${x}%`} y2="70%" 
                      stroke="#14b8a6" strokeWidth="1.5" strokeDasharray="4 4"
                      initial={{ pathLength: 0, opacity: 0 }} 
                      animate={{ pathLength: 1, opacity: 0.25 }} 
                      transition={{ duration: 0.5 }}
                    />
                  )}
                  
                  {/* Phase 2: Resolver Packets flying UP */}
                  {activePhase === 2 && (
                    <motion.circle r="3.5" fill="#fbbf24" style={{ willChange: 'transform' }}
                      initial={{ cx: `${x}%`, cy: "70%" }}
                      animate={{ cx: "50%", cy: "25%" }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3, ease: "easeInOut" }}
                    />
                  )}

                  {/* Phase 3: Asymmetric Sync Packets flying DOWN */}
                  {activePhase === 3 && (
                    <motion.circle r="3.5" fill="#818cf8" style={{ willChange: 'transform' }}
                      initial={{ cx: "50%", cy: "25%" }}
                      animate={{ cx: `${x}%`, cy: "70%" }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2, ease: "easeInOut" }}
                    />
                  )}
                </g>
              ))}
            </svg>

            {/* Dynamic Center Badge */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activePhase}
                  initial={{ opacity: 0, y: 10, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border bg-[#0a0e17]/90 backdrop-blur-md shadow-2xl flex items-center gap-1.5 sm:gap-2 ${PHASES[activePhase].border}`}
                >
                  {activePhase === 0 && <Network className="text-cyan-400 w-3 h-3 sm:w-4 sm:h-4" />}
                  {activePhase === 1 && <CheckCircle2 className="text-teal-400 w-3 h-3 sm:w-4 sm:h-4" />}
                  {activePhase === 2 && <Database className="text-amber-400 w-3 h-3 sm:w-4 sm:h-4" />}
                  {activePhase === 3 && <ShieldAlert className="text-indigo-400 w-3 h-3 sm:w-4 sm:h-4" />}
                  <span className={`text-[10px] sm:text-xs font-mono font-bold tracking-widest uppercase whitespace-nowrap ${PHASES[activePhase].color}`}>
                    {PHASES[activePhase].title}
                  </span>
                </motion.div>
              </AnimatePresence>
            </div>

          </div>

          {/* ── RIGHT: CONTROL PANEL ── */}
          <div className="lg:col-span-5 flex flex-col justify-center gap-3 sm:gap-4">
            {PHASES.map((phase, index) => {
              const isActive = activePhase === index;
              return (
                <button
                  key={phase.id}
                  onClick={() => setActivePhase(index)}
                  className={`text-left p-4 sm:p-5 lg:p-6 rounded-xl border transition-all duration-300 relative overflow-hidden group ${
                    isActive ? `bg-slate-900 ${phase.border}` : 'bg-slate-900/30 border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  {/* Active highlight bar */}
                  {isActive && (
                    <motion.div layoutId="activePhaseBar" className={`absolute left-0 top-0 bottom-0 w-1 ${phase.bg.replace('/10', '')}`} />
                  )}

                  <div className="flex items-center justify-between mb-1 sm:mb-2">
                    <h3 className={`text-base sm:text-lg font-bold font-sans tracking-tight transition-colors ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`}>
                      0{index + 1}. {phase.title}
                    </h3>
                    <span className={`text-[9px] sm:text-[10px] font-mono px-2 py-0.5 sm:py-1 rounded border transition-colors ${
                      isActive ? `${phase.color} ${phase.bg} ${phase.border}` : 'text-slate-600 border-slate-700'
                    }`}>
                      {isActive ? 'ACTIVE' : 'IDLE'}
                    </span>
                  </div>
                  
                  <h4 className={`text-[11px] sm:text-xs font-mono mb-1 sm:mb-2 tracking-wide transition-colors ${isActive ? phase.color : 'text-slate-500'}`}>
                    {phase.subtitle}
                  </h4>

                  {/* Smooth height animation fix */}
                  <AnimatePresence initial={false}>
                    {isActive && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="overflow-hidden"
                      >
                        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed pt-2">
                          {phase.desc}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </button>
              );
            })}
          </div>

        </div>
      </div>
    </div>
  );
};

export default MoonveilImmersive;
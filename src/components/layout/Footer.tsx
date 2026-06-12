/**
 * Footer.tsx — Systems Engineering Status Bar
 *
 * Matches the Header.tsx aesthetic:
 * - Monospace technical readouts
 * - Animated pulse indicators
 * - Ultra-fine borders and tracking
 * - Component-based tech stack pills
 */

import React from 'react';
import { motion } from 'framer-motion';

// ─── Sub-components ───────────────────────────────────────────────────────────

const PulseDot = ({
  color,
  period,
  size = 5,
}: {
  color: 'cyan' | 'green' | 'blue';
  period: number;
  size?: number;
}) => {
  const colors = {
    cyan:  'bg-cyan-400',
    green: 'bg-emerald-400',
    blue:  'bg-blue-400',
  };
  return (
    <motion.span
      className={`inline-block rounded-full flex-shrink-0 ${colors[color]}`}
      style={{ width: size, height: size }}
      animate={{ opacity: [1, 0.25, 1], scale: [1, 0.65, 1] }}
      transition={{ duration: period, repeat: Infinity, ease: 'easeInOut' }}
    />
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-white/[0.06] bg-[#020813] z-40 relative">
      <div className="max-w-none px-4 md:px-6 h-[48px] md:h-[52px] flex items-center justify-between">
        
        {/* ── Left: Identity & Copyright ── */}
        <div className="flex items-center gap-2 md:gap-3 select-none">
          <span className="font-sans font-bold text-slate-50 text-[12px] md:text-[13px] tracking-tight">
            SK<span className="text-cyan-400">.</span>
          </span>
          
          <div className="w-[1px] h-[12px] bg-white/[0.08]" />
          
          <span className="font-mono text-[8px] md:text-[9px] tracking-[0.1em] text-slate-500 flex items-center gap-1">
            <span className="hidden md:inline">COPYRIGHT ©</span> {currentYear}
          </span>
          
          <span className="hidden md:inline-block font-mono text-[7px] tracking-[0.1em] text-slate-700 border border-white/[0.04] rounded-[2px] px-[5px] py-[2px] ml-2">
            SYSTEMS ENG.
          </span>
        </div>

        {/* ── Right: Tech Stack & System Status ── */}
        <div className="flex items-center gap-3 md:gap-4 select-none">
          
          {/* Tech Stack Pills (Hidden on very small screens) */}
          <div className="hidden sm:flex items-center gap-2">
            <span className="font-mono text-[7px] tracking-[0.1em] text-slate-600">STACK</span>
            <div className="flex gap-[4px]">
              {['REACT', 'THREE.JS', 'D3', 'RESILIENCE'].map((tech) => (
                <span 
                  key={tech} 
                  className="font-mono text-[7px] tracking-[0.08em] text-cyan-400/70 bg-cyan-400/[0.03] border border-cyan-400/[0.1] rounded-[2px] px-[5px] py-[2px] hover:bg-cyan-400/[0.08] hover:text-cyan-400 transition-colors duration-200 cursor-default"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          <div className="w-[1px] h-[12px] bg-white/[0.08] hidden sm:block" />

          {/* System Status Indicator (Matches Header StatusIndicator format) */}
          <div className="flex items-center gap-[5px] px-2 py-[4px] border border-white/[0.05] rounded-[3px] bg-black/20">
            <PulseDot color="green" period={3.0} size={4} />
            <div className="flex flex-col gap-0 hidden md:flex">
              <span className="font-mono text-[7px] tracking-[0.1em] text-slate-700 leading-none">SYS.STATE</span>
            </div>
            <span className="font-mono text-[8px] tracking-[0.08em] font-bold leading-none text-emerald-400">NOMINAL</span>
          </div>

        </div>
      </div>
    </footer>
  );
};
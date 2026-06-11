import React from 'react';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { Network, Database, Cpu, Workflow, Terminal } from 'lucide-react';

// ─── Data Layer ─────────────────────────────────────────────────────────────

const SKILL_CATEGORIES = [
  {
    id: 'architecture',
    title: 'System Architecture',
    subtitle: 'High-level system design',
    colSpan: 'col-span-1 md:col-span-2',
    icon: <Workflow className="text-cyan-400" size={24} />,
    color: 'cyan',
    skills: ['Offline-First Design', 'Distributed Systems', 'Service-Oriented Architecture', 'Event-Driven Workflows', 'Fault Tolerance']
  },
  {
    id: 'core',
    title: 'Core Technologies',
    subtitle: 'Languages & frameworks',
    colSpan: 'col-span-1',
    icon: <Cpu className="text-indigo-400" size={24} />,
    color: 'indigo',
    skills: ['TypeScript', 'JavaScript', 'Python', 'SQL', 'React Native']
  },
  {
    id: 'data',
    title: 'Data & Persistence',
    subtitle: 'Storage & sync engines',
    colSpan: 'col-span-1',
    icon: <Database className="text-teal-400" size={24} />,
    color: 'teal',
    skills: ['SQLite', 'MySQL', 'State Synchronization', 'Self-Healing DBs']
  },
  {
    id: 'network',
    title: 'Networking & Security',
    subtitle: 'Protocols & encryption',
    colSpan: 'col-span-1 md:col-span-2',
    icon: <Network className="text-amber-400" size={24} />,
    color: 'amber',
    skills: ['TCP/IP', 'UDP Broadcast', 'WebSockets', 'MD5 Hashing', 'XOR Obfuscation', 'P2P Discovery']
  }
];

const TOOLS = ['Git', 'GitHub', 'Android Studio', 'VS Code', 'REST APIs', 'Postman', 'CI/CD'];

// ─── Animation Variants ─────────────────────────────────────────────────────

// Added the 'Variants' type here to fix the strict TypeScript errors
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15
    }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { type: 'spring', stiffness: 100, damping: 15 }
  }
};

// ─── Component ──────────────────────────────────────────────────────────────

const SkillsMatrix: React.FC = () => {
  // Removed the unused hoveredZone state since Tailwind CSS handles it via group-hover

  return (
    <div className="w-full max-w-6xl mx-auto">
      
      {/* Top Console/Status Bar */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="flex items-center justify-between bg-slate-900/50 border border-slate-800 rounded-t-xl px-6 py-3 border-b-0 backdrop-blur-sm"
      >
        <div className="flex items-center gap-3">
          <Terminal size={16} className="text-slate-500" />
          <span className="text-[10px] text-slate-400 font-mono uppercase tracking-widest">
            System.Capabilities.Read()
          </span>
        </div>
        <div className="flex gap-2">
          <div className="w-2 h-2 rounded-full bg-slate-700"></div>
          <div className="w-2 h-2 rounded-full bg-slate-700"></div>
          <div className="w-2 h-2 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.6)] animate-pulse"></div>
        </div>
      </motion.div>

      {/* Main Bento Grid */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        {SKILL_CATEGORIES.map((category) => (
          <motion.div
            key={category.id}
            variants={itemVariants}
            className={`
              relative group overflow-hidden bg-slate-900/40 border border-slate-800 
              rounded-xl p-6 sm:p-8 backdrop-blur-sm transition-all duration-500
              hover:bg-slate-800/40 hover:border-${category.color}-500/30 hover:shadow-[0_0_30px_rgba(0,0,0,0.5)]
              ${category.colSpan}
            `}
          >
            {/* Background Glow on Hover */}
            <div 
              className={`absolute -inset-px bg-gradient-to-br from-${category.color}-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-xl`}
            />

            <div className="relative z-10 flex flex-col h-full">
              {/* Header */}
              <div className="flex items-start justify-between mb-8">
                <div>
                  <h3 className="text-xl font-bold text-slate-100 mb-1">{category.title}</h3>
                  <p className={`text-xs font-mono tracking-wider text-${category.color}-400/80 uppercase`}>
                    {category.subtitle}
                  </p>
                </div>
                <div className={`p-3 rounded-lg bg-${category.color}-500/10 border border-${category.color}-500/20`}>
                  {category.icon}
                </div>
              </div>

              {/* Skills Pills */}
              <div className="flex flex-wrap gap-2 mt-auto">
                {category.skills.map((skill) => (
                  <span 
                    key={skill}
                    className={`
                      px-3 py-1.5 text-[11px] font-mono rounded-md border border-slate-700/50 
                      bg-slate-800/50 text-slate-300 transition-all duration-300
                      group-hover:border-${category.color}-500/30 group-hover:bg-${category.color}-500/10 group-hover:text-slate-100
                    `}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Bottom Tools Footer */}
      <motion.div 
        variants={itemVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="mt-4 bg-slate-900/30 border border-slate-800 rounded-b-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 backdrop-blur-sm"
      >
        <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest flex-shrink-0">
          Development / Deployment / Environment
        </span>
        <div className="flex flex-wrap justify-center sm:justify-end gap-x-4 gap-y-2">
          {TOOLS.map((tool) => (
            <span key={tool} className="text-xs text-slate-400 font-medium flex items-center gap-1.5 hover:text-cyan-400 transition-colors cursor-default">
              <span className="w-1 h-1 rounded-full bg-slate-600"></span>
              {tool}
            </span>
          ))}
        </div>
      </motion.div>

    </div>
  );
};

export default SkillsMatrix;
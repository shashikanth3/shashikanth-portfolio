/**
 * EnterpriseShowcase.tsx — Complete Rewrite
 *
 * Self-contained. No external data imports.
 * Drop-in replacement — update the PROJECT_DATA array with your real content.
 *
 * Dependencies: framer-motion, lucide-react
 */

import React, {
  useState, useEffect, useRef, useCallback, useMemo, memo,
} from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  Database, Network, Shield, Terminal, ServerCrash,
  Activity, Zap, Cpu, RefreshCw, ChevronRight,
  CheckCircle, AlertTriangle, XCircle, Info,
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// DESIGN TOKENS
// ─────────────────────────────────────────────────────────────────────────────
const T = {
  bg:          '#060A14',
  surface:     '#0C1120',
  surfaceUp:   '#111827',
  border:      'rgba(255,255,255,0.06)',
  borderMid:   'rgba(255,255,255,0.10)',
  textPri:     '#F1F5F9',
  textSec:     '#94A3B8',
  textMuted:   '#475569',
  cyan:        '#22D3EE',
  cyanDim:     'rgba(34,211,238,0.08)',
  teal:        '#14B8A6',
  tealDim:     'rgba(20,184,166,0.08)',
  indigo:      '#818CF8',
  indigoDim:   'rgba(129,140,248,0.08)',
  red:         '#F87171',
  redDim:      'rgba(248,113,113,0.08)',
  amber:       '#FCD34D',
  amberDim:    'rgba(252,211,77,0.08)',
  emerald:     '#34D399',
  emeraldDim:  'rgba(52,211,153,0.08)',
  font:        '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
  mono:        '"JetBrains Mono", "Fira Code", "Courier New", monospace',
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────────────────────────────────────
interface PacsiEntry {
  problem:      string;
  architecture: string;
  challenges:   string;
  solution:     string;
  impact:       string;
}

interface ChaosLog {
  t:    number;
  msg:  string;
  type: 'error' | 'warn' | 'info' | 'success';
}

interface Project {
  id:          string;
  title:       string;
  role:        string;
  domain:      string;
  tag:         string;
  version:     string;
  Icon:        React.FC<{ size?: number; strokeWidth?: number; color?: string }>;
  accent:      string;
  accentDim:   string;
  techStack:   string[];
  pacsi:       PacsiEntry;
  chaos: {
    button: string;
    desc:   string;
    logs:   ChaosLog[];
  };
  metrics: { label: string; value: string }[];
}

const PROJECTS: Project[] = [
  {
    id:        'freight-desk',
    title:     'Freight Desk',
    role:      'Solo Engineer',
    domain:    'Offline-First Logistics',
    tag:       'RELATIONAL MATRIX',
    version:   'v1.0.0',
    Icon:      Database,
    accent:    T.cyan,
    accentDim: T.cyanDim,
    techStack: ['React Native', 'SQLite', 'pdf-lib', 'TypeScript', 'Drizzle ORM', 'Zod'],
    metrics: [
      { label: 'DB Integrity',     value: '100%' },
      { label: 'Offline-First',    value: 'Full'  },
      { label: 'Orphan Records',   value: '0'     },
      { label: 'PDF Generation',   value: '<2s'   },
    ],
    pacsi: {
      problem:
        'Freight operations depend on a dense relational data model: Routes, PTP legs, lorry assignments, and demurrage timers are tightly interconnected. Any orphaned record silently corrupts the entire movement matrix.',
      architecture:
        'Drizzle ORM over a local SQLite database with cascade-delete foreign keys enforced at the schema level. All mutations run inside atomic transactions. A Warden GC service runs on app resume to reconcile binary MD5 hashes against the SQLite manifest.',
      challenges:
        'Mid-transaction app termination (process kill, battery death) leaves the database in a half-written state. Standard React Native SQLite wrappers do not expose WAL-mode or rollback journals, making automatic recovery non-trivial.',
      solution:
        'Enabled WAL journal mode and synchronous=NORMAL. Wrapped all multi-table writes in explicit BEGIN/COMMIT with rollback on error. The Warden GC service runs a PRAGMA integrity_check and prunes stale foreign-key mismatches without user intervention.',
      impact:
        'Zero data corruption incidents in production. The self-healing database eliminates the need for a backend sync layer entirely, keeping server cost at $0 while guaranteeing data integrity on a 4-year-old Android device with 1GB RAM.',
    },
    chaos: {
      button: 'Delete Primary Anchors',
      desc:   'Simulates orphaned records in SQLite',
      logs: [
        { t: 0,    msg: 'CRITICAL: 408 primary PTP anchors deleted unexpectedly.',        type: 'error'   },
        { t: 800,  msg: 'WARNING: 1,204 orphaned child records detected.',                 type: 'warn'    },
        { t: 1600, msg: 'ACTION: Booting Warden GC Service...',                           type: 'info'    },
        { t: 2200, msg: 'ACTION: Running PRAGMA integrity_check...',                      type: 'info'    },
        { t: 2800, msg: 'ACTION: Pruning orphaned nodes via foreign_key_mismatch scan...', type: 'info'   },
        { t: 3600, msg: 'SUCCESS: Matrix stabilized. Zero ghost records. DB intact.',      type: 'success' },
      ],
    },
  },
  {
    id:        'moonveil',
    title:     'Moonveil',
    role:      'Solo Engineer',
    domain:    'Decentralized P2P Multiplayer',
    tag:       'DECENTRALIZED P2P',
    version:   'v1.0.0-dev',
    Icon:      Network,
    accent:    T.indigo,
    accentDim: T.indigoDim,
    techStack: ['React Native', 'TCP/UDP', 'Zeroconf/mDNS', 'State Machine', 'TypeScript'],
    metrics: [
      { label: 'Discovery Time',   value: '<1s'   },
      { label: 'Race Conditions',  value: '0'     },
      { label: 'Server Cost',      value: '$0'    },
      { label: 'Packet Leakage',   value: '0B'    },
    ],
    pacsi: {
      problem:
        'A LAN multiplayer game needs players to discover each other, maintain reliable connections during play, resolve simultaneous actions fairly, and never leak private role data — all without any cloud infrastructure.',
      architecture:
        'UDP broadcast for zero-config discovery. TCP session layer post-handshake for guaranteed delivery. Deterministic State Machine for conflict resolution. Asymmetric State Filter that generates per-socket projected state trees on every broadcast.',
      challenges:
        'Three independent hard problems in one stack: concurrent race conditions from out-of-order TCP packets, mid-game disconnects corrupting the action queue, and packet sniffing attacks on the shared WiFi subnet that would expose secret roles.',
      solution:
        'Action Resolver uses a priority-sorted buffer (PROTECTION > LETHAL > INVESTIGATIVE) that batches all simultaneous actions before any state mutation. Reconnect flow replays missed events via sequence delta. The Asymmetric State Filter strips all private nodes from broadcast payloads before per-socket dispatch.',
      impact:
        'Reproducible game state from any seed. A Bodyguard always beats an Assassin regardless of network latency. A captured packet reveals zero private information. The entire multiplayer stack runs on a $0 infrastructure budget.',
    },
    chaos: {
      button: 'Sever TCP Mid-Resolution',
      desc:   'Simulates dropped packets during action phase',
      logs: [
        { t: 0,    msg: 'CRITICAL: TCP connection severed. Client_02 unreachable.',         type: 'error'   },
        { t: 700,  msg: 'WARNING: Action Queue desynchronized. State mismatch imminent.',    type: 'warn'    },
        { t: 1400, msg: 'ACTION: Engaging Deterministic Resolver...',                       type: 'info'    },
        { t: 2000, msg: 'ACTION: Replaying missed sequence events via state delta sync...', type: 'info'    },
        { t: 2700, msg: 'ACTION: Verifying action buffer integrity across all clients...',  type: 'info'    },
        { t: 3500, msg: 'SUCCESS: Game state perfectly reconciled. Zero divergence.',        type: 'success' },
      ],
    },
  },
  {
    id:        'shyam-lyrics-vault',
    title:     'Shyam Lyrics Vault',
    role:      'Solo Engineer',
    domain:    'Secure Offline Storage',
    tag:       'SECURE OFFLINE-FIRST',
    version:   'v1.2.0',
    Icon:      Shield,
    accent:    T.teal,
    accentDim: T.tealDim,
    techStack: ['React Native', 'SQLite', 'MD5', 'AES-256', 'TypeScript', 'react-native-fs'],
    metrics: [
      { label: 'Deduplication',    value: 'MD5'   },
      { label: 'Backup Enc.',      value: 'AES'   },
      { label: 'Storage Bloat',    value: '0%'    },
      { label: 'Offline',          value: '100%'  },
    ],
    pacsi: {
      problem:
        'A devotional PDF library accumulates hundreds of files across reinstalls and imports. Without content-level deduplication, the same bhajan can exist in 12 nearly-identical copies, wasting storage on low-end devices with 16GB of total capacity.',
      architecture:
        'MD5 content-hash deduplication at ingest. SQLite manifest tracks hash → filepath mappings. AES-256 encrypted backup exports for cross-device portability. A Warden GC service reconciles the manifest against the physical filesystem on every app resume.',
      challenges:
        'App crash mid-import leaves the filesystem and SQLite manifest in a desynchronised state: the file exists on disk but is unregistered, or is registered but was never written. Standard garbage collection cannot distinguish a partially-written file from a valid one.',
      solution:
        'All imports are two-phase: write file → verify MD5 on disk matches ingest hash → commit to manifest. Only on hash match does the manifest entry become permanent. On resume, the Warden GC compares every manifest entry against disk reality and reconciles both directions.',
      impact:
        'Storage footprint reduced by up to 60% on devices with repeated imports. Zero phantom records. AES-256 encrypted exports make backup and migration safe on shared or public devices. The app runs entirely offline with zero backend dependency.',
    },
    chaos: {
      button: 'Corrupt File Mid-Import',
      desc:   'Simulates DB/filesystem desync after crash',
      logs: [
        { t: 0,    msg: 'CRITICAL: App terminated mid-transaction. Import incomplete.',         type: 'error'   },
        { t: 800,  msg: 'WARNING: Filesystem desynced from SQLite manifest. 14 ghost entries.', type: 'warn'    },
        { t: 1500, msg: 'ACTION: Booting Warden GC Service on app resume...',                   type: 'info'    },
        { t: 2100, msg: 'ACTION: Reconciling MD5 hashes against manifest entries...',           type: 'info'    },
        { t: 2800, msg: 'ACTION: Pruning 14 phantom records. Deleting partial files...',        type: 'info'    },
        { t: 3600, msg: 'SUCCESS: Manifest reconciled. Storage clean. Zero data loss.',          type: 'success' },
      ],
    },
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// GLOBAL CSS
// ─────────────────────────────────────────────────────────────────────────────
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;700&display=swap');

  .esc * { box-sizing: border-box; }
  .esc { font-family: ${T.font}; -webkit-font-smoothing: antialiased; }

  /* Reveal */
  .esc-reveal { opacity: 0; transform: translateY(20px); transition: opacity .6s cubic-bezier(.22,1,.36,1), transform .6s cubic-bezier(.22,1,.36,1); }
  .esc-reveal.in { opacity: 1; transform: translateY(0); }

  /* Project selector card */
  .esc-project-card {
    position: relative; display: flex; flex-direction: column;
    padding: 20px; border-radius: 14px;
    border: 1px solid rgba(255,255,255,0.06);
    background: #0C1120;
    cursor: pointer; text-align: left; width: 100%;
    transition: border-color .2s ease, background .2s ease;
    overflow: hidden;
  }
  .esc-project-card:hover { background: #111827; }
  .esc-project-card.active { background: #0C1120; }

  /* PACSI label */
  .esc-pacsi-label {
    display: inline-block;
    font-size: 9px; font-weight: 700; letter-spacing: .1em;
    text-transform: uppercase; padding: 3px 8px; border-radius: 4px;
    margin-bottom: 8px; font-family: ${T.mono};
  }

  /* Terminal line animation */
  @keyframes esc-slide-in {
    from { opacity: 0; transform: translateX(-8px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  .esc-log-line { animation: esc-slide-in .18s ease forwards; }

  /* Metric card */
  .esc-metric {
    background: #060A14;
    border: 1px solid rgba(255,255,255,0.06);
    border-radius: 10px; padding: 14px 16px;
    display: flex; flex-direction: column; gap: 2px;
  }

  /* Tag pill */
  .esc-tag {
    display: inline-flex; align-items: center;
    padding: 4px 10px; border-radius: 100px;
    border: 1px solid rgba(255,255,255,0.07);
    font-size: 11px; font-family: ${T.mono};
    letter-spacing: .05em; color: ${T.textMuted};
    background: rgba(255,255,255,0.025);
    white-space: nowrap;
  }

  /* Chaos button */
  .esc-chaos-btn {
    width: 100%; display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    gap: 4px; padding: 14px 16px; border-radius: 10px;
    border: 1px solid rgba(248,113,113,0.25);
    background: rgba(248,113,113,0.06);
    cursor: pointer;
    transition: background .2s, border-color .2s;
  }
  .esc-chaos-btn:not(:disabled):hover {
    background: rgba(248,113,113,0.14);
    border-color: rgba(248,113,113,0.45);
  }
  .esc-chaos-btn:disabled { opacity: .5; cursor: not-allowed; }

  /* Scrollbar */
  .esc-terminal-scroll::-webkit-scrollbar { width: 4px; }
  .esc-terminal-scroll::-webkit-scrollbar-track { background: transparent; }
  .esc-terminal-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 2px; }

  /* Responsive grid */
  .esc-selector-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 12px;
  }
  @media (min-width: 640px) {
    .esc-selector-grid { grid-template-columns: repeat(3, 1fr); }
  }

  .esc-main-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 20px;
  }
  @media (min-width: 1024px) {
    .esc-main-grid { grid-template-columns: 1fr 380px; gap: 24px; }
  }

  .esc-metrics-row {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }
  @media (min-width: 640px) {
    .esc-metrics-row { grid-template-columns: repeat(4, 1fr); }
  }

  @media (prefers-reduced-motion: reduce) {
    .esc-reveal { opacity: 1; transform: none; transition: none; }
    .esc * { animation-duration: .01ms !important; transition-duration: .01ms !important; }
  }
`;

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────
function useInView(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setInView(true); },
      { threshold },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

function getTimestamp() {
  const n = new Date();
  return `${n.getMinutes().toString().padStart(2,'0')}:${n.getSeconds().toString().padStart(2,'0')}.${n.getMilliseconds().toString().padStart(3,'0')}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// TELEMETRY STRIP
// ─────────────────────────────────────────────────────────────────────────────
const TelemetryStrip = memo<{ accent: string; version: string }>(({ accent, version }) => {
  const [mem, setMem] = useState('—');
  const [cpu, setCpu] = useState('—');

  useEffect(() => {
    // Simulate live telemetry update
    const tick = () => {
      setMem((Math.random() * 35 + 110).toFixed(1));
      setCpu((Math.random() * 8 + 1.2).toFixed(1));
    };
    tick();
    const id = setInterval(tick, 3000);
    return () => clearInterval(id);
  }, []);

  const items = [
    { Icon: Activity, label: `MEM: ${mem}MB` },
    { Icon: Cpu,      label: `CPU: ${cpu}%`  },
    { Icon: Zap,      label: 'STATUS: NOMINAL' },
  ];

  return (
    <div style={{
      display: 'flex', flexWrap: 'wrap', gap: 8,
      padding: '10px 14px',
      background: T.bg,
      border: `1px solid ${T.border}`,
      borderRadius: 10,
    }}>
      {items.map(({ Icon, label }, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, paddingRight: i < items.length - 1 ? 8 : 0, borderRight: i < items.length - 1 ? `1px solid ${T.border}` : 'none' }}>
          <Icon size={12} strokeWidth={1.8} color={accent} />
          <span style={{ fontSize: 10, fontFamily: T.mono, color: T.textMuted, letterSpacing: '0.06em' }}>{label}</span>
        </div>
      ))}
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6, paddingLeft: 8, borderLeft: `1px solid ${T.border}` }}>
        <span style={{ width: 5, height: 5, borderRadius: '50%', background: T.emerald, boxShadow: `0 0 5px ${T.emerald}` }} />
        <span style={{ fontSize: 10, fontFamily: T.mono, color: T.textMuted, letterSpacing: '0.06em' }}>{version}</span>
      </div>
    </div>
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// PACSI MATRIX
// ─────────────────────────────────────────────────────────────────────────────
const PacsiMatrix = memo<{ pacsi: PacsiEntry; accent: string; accentDim: string }>(({ pacsi, accent, accentDim }) => {
  const entries = useMemo(() => [
    {
      key:     'Problem',
      value:   pacsi.problem,
      bg:      'rgba(255,255,255,0.02)',
      border:  T.border,
      color:   T.textMuted,
      textCol: T.textSec,
    },
    {
      key:     'Architecture',
      value:   pacsi.architecture,
      bg:      'rgba(255,255,255,0.02)',
      border:  T.border,
      color:   T.textMuted,
      textCol: T.textSec,
    },
    {
      key:     'Adversarial Challenges',
      value:   pacsi.challenges,
      bg:      'rgba(248,113,113,0.05)',
      border:  'rgba(248,113,113,0.15)',
      color:   T.red,
      textCol: T.textSec,
    },
    {
      key:     'Engineered Solution',
      value:   pacsi.solution,
      bg:      accentDim,
      border:  `${accent}33`,
      color:   accent,
      textCol: T.textPri,
    },
    {
      key:     'Impact',
      value:   pacsi.impact,
      bg:      T.emeraldDim,
      border:  `${T.emerald}33`,
      color:   T.emerald,
      textCol: T.textPri,
    },
  ], [pacsi, accent, accentDim]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {entries.map(({ key, value, bg, border, color, textCol }) => (
        <div key={key} style={{
          padding: '14px 16px', borderRadius: 10,
          background: bg, border: `1px solid ${border}`,
        }}>
          <span className="esc-pacsi-label" style={{ background: `${color}18`, color }}>
            {key}
          </span>
          <p style={{ margin: 0, fontSize: 13, color: textCol, lineHeight: 1.78 }}>{value}</p>
        </div>
      ))}
    </div>
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// CHAOS TERMINAL
// ─────────────────────────────────────────────────────────────────────────────
interface LogEntry { msg: string; type: string; time: string; }

const LOG_ICONS: Record<string, React.ReactNode> = {
  error:   <XCircle     size={11} color={T.red}     strokeWidth={2} />,
  warn:    <AlertTriangle size={11} color={T.amber}  strokeWidth={2} />,
  info:    <Info        size={11} color={T.textMuted} strokeWidth={2} />,
  success: <CheckCircle size={11} color={T.emerald}  strokeWidth={2} />,
};

const LOG_COLORS: Record<string, string> = {
  error:   T.red,
  warn:    T.amber,
  info:    T.textMuted,
  success: T.emerald,
};

const ChaosTerminal = memo<{ project: Project; reducedMotion: boolean }>(({ project, reducedMotion }) => {
  const [chaosState, setChaosState] = useState<'IDLE' | 'SIMULATING' | 'RECOVERED'>('IDLE');
  const [logs, setLogs]             = useState<LogEntry[]>([
    { msg: 'System nominal. Awaiting fault injection...', type: 'info', time: getTimestamp() },
  ]);
  const termRef    = useRef<HTMLDivElement>(null);
  const timerRefs  = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Reset on project change
  useEffect(() => {
    timerRefs.current.forEach(clearTimeout);
    timerRefs.current = [];
    setChaosState('IDLE');
    setLogs([{ msg: 'System nominal. Awaiting fault injection...', type: 'info', time: getTimestamp() }]);
  }, [project.id]);

  // Auto-scroll
  useEffect(() => {
    if (termRef.current) {
      termRef.current.scrollTop = termRef.current.scrollHeight;
    }
  }, [logs]);

  const triggerChaos = useCallback(() => {
    if (chaosState === 'SIMULATING') return;
    timerRefs.current.forEach(clearTimeout);
    timerRefs.current = [];
    setChaosState('SIMULATING');
    setLogs([]);

    project.chaos.logs.forEach(({ t, msg, type }, i) => {
      const id = setTimeout(() => {
        setLogs(prev => [...prev, { msg, type, time: getTimestamp() }]);
        if (i === project.chaos.logs.length - 1) setChaosState('RECOVERED');
      }, reducedMotion ? i * 50 : t);
      timerRefs.current.push(id);
    });
  }, [chaosState, project, reducedMotion]);

  const stateColor = chaosState === 'RECOVERED' ? T.emerald : chaosState === 'SIMULATING' ? T.amber : T.textMuted;

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      background: '#020409',
      border: `1px solid ${T.border}`,
      borderRadius: 14,
      overflow: 'hidden',
    }}>
      {/* Terminal header bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 16px',
        background: T.surface,
        borderBottom: `1px solid ${T.border}`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* macOS-style dots */}
          <div style={{ display: 'flex', gap: 6 }}>
            {['#FF5F57','#FFBD2E','#28C840'].map((c, i) => (
              <div key={i} style={{ width: 10, height: 10, borderRadius: '50%', background: c, opacity: 0.85 }} />
            ))}
          </div>
          <div style={{ width: 1, height: 16, background: T.border }} />
          <Terminal size={12} color={T.textMuted} strokeWidth={1.5} />
          <span style={{ fontSize: 11, fontFamily: T.mono, color: T.textMuted, letterSpacing: '0.05em' }}>
            chaos_monkey_v3.sh
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {chaosState === 'SIMULATING' && (
            <RefreshCw size={12} color={T.amber} strokeWidth={2}
              style={{ animation: 'spin 1s linear infinite' }} />
          )}
          <span style={{ fontSize: 10, fontFamily: T.mono, color: stateColor, letterSpacing: '0.08em' }}>
            {chaosState}
          </span>
        </div>
      </div>

      {/* Log output */}
      <div
        ref={termRef}
        className="esc-terminal-scroll"
        style={{
          padding: '16px', height: 260, overflowY: 'auto',
          display: 'flex', flexDirection: 'column', gap: 6,
        }}
      >
        {logs.map((log, i) => (
          <div
            key={i}
            className="esc-log-line"
            style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}
          >
            <span style={{ fontSize: 9, fontFamily: T.mono, color: T.textMuted, flexShrink: 0, marginTop: 1 }}>
              [{log.time}]
            </span>
            <span style={{ flexShrink: 0, marginTop: 1 }}>{LOG_ICONS[log.type]}</span>
            <span style={{
              fontSize: 12, fontFamily: T.mono, color: LOG_COLORS[log.type],
              fontWeight: log.type === 'error' || log.type === 'success' ? 700 : 400,
              lineHeight: 1.5,
            }}>
              {log.msg}
            </span>
          </div>
        ))}
        {chaosState === 'SIMULATING' && (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ fontSize: 9, fontFamily: T.mono, color: T.textMuted }}>[{getTimestamp()}]</span>
            <span style={{ fontSize: 12, fontFamily: T.mono, color: T.textMuted, animation: 'pulse 1s ease-in-out infinite' }}>▌</span>
          </div>
        )}
      </div>

      {/* Control */}
      <div style={{ padding: '14px 16px', borderTop: `1px solid ${T.border}`, background: T.surface }}>
        <button
          className="esc-chaos-btn"
          onClick={triggerChaos}
          disabled={chaosState === 'SIMULATING'}
          aria-label={`Trigger chaos scenario: ${project.chaos.button}`}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: T.red }}>
            <ServerCrash size={15} strokeWidth={2} />
            <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', fontFamily: T.mono }}>
              {chaosState === 'SIMULATING' ? 'INJECTING FAULT...' : project.chaos.button}
            </span>
          </div>
          <span style={{ fontSize: 10, fontFamily: T.mono, color: 'rgba(248,113,113,0.5)', letterSpacing: '0.05em' }}>
            {project.chaos.desc}
          </span>
        </button>
      </div>
    </div>
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// PROJECT SELECTOR CARD
// ─────────────────────────────────────────────────────────────────────────────
const ProjectCard = memo<{
  project: Project;
  isActive: boolean;
  onClick: () => void;
}>(({ project, isActive, onClick }) => (
  <button
    className={`esc-project-card ${isActive ? 'active' : ''}`}
    style={{ borderColor: isActive ? `${project.accent}50` : T.border }}
    onClick={onClick}
    aria-pressed={isActive}
  >
    {isActive && (
      <motion.div
        layoutId="active-card-ring"
        style={{
          position: 'absolute', inset: 0, borderRadius: 13,
          border: `1.5px solid ${project.accent}60`,
          pointerEvents: 'none',
        }}
        transition={{ type: 'spring', stiffness: 350, damping: 38 }}
      />
    )}

    {/* Accent glow behind icon */}
    {isActive && (
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 60,
        background: `radial-gradient(ellipse 70% 100% at 30% 0%, ${project.accent}12 0%, transparent 70%)`,
        pointerEvents: 'none', borderRadius: '13px 13px 0 0',
      }} />
    )}

    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12, position: 'relative' }}>
      <div style={{
        width: 36, height: 36, borderRadius: 9, flexShrink: 0,
        background: isActive ? `${project.accent}18` : 'rgba(255,255,255,0.04)',
        border: `1px solid ${isActive ? `${project.accent}33` : T.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'background .2s, border-color .2s',
      }}>
        <project.Icon size={16} color={isActive ? project.accent : T.textMuted} strokeWidth={1.5} />
      </div>
      <span style={{
        fontSize: 10, fontFamily: T.mono, fontWeight: 700,
        letterSpacing: '0.1em', textTransform: 'uppercase',
        color: isActive ? project.accent : T.textMuted,
        transition: 'color .2s',
      }}>
        {project.tag}
      </span>
    </div>

    <h4 style={{
      margin: 0, fontSize: 16, fontWeight: 800, letterSpacing: '-0.02em',
      color: isActive ? T.textPri : T.textSec,
      transition: 'color .2s',
    }}>
      {project.title}
    </h4>

    <p style={{ margin: '6px 0 0', fontSize: 12, color: T.textMuted, lineHeight: 1.5 }}>
      {project.domain}
    </p>

    {isActive && (
      <div style={{ position: 'absolute', bottom: 16, right: 16 }}>
        <ChevronRight size={14} color={project.accent} strokeWidth={2} />
      </div>
    )}
  </button>
));

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export const EnterpriseShowcase: React.FC = () => {
  const [activeId, setActiveId] = useState(PROJECTS[0].id);
  const reducedMotion           = useReducedMotion() ?? false;
  const { ref: headerRef, inView: headerIn } = useInView(0.1);

  const project = useMemo(() => PROJECTS.find(p => p.id === activeId)!, [activeId]);

  // Inject global CSS once
  useEffect(() => {
    const id = 'esc-styles';
    if (document.getElementById(id)) return;
    const el = document.createElement('style');
    el.id = id;
    el.textContent = GLOBAL_CSS;
    document.head.appendChild(el);
    return () => { document.getElementById(id)?.remove(); };
  }, []);

  const handleSelect = useCallback((id: string) => setActiveId(id), []);

  return (
    <section
      className="esc"
      id="projects"
      style={{
        background: T.bg,
        padding: 'clamp(56px,8vw,112px) clamp(16px,5vw,56px) clamp(64px,8vw,112px)',
      }}
      aria-label="Engineering Showcase — Architectural Deep Dives"
    >
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>

        {/* ── HEADER ── */}
        <div
          ref={headerRef}
          className={`esc-reveal ${headerIn ? 'in' : ''}`}
          style={{ marginBottom: 'clamp(28px,4vw,52px)' }}
        >
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '5px 14px', borderRadius: 20,
            border: `1px solid ${T.border}`, background: T.cyanDim,
            marginBottom: 18,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: T.cyan, boxShadow: `0 0 7px ${T.cyan}` }} />
            <span style={{ fontSize: 11, fontFamily: T.mono, letterSpacing: '0.1em', textTransform: 'uppercase', color: T.cyan }}>
              Architectural Deep Dives
            </span>
          </div>

          <h2 style={{
            margin: '0 0 12px',
            fontSize: 'clamp(28px,4.5vw,54px)',
            fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1.05,
            color: T.textPri,
          }}>
            Engineering{' '}
            <span style={{ color: T.cyan }}>Under Pressure</span>.
          </h2>

          <p style={{
            margin: 0,
            fontSize: 'clamp(14px,1.5vw,17px)',
            color: T.textSec, lineHeight: 1.72, maxWidth: 540,
          }}>
            Three production systems designed around failure modes. Click a project, read the architecture, then inject a fault to see the recovery system respond in real time.
          </p>
        </div>

        {/* ── PROJECT SELECTOR ── */}
        <div className="esc-selector-grid" style={{ marginBottom: 24 }}>
          {PROJECTS.map(p => (
            <ProjectCard
              key={p.id}
              project={p}
              isActive={activeId === p.id}
              onClick={() => handleSelect(p.id)}
            />
          ))}
        </div>

        {/* ── MAIN DASHBOARD ── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeId}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Telemetry strip */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <project.Icon size={20} color={project.accent} strokeWidth={1.5} />
                    <h3 style={{ margin: 0, fontSize: 'clamp(18px,2.5vw,26px)', fontWeight: 900, letterSpacing: '-0.03em', color: T.textPri }}>
                      {project.title}
                    </h3>
                  </div>
                  <p style={{ margin: '4px 0 0', fontSize: 12, fontFamily: T.mono, color: T.textMuted }}>
                    {project.role} · {project.domain}
                  </p>
                </div>
                <TelemetryStrip accent={project.accent} version={project.version} />
              </div>
            </div>

            {/* Metrics row */}
            <div className="esc-metrics-row" style={{ marginBottom: 20 }}>
              {project.metrics.map(m => (
                <div key={m.label} className="esc-metric">
                  <span style={{ fontSize: 20, fontWeight: 900, color: project.accent, fontFamily: T.mono, letterSpacing: '-0.02em', lineHeight: 1 }}>
                    {m.value}
                  </span>
                  <span style={{ fontSize: 11, color: T.textSec, fontWeight: 600 }}>{m.label}</span>
                </div>
              ))}
            </div>

            {/* Two-column layout */}
            <div className="esc-main-grid">
              {/* PACSI */}
              <div style={{
                padding: '22px 24px',
                background: T.surface,
                border: `1px solid ${T.border}`,
                borderRadius: 14,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, paddingBottom: 14, borderBottom: `1px solid ${T.border}` }}>
                  <span style={{ fontSize: 10, fontFamily: T.mono, letterSpacing: '0.1em', textTransform: 'uppercase', color: T.textMuted }}>
                    PACSI Engineering Matrix
                  </span>
                </div>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeId}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <PacsiMatrix
                      pacsi={project.pacsi}
                      accent={project.accent}
                      accentDim={project.accentDim}
                    />
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Right column: Chaos Terminal + Stack */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <ChaosTerminal project={project} reducedMotion={reducedMotion} />

                {/* Tech Stack */}
                <div style={{
                  padding: '18px 20px',
                  background: T.surface,
                  border: `1px solid ${T.border}`,
                  borderRadius: 14,
                }}>
                  <p style={{ margin: '0 0 12px', fontSize: 10, fontFamily: T.mono, letterSpacing: '0.1em', textTransform: 'uppercase', color: T.textMuted }}>
                    Runtime Environment
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                    {project.techStack.map(t => (
                      <span key={t} className="esc-tag">{t}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

          </motion.div>
        </AnimatePresence>

        {/* Footer note */}
        <div style={{ marginTop: 40, paddingTop: 24, borderTop: `1px solid ${T.border}` }}>
          <p style={{ margin: 0, fontSize: 11, fontFamily: T.mono, color: T.textMuted, letterSpacing: '0.06em' }}>
            All systems designed, architected, and implemented by a single engineer.
          </p>
        </div>

      </div>

      {/* Inline keyframes for spin (can't use Tailwind in pure inline CSS) */}
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.2; } }
      `}</style>
    </section>
  );
};

export default EnterpriseShowcase;
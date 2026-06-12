/**
 * MoonveilImmersive.tsx
 * Complete rewrite — cinematic engineering portfolio section.
 * Self-contained: no external CSS files needed. Framer Motion + Lucide only.
 */

import React, {
  useState, useEffect, useRef, useCallback, useMemo, memo,
} from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  Server, Wifi, Zap, Lock,
  ChevronRight, Code2, Briefcase,
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// DESIGN TOKENS
// ─────────────────────────────────────────────────────────────────────────────
const T = {
  bg:         '#05080F',
  surface:    '#0A0E1A',
  surfaceUp:  '#0F1422',
  border:     'rgba(255,255,255,0.06)',
  borderMid:  'rgba(255,255,255,0.10)',
  cyan:       '#22D3EE',
  cyanDim:    'rgba(34,211,238,0.10)',
  cyanGlow:   'rgba(34,211,238,0.25)',
  teal:       '#2DD4BF',
  tealDim:    'rgba(45,212,191,0.10)',
  indigo:     '#818CF8',
  indigoDim:  'rgba(129,140,248,0.10)',
  amber:      '#FCD34D',
  amberDim:   'rgba(252,211,77,0.10)',
  emerald:    '#34D399',
  emeraldDim: 'rgba(52,211,153,0.10)',
  textPri:    '#F1F5F9',
  textSec:    '#94A3B8',
  textMuted:  '#475569',
  font:       '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
  mono:       '"JetBrains Mono", "Fira Code", "Courier New", monospace',
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// CHAPTER DATA
// ─────────────────────────────────────────────────────────────────────────────
interface ChapterContent {
  problem: string;
  challenge: string;
  solution: string;
  result: string;
}

interface Chapter {
  id: string;
  index: string;
  title: string;
  techTitle: string;
  subtitle: string;
  recruiter: ChapterContent;
  technical: ChapterContent;
  accent: string;
  accentDim: string;
  accentGlow: string;
  Icon: React.FC<{ size?: number; strokeWidth?: number; color?: string }>;
  phase: 'discovery' | 'tcp' | 'resolver' | 'security';
}

const CHAPTERS: Chapter[] = [
  {
    id: 'discovery',
    index: '01',
    title: 'Finding the Game',
    techTitle: 'UDP Broadcast Discovery',
    subtitle: 'How do players find each other without servers?',
    phase: 'discovery',
    Icon: Wifi,
    accent: T.cyan,
    accentDim: T.cyanDim,
    accentGlow: T.cyanGlow,
    recruiter: {
      problem: `Players need to find each other's game without any internet connection.`,
      challenge: 'Without AWS or Firebase, phones in the same room have no way to discover who is hosting.',
      solution: 'Built a local broadcast engine that announces the lobby across the WiFi network the moment a host starts the game.',
      result: 'Instant, offline lobby detection. Zero configuration. Players tap, connect, play.',
    },
    technical: {
      problem: 'Dynamic IP resolution on restrictive enterprise and home subnets.',
      challenge: 'TCP requires a known target IP address. On NAT subnets, clients have no prior knowledge of the host IP.',
      solution: 'Host binds a UDP socket and broadcasts a signed payload on port 4444. Clients listen passively and parse the payload to extract the Host IP and session token before initiating TCP.',
      result: 'Sub-second zero-config peer discovery. No DNS. No STUN. No cloud.',
    },
  },
  {
    id: 'tcp',
    index: '02',
    title: 'Establishing Trust',
    techTitle: 'TCP Session Layer',
    subtitle: `What happens when someone's WiFi drops mid-game?`,
    phase: 'tcp',
    Icon: Server,
    accent: T.teal,
    accentDim: T.tealDim,
    accentGlow: 'rgba(45,212,191,0.20)',
    recruiter: {
      problem: 'Mobile WiFi is unreliable. Players move around, lose signal, and reconnect.',
      challenge: 'A dropped connection mid-vote or mid-reveal breaks the game and ruins the experience.',
      solution: 'Built a persistent session layer that remembers disconnected players by device fingerprint and holds their game slot open.',
      result: 'Players reconnect seamlessly within seconds. The game never breaks. Their role, votes, and state are fully restored.',
    },
    technical: {
      problem: 'Connection volatility causing irrecoverable state divergence during critical game phases.',
      challenge: 'UDP is connectionless — lost packets would corrupt client state permanently with no recovery path.',
      solution: 'Switched to stateful TCP post-discovery. Heartbeat pings every 3s detect timeouts. On timeout, the server substitutes a deterministic bot for the player, keyed to MAC address. Reconnect triggers a full state delta sync.',
      result: 'Guaranteed packet delivery, graceful degradation, and lossless reconnect. Zero game-breaking disconnects.',
    },
  },
  {
    id: 'resolver',
    index: '03',
    title: 'Resolving Conflicts',
    techTitle: 'Deterministic Action Resolver',
    subtitle: 'What if two actions happen at the exact same millisecond?',
    phase: 'resolver',
    Icon: Zap,
    accent: T.amber,
    accentDim: T.amberDim,
    accentGlow: 'rgba(252,211,77,0.20)',
    recruiter: {
      problem: 'Multiple players press buttons at the exact same time — who wins?',
      challenge: `If a Bodyguard protects someone at the same instant an Assassin kills them, who wins depends on whose phone is faster. That's broken.`,
      solution: 'Built a strict priority queue that collects all simultaneous actions, pauses resolution, and applies a deterministic rule hierarchy regardless of arrival order.',
      result: '100% consistent outcomes. A Bodyguard always beats an Assassin. Every time. On every device.',
    },
    technical: {
      problem: 'Concurrent race conditions mutating shared state tree via out-of-order network packets.',
      challenge: 'Network latency (2–200ms) means action packets arrive in random order. First-write-wins creates non-deterministic outcomes.',
      solution: 'Implemented a Deterministic State Machine. All actions buffer in a priority queue keyed by enum: PROTECTION(0) > LETHAL(1) > INVESTIGATIVE(2). Resolution is batched at the end of each phase tick, never on packet arrival.',
      result: 'Zero race conditions. State is always consistent across all clients. Outcome is reproducible from any game seed.',
    },
  },
  {
    id: 'security',
    index: '04',
    title: 'Preventing Cheating',
    techTitle: 'Asymmetric State Sync',
    subtitle: 'How do you hide secret roles on a shared WiFi network?',
    phase: 'security',
    Icon: Lock,
    accent: T.indigo,
    accentDim: T.indigoDim,
    accentGlow: 'rgba(129,140,248,0.20)',
    recruiter: {
      problem: `Players have secret roles. Cheaters could use packet sniffers to see everyone's role.`,
      challenge: 'If the server sends the full game state to all players, a cheater with Wireshark sees every secret.',
      solution: 'The host acts as a filter, surgically stripping private data before sending the state tree to each individual device.',
      result: 'Mathematically impossible to cheat by intercepting network traffic. Every player only ever receives their own slice.',
    },
    technical: {
      problem: 'Man-in-the-middle and ARP-poisoning attacks on LAN expose private game state.',
      challenge: 'Broadcasting the Global Truth tree exposes private player variables (role, alignment, night actions) on any promiscuous network interface.',
      solution: 'Asymmetric State Filter: the Host maintains a single Global Truth tree. On each broadcast, it generates a per-socket Projected State that strips all private nodes not owned by that socket\'s player ID. Public nodes (alive status, vote tally) are shared; Private nodes (role, ability state) are exclusive.',
      result: 'Zero payload leakage. A packet capture reveals only what that specific player is allowed to know. Private state never leaves the host process.',
    },
  },
];

const METRICS = [
  { label: 'Discovery Time',      value: '<1s',    sub: 'avg on local WiFi',  accent: T.cyan    },
  { label: 'Reconnect Success',   value: '99.9%',  sub: 'within 5 seconds',  accent: T.teal    },
  { label: 'Server Cost',         value: '$0',     sub: 'forever, by design', accent: T.emerald },
  { label: 'Race Conditions',     value: '0',      sub: 'resolved by design', accent: T.amber   },
  { label: 'Internet Required',   value: 'None',   sub: 'fully offline',      accent: T.indigo  },
  { label: 'Packet Leakage',      value: '0',      sub: 'per security audit', accent: T.indigo  },
];

// ─────────────────────────────────────────────────────────────────────────────
// HOOKS
// ─────────────────────────────────────────────────────────────────────────────

/** Returns true when the element is in the viewport */
function useInView(threshold = 0.15) {
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

/** True while element is on screen — for pausing expensive animations */
function useIsOnScreen() {
  const ref = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => setOn(e.isIntersecting), { threshold: 0 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, on };
}

/** Responsive breakpoint */
function useBreakpoint() {
  const [bp, setBp] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
  useEffect(() => {
    const check = () => {
      const w = window.innerWidth;
      setBp(w < 640 ? 'mobile' : w < 1024 ? 'tablet' : 'desktop');
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);
  return bp;
}

// ─────────────────────────────────────────────────────────────────────────────
// GLOBAL STYLES  (injected once into <head>)
// ─────────────────────────────────────────────────────────────────────────────
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

  .mnv * { box-sizing: border-box; }
  .mnv { font-family: ${T.font}; -webkit-font-smoothing: antialiased; }

  /* Fade reveal */
  .mnv-reveal { opacity: 0; transform: translateY(24px); transition: opacity .65s cubic-bezier(.22,1,.36,1), transform .65s cubic-bezier(.22,1,.36,1); }
  .mnv-reveal.in { opacity: 1; transform: translateY(0); }

  /* Chapter tab */
  .mnv-tab {
    display: flex; align-items: flex-start; gap: 14px;
    padding: 16px 18px; border-radius: 12px;
    border: 1px solid rgba(255,255,255,0.06);
    background: transparent;
    cursor: pointer; text-align: left; width: 100%;
    transition: background .2s ease, border-color .2s ease;
    position: relative; overflow: hidden;
  }
  .mnv-tab:hover  { background: rgba(255,255,255,0.03); }
  .mnv-tab.active { background: #0A0E1A; }

  /* Tab accent bar */
  .mnv-tab-bar {
    position: absolute; left: 0; top: 0; bottom: 0;
    width: 3px; border-radius: 0 2px 2px 0;
  }

  /* Metric card */
  .mnv-metric {
    background: #0A0E1A;
    border: 1px solid rgba(255,255,255,0.06);
    border-radius: 12px; padding: 20px;
    display: flex; flex-direction: column; gap: 4px;
    transition: border-color .2s ease;
  }
  .mnv-metric:hover { border-color: rgba(255,255,255,0.12); }

  /* Mode toggle */
  .mnv-toggle {
    position: relative; display: flex;
    background: #0A0E1A; border: 1px solid rgba(255,255,255,0.08);
    border-radius: 10px; padding: 4px; gap: 0;
  }
  .mnv-toggle-btn {
    position: relative; z-index: 1;
    display: flex; align-items: center; gap: 6px;
    padding: 8px 16px; border-radius: 8px;
    font-size: 13px; font-weight: 700;
    border: none; background: transparent; cursor: pointer;
    transition: color .2s ease;
    white-space: nowrap;
  }
  .mnv-toggle-pill {
    position: absolute; inset: 4px; border-radius: 7px;
    background: #161B2E; border: 1px solid rgba(255,255,255,0.10);
    transition: transform .25s cubic-bezier(.22,1,.36,1), width .25s cubic-bezier(.22,1,.36,1);
    pointer-events: none;
  }

  /* CTA link */
  .mnv-cta {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 10px 20px; border-radius: 8px;
    border: 1px solid rgba(255,255,255,0.10);
    background: transparent; color: ${T.textPri};
    font-size: 13px; font-weight: 700; letter-spacing: .04em;
    text-decoration: none; cursor: pointer;
    transition: background .2s ease, border-color .2s ease, color .2s ease;
  }
  .mnv-cta:hover { background: ${T.cyan}; border-color: ${T.cyan}; color: #05080F; }

  /* Tag pill */
  .mnv-tag {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 4px 10px; border-radius: 100px;
    border: 1px solid rgba(255,255,255,0.08);
    font-size: 11px; font-family: ${T.mono};
    letter-spacing: .06em; color: ${T.textMuted};
    background: rgba(255,255,255,0.03);
  }

  /* Chapter content label */
  .mnv-label {
    display: inline-block;
    font-size: 10px; font-weight: 700; letter-spacing: .1em;
    text-transform: uppercase; padding: 3px 8px; border-radius: 4px;
    margin-bottom: 6px;
  }

  /* Progress bar */
  .mnv-progress-track {
    height: 2px; background: rgba(255,255,255,0.07);
    border-radius: 1px; overflow: hidden; flex: 1;
  }
  .mnv-progress-fill {
    height: 100%; border-radius: 1px;
    transition: width 6s linear;
  }

  /* SVG animation — GPU only */
  .mnv-svg circle, .mnv-svg line, .mnv-svg path {
    will-change: transform, opacity;
  }

  /* Scrollbar reset */
  .mnv ::-webkit-scrollbar { display: none; }
  .mnv { scrollbar-width: none; }

  /* Responsive grid */
  .mnv-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 24px;
  }
  @media (min-width: 1024px) {
    .mnv-grid {
      grid-template-columns: 1fr 420px 220px;
      gap: 32px;
      align-items: start;
    }
  }

  /* Metrics grid */
  .mnv-metrics-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
  @media (min-width: 640px) {
    .mnv-metrics-grid { grid-template-columns: repeat(3, 1fr); }
  }
  @media (min-width: 1024px) {
    .mnv-metrics-grid { grid-template-columns: 1fr; }
  }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .mnv-reveal { opacity: 1; transform: none; transition: none; }
    .mnv * { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
  }
`;

// ─────────────────────────────────────────────────────────────────────────────
// NETWORK VISUALIZATION
// ─────────────────────────────────────────────────────────────────────────────
interface VizProps {
  phase: Chapter['phase'];
  active: boolean;
  reducedMotion: boolean;
}

const CLIENT_POSITIONS = [
  { cx: '14%', cy: '78%' },
  { cx: '50%', cy: '88%' },
  { cx: '86%', cy: '78%' },
];

const NetworkVisualization = memo<VizProps>(({ phase, active, reducedMotion }) => {

 

 

  const anim = reducedMotion ? false : active;

  return (
    <div style={{ position: 'relative', width: '100%', paddingBottom: '75%', background: T.bg, borderRadius: 16, border: `1px solid ${T.border}`, overflow: 'hidden' }}>

      {/* Ambient gradient */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: phase === 'discovery' ? `radial-gradient(ellipse 55% 40% at 50% 22%, ${T.cyanGlow} 0%, transparent 70%)`
          : phase === 'tcp'      ? `radial-gradient(ellipse 55% 40% at 50% 22%, rgba(45,212,191,0.18) 0%, transparent 70%)`
          : phase === 'resolver' ? `radial-gradient(ellipse 55% 40% at 50% 22%, rgba(252,211,77,0.15) 0%, transparent 70%)`
          : `radial-gradient(ellipse 55% 40% at 50% 22%, rgba(129,140,248,0.18) 0%, transparent 70%)`,
        transition: 'background 0.6s ease',
      }} />

      <svg
        className="mnv-svg"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
        viewBox="0 0 400 300"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Connection lines — appear from TCP phase onward */}
        {(phase === 'tcp' || phase === 'resolver' || phase === 'security') && CLIENT_POSITIONS.map((pos, i) => (
          <motion.line
            key={`line-${i}`}
            x1="200" y1="66"
            x2={`${parseFloat(pos.cx) * 4}`} y2={`${parseFloat(pos.cy) * 3}`}
            stroke={phase === 'security' ? T.indigo : T.teal}
            strokeWidth="1.5"
            strokeDasharray="5 5"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={anim ? { pathLength: 1, opacity: 0.35 } : { pathLength: 0, opacity: 0 }}
            transition={{ duration: 0.6, delay: i * 0.15 }}
          />
        ))}

        {/* Discovery broadcast rings */}
        {phase === 'discovery' && [0, 1, 2].map(i => (
          <motion.circle
            key={`ring-${i}`}
            cx="200" cy="66" r="0"
            fill="none" stroke={T.cyan} strokeWidth="1.5"
            initial={{ r: 10, opacity: 0.7 }}
            animate={anim ? { r: [10, 80], opacity: [0.7, 0] } : { r: 10, opacity: 0 }}
            transition={{ duration: 2.4, delay: i * 0.8, repeat: Infinity, ease: 'easeOut' }}
          />
        ))}

        {/* Resolver: packets from clients converging to host */}
        {phase === 'resolver' && CLIENT_POSITIONS.map((pos, i) => (
          <motion.circle
            key={`pkt-${i}`}
            r="5" fill={T.amber}
            initial={{ opacity: 0 }}
            animate={anim ? {
              cx: [parseFloat(pos.cx) * 4, 200],
              cy: [parseFloat(pos.cy) * 3, 66],
              opacity: [0, 1, 1, 0],
            } : { opacity: 0 }}
            transition={{ duration: 1.6, delay: i * 0.3, repeat: Infinity, ease: 'easeInOut' }}
          />
        ))}

        {/* Security: filtered packets flowing from host to clients */}
        {phase === 'security' && CLIENT_POSITIONS.map((pos, i) => (
          <motion.circle
            key={`sec-${i}`}
            r="5" fill={T.indigo}
            initial={{ opacity: 0 }}
            animate={anim ? {
              cx: [200, parseFloat(pos.cx) * 4],
              cy: [66, parseFloat(pos.cy) * 3],
              opacity: [0, 1, 1, 0],
            } : { opacity: 0 }}
            transition={{ duration: 1.8, delay: i * 0.4, repeat: Infinity, ease: 'easeInOut' }}
          />
        ))}

        {/* Host Node */}
        <motion.circle
          cx="200" cy="66" r="28"
          fill={T.surface}
          stroke={phase === 'discovery' ? T.cyan : phase === 'tcp' ? T.teal : phase === 'resolver' ? T.amber : T.indigo}
          strokeWidth="1.5"
          animate={anim ? { strokeOpacity: [0.5, 1, 0.5] } : { strokeOpacity: 0.5 }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        />
        {/* Host glow core */}
        <motion.circle
          cx="200" cy="66" r="12"
          fill={phase === 'discovery' ? T.cyan : phase === 'tcp' ? T.teal : phase === 'resolver' ? T.amber : T.indigo}
          animate={anim ? { r: [10, 14, 10], opacity: [0.8, 1, 0.8] } : { r: 10 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Client nodes */}
        {CLIENT_POSITIONS.map((pos, i) => {
          const cx = parseFloat(pos.cx) * 4;
          const cy = parseFloat(pos.cy) * 3;
          return (
            <g key={`client-${i}`}>
              <rect
                x={cx - 18} y={cy - 18} width="36" height="36" rx="8"
                fill={T.surface}
                stroke={T.border}
                strokeWidth="1"
              />
              {/* Security shield badge */}
              {phase === 'security' && (
                <motion.circle
                  cx={cx + 14} cy={cy - 14} r="8"
                  fill={T.indigo}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                />
              )}
              {/* Discovery ping dot */}
              {phase === 'discovery' && (
                <motion.circle
                  cx={cx + 14} cy={cy - 14} r="5"
                  fill={T.cyan}
                  animate={anim ? { opacity: [0, 1, 0], scale: [0.5, 1.3, 0.5] } : { opacity: 0 }}
                  transition={{ duration: 1.8, delay: i * 0.5, repeat: Infinity }}
                />
              )}
            </g>
          );
        })}
      </svg>

      {/* Labels */}
      <div style={{
        position: 'absolute', top: '13%', left: '50%', transform: 'translateX(-50%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, pointerEvents: 'none',
      }}>
        <Server size={16} color={phase === 'discovery' ? T.cyan : phase === 'tcp' ? T.teal : phase === 'resolver' ? T.amber : T.indigo} strokeWidth={1.5} />
        <span style={{ fontSize: 10, fontFamily: T.mono, color: T.textMuted, letterSpacing: '0.08em' }}>HOST</span>
      </div>

      {CLIENT_POSITIONS.map((pos, i) => (
        <div key={`clabel-${i}`} style={{
          position: 'absolute',
          left: pos.cx, top: `calc(${pos.cy} + 20px)`,
          transform: 'translateX(-50%)',
          fontSize: 9, fontFamily: T.mono, color: T.textMuted,
          letterSpacing: '0.06em', pointerEvents: 'none',
        }}>
          P{i + 1}
        </div>
      ))}

      {/* Phase label overlay */}
      <div style={{
        position: 'absolute', top: 14, left: 14,
        display: 'flex', alignItems: 'center', gap: 6,
        background: 'rgba(5,8,15,0.80)', backdropFilter: 'blur(8px)',
        padding: '5px 10px', borderRadius: 6,
        border: `1px solid ${T.border}`,
      }}>
        <span style={{
          width: 6, height: 6, borderRadius: '50%',
          background: phase === 'discovery' ? T.cyan : phase === 'tcp' ? T.teal : phase === 'resolver' ? T.amber : T.indigo,
          boxShadow: `0 0 6px ${phase === 'discovery' ? T.cyan : phase === 'tcp' ? T.teal : phase === 'resolver' ? T.amber : T.indigo}`,
          flexShrink: 0,
        }} />
        <span style={{ fontSize: 10, fontFamily: T.mono, letterSpacing: '0.08em', color: T.textSec }}>
          {phase.toUpperCase()}
        </span>
      </div>
    </div>
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// CHAPTER CONTENT CARD
// ─────────────────────────────────────────────────────────────────────────────
interface ContentCardProps {
  content: ChapterContent;
  chapter: Chapter;
}

const ContentCard = memo<ContentCardProps>(({ content, chapter }) => (
  <motion.div
    key={chapter.id}
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -8 }}
    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
  >
    {/* Problem */}
    <div>
      <span className="mnv-label" style={{ background: 'rgba(148,163,184,0.08)', color: T.textMuted }}>
        Problem
      </span>
      <p style={{ margin: 0, fontSize: 14, color: T.textSec, lineHeight: 1.75 }}>{content.problem}</p>
    </div>

    {/* Challenge */}
    <div>
      <span className="mnv-label" style={{ background: 'rgba(148,163,184,0.08)', color: T.textMuted }}>
        Challenge
      </span>
      <p style={{ margin: 0, fontSize: 14, color: T.textSec, lineHeight: 1.75 }}>{content.challenge}</p>
    </div>

    {/* Solution */}
    <div style={{
      padding: '14px 16px', borderRadius: 10,
      background: chapter.accentDim,
      border: `1px solid ${chapter.accent}33`,
    }}>
      <span className="mnv-label" style={{ background: `${chapter.accent}22`, color: chapter.accent }}>
        Architecture Decision
      </span>
      <p style={{ margin: 0, fontSize: 14, color: T.textPri, lineHeight: 1.75 }}>{content.solution}</p>
    </div>

    {/* Result */}
    <div>
      <span className="mnv-label" style={{ background: T.emeraldDim, color: T.emerald }}>
        Result
      </span>
      <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: T.textPri, lineHeight: 1.75 }}>{content.result}</p>
    </div>
  </motion.div>
));

// ─────────────────────────────────────────────────────────────────────────────
// CHAPTER TAB
// ─────────────────────────────────────────────────────────────────────────────
interface TabProps {
  chapter: Chapter;
  isActive: boolean;
  isTech: boolean;
  onClick: () => void;
}

const ChapterTab = memo<TabProps>(({ chapter, isActive, isTech, onClick }) => (
  <button
    className={`mnv-tab ${isActive ? 'active' : ''}`}
    style={{ borderColor: isActive ? `${chapter.accent}40` : T.border }}
    onClick={onClick}
    aria-selected={isActive}
    aria-label={`Chapter ${chapter.index}: ${isTech ? chapter.techTitle : chapter.title}`}
  >
    {isActive && (
      <motion.div
        className="mnv-tab-bar"
        layoutId="tab-accent"
        style={{ background: chapter.accent }}
        transition={{ type: 'spring', stiffness: 400, damping: 40 }}
      />
    )}

    {/* Icon */}
    <div style={{
      width: 36, height: 36, borderRadius: 8, flexShrink: 0,
      background: isActive ? chapter.accentDim : 'rgba(255,255,255,0.03)',
      border: `1px solid ${isActive ? `${chapter.accent}33` : T.border}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      transition: 'background .2s, border-color .2s',
    }}>
      {(() => {
        const Icon = chapter.Icon;
        return <Icon size={16} color={isActive ? chapter.accent : T.textMuted} strokeWidth={1.5} />;
      })()}
    </div>

    {/* Text */}
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
        <span style={{ fontSize: 10, fontFamily: T.mono, color: T.textMuted, letterSpacing: '0.1em' }}>
          {chapter.index}
        </span>
        <span style={{
          fontSize: 14, fontWeight: 700, color: isActive ? T.textPri : T.textSec,
          transition: 'color .2s',
        }}>
          {isTech ? chapter.techTitle : chapter.title}
        </span>
      </div>
      <p style={{ margin: 0, fontSize: 12, color: T.textMuted, lineHeight: 1.4, display: isActive ? 'none' : 'block' }}>
        {chapter.subtitle}
      </p>
    </div>

    <ChevronRight
      size={14}
      color={isActive ? chapter.accent : T.textMuted}
      style={{ flexShrink: 0, transition: 'transform .2s, color .2s', transform: isActive ? 'rotate(90deg)' : 'none' }}
    />
  </button>
));

// ─────────────────────────────────────────────────────────────────────────────
// METRICS PANEL
// ─────────────────────────────────────────────────────────────────────────────
const MetricsPanel = memo(() => {
  const { ref, inView } = useInView(0.1);
  return (
    <div ref={ref}>
      <p style={{ margin: '0 0 12px', fontSize: 10, fontFamily: T.mono, letterSpacing: '0.1em', textTransform: 'uppercase', color: T.textMuted }}>
        Engineering Impact
      </p>
      <div className="mnv-metrics-grid">
        {METRICS.map((m, i) => (
          <motion.div
            key={m.label}
            className="mnv-metric"
            initial={{ opacity: 0, y: 12 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: i * 0.07, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            <span style={{ fontSize: 22, fontWeight: 900, color: m.accent, fontFamily: T.mono, letterSpacing: '-0.02em', lineHeight: 1 }}>
              {m.value}
            </span>
            <span style={{ fontSize: 11, fontWeight: 700, color: T.textPri }}>{m.label}</span>
            <span style={{ fontSize: 10, color: T.textMuted, fontFamily: T.mono }}>{m.sub}</span>
          </motion.div>
        ))}
      </div>

      {/* Stack tags */}
      <div style={{ marginTop: 16, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {['React Native', 'TCP/UDP', 'State Machine', 'Zeroconf'].map(t => (
          <span key={t} className="mnv-tag">{t}</span>
        ))}
      </div>
    </div>
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// MODE TOGGLE
// ─────────────────────────────────────────────────────────────────────────────
interface ModeToggleProps {
  isTech: boolean;
  onChange: (v: boolean) => void;
}

const ModeToggle = memo<ModeToggleProps>(({ isTech, onChange }) => {
  const btnRef0 = useRef<HTMLButtonElement>(null);
  const btnRef1 = useRef<HTMLButtonElement>(null);
  const [pillStyle, setPillStyle] = useState<React.CSSProperties>({});

  useEffect(() => {
    const btn = isTech ? btnRef1.current : btnRef0.current;
    if (!btn) return;
    setPillStyle({ left: btn.offsetLeft, top: btn.offsetTop, width: btn.offsetWidth, height: btn.offsetHeight });
  }, [isTech]);

  return (
    <div className="mnv-toggle" role="group" aria-label="View mode">
      <div className="mnv-toggle-pill" style={{ ...pillStyle, position: 'absolute' }} />
      <button
        ref={btnRef0}
        className="mnv-toggle-btn"
        style={{ color: !isTech ? T.textPri : T.textMuted }}
        onClick={() => onChange(false)}
        aria-pressed={!isTech}
      >
        <Briefcase size={14} strokeWidth={1.8} />
        Recruiter
      </button>
      <button
        ref={btnRef1}
        className="mnv-toggle-btn"
        style={{ color: isTech ? T.textPri : T.textMuted }}
        onClick={() => onChange(true)}
        aria-pressed={isTech}
      >
        <Code2 size={14} strokeWidth={1.8} />
        Technical
      </button>
    </div>
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// PROGRESS BAR
// ─────────────────────────────────────────────────────────────────────────────
interface ProgressBarProps {
  active: number;
  total: number;
  accent: string;
  running: boolean;
}

const ProgressBar = memo<ProgressBarProps>(({ active, total, accent, running }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
    <span style={{ fontSize: 11, fontFamily: T.mono, color: T.textMuted, whiteSpace: 'nowrap' }}>
      {String(active + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
    </span>
    <div className="mnv-progress-track">
      <motion.div
        className="mnv-progress-fill"
        style={{ background: accent }}
        initial={{ width: '0%' }}
        animate={{ width: running ? '100%' : '0%' }}
        transition={running ? { duration: 6, ease: 'linear' } : { duration: 0 }}
        key={`${active}-${running}`}
      />
    </div>
    <span style={{ fontSize: 10, fontFamily: T.mono, color: T.textMuted, letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>
      {CHAPTERS[active].phase.toUpperCase()}
    </span>
  </div>
));

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export const MoonveilImmersive: React.FC = () => {
  const [activeIdx, setActiveIdx]   = useState(0);
  const [isTech, setIsTech]         = useState(false);
  const [autoPlay, setAutoPlay]     = useState(true);
  const reducedMotion               = useReducedMotion() ?? false;
  const { ref: screenRef, on }      = useIsOnScreen();
  const { ref: headerRef, inView: headerIn } = useInView(0.1);
  const bp                          = useBreakpoint();

  const chapter = CHAPTERS[activeIdx];

  // Inject global CSS once
  useEffect(() => {
    const id = 'mnv-styles';
    if (document.getElementById(id)) return;
    const el = document.createElement('style');
    el.id = id;
    el.textContent = GLOBAL_CSS;
    document.head.appendChild(el);
    return () => { document.getElementById(id)?.remove(); };
  }, []);

  // Auto-advance chapters
  useEffect(() => {
    if (!autoPlay || !on || reducedMotion) return;
    const t = setInterval(() => setActiveIdx(p => (p + 1) % CHAPTERS.length), 6000);
    return () => clearInterval(t);
  }, [autoPlay, on, reducedMotion]);

  const handleTabClick = useCallback((i: number) => {
    setActiveIdx(i);
    setAutoPlay(false);
  }, []);

  const content = useMemo(
    () => isTech ? chapter.technical : chapter.recruiter,
    [isTech, chapter],
  );

  return (
    <section
      className="mnv"
      ref={screenRef}
      style={{
        background: T.bg,
        padding: 'clamp(48px,7vw,100px) clamp(16px,5vw,56px) clamp(64px,8vw,112px)',
        minHeight: '100vh',
      }}
      aria-label="Moonveil Network Engine — Engineering Case Study"
    >
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>

        {/* ── HEADER ── */}
        <div
          ref={headerRef}
          className={`mnv-reveal ${headerIn ? 'in' : ''}`}
          style={{ marginBottom: 'clamp(32px,5vw,64px)' }}
        >
          {/* Eyebrow */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '5px 14px', borderRadius: 20,
            border: `1px solid ${T.border}`, background: T.cyanDim,
            marginBottom: 20,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: T.cyan, boxShadow: `0 0 8px ${T.cyan}`, flexShrink: 0 }} />
            <span style={{ fontSize: 11, fontFamily: T.mono, letterSpacing: '0.1em', textTransform: 'uppercase', color: T.cyan }}>
              Decentralized Multiplayer Architecture
            </span>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: 20 }}>
            <div>
              <h2 style={{
                margin: '0 0 12px',
                fontSize: 'clamp(28px,4.5vw,56px)',
                fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1.05,
                color: T.textPri,
              }}>
                Moonveil{' '}
                <span style={{ color: T.cyan }}>Network Engine</span>
              </h2>
              <p style={{ margin: 0, fontSize: 'clamp(14px,1.5vw,17px)', color: T.textSec, lineHeight: 1.7, maxWidth: 560 }}>
                A fully offline, peer-to-peer multiplayer system — no cloud, no servers, no latency. Built from scratch on TCP/UDP with a deterministic state machine and asymmetric data security.
              </p>
            </div>
            <ModeToggle isTech={isTech} onChange={setIsTech} />
          </div>
        </div>

        {/* ── PROGRESS ── */}
        <div style={{ marginBottom: 28 }}>
          <ProgressBar
            active={activeIdx}
            total={CHAPTERS.length}
            accent={chapter.accent}
            running={autoPlay && on && !reducedMotion}
          />
        </div>

        {/* ── MAIN GRID ── */}
        <div className="mnv-grid">

          {/* COL 1: Visualization */}
          <div>
            <NetworkVisualization
              phase={chapter.phase}
              active={on && !reducedMotion}
              reducedMotion={reducedMotion}
            />

            {/* Active chapter detail — visible below viz on mobile/tablet */}
            {bp !== 'desktop' && (
              <div style={{
                marginTop: 20,
                padding: '20px',
                background: T.surface,
                border: `1px solid ${T.border}`,
                borderRadius: 12,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                  {(() => { const Icon = chapter.Icon; return <Icon size={18} color={chapter.accent} strokeWidth={1.5} />; })()}
                  <span style={{ fontSize: 16, fontWeight: 800, color: T.textPri }}>
                    {isTech ? chapter.techTitle : chapter.title}
                  </span>
                </div>
                <AnimatePresence mode="wait">
                  <ContentCard key={`${chapter.id}-${isTech}`} content={content} chapter={chapter} />
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* COL 2: Chapters */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {/* Tab list */}
            <div role="tablist" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {CHAPTERS.map((ch, i) => (
                <ChapterTab
                  key={ch.id}
                  chapter={ch}
                  isActive={activeIdx === i}
                  isTech={isTech}
                  onClick={() => handleTabClick(i)}
                />
              ))}
            </div>

            {/* Content panel — desktop only */}
            {bp === 'desktop' && (
              <div style={{
                marginTop: 20,
                padding: '20px 22px',
                background: T.surface,
                border: `1px solid ${T.border}`,
                borderRadius: 12,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                  {(() => { const Icon = chapter.Icon; return <Icon size={18} color={chapter.accent} strokeWidth={1.5} />; })()}
                  <span style={{ fontSize: 15, fontWeight: 800, color: T.textPri }}>
                    {isTech ? chapter.techTitle : chapter.title}
                  </span>
                </div>
                <AnimatePresence mode="wait">
                  <ContentCard key={`${chapter.id}-${isTech}`} content={content} chapter={chapter} />
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* COL 3: Metrics (desktop only) */}
          {bp === 'desktop' && (
            <div style={{
              padding: '20px',
              background: T.surface,
              border: `1px solid ${T.border}`,
              borderRadius: 12,
              position: 'sticky', top: 32,
            }}>
              <MetricsPanel />
            </div>
          )}

        </div>

        {/* Metrics — mobile/tablet below */}
        {bp !== 'desktop' && (
          <div style={{
            marginTop: 28, padding: '20px',
            background: T.surface,
            border: `1px solid ${T.border}`,
            borderRadius: 12,
          }}>
            <MetricsPanel />
          </div>
        )}

        {/* ── FOOTER CTA ── */}
        <div style={{ marginTop: 48, paddingTop: 32, borderTop: `1px solid ${T.border}`, display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 20 }}>
          <div>
            <p style={{ margin: '0 0 4px', fontSize: 11, fontFamily: T.mono, letterSpacing: '0.08em', textTransform: 'uppercase', color: T.textMuted }}>
              Moonveil — v1.0.0 · In Development
            </p>
            <p style={{ margin: 0, fontSize: 13, color: T.textSec }}>
              Solo-built Android game — design, networking, and engine by one engineer.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <a href="#" className="mnv-cta" style={{ borderColor: `${T.cyan}40`, color: T.cyan }}>
              View Source <ChevronRight size={14} strokeWidth={2} />
            </a>
          </div>
        </div>

      </div>
    </section>
  );
};

export default MoonveilImmersive;

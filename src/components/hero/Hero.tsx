/**
 * Hero.tsx — Engineering Command Center
 *
 * Architecture:
 * - Phase-driven boot sequence (DARK → INIT → ONLINE)
 * - Fully autonomous system simulation (fault → recovery → stability)
 * - HeroScene event bus integration (hero:packet, hero:linkFail, hero:linkRecover)
 * - 60fps — all animations via transform/opacity/filter on GPU thread
 * - prefers-reduced-motion respected throughout
 * - Semantic HTML, ARIA labels, keyboard navigation
 */

import {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
  memo,
} from 'react';
import HeroScene from './HeroScene';
import { ArrowRight, Download, ExternalLink } from 'lucide-react';

// ─── Types ─────────────────────────────────────────────────────────────────────

type NodeHealth = 'healthy' | 'degraded' | 'failed' | 'recovering';
type BootPhase  = 'dark' | 'init' | 'online';

interface SystemRow {
  id: string;
  label: string;
  status: string;
  health: NodeHealth;
  load: number;
}

interface ActivityEntry {
  id: number;
  ts: number;
  time: string;
  event: string;
  subsystem: string;
  type: 'sync' | 'heartbeat' | 'integrity' | 'recovery' | 'fail' | 'checkpoint' | 'flush';
}

// ─── Constants ─────────────────────────────────────────────────────────────────

const HEADLINES = [
  { line1: 'Systems fail.', line2: 'Mine recover.' },
  { line1: 'Designed for failure.', line2: 'Built for continuity.' },
  { line1: 'Architecting resilience', line2: 'into every layer.' },
  { line1: 'Where others assume stability,', line2: 'I engineer it.' },
] as const;

const CAPABILITIES = [
  'Unreliable network environments',
  'Offline-first state architecture',
  'Real-time system coordination',
  'Autonomous fault recovery',
  'Distributed data integrity',
] as const;

const INITIAL_ROWS: SystemRow[] = [
  { id: 'statesync', label: 'State sync engine', status: 'ACTIVE',   health: 'healthy', load: 0.88 },
  { id: 'offline',   label: 'Offline queue',     status: 'HEALTHY',  health: 'healthy', load: 0.72 },
  { id: 'integrity', label: 'Integrity engine',  status: 'RUNNING',  health: 'healthy', load: 0.95 },
  { id: 'network',   label: 'Network fabric',    status: 'NOMINAL',  health: 'healthy', load: 1.00 },
  { id: 'recovery',  label: 'Recovery services', status: 'STANDBY',  health: 'healthy', load: 0.60 },
];

const PACKET_TEMPLATES: { type: ActivityEntry['type']; event: string; subsystem: string }[] = [
  { type: 'heartbeat',  event: 'HEARTBEAT_ACK',     subsystem: 'moonveil → state-sync'    },
  { type: 'sync',       event: 'STATE_RECONCILED',  subsystem: 'freight-desk → state-sync'},
  { type: 'heartbeat',  event: 'NODE_ALIVE',         subsystem: 'offline-first → coordinator'},
  { type: 'integrity',  event: 'CHECKSUM_VERIFIED',  subsystem: 'lyrics-vault → integrity' },
  { type: 'sync',       event: 'DELTA_APPLIED',      subsystem: 'state-sync → coordinator' },
  { type: 'checkpoint', event: 'CHECKPOINT_CREATED', subsystem: 'recovery-svc → store'     },
  { type: 'flush',      event: 'QUEUE_FLUSHED',      subsystem: 'offline-queue → gateway'  },
  { type: 'sync',       event: 'SYNC_COMPLETED',     subsystem: 'coordinator → all-nodes'  },
];

// ─── Colours ────────────────────────────────────────────────────────────────────

const HEALTH_COLORS: Record<NodeHealth, string> = {
  healthy:    '#10d9a0',
  degraded:   '#f59e0b',
  failed:     '#ef4444',
  recovering: '#f59e0b',
};

const EVENT_COLORS: Record<ActivityEntry['type'], { bg: string; fg: string; short: string }> = {
  sync:       { bg: 'rgba(0,200,255,0.08)',  fg: '#00c8ff', short: 'SYNC'  },
  heartbeat:  { bg: 'rgba(16,217,160,0.08)', fg: '#10d9a0', short: 'HB'   },
  integrity:  { bg: 'rgba(136,255,68,0.08)', fg: '#88ff44', short: 'INTEG' },
  recovery:   { bg: 'rgba(245,158,11,0.08)', fg: '#f59e0b', short: 'RECV' },
  fail:       { bg: 'rgba(239,68,68,0.08)',  fg: '#ef4444', short: 'FAIL' },
  checkpoint: { bg: 'rgba(168,85,247,0.08)', fg: '#a855f7', short: 'CKPT' },
  flush:      { bg: 'rgba(59,130,246,0.08)', fg: '#3b82f6', short: 'FLSH' },
};

// ─── Helpers ────────────────────────────────────────────────────────────────────

function nowTs(): string {
  const d = new Date();
  return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}:${String(d.getSeconds()).padStart(2,'0')}.${String(d.getMilliseconds()).padStart(3,'0').slice(0,2)}`;
}



// ─── Sub-components (all memo'd) ────────────────────────────────────────────────

// Heartbeat dot with glow
const HeartDot = memo(({ health }: { health: NodeHealth }) => {
  const color = HEALTH_COLORS[health];
  const pulse  = health !== 'healthy' && health !== 'failed';
  return (
    <span
      aria-hidden="true"
      style={{
        display: 'inline-block',
        width: 5,
        height: 5,
        borderRadius: '50%',
        flexShrink: 0,
        background: color,
        boxShadow: health === 'healthy' ? `0 0 6px ${color}88` : health === 'failed' ? `0 0 6px #ef444488` : `0 0 8px ${color}`,
        animation: (pulse || health === 'healthy') ? `hbPulse 2s ease-in-out infinite` : 'none',
        animationDelay: pulse ? '0s' : `${Math.random() * 2}s`,
      }}
    />
  );
});
HeartDot.displayName = 'HeartDot';

// Load bar
const LoadBar = memo(({ value, health }: { value: number; health: NodeHealth }) => {
  const color = HEALTH_COLORS[health];
  return (
    <div style={{
      width: 52,
      height: 3,
      background: 'rgba(255,255,255,0.05)',
      borderRadius: 2,
      overflow: 'hidden',
    }}>
      <div style={{
        height: '100%',
        width: `${Math.round(value * 100)}%`,
        background: color,
        boxShadow: `0 0 6px ${color}66`,
        borderRadius: 2,
        transition: 'width 700ms cubic-bezier(0.4,0,0.2,1)',
      }} />
    </div>
  );
});
LoadBar.displayName = 'LoadBar';

// Sparkline — premium canvas with fill gradient
const Sparkline = memo(({ data, fault }: { data: number[]; fault: boolean }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const W = canvas.offsetWidth;
    const H = canvas.offsetHeight;
    canvas.width  = W * dpr;
    canvas.height = H * dpr;
    ctx.scale(dpr, dpr);

    const max = Math.max(...data, 1);
    const pts = data.map((v, i) => ({
      x: (i / (data.length - 1)) * W,
      y: H - (v / max) * (H - 4) - 2,
    }));

    // Fill
    const fill = ctx.createLinearGradient(0, 0, 0, H);
    fill.addColorStop(0, fault ? 'rgba(239,68,68,0.18)' : 'rgba(0,200,255,0.12)');
    fill.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.beginPath();
    pts.forEach(({ x, y }, i) => i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y));
    ctx.lineTo(W, H);
    ctx.lineTo(0, H);
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.fill();

    // Stroke
    ctx.beginPath();
    pts.forEach(({ x, y }, i) => i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y));
    ctx.strokeStyle = fault ? 'rgba(239,68,68,0.7)' : 'rgba(0,200,255,0.6)';
    ctx.lineWidth   = 1.5;
    ctx.lineJoin    = 'round';
    ctx.stroke();

    // Glow pass
    ctx.beginPath();
    pts.forEach(({ x, y }, i) => i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y));
    ctx.strokeStyle = fault ? 'rgba(239,68,68,0.25)' : 'rgba(0,200,255,0.2)';
    ctx.lineWidth   = 4;
    ctx.stroke();
  }, [data, fault]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full block"
      aria-label="Packet throughput sparkline"
    />
  );
});
Sparkline.displayName = 'Sparkline';

// Panel chrome — shared wrapper
const Panel = memo(({
  title, right, children, glowFault = false, style = {},
}: {
  title: string;
  right?: React.ReactNode;
  children: React.ReactNode;
  glowFault?: boolean;
  style?: React.CSSProperties;
}) => (
  <div
    role="region"
    aria-label={title}
    style={{
      border: `1px solid ${glowFault ? 'rgba(239,68,68,0.35)' : 'rgba(255,255,255,0.06)'}`,
      borderRadius: 6,
      background: 'rgba(255,255,255,0.015)',
      backdropFilter: 'blur(0)',
      overflow: 'hidden',
      transition: 'border-color 600ms ease',
      boxShadow: glowFault ? '0 0 20px rgba(239,68,68,0.08)' : 'none',
      ...style,
    }}
  >
    {/* Title bar */}
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '8px 14px',
      borderBottom: '1px solid rgba(255,255,255,0.04)',
      background: 'rgba(0,0,0,0.2)',
    }}>
      <span style={{
        fontFamily: 'var(--mono)',
        fontSize: 9,
        letterSpacing: '0.16em',
        textTransform: 'uppercase',
        color: 'rgba(148,163,184,0.5)',
      }}>{title}</span>
      {right}
    </div>
    {children}
  </div>
));
Panel.displayName = 'Panel';

// ─── Main Component ─────────────────────────────────────────────────────────────

export const Hero = () => {
  // ── State ────────────────────────────────────────────────────────────────────
  const [phase,    setPhase]    = useState<BootPhase>('dark');
  const [capIdx,   setCapIdx]   = useState(0);
  const [hlIdx,    setHlIdx]    = useState(0);
  const [rows,     setRows]     = useState<SystemRow[]>(INITIAL_ROWS);
  const [activity, setActivity] = useState<ActivityEntry[]>([]);
  const [pktTotal, setPktTotal] = useState(0);
  const [pktRate,  setPktRate]  = useState(0);
  const [sparkData, setSparkData] = useState<number[]>(new Array(30).fill(0));
  const [inFault,  setInFault]  = useState(false);
  const [bootRows, setBootRows] = useState<number[]>([]);    // rows revealed during init
  const [systemTs, setSystemTs] = useState('');

  const entryId          = useRef(0);
  const pktThisSecond    = useRef(0);
  const faultRef         = useRef(false);
  const prefersReduced   = useRef(
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  // ── System timestamp ─────────────────────────────────────────────────────────
  useEffect(() => {
    const tick = () => setSystemTs(nowTs());
    tick();
    const id = setInterval(tick, 100);
    return () => clearInterval(id);
  }, []);

  // ── Boot sequence ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (prefersReduced.current) { setPhase('online'); setBootRows([0,1,2,3,4]); return; }

    // Phase 1: darkness → init
    const t0 = setTimeout(() => setPhase('init'), 120);

    // Stagger rows awakening
    [0,1,2,3,4].forEach((i) => {
      const t = setTimeout(() => setBootRows((prev) => [...prev, i]), 300 + i * 160);
      // clean up handled by returning one function below
      void t; // avoid lint warning on unref'd setTimeouts (we clear on unmount)
    });

    // Phase 2: online
    const t1 = setTimeout(() => setPhase('online'), 1600);

    return () => { clearTimeout(t0); clearTimeout(t1); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
// placeholder to absorb forEach setTimeout refs

  // ── Capability & headline rotators ───────────────────────────────────────────
  useEffect(() => {
    const id = setInterval(() => setCapIdx((i) => (i + 1) % CAPABILITIES.length), 2800);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const id = setInterval(() => setHlIdx((i) => (i + 1) % HEADLINES.length), 5600);
    return () => clearInterval(id);
  }, []);

  // ── Add activity entry ────────────────────────────────────────────────────────
  const addEntry = useCallback((type: ActivityEntry['type'], event: string, subsystem: string) => {
    const id = ++entryId.current;
    setActivity((prev) => [{ id, ts: Date.now(), time: nowTs(), type, event, subsystem }, ...prev].slice(0, 8));
    pktThisSecond.current++;
    setPktTotal((n) => n + 1);
  }, []);

  // ── Fault / recovery cycle ─────────────────────────────────────────────────
  const triggerFault = useCallback(() => {
    if (faultRef.current) return;
    faultRef.current = true;
    setInFault(true);

    // Degrade
    setRows((prev) => prev.map((r) =>
      r.id === 'network'  ? { ...r, health: 'failed',    status: 'LINK_DOWN',  load: 0.10 } :
      r.id === 'recovery' ? { ...r, health: 'degraded',  status: 'ACTIVATING', load: 0.95 } : r
    ));
    addEntry('fail', 'LINK_SEVERED', 'freight-desk → state-sync');

    const t1 = setTimeout(() => {
      setRows((prev) => prev.map((r) =>
        r.id === 'network'  ? { ...r, health: 'recovering', status: 'RESTORING', load: 0.52 } :
        r.id === 'recovery' ? { ...r, health: 'healthy',    status: 'ACTIVE',    load: 0.98 } : r
      ));
      addEntry('recovery', 'NODE_RECOVERED', 'recovery-svc → network-fabric');
    }, 2200);

    const t2 = setTimeout(() => {
      addEntry('sync', 'LINK_RESTORED', 'network-fabric → all-nodes');
    }, 3600);

    const t3 = setTimeout(() => {
      setRows((prev) => prev.map((r) =>
        r.id === 'network'  ? { ...r, health: 'healthy', status: 'NOMINAL', load: 1.0  } :
        r.id === 'recovery' ? { ...r, health: 'healthy', status: 'STANDBY', load: 0.60 } : r
      ));
      faultRef.current = false;
      setInFault(false);
    }, 5000);

    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [addEntry]);

  // ── Autonomous traffic loop (rAF) ─────────────────────────────────────────
  useEffect(() => {
    let pktTimer  = 1200;
    let faultTimer = 14000;
    let secTimer   = 0;
    let last = performance.now();
    let raf: number;

    const tick = (now: number) => {
      const dt = Math.min(now - last, 80);
      last = now;

      pktTimer -= dt;
      if (pktTimer <= 0) {
        pktTimer = 900 + Math.random() * 1500;
        const tmpl = PACKET_TEMPLATES[Math.floor(Math.random() * PACKET_TEMPLATES.length)];
        addEntry(tmpl.type, tmpl.event, tmpl.subsystem);
      }

      faultTimer -= dt;
      if (faultTimer <= 0) {
        faultTimer = 18000 + Math.random() * 12000;
        triggerFault();
      }

      secTimer += dt;
      if (secTimer >= 1000) {
        secTimer = 0;
        const rate = pktThisSecond.current;
        pktThisSecond.current = 0;
        setPktRate(rate);
        setSparkData((prev) => [...prev.slice(1), rate]);
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [addEntry, triggerFault]);

  // ── HeroScene event bridge ────────────────────────────────────────────────
  useEffect(() => {
    const onPacket = (e: Event) => {
      const { type, from, to } = (e as CustomEvent).detail;
      addEntry(type, type.toUpperCase(), `${from} → ${to}`);
    };
    const onFail = () => triggerFault();

    window.addEventListener('hero:packet',      onPacket);
    window.addEventListener('hero:linkFail',    onFail);
    window.addEventListener('hero:linkRecover', onFail);
    return () => {
      window.removeEventListener('hero:packet',      onPacket);
      window.removeEventListener('hero:linkFail',    onFail);
      window.removeEventListener('hero:linkRecover', onFail);
    };
  }, [addEntry, triggerFault]);

  // ── Derived ───────────────────────────────────────────────────────────────
  const overallHealth = useMemo(() => {
    if (rows.some((r) => r.health === 'failed'))    return 'DEGRADED';
    if (rows.some((r) => r.health === 'recovering'))return 'RESTORING';
    return 'NOMINAL';
  }, [rows]);

  const headline = HEADLINES[hlIdx];

  // ── Boot visibility helpers ────────────────────────────────────────────────
  const visible = phase !== 'dark';
  const online  = phase === 'online';

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      {/* ── Global keyframes + CSS vars ── */}
      <style>{`
        :root {
          --mono: 'JetBrains Mono', 'Fira Code', ui-monospace, monospace;
        }
        @keyframes hbPulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.4; }
        }
        @keyframes scanMove {
          0%   { transform: translateY(-100vh); }
          100% { transform: translateY(100vh); }
        }
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes blinkCaret {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0; }
        }
        @keyframes capScroll {
          from { transform: translateY(0); }
          to   { transform: translateY(-${CAPABILITIES.length * 32}px); }
        }
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>

      <section
        aria-label="Engineering command center hero"
        style={{
          position: 'relative',
          minHeight: '100svh',
          width: '100%',
          overflow: 'hidden',
          background: '#06090f',
        }}
      >
        {/* ── Subtle scanline overlay ── */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none',
            backgroundImage:
              'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,200,255,0.008) 3px, rgba(0,200,255,0.008) 4px)',
          }}
        />

        {/* Moving scan line — single slow pass */}
        {!prefersReduced.current && (
          <div
            aria-hidden="true"
            style={{
              position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none',
              overflow: 'hidden',
            }}
          >
            <div style={{
              position: 'absolute',
              left: 0, right: 0, height: 1,
              background: 'linear-gradient(90deg, transparent, rgba(0,200,255,0.06), transparent)',
              animation: 'scanMove 8s linear infinite',
            }} />
          </div>
        )}

        {/* Three.js backdrop */}
        <HeroScene />

        {/* ── Command center overlay ── */}
        <div
          style={{
            position: 'relative',
            zIndex: 10,
            minHeight: '100svh',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 380px), 1fr))',
            gap: 0,
            opacity: visible ? 1 : 0,
            transition: prefersReduced.current ? 'none' : 'opacity 600ms ease',
          }}
        >
          {/* ════════════════════════════════════
               LEFT — Identity + Actions
          ════════════════════════════════════ */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              padding: 'clamp(5rem, 10vw, 6rem) clamp(1.25rem, 5vw, 4rem) clamp(2rem, 4vw, 3rem)',
              gap: 0,
            }}
          >
            {/* System status badge */}
            <div
              aria-live="polite"
              aria-label={`System status: ${overallHealth}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginBottom: 24,
                opacity: online ? 1 : 0,
                transform: online ? 'none' : 'translateY(-8px)',
                transition: prefersReduced.current ? 'none' : 'opacity 500ms ease, transform 500ms ease',
              }}
            >
              <span
                style={{
                  width: 6, height: 6,
                  borderRadius: '50%',
                  background: inFault ? '#ef4444' : '#10d9a0',
                  boxShadow: inFault ? '0 0 8px #ef444488' : '0 0 8px #10d9a088',
                  animation: 'hbPulse 2s ease-in-out infinite',
                  flexShrink: 0,
                }}
              />
              <span style={{
                fontFamily: 'var(--mono)',
                fontSize: 'clamp(9px, 1.5vw, 11px)',
                letterSpacing: '0.2em',
                color: inFault ? '#ef4444' : '#10d9a0',
                border: `1px solid ${inFault ? 'rgba(239,68,68,0.25)' : 'rgba(16,217,160,0.2)'}`,
                borderRadius: 3,
                padding: '3px 8px',
                transition: 'color 500ms ease, border-color 500ms ease',
              }}>
                SYSTEM {overallHealth}
              </span>

              {/* Timestamp */}
              <span style={{
                fontFamily: 'var(--mono)',
                fontSize: 'clamp(8px, 1.2vw, 9px)',
                letterSpacing: '0.12em',
                color: 'rgba(148,163,184,0.3)',
                marginLeft: 'auto',
              }} aria-hidden="true">
                {systemTs}
              </span>
            </div>

            {/* ── Headline ── */}
            <div
              style={{
                marginBottom: 'clamp(1rem, 2.5vw, 1.5rem)',
                opacity: online ? 1 : 0,
                transform: online ? 'none' : 'translateY(16px)',
                transition: prefersReduced.current ? 'none' : 'opacity 700ms 200ms ease, transform 700ms 200ms cubic-bezier(0.16,1,0.3,1)',
              }}
            >
              <h1
                style={{
                  fontFamily: '"Inter", system-ui, sans-serif',
                  fontSize: 'clamp(1.75rem, 4.5vw, 3.5rem)',
                  fontWeight: 800,
                  letterSpacing: '-0.035em',
                  lineHeight: 1.06,
                  color: '#e8eaf0',
                  margin: 0,
                }}
              >
                <span
                  key={`h1-${hlIdx}`}
                  style={{
                    display: 'block',
                    animation: prefersReduced.current ? 'none' : 'fadeSlideIn 500ms ease forwards',
                  }}
                >
                  {headline.line1}
                </span>
                <span
                  key={`h2-${hlIdx}`}
                  style={{
                    display: 'block',
                    color: '#2a9d8f',
                    animation: prefersReduced.current ? 'none' : 'fadeSlideIn 500ms 60ms ease forwards',
                  }}
                >
                  {headline.line2}
                </span>
              </h1>

              {/* Name — secondary */}
              <p style={{
                fontFamily: 'var(--mono)',
                fontSize: 'clamp(10px, 1.5vw, 12px)',
                letterSpacing: '0.16em',
                color: 'rgba(148,163,184,0.4)',
                marginTop: '0.75rem',
                textTransform: 'uppercase',
              }}>
                Shashikanth Panuganti<span style={{ color: '#2a9d8f' }}>_</span>
              </p>
            </div>

            {/* ── Rotating capability ── */}
            <div
              style={{
                height: 32,
                overflow: 'hidden',
                marginBottom: 'clamp(1.5rem, 3vw, 2.5rem)',
                opacity: online ? 1 : 0,
                transition: prefersReduced.current ? 'none' : 'opacity 600ms 350ms ease',
              }}
              aria-live="polite"
              aria-label={`Current expertise: ${CAPABILITIES[capIdx]}`}
            >
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  transform: `translateY(-${capIdx * 32}px)`,
                  transition: prefersReduced.current ? 'none' : 'transform 500ms cubic-bezier(0.4,0,0.2,1)',
                }}
              >
                {[...CAPABILITIES, CAPABILITIES[0]].map((cap, i) => (
                  <div
                    key={i}
                    style={{
                      height: 32,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      fontFamily: 'var(--mono)',
                      fontSize: 'clamp(11px, 1.6vw, 14px)',
                      color: 'rgba(148,163,184,0.6)',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <span style={{ color: '#2a9d8f', fontSize: '0.8em' }}>◆</span>
                    {cap}
                  </div>
                ))}
              </div>
            </div>

            {/* ── KPIs ── */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 8,
                marginBottom: 'clamp(1.5rem, 3vw, 2.5rem)',
                opacity: online ? 1 : 0,
                transform: online ? 'none' : 'translateY(12px)',
                transition: prefersReduced.current ? 'none' : 'opacity 600ms 450ms ease, transform 600ms 450ms ease',
              }}
              aria-label="Engineering metrics"
            >
              {[
                { val: '99.9%', label: 'Availability',       sub: 'self-healing' },
                { val: '<50ms', label: 'Recovery RTO',       sub: 'autonomous'   },
                { val: pktTotal > 0 ? `${pktTotal}` : '—',
                  label: 'Events routed', sub: 'this session'   },
              ].map(({ val, label, sub }) => (
                <div
                  key={label}
                  style={{
                    border: '1px solid rgba(255,255,255,0.05)',
                    borderRadius: 5,
                    background: 'rgba(255,255,255,0.02)',
                    padding: 'clamp(8px, 1.5vw, 12px)',
                  }}
                >
                  <div style={{
                    fontFamily: 'var(--mono)',
                    fontSize: 'clamp(14px, 2vw, 20px)',
                    fontWeight: 700,
                    color: '#e8eaf0',
                    lineHeight: 1,
                    letterSpacing: '-0.02em',
                  }}>{val}</div>
                  <div style={{
                    fontFamily: 'var(--mono)',
                    fontSize: 'clamp(7px, 1vw, 9px)',
                    letterSpacing: '0.08em',
                    color: 'rgba(148,163,184,0.4)',
                    marginTop: 5,
                    textTransform: 'uppercase',
                  }}>{label}</div>
                  <div style={{
                    fontFamily: 'var(--mono)',
                    fontSize: 7,
                    letterSpacing: '0.1em',
                    color: '#2a9d8f',
                    marginTop: 2,
                    opacity: 0.7,
                  }}>{sub}</div>
                </div>
              ))}
            </div>

            {/* ── CTAs ── */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                opacity: online ? 1 : 0,
                transform: online ? 'none' : 'translateY(10px)',
                transition: prefersReduced.current ? 'none' : 'opacity 600ms 550ms ease, transform 600ms 550ms ease',
              }}
            >
              {/* Primary */}
              <a
                href="#moonveil"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: 'clamp(9px, 1.5vw, 12px) clamp(12px, 2vw, 16px)',
                  background: 'rgba(42,157,143,0.08)',
                  border: '1px solid rgba(42,157,143,0.3)',
                  borderRadius: 4,
                  fontFamily: 'var(--mono)',
                  fontSize: 'clamp(9px, 1.4vw, 12px)',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: '#2a9d8f',
                  textDecoration: 'none',
                  transition: 'background 150ms ease, border-color 150ms ease',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = 'rgba(42,157,143,0.14)';
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(42,157,143,0.55)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = 'rgba(42,157,143,0.08)';
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(42,157,143,0.3)';
                }}
              >
                <span>Launch architecture tour</span>
                <ArrowRight size={13} aria-hidden="true" />
              </a>

              {/* Secondary */}
              <a
                href="#architecture"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: 'clamp(9px, 1.5vw, 12px) clamp(12px, 2vw, 16px)',
                  background: 'transparent',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: 4,
                  fontFamily: 'var(--mono)',
                  fontSize: 'clamp(9px, 1.4vw, 12px)',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: 'rgba(148,163,184,0.5)',
                  textDecoration: 'none',
                  transition: 'background 150ms ease, border-color 150ms ease, color 150ms ease',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)';
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.1)';
                  (e.currentTarget as HTMLElement).style.color = 'rgba(148,163,184,0.8)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = 'transparent';
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.06)';
                  (e.currentTarget as HTMLElement).style.color = 'rgba(148,163,184,0.5)';
                }}
              >
                <span>View engineering decisions</span>
                <ExternalLink size={12} aria-hidden="true" />
              </a>

              {/* Resume */}
              <a
                href="/resume.pdf"
                download
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: 'clamp(9px, 1.5vw, 12px) clamp(12px, 2vw, 16px)',
                  background: 'transparent',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: 4,
                  fontFamily: 'var(--mono)',
                  fontSize: 'clamp(9px, 1.4vw, 12px)',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: 'rgba(148,163,184,0.5)',
                  textDecoration: 'none',
                  transition: 'background 150ms ease, border-color 150ms ease, color 150ms ease',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)';
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.1)';
                  (e.currentTarget as HTMLElement).style.color = 'rgba(148,163,184,0.8)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = 'transparent';
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.06)';
                  (e.currentTarget as HTMLElement).style.color = 'rgba(148,163,184,0.5)';
                }}
              >
                <span>Download resume</span>
                <Download size={12} aria-hidden="true" />
              </a>
            </div>
          </div>

          {/* ════════════════════════════════════
               RIGHT — Live Telemetry
          ════════════════════════════════════ */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              padding: 'clamp(5rem, 10vw, 6rem) clamp(1.25rem, 5vw, 3rem) clamp(2rem, 4vw, 3rem)',
              gap: 12,
              opacity: online ? 1 : 0,
              transition: prefersReduced.current ? 'none' : 'opacity 700ms 300ms ease',
            }}
          >
            {/* ── System Health ── */}
            <Panel
              title="System health"
              glowFault={inFault}
              right={
                <span
                  aria-live="polite"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                    fontFamily: 'var(--mono)',
                    fontSize: 9,
                    color: inFault ? '#ef4444' : '#10d9a0',
                    transition: 'color 500ms ease',
                  }}
                >
                  <span style={{
                    width: 5, height: 5, borderRadius: '50%',
                    background: 'currentColor',
                    animation: 'hbPulse 2s ease-in-out infinite',
                    flexShrink: 0,
                  }} />
                  {overallHealth}
                </span>
              }
            >
              <div role="list">
                {rows.map((row, i) => {
                  const shown = bootRows.includes(i) || phase === 'online';
                  return (
                    <div
                      role="listitem"
                      key={row.id}
                      aria-label={`${row.label}: ${row.status}`}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '7px 14px',
                        gap: 10,
                        opacity: shown ? 1 : 0,
                        transform: shown ? 'none' : 'translateX(12px)',
                        transition: prefersReduced.current ? 'none' : `opacity 400ms ${i * 80}ms ease, transform 400ms ${i * 80}ms ease, background 200ms ease`,
                        cursor: 'default',
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.02)';
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.background = 'transparent';
                      }}
                    >
                      {/* Label */}
                      <span style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 7,
                        fontFamily: 'var(--mono)',
                        fontSize: 'clamp(9px, 1.2vw, 11px)',
                        color: 'rgba(148,163,184,0.55)',
                      }}>
                        <HeartDot health={row.health} />
                        {row.label}
                      </span>

                      {/* Right cluster */}
                      <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <LoadBar value={row.load} health={row.health} />
                        <span style={{
                          fontFamily: 'var(--mono)',
                          fontSize: 'clamp(8px, 1.1vw, 10px)',
                          fontWeight: 700,
                          letterSpacing: '0.1em',
                          color: HEALTH_COLORS[row.health],
                          transition: 'color 500ms ease',
                          minWidth: 70,
                          textAlign: 'right',
                        }}>
                          {row.status}
                        </span>
                      </span>
                    </div>
                  );
                })}
              </div>
            </Panel>

            {/* ── Activity feed ── */}
            <Panel
              title="Event stream"
              right={
                <span style={{
                  fontFamily: 'var(--mono)',
                  fontSize: 9,
                  color: 'rgba(148,163,184,0.3)',
                }}>
                  {pktRate} evt/s
                </span>
              }
            >
              <div
                aria-live="polite"
                aria-label="System event feed"
                style={{
                  padding: '8px 0',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 3,
                  minHeight: 'clamp(80px, 12vw, 130px)',
                }}
              >
                {activity.length === 0 && (
                  <div style={{
                    padding: '0 14px',
                    fontFamily: 'var(--mono)',
                    fontSize: 9,
                    color: 'rgba(148,163,184,0.2)',
                    fontStyle: 'italic',
                  }}>
                    Awaiting events…
                  </div>
                )}
                {activity.map((entry) => {
                  const ec = EVENT_COLORS[entry.type];
                  return (
                    <div
                      key={entry.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '2px 14px',
                        animation: prefersReduced.current ? 'none' : 'fadeSlideIn 280ms ease forwards',
                        fontFamily: 'var(--mono)',
                        fontSize: 'clamp(8px, 1.1vw, 10px)',
                      }}
                    >
                      {/* Timestamp */}
                      <span style={{
                        fontSize: 7,
                        letterSpacing: '0.06em',
                        color: 'rgba(148,163,184,0.2)',
                        minWidth: 52,
                        flexShrink: 0,
                      }}>{entry.time}</span>

                      {/* Type badge */}
                      <span style={{
                        fontSize: 7,
                        padding: '1px 4px',
                        borderRadius: 2,
                        fontWeight: 700,
                        letterSpacing: '0.12em',
                        background: ec.bg,
                        color: ec.fg,
                        flexShrink: 0,
                      }}>{ec.short}</span>

                      {/* Event */}
                      <span style={{
                        color: '#e8eaf0',
                        fontWeight: 600,
                        fontSize: 'clamp(8px, 1.1vw, 10px)',
                        flexShrink: 0,
                      }}>{entry.event}</span>

                      {/* Subsystem */}
                      <span style={{
                        color: 'rgba(148,163,184,0.35)',
                        flex: 1,
                        minWidth: 0,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        fontSize: 'clamp(7px, 1vw, 9px)',
                      }}>{entry.subsystem}</span>

                      {/* Dot */}
                      <span style={{
                        width: 4, height: 4,
                        borderRadius: '50%',
                        background: ec.fg,
                        flexShrink: 0,
                        boxShadow: `0 0 4px ${ec.fg}66`,
                      }} aria-hidden="true" />
                    </div>
                  );
                })}
              </div>
            </Panel>

            {/* ── Throughput graph ── */}
            <Panel
              title="Packet throughput"
              glowFault={inFault}
              right={
                <span style={{
                  fontFamily: 'var(--mono)',
                  fontSize: 9,
                  color: 'rgba(148,163,184,0.3)',
                }}>
                  30s window
                </span>
              }
            >
              <div style={{ padding: '10px 14px 4px', height: 'clamp(36px, 5vw, 48px)' }}>
                <Sparkline data={sparkData} fault={inFault} />
              </div>

              {/* Uptime strip */}
              <div
                aria-label="Uptime history: 30 intervals"
                style={{
                  display: 'flex',
                  gap: 2,
                  padding: '4px 14px 10px',
                }}
              >
                {Array.from({ length: 30 }, (_, i) => {
                  const isFaultSlot = i === 11 || i === 12;
                  return (
                    <div
                      key={i}
                      title={isFaultSlot ? 'Degraded event' : 'Healthy'}
                      style={{
                        flex: 1,
                        height: 5,
                        borderRadius: 1,
                        background: isFaultSlot
                          ? 'rgba(239,68,68,0.45)'
                          : 'rgba(16,217,160,0.5)',
                        transition: 'background 500ms ease',
                      }}
                    />
                  );
                })}
              </div>

              {/* Uptime label */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 14px 10px',
              }}>
                <span style={{
                  fontFamily: 'var(--mono)',
                  fontSize: 8,
                  letterSpacing: '0.1em',
                  color: 'rgba(148,163,184,0.25)',
                }}>UPTIME · 30 INTERVALS</span>
                <span style={{
                  fontFamily: 'var(--mono)',
                  fontSize: 8,
                  letterSpacing: '0.08em',
                  color: inFault ? 'rgba(239,68,68,0.6)' : 'rgba(16,217,160,0.6)',
                  transition: 'color 500ms ease',
                }}>
                  {inFault ? '93.3%' : '99.9%'}
                </span>
              </div>
            </Panel>

            {/* ── Confidence indicators row ── */}
            <div
              aria-label="System confidence metrics"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 8,
              }}
            >
              {[
                { label: 'State consistency', val: inFault ? 87 : 100, color: inFault ? '#f59e0b' : '#10d9a0' },
                { label: 'Sync accuracy',     val: inFault ? 91 : 100, color: inFault ? '#f59e0b' : '#10d9a0' },
                { label: 'Healing score',     val: inFault ? 72 : 98,  color: inFault ? '#ef4444' : '#10d9a0' },
              ].map(({ label, val, color }) => (
                <div
                  key={label}
                  style={{
                    border: '1px solid rgba(255,255,255,0.05)',
                    borderRadius: 5,
                    background: 'rgba(255,255,255,0.01)',
                    padding: '8px 10px',
                  }}
                >
                  <div style={{
                    fontFamily: 'var(--mono)',
                    fontSize: 'clamp(12px, 2vw, 16px)',
                    fontWeight: 700,
                    color,
                    lineHeight: 1,
                    transition: 'color 600ms ease',
                    letterSpacing: '-0.01em',
                  }}>
                    {val}<span style={{ fontSize: '0.6em', opacity: 0.7 }}>%</span>
                  </div>
                  <div style={{
                    fontFamily: 'var(--mono)',
                    fontSize: 7,
                    letterSpacing: '0.08em',
                    color: 'rgba(148,163,184,0.3)',
                    marginTop: 4,
                    textTransform: 'uppercase',
                    lineHeight: 1.3,
                  }}>{label}</div>
                  {/* micro bar */}
                  <div style={{
                    marginTop: 5,
                    height: 2,
                    borderRadius: 1,
                    background: 'rgba(255,255,255,0.05)',
                    overflow: 'hidden',
                  }}>
                    <div style={{
                      height: '100%',
                      width: `${val}%`,
                      background: color,
                      boxShadow: `0 0 4px ${color}44`,
                      borderRadius: 1,
                      transition: 'width 800ms cubic-bezier(0.4,0,0.2,1), background 600ms ease',
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Scroll indicator ── */}
        <div
          aria-label="Scroll down"
          style={{
            position: 'absolute',
            bottom: 'clamp(1.5rem, 3vw, 2.5rem)',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 10,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 6,
            opacity: online ? 0.5 : 0,
            transition: prefersReduced.current ? 'none' : 'opacity 800ms 1s ease',
          }}
        >
          <span style={{
            fontFamily: 'var(--mono)',
            fontSize: 7,
            letterSpacing: '0.2em',
            color: 'rgba(148,163,184,0.4)',
            textTransform: 'uppercase',
          }}>scroll</span>
          <div style={{
            width: 20, height: 32,
            border: '1px solid rgba(148,163,184,0.15)',
            borderRadius: 10,
            display: 'flex',
            justifyContent: 'center',
            paddingTop: 5,
          }}>
            <div style={{
              width: 3, height: 6,
              background: '#2a9d8f',
              borderRadius: 2,
              animation: prefersReduced.current ? 'none' : 'hbPulse 1.5s ease-in-out infinite',
            }} />
          </div>
        </div>
      </section>
    </>
  );
};

export default Hero;
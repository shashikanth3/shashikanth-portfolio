/**
 * Hero.tsx — Systems Engineering Command Center
 *
 * Layout: asymmetric grid — identity/actions left, live telemetry right.
 * The Three.js scene from HeroScene.tsx fills the full section as the backdrop.
 *
 * Design philosophy:
 * - Every element communicates engineering behavior, not portfolio decoration.
 * - The status panel is driven by real event emissions from HeroScene via a
 * shared event bus (window.heroEvents), so the UI reflects what the scene
 * actually does — link failures turn the Network row red, recovery turns it
 * amber, restoration turns it green.
 * - The rotating capability line cycles through the five core engineering
 * domains in sync with the scene's storytelling events.
 * - Buttons feel like system actions, not navigation links.
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import HeroScene from './HeroScene';
import { ArrowRight, Download, ExternalLink } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

type NodeHealth = 'healthy' | 'degraded' | 'failed' | 'recovering';

interface SystemRow {
  id: string;
  label: string;
  status: string;
  health: NodeHealth;
  load: number; // 0–1
}

interface ActivityEntry {
  id: number;
  time: string;
  type: 'sync' | 'heartbeat' | 'integrity' | 'recovery' | 'fail';
  from: string;
  to: string;
}

// ─── Event bus (shared with HeroScene) ───────────────────────────────────────
//
// HeroScene emits CustomEvents on window so the Hero overlay can react:
//   window.dispatchEvent(new CustomEvent('hero:packet', { detail: { type, from, to } }))
//   window.dispatchEvent(new CustomEvent('hero:linkFail', { detail: { from, to } }))
//   window.dispatchEvent(new CustomEvent('hero:linkRecover', { detail: { from, to } }))
//   window.dispatchEvent(new CustomEvent('hero:nodeOverload', { detail: { id } }))
//   window.dispatchEvent(new CustomEvent('hero:nodeSyncing', { detail: { id } }))
//   window.dispatchEvent(new CustomEvent('hero:nodeOnline', { detail: { id } }))
//
// If HeroScene doesn't emit these yet, the panel still works — it runs its own
// autonomous simulation. The events just make it perfectly in sync.

// ─── Constants ────────────────────────────────────────────────────────────────

const CAPABILITIES = [
  'Unreliable network environments',
  'Offline-first architectures',
  'Real-time state coordination',
  'Autonomous fault recovery',
  'Distributed data integrity',
] as const;

const INITIAL_ROWS: SystemRow[] = [
  { id: 'statesync', label: 'State sync engine', status: 'ACTIVE',  health: 'healthy',   load: 0.88 },
  { id: 'offline',   label: 'Offline queue',     status: 'HEALTHY', health: 'healthy',   load: 0.72 },
  { id: 'integrity', label: 'Integrity engine',  status: 'RUNNING', health: 'healthy',   load: 0.95 },
  { id: 'network',   label: 'Network fabric',    status: 'NOMINAL', health: 'healthy',   load: 1.00 },
  { id: 'recovery',  label: 'Recovery services', status: 'STANDBY', health: 'healthy',   load: 0.60 },
];

const PACKET_TEMPLATES = [
  { type: 'heartbeat' as const, from: 'Moonveil',     to: 'State Sync'     },
  { type: 'sync'      as const, from: 'Freight Desk', to: 'State Sync'     },
  { type: 'heartbeat' as const, from: 'Offline-First',to: 'Freight Desk'   },
  { type: 'integrity' as const, from: 'Lyrics Vault', to: 'Integrity'      },
  { type: 'sync'      as const, from: 'State Sync',   to: 'Self-Healing'   },
  { type: 'heartbeat' as const, from: 'Self-Healing', to: 'State Sync'     },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

const StatusDot = ({ health }: { health: NodeHealth }) => {
  const colors: Record<NodeHealth, string> = {
    healthy:    'bg-emerald-400',
    degraded:   'bg-yellow-400 animate-pulse',
    failed:     'bg-red-500',
    recovering: 'bg-yellow-400 animate-pulse',
  };
  return (
    <span
      className={`inline-block w-[5px] h-[5px] rounded-full flex-shrink-0 ${colors[health]}`}
    />
  );
};

const LoadBar = ({ value, health }: { value: number; health: NodeHealth }) => {
  const barColors: Record<NodeHealth, string> = {
    healthy:    'bg-emerald-400',
    degraded:   'bg-yellow-400',
    failed:     'bg-red-500',
    recovering: 'bg-yellow-400',
  };
  return (
    <div className="w-[40px] sm:w-[60px] h-[3px] bg-white/5 rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-700 ${barColors[health]}`}
        style={{ width: `${Math.round(value * 100)}%` }}
      />
    </div>
  );
};

const StatusLabel = ({ text, health }: { text: string; health: NodeHealth }) => {
  const textColors: Record<NodeHealth, string> = {
    healthy:    'text-emerald-400',
    degraded:   'text-yellow-400',
    failed:     'text-red-400',
    recovering: 'text-yellow-400',
  };
  return (
    <span className={`text-[9px] sm:text-[11px] font-bold tracking-wider font-mono ${textColors[health]}`}>
      {text}
    </span>
  );
};

const TypeBadge = ({ type }: { type: ActivityEntry['type'] }) => {
  const styles: Record<ActivityEntry['type'], string> = {
    sync:      'bg-cyan-400/10 text-cyan-400',
    heartbeat: 'bg-emerald-400/10 text-emerald-400',
    integrity: 'bg-lime-400/10 text-lime-400',
    recovery:  'bg-yellow-400/10 text-yellow-400',
    fail:      'bg-red-400/10 text-red-400',
  };
  const labels: Record<ActivityEntry['type'], string> = {
    sync: 'SYNC', heartbeat: 'HB', integrity: 'INTEG', recovery: 'RECV', fail: 'FAIL',
  };
  return (
    <span className={`text-[7px] sm:text-[8px] px-[4px] sm:px-[5px] py-[1px] rounded-[2px] font-bold tracking-wider font-mono flex-shrink-0 ${styles[type]}`}>
      {labels[type]}
    </span>
  );
};

const PacketDot = ({ type }: { type: ActivityEntry['type'] }) => {
  const colors: Record<ActivityEntry['type'], string> = {
    sync: '#00c8ff', heartbeat: '#00e5a0', integrity: '#88ff44', recovery: '#ffd700', fail: '#ff4444',
  };
  return (
    <span
      className="inline-block w-[3px] sm:w-[4px] h-[3px] sm:h-[4px] rounded-full flex-shrink-0"
      style={{ background: colors[type] }}
    />
  );
};

// ─── Sparkline canvas ─────────────────────────────────────────────────────────

const Sparkline = ({ data }: { data: number[] }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const w = canvas.offsetWidth;
    const h = canvas.offsetHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);

    const max = Math.max(...data, 1);
    ctx.clearRect(0, 0, w, h);
    ctx.beginPath();
    data.forEach((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - (v / max) * (h - 4) - 2;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.strokeStyle = 'rgba(0, 200, 255, 0.5)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }, [data]);

  return <canvas ref={canvasRef} className="w-full h-full block" />;
};

// ─── Main component ───────────────────────────────────────────────────────────

export const Hero = () => {
  const [capIndex, setCapIndex] = useState(0);
  const [rows, setRows] = useState<SystemRow[]>(INITIAL_ROWS);
  const [activity, setActivity] = useState<ActivityEntry[]>([]);
  const [pktTotal, setPktTotal] = useState(0);
  const [pktRate, setPktRate] = useState(0);
  const [sparkData, setSparkData] = useState<number[]>(new Array(30).fill(0));
  const [booted, setBooted] = useState(false);

  const entryId = useRef(0);
  const pktThisSecond = useRef(0);
  const inFault = useRef(false);

  // ── Boot sequence delay ────────────────────────────────────────────────────
  useEffect(() => {
    const t = setTimeout(() => setBooted(true), 400);
    return () => clearTimeout(t);
  }, []);

  // ── Capability rotator ─────────────────────────────────────────────────────
  useEffect(() => {
    const interval = setInterval(() => {
      setCapIndex((i) => (i + 1) % CAPABILITIES.length);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  // ── Add activity entry ─────────────────────────────────────────────────────
  const addEntry = useCallback((type: ActivityEntry['type'], from: string, to: string) => {
    const now = new Date();
    const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    const id = ++entryId.current;
    setActivity((prev) => [{ id, time, type, from, to }, ...prev].slice(0, 7));
    pktThisSecond.current++;
    setPktTotal((n) => n + 1);
  }, []);

  // ── Network fault simulation ───────────────────────────────────────────────
  const triggerFault = useCallback(() => {
    if (inFault.current) return;
    inFault.current = true;

    setRows((prev) =>
      prev.map((r) =>
        r.id === 'network'
          ? { ...r, health: 'failed', status: 'DEGRADED', load: 0.18 }
          : r
      )
    );
    addEntry('fail', 'Freight Desk', 'State Sync');

    setTimeout(() => {
      setRows((prev) =>
        prev.map((r) =>
          r.id === 'network'
            ? { ...r, health: 'recovering', status: 'RECOVERING', load: 0.55 }
            : r
        )
      );
      addEntry('recovery', 'State Sync', 'Freight Desk');
    }, 2200);

    setTimeout(() => {
      setRows((prev) =>
        prev.map((r) =>
          r.id === 'network'
            ? { ...r, health: 'healthy', status: 'NOMINAL', load: 1.0 }
            : r
        )
      );
      inFault.current = false;
    }, 5000);
  }, [addEntry]);

  // ── Autonomous traffic ─────────────────────────────────────────────────────
  useEffect(() => {
    let pktTimer = 0;
    let faultTimer = 14000;
    let secondTimer = 0;
    let last = performance.now();
    let raf: number;

    const tick = (now: number) => {
      const dt = Math.min(now - last, 80);
      last = now;

      pktTimer -= dt;
      if (pktTimer <= 0) {
        pktTimer = 1100 + Math.random() * 1400;
        const tmpl = PACKET_TEMPLATES[Math.floor(Math.random() * PACKET_TEMPLATES.length)];
        addEntry(tmpl.type, tmpl.from, tmpl.to);
      }

      faultTimer -= dt;
      if (faultTimer <= 0) {
        faultTimer = 18000 + Math.random() * 10000;
        triggerFault();
      }

      secondTimer += dt;
      if (secondTimer >= 1000) {
        secondTimer = 0;
        const rate = pktThisSecond.current;
        pktThisSecond.current = 0;
        setPktRate(rate);
        setSparkData((prev) => {
          const next = [...prev.slice(1), rate];
          return next;
        });
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [addEntry, triggerFault]);

  // ── Listen to HeroScene events ─────────────────────────────────────────────
  useEffect(() => {
    const onPacket = (e: Event) => {
      const { type, from, to } = (e as CustomEvent).detail;
      addEntry(type, from, to);
    };
    const onFail = () => triggerFault();

    window.addEventListener('hero:packet', onPacket);
    window.addEventListener('hero:linkFail', onFail);
    return () => {
      window.removeEventListener('hero:packet', onPacket);
      window.removeEventListener('hero:linkFail', onFail);
    };
  }, [addEntry, triggerFault]);

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <section className="relative min-h-screen w-full overflow-x-hidden bg-[#020c18]">
      {/* Scanline texture */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,200,255,0.012) 2px, rgba(0,200,255,0.012) 4px)',
        }}
      />

      {/* Three.js scene — full bleed backdrop */}
      <HeroScene />

      {/* Command center overlay */}
      <div
        className={`relative z-10 min-h-screen grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-0 transition-opacity duration-700 ${booted ? 'opacity-100' : 'opacity-0'}`}
      >
        {/* ── Left: Identity + Actions ─────────────────────────────────────── */}
        <div className="flex flex-col justify-center px-5 sm:px-12 lg:px-16 pt-24 pb-8 lg:py-16 gap-0">
          
          {/* Boot badge */}
          <div className="flex items-center gap-2 sm:gap-3 mb-2">
            <span className="w-[4px] h-[4px] sm:w-[6px] sm:h-[6px] rounded-full bg-cyan-400 animate-pulse" />
            <span className="font-mono text-[10px] sm:text-[12px] tracking-[0.2em] text-cyan-400 border border-cyan-400/20 rounded-[3px] px-2 sm:px-3 py-[3px] sm:py-[4px]">
              SYSTEMS ONLINE
            </span>
          </div>

          {/* Headline / Identity */}
          <div className="mb-4 flex flex-col gap-0 w-full">
            <h1 className="font-sans text-[22px] min-[375px]:text-[26px] sm:text-[36px] lg:text-[48px] font-bold tracking-tight text-slate-50 leading-none whitespace-nowrap -mb-1">
              SHASHIKANTH PANUGANTI<span className="text-cyan-400">.</span>
            </h1>
            <p className="font-sans text-[22px] min-[375px]:text-[26px] sm:text-[36px] lg:text-[48px] text-slate-300 font-light tracking-tight leading-[1.05] whitespace-nowrap">
              Building systems that hold<br />
              under <span className="text-cyan-400 font-semibold">real conditions</span>.
            </p>
          </div>

          {/* Rotating capability */}
          <div className="h-[32px] overflow-hidden mb-8 lg:mb-10 w-full max-w-[100vw]">
            <div
              className="flex flex-col transition-transform duration-500 ease-in-out"
              style={{ transform: `translateY(-${capIndex * 32}px)` }}
            >
              {[...CAPABILITIES, CAPABILITIES[0]].map((cap, i) => (
                <div
                  key={i}
                  className="h-[32px] flex items-center gap-2 sm:gap-3 font-mono text-[12px] min-[375px]:text-[14px] sm:text-[16px] lg:text-[18px] text-slate-400 whitespace-nowrap"
                >
                  <span className="text-emerald-400 text-[12px] sm:text-[16px]">→</span>
                  {cap}
                </div>
              ))}
            </div>
          </div>

          {/* KPI row */}
          <div className="grid grid-cols-3 gap-2 mb-8 lg:mb-10">
            {[
              { val: '3',           label: 'Systems built'  },
              { val: '99.9%',       label: 'Uptime target'  },
              { val: pktTotal.toString(), label: 'Packets routed' },
            ].map(({ val, label }) => (
              <div
                key={label}
                className="border border-white/[0.06] rounded-[4px] bg-white/[0.02] px-2 sm:px-3 py-[8px] sm:py-[10px]"
              >
                <div className="font-mono text-[14px] sm:text-[18px] font-bold text-slate-50 leading-none">
                  {val}
                </div>
                <div className="font-mono text-[7px] sm:text-[9px] tracking-[0.05em] sm:tracking-[0.1em] text-slate-500 mt-1 uppercase truncate">
                  {label}
                </div>
              </div>
            ))}
          </div>

          {/* CTAs */}
          <div className="flex flex-col gap-2">
            <a
              href="#moonveil"
              className="group flex items-center justify-between px-3 sm:px-4 py-[9px] sm:py-[11px] rounded-[4px] bg-cyan-400/[0.08] border border-cyan-400/25 text-cyan-400 font-mono text-[10px] sm:text-[12px] tracking-[0.06em] uppercase hover:bg-cyan-400/[0.14] hover:border-cyan-400/50 transition-all duration-150"
            >
              <span>Launch architecture tour</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </a>
            <a
              href="#architecture"
              className="flex items-center justify-between px-3 sm:px-4 py-[9px] sm:py-[11px] rounded-[4px] bg-transparent border border-white/[0.06] text-slate-500 font-mono text-[10px] sm:text-[12px] tracking-[0.06em] uppercase hover:bg-white/[0.04] hover:border-white/[0.12] hover:text-slate-400 transition-all duration-150"
            >
              <span>View engineering decisions</span>
              <ExternalLink size={12} className="opacity-60" />
            </a>
            <a
              href="/resume.pdf"
              className="flex items-center justify-between px-3 sm:px-4 py-[9px] sm:py-[11px] rounded-[4px] bg-transparent border border-white/[0.06] text-slate-500 font-mono text-[10px] sm:text-[12px] tracking-[0.06em] uppercase hover:bg-white/[0.04] hover:border-white/[0.12] hover:text-slate-400 transition-all duration-150"
            >
              <span>Download resume</span>
              <Download size={12} className="opacity-60" />
            </a>
          </div>
        </div>

        {/* ── Right: Live telemetry panels ─────────────────────────────────── */}
        <div className="flex flex-col justify-center px-4 sm:px-8 lg:px-12 pb-24 lg:py-16 gap-3 lg:gap-4">
          
          {/* System health */}
          <div className="border border-white/[0.06] rounded-[6px] bg-white/[0.02] overflow-hidden">
            <div className="flex items-center justify-between px-3 sm:px-4 py-[8px] sm:py-[10px] border-b border-white/[0.05]">
              <span className="font-mono text-[8px] sm:text-[9px] tracking-[0.14em] text-slate-600 uppercase">
                System health
              </span>
              <span className="flex items-center gap-[4px] sm:gap-[5px] font-mono text-[8px] sm:text-[9px] text-emerald-400">
                <span className="w-[4px] sm:w-[5px] h-[4px] sm:h-[5px] rounded-full bg-emerald-400 animate-pulse" />
                All systems operational
              </span>
            </div>
            <div>
              {rows.map((row) => (
                <div
                  key={row.id}
                  className="flex items-center justify-between px-3 sm:px-4 py-[6px] sm:py-[7px] hover:bg-white/[0.02] transition-colors gap-2 sm:gap-3"
                >
                  <span className="flex items-center gap-[5px] sm:gap-[7px] font-mono text-[9px] sm:text-[11px] text-slate-500">
                    <StatusDot health={row.health} />
                    {row.label}
                  </span>
                  <div className="flex items-center gap-[6px] sm:gap-[10px]">
                    <LoadBar value={row.load} health={row.health} />
                    <StatusLabel text={row.status} health={row.health} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Activity feed */}
          <div className="border border-white/[0.06] rounded-[6px] bg-white/[0.02] overflow-hidden">
            <div className="flex items-center justify-between px-3 sm:px-4 py-[8px] sm:py-[10px] border-b border-white/[0.05]">
              <span className="font-mono text-[8px] sm:text-[9px] tracking-[0.14em] text-slate-600 uppercase">
                Network activity
              </span>
              <span className="font-mono text-[8px] sm:text-[9px] text-slate-600">
                {pktRate} pkt/s
              </span>
            </div>
            <div className="px-3 sm:px-4 py-2 flex flex-col gap-[4px] sm:gap-[5px] min-h-[100px] sm:min-h-[120px]">
              {activity.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center gap-1 sm:gap-2 font-mono text-[8px] sm:text-[10px] text-slate-600 animate-[fadeSlideIn_0.3s_ease_forwards]"
                >
                  <span className="text-slate-800 min-w-[36px] sm:min-w-[44px] text-[7px] sm:text-[9px]">{entry.time}</span>
                  <TypeBadge type={entry.type} />
                  <span className="text-slate-500 flex-1 min-w-0 truncate">
                    {entry.from}
                    <span className="text-slate-800 mx-1">→</span>
                    {entry.to}
                  </span>
                  <PacketDot type={entry.type} />
                </div>
              ))}
            </div>
          </div>

          {/* Sparkline */}
          <div className="border border-white/[0.06] rounded-[6px] bg-white/[0.02] overflow-hidden">
            <div className="flex items-center justify-between px-3 sm:px-4 py-[8px] sm:py-[10px] border-b border-white/[0.05]">
              <span className="font-mono text-[8px] sm:text-[9px] tracking-[0.14em] text-slate-600 uppercase">
                Packet throughput
              </span>
              <span className="font-mono text-[8px] sm:text-[9px] text-slate-600">30s window</span>
            </div>
            <div className="px-3 sm:px-4 pt-2 pb-1 h-[36px] sm:h-[44px]">
              <Sparkline data={sparkData} />
            </div>
            {/* Uptime strip */}
            <div className="flex gap-[1px] sm:gap-[2px] px-3 sm:px-4 pb-2 sm:pb-3 pt-1">
              {Array.from({ length: 30 }).map((_, i) => (
                <div
                  key={i}
                  className={`flex-1 h-[4px] sm:h-[6px] rounded-[1px] ${
                    i === 11 || i === 12 ? 'bg-red-500/40' : 'bg-emerald-400/70'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator - Hidden on mobile as it conflicts with content flow */}
      <div className="hidden lg:block absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
        <div className="w-[22px] h-[38px] border border-slate-700 rounded-full flex justify-center">
          <div className="w-[3px] h-[6px] bg-cyan-400 rounded-full mt-[6px] animate-bounce" />
        </div>
      </div>
    </section>
  );
};
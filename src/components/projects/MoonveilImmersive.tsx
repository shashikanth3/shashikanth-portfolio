import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Info, Network, Database } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

// ─── Data ────────────────────────────────────────────────────────────────────

const STEPS = [
  {
    id: 'udp-discovery',
    phase: '01',
    title: 'UDP DISCOVERY',
    subtitle: 'Broadcasting to local network — finding peers',
    description:
      'Host broadcasts its presence on the local network. Clients discover the host instantly without needing a centralized cloud server.',
    tooltip:
      'UDP broadcasts are lightweight, connectionless messages sent to all devices on the local subnet. It allows "Zero-Configuration" joining.',
    accentClass: 'text-cyan-400',
    borderClass: 'border-cyan-500/30',
    bgClass: 'bg-cyan-500/10',
    dotClass: 'bg-cyan-400',
    glowColor: 'rgba(34,211,238,0.45)',
  },
  {
    id: 'tcp-handshake',
    phase: '02',
    title: 'TCP HANDSHAKE',
    subtitle: 'Persistent session established',
    description:
      'A reliable connection is established between the host and each client via the SYN → SYN-ACK → ACK handshake protocol.',
    tooltip:
      'TCP guarantees reliable, ordered delivery of packets. Once discovered via UDP, the actual game data must use TCP so no actions are dropped.',
    accentClass: 'text-teal-400',
    borderClass: 'border-teal-500/30',
    bgClass: 'bg-teal-500/10',
    dotClass: 'bg-teal-400',
    glowColor: 'rgba(20,184,166,0.45)',
  },
  {
    id: 'action-resolver',
    phase: '03',
    title: 'ACTION RESOLVER',
    subtitle: 'Race conditions mathematically eliminated',
    description:
      'A deterministic state machine queues all incoming client actions and processes them in a strict hierarchy, ensuring every client reaches the exact same state.',
    tooltip:
      'If two players act at the exact same millisecond, the Resolver queues them and applies game-logic priority, preventing server confusion.',
    accentClass: 'text-amber-400',
    borderClass: 'border-amber-500/30',
    bgClass: 'bg-amber-500/10',
    dotClass: 'bg-amber-400',
    glowColor: 'rgba(245,166,35,0.45)',
  },
  {
    id: 'asymmetric-sync',
    phase: '04',
    title: 'ASYMMETRIC SYNC',
    subtitle: 'Zero packet-sniffing vulnerability',
    description:
      'The server holds global truth, but sends each client only the specific data they are authorized to see based on their in-game role.',
    tooltip:
      'If we broadcast the whole game state, a hacker could inspect packets to see hidden roles. Asymmetric sync eliminates this vector.',
    accentClass: 'text-indigo-400',
    borderClass: 'border-indigo-500/30',
    bgClass: 'bg-indigo-500/10',
    dotClass: 'bg-indigo-400',
    glowColor: 'rgba(129,140,248,0.45)',
  },
];

// ─── Visuals (pure DOM, no React state changes during scroll) ─────────────────

const VisualUDP = () => (
  <div className="relative flex items-center justify-center w-48 h-48">
    <div className="absolute w-20 h-20 border border-cyan-500/40 rounded-full animate-ping" />
    <div
      className="absolute w-36 h-36 border border-cyan-500/20 rounded-full animate-ping"
      style={{ animationDelay: '0.5s' }}
    />
    <div className="relative z-10 w-16 h-16 bg-cyan-950 border-2 border-cyan-400 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(34,211,238,0.5)]">
      <Network size={28} className="text-cyan-400" />
    </div>
  </div>
);

const VisualTCP = () => (
  <div className="flex items-center gap-10">
    <div className="w-16 h-16 bg-teal-950 border-2 border-teal-400 rounded-full flex items-center justify-center">
      <span className="text-[10px] font-bold text-teal-300">HOST</span>
    </div>
    <div className="w-32 h-1 bg-slate-800 relative overflow-hidden rounded-full">
      <div className="absolute inset-0 bg-teal-400 rounded-full animate-[tcpSlide_1.8s_ease-in-out_infinite]" />
    </div>
    <div className="w-16 h-16 bg-slate-800 border-2 border-slate-600 rounded-full flex items-center justify-center">
      <span className="text-[10px] font-bold text-slate-300">CLIENT</span>
    </div>
    <style>{`@keyframes tcpSlide { 0%{transform:translateX(-100%)} 100%{transform:translateX(200%)} }`}</style>
  </div>
);

const VisualResolver = () => (
  <div className="relative w-48 h-48 flex items-center justify-center">
    <div className="absolute inset-0 border-4 border-amber-500/20 rounded-full" />
    <div className="absolute inset-0 border-t-4 border-amber-400 rounded-full animate-spin" />
    <div className="text-center">
      <Database size={32} className="text-amber-400 mx-auto" />
      <div className="text-[10px] text-amber-400 mt-2 font-mono tracking-widest">QUEUE</div>
    </div>
  </div>
);

const VisualAsymmetric = () => (
  <div className="flex gap-6 items-center">
    {[
      { label: 'Payload A', visible: true },
      { label: 'Masked', visible: false },
      { label: 'Payload C', visible: true },
    ].map(({ label, visible }) => (
      <div
        key={label}
        className={`p-4 border rounded-xl flex flex-col items-center gap-2 transition-opacity ${
          visible
            ? 'border-indigo-500/50 bg-indigo-500/10'
            : 'border-slate-700 bg-slate-800 opacity-40'
        }`}
      >
        <span className={`text-[10px] font-mono ${visible ? 'text-indigo-300' : 'text-slate-400'}`}>
          {label}
        </span>
        <div className={`w-12 h-2 rounded ${visible ? 'bg-indigo-400' : 'bg-slate-600'}`} />
      </div>
    ))}
  </div>
);

const VISUALS = [VisualUDP, VisualTCP, VisualResolver, VisualAsymmetric];

// ─── Component ────────────────────────────────────────────────────────────────

const MoonveilImmersive: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLDivElement>(null); // Added ref for the floating nav
  const sectionsRef = useRef<HTMLDivElement[]>([]);
  const indicatorDotsRef = useRef<HTMLButtonElement[]>([]);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const chapterTextRef = useRef<HTMLSpanElement>(null);
  const [tooltip, setTooltip] = useState<{ text: string; x: number; y: number } | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // GSAP ScrollTrigger — zero React state changes during scroll
  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      // 1. Master trigger to hide/show the navigation ONLY when Moonveil is on screen
      ScrollTrigger.create({
        trigger: containerRef.current,
        start: 'top 75%', // Show nav when section is 25% into viewport
        end: 'bottom 25%', // Hide nav when section is almost out
        onToggle: (self) => {
          if (navRef.current) {
            gsap.to(navRef.current, {
              opacity: self.isActive ? 1 : 0,
              y: self.isActive ? 0 : 20,
              pointerEvents: self.isActive ? 'auto' : 'none',
              duration: 0.4,
              ease: 'power2.out',
            });
          }
        },
      });

      sectionsRef.current.forEach((section, i) => {
        if (!section) return;

        // Pin each panel for its scroll distance
        ScrollTrigger.create({
          trigger: section,
          start: 'top top',
          end: '+=100%',
          pin: true,
          pinSpacing: true,
          anticipatePin: 1,
          onEnter: () => {
            setActiveIndex(i);
            updateNav(i);
          },
          onEnterBack: () => {
            setActiveIndex(i);
            updateNav(i);
          },
        });

        // Fade-in timeline for each section
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: 'top 80%',
            end: 'top 20%',
            scrub: 0.6,
          },
        });

        tl.fromTo(
          section.querySelector('.step-content'),
          { opacity: 0, y: 40 },
          { opacity: 1, y: 0, ease: 'power2.out' }
        );
      });

      // Scroll progress bar (DOM mutation, no React state)
      ScrollTrigger.create({
        trigger: containerRef.current,
        start: 'top top',
        end: 'bottom bottom',
        onUpdate: (self) => {
          if (progressBarRef.current) {
            progressBarRef.current.style.width = `${self.progress * 100}%`;
          }
        },
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  function updateNav(idx: number) {
    indicatorDotsRef.current.forEach((dot, i) => {
      if (!dot) return;
      dot.classList.toggle('w-8', i === idx);
      dot.classList.toggle('bg-cyan-400', i === idx);
      dot.classList.toggle('w-2', i !== idx);
      dot.classList.toggle('bg-slate-600', i !== idx);
    });
    if (chapterTextRef.current) {
      chapterTextRef.current.textContent = STEPS[idx].title;
    }
  }

  const scrollToStep = (idx: number) => {
    sectionsRef.current[idx]?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleTooltip = (text: string, e: React.MouseEvent) => {
    const x = Math.min(e.clientX + 12, window.innerWidth - 320);
    const y = e.clientY - 48;
    setTooltip({ text, x, y });
    setTimeout(() => setTooltip(null), 4500);
  };

  return (
    <div ref={containerRef} className="relative bg-[#0a0e17]">
      {/* Background grid */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.025]">
        <div className="w-full h-full bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:40px_40px]" />
      </div>

      {/* Sections — each pinned via ScrollTrigger */}
      {STEPS.map((step, i) => {
        const Visual = VISUALS[i];
        return (
          <div
            key={step.id}
            ref={(el) => { if (el) sectionsRef.current[i] = el; }}
            className="relative min-h-screen w-full flex flex-col items-center justify-center px-6"
          >
            <div className="step-content max-w-3xl w-full text-center opacity-0">
              {/* Phase badge */}
              <div
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border mb-8 ${step.bgClass} ${step.borderClass}`}
              >
                <span className={`w-2 h-2 rounded-full ${step.dotClass} animate-pulse`} />
                <span className={`text-xs font-bold tracking-widest ${step.accentClass}`}>
                  PHASE {step.phase}
                </span>
              </div>

              <h2 className="text-4xl md:text-6xl font-black tracking-tight mb-3 text-white">
                {step.title}
              </h2>
              <p className={`text-base md:text-lg font-medium mb-12 ${step.accentClass}`}>
                {step.subtitle}
              </p>

              {/* Visual */}
              <div className="h-52 flex items-center justify-center mb-12">
                <Visual />
              </div>

              <p className="text-slate-400 text-base md:text-lg max-w-2xl mx-auto leading-relaxed mb-6">
                {step.description}
              </p>

              <button
                onClick={(e) => handleTooltip(step.tooltip, e)}
                className={`inline-flex items-center gap-2 text-sm text-slate-500 hover:${step.accentClass} transition-colors underline underline-offset-4 decoration-slate-700`}
              >
                <Info size={14} /> Engineering Context
              </button>
            </div>
          </div>
        );
      })}

      {/* ── Floating nav ──────────────────────────────────────────────────── */}
      {/* Note: Added navRef, opacity-0, pointer-events-none, and translate-y-5 to hide by default */}
      <div 
        ref={navRef} 
        className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 opacity-0 pointer-events-none translate-y-5"
      >
        <div className="flex items-center gap-5 bg-slate-900/85 backdrop-blur-md px-6 py-3.5 rounded-2xl border border-slate-700 shadow-2xl">
          {/* Progress bar slot */}
          <div className="hidden sm:flex items-center gap-2 pr-4 border-r border-slate-700">
            <span className="text-[10px] text-slate-500 font-mono whitespace-nowrap">
              {String(activeIndex + 1).padStart(2, '0')} / {String(STEPS.length).padStart(2, '0')}
            </span>
          </div>

          {/* Dot indicators */}
          <div className="flex gap-2 items-center">
            {STEPS.map((_, idx) => (
              <button
                key={idx}
                ref={(el) => { if (el) indicatorDotsRef.current[idx] = el; }}
                onClick={() => scrollToStep(idx)}
                aria-label={`Jump to phase ${idx + 1}`}
                className={`h-2 rounded-full transition-all duration-300 ${
                  idx === 0 ? 'w-8 bg-cyan-400' : 'w-2 bg-slate-600 hover:bg-slate-400'
                }`}
              />
            ))}
          </div>

          {/* Chapter name */}
          <div className="hidden sm:flex items-center gap-2 pl-4 border-l border-slate-700">
            <span
              ref={chapterTextRef}
              className="text-[10px] text-slate-400 font-mono tracking-wider whitespace-nowrap"
            >
              {STEPS[0].title}
            </span>
          </div>
        </div>

        {/* Thin progress bar above nav pill */}
        <div className="mt-2 h-0.5 w-full bg-slate-800 rounded-full overflow-hidden">
          <div
            ref={progressBarRef}
            className="h-full bg-cyan-400 rounded-full transition-none"
            style={{ width: '0%' }}
          />
        </div>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="fixed z-[100] bg-slate-900 border border-slate-700 text-white text-sm p-4 rounded-xl shadow-2xl max-w-xs leading-relaxed pointer-events-none"
          style={{ left: tooltip.x, top: tooltip.y }}
        >
          <div className="text-[10px] text-slate-400 font-bold mb-1 uppercase tracking-wider">
            Architecture Note
          </div>
          {tooltip.text}
        </div>
      )}
    </div>
  );
};

export default MoonveilImmersive;
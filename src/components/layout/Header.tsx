/**
 * Header.tsx — Systems Engineering Command Bar
 *
 * Behaviors:
 * - At top: transparent, minimal — name abbreviated, status indicators visible
 * - Scrolled: glass panel with frosted bg, name expands, progress bar appears
 * - Active chapter tracking via IntersectionObserver on named sections
 * - Progress bar reflects scroll depth within current chapter
 * - Mobile: compact identity + current chapter + drawer (no hamburger)
 * - Logo hover: specialty tags fan out
 * - Status indicators: animated pulses, tooltip on hover
 * - Framer Motion: header entrance, glass transition, active pill slide
 *
 * Sections wired to chapters (add these IDs to your page sections):
 * #philosophy  #moonveil  #architecture  #reliability  #contact
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail } from 'lucide-react';

// ─── Data ─────────────────────────────────────────────────────────────────────

const CHAPTERS = [
  { num: '01', label: 'Philosophy',   href: '#philosophy',   sublabel: 'Foundation'    },
  { num: '02', label: 'Moonveil',     href: '#moonveil',     sublabel: 'LAN · WS'      },
  { num: '03', label: 'Architecture', href: '#architecture', sublabel: 'Systems'       },
  { num: '04', label: 'Reliability',  href: '#reliability',  sublabel: 'Metrics'       },
  { num: '05', label: 'Contact',      href: '#contact',      sublabel: 'Open'          },
] as const;

const SPECIALTIES = [
  'Offline-First',
  'Distributed Systems',
  'Fault Tolerance',
  'Real-Time Networking',
] as const;

const INDICATORS = [
  { id: 'sync',    label: 'SYNC',    value: 'ACTIVE', pulse: 'cyan',  period: 1.8 },
  { id: 'status',  label: 'STATUS',  value: 'ONLINE', pulse: 'green', period: 2.5 },
] as const;

// ─── Types ────────────────────────────────────────────────────────────────────

type ChapterId = 0 | 1 | 2 | 3 | 4;

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

const StatusIndicator = ({
  label,
  value,
  pulse,
  period,
  tooltip,
}: {
  label: string;
  value: string;
  pulse: 'cyan' | 'green' | 'blue';
  period: number;
  tooltip?: string;
}) => {
  const [hovered, setHovered] = useState(false);
  const valueColors = { cyan: 'text-cyan-400', green: 'text-emerald-400', blue: 'text-blue-400' };

  return (
    <div className="relative" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <div className="flex items-center gap-[5px] px-2 py-[4px] border border-white/[0.05] rounded-[3px] cursor-default select-none">
        <PulseDot color={pulse} period={period} size={4} />
        <div className="flex flex-col gap-0">
          <span className="font-mono text-[7px] tracking-[0.1em] text-slate-700 leading-none">{label}</span>
          <span className={`font-mono text-[8px] tracking-[0.08em] font-bold leading-none ${valueColors[pulse]}`}>{value}</span>
        </div>
      </div>
      <AnimatePresence>
        {hovered && tooltip && (
          <motion.div
            className="absolute top-full right-0 mt-1 px-2 py-1 bg-[#030e1e] border border-white/[0.08] rounded-[3px] whitespace-nowrap z-50"
            initial={{ opacity: 0, y: -2 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -2 }}
            transition={{ duration: 0.12 }}
          >
            <span className="font-mono text-[9px] text-slate-500">{tooltip}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const SpecialtyTags = ({ visible }: { visible: boolean }) => (
  <AnimatePresence>
    {visible && (
      <motion.div
        className="absolute top-full left-0 mt-2 flex flex-col gap-[3px] z-50"
        initial="hidden"
        animate="visible"
        exit="hidden"
      >
        {SPECIALTIES.map((s, i) => (
          <motion.div
            key={s}
            className="font-mono text-[9px] tracking-[0.06em] text-slate-500 bg-[#030e1e] border border-white/[0.06] rounded-[2px] px-2 py-[3px] whitespace-nowrap"
            variants={{
              hidden: { opacity: 0, x: -6 },
              visible: { opacity: 1, x: 0 },
            }}
            transition={{ delay: i * 0.04, duration: 0.15 }}
          >
            {s}
          </motion.div>
        ))}
      </motion.div>
    )}
  </AnimatePresence>
);

// ─── Main component ───────────────────────────────────────────────────────────

export const Header: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeChapter, setActiveChapter] = useState<ChapterId>(0);
  const [logoHovered, setLogoHovered] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const observersRef = useRef<IntersectionObserver[]>([]);

  // ── Scroll state ────────────────────────────────────────────────────────────
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      const docH = document.documentElement.scrollHeight - window.innerHeight;
      setScrolled(y > 20);
      setScrollProgress(docH > 0 ? Math.min(y / docH, 1) : 0);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // ── Active chapter via IntersectionObserver ─────────────────────────────────
  useEffect(() => {
    observersRef.current.forEach((o) => o.disconnect());
    observersRef.current = [];

    CHAPTERS.forEach((ch, i) => {
      const id = ch.href.slice(1);
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveChapter(i as ChapterId); },
        { rootMargin: '-20% 0px -60% 0px' }
      );
      obs.observe(el);
      observersRef.current.push(obs);
    });

    return () => observersRef.current.forEach((o) => o.disconnect());
  }, []);

  // ── Smooth scroll ───────────────────────────────────────────────────────────
  const handleNav = useCallback((e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setMobileOpen(false);
    const target = document.getElementById(href.slice(1));
    if (target) target.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <>
      <motion.header
        className="fixed top-0 w-full z-50"
        initial={{ y: -52, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Progress bar */}
        <AnimatePresence>
          {scrolled && (
            <motion.div
              className="absolute bottom-0 left-0 h-[1px] bg-cyan-400/60 z-10 pointer-events-none"
              style={{ width: `${scrollProgress * 100}%` }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            />
          )}
        </AnimatePresence>

        {/* Glass background */}
        <motion.div
          className="absolute inset-0 border-b border-transparent"
          animate={{
            backgroundColor: scrolled ? 'rgba(2, 12, 24, 0.88)' : 'rgba(0,0,0,0)',
            borderColor: scrolled ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0)',
            backdropFilter: scrolled ? 'blur(12px)' : 'blur(0px)',
          }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        />

        {/* ── Desktop layout ─────────────────────────────────────────────── */}
        <div className="relative hidden md:flex items-center h-[52px] px-6 max-w-none">
          {/* Identity */}
          <div
            className="relative flex items-center gap-2 flex-shrink-0 cursor-default select-none"
            onMouseEnter={() => setLogoHovered(true)}
            onMouseLeave={() => setLogoHovered(false)}
          >
            <PulseDot color="green" period={2.2} size={6} />
            <motion.span
              className="font-sans font-bold text-slate-50 tracking-tight"
              animate={{ fontSize: scrolled ? '13px' : '14px' }}
              transition={{ duration: 0.3 }}
            >
              {scrolled ? 'SHASHIKANTH PANUGANTI' : 'SK'}
              <span className="text-cyan-400">.</span>
            </motion.span>
            <span className="font-mono text-[7px] tracking-[0.1em] text-slate-700 border border-white/[0.04] rounded-[2px] px-[5px] py-[2px]">
              SYSTEMS ENG
            </span>
            <SpecialtyTags visible={logoHovered} />
          </div>

          {/* Chapter nav — centered */}
          <nav className="absolute left-1/2 -translate-x-1/2 flex items-center">
            {CHAPTERS.map((ch, i) => {
              const isActive = activeChapter === i;
              return (
                <a
                  key={ch.label}
                  href={ch.href}
                  onClick={(e) => handleNav(e, ch.href)}
                  className="group relative flex items-center gap-[5px] px-3 h-[52px] transition-colors duration-150 no-underline"
                >
                  <span className={`font-mono text-[8px] transition-colors duration-150 ${isActive ? 'text-cyan-400/60' : 'text-slate-700 group-hover:text-slate-600'}`}>
                    {ch.num}
                  </span>
                  <span className={`font-mono text-[10px] tracking-[0.05em] transition-colors duration-150 ${isActive ? 'text-cyan-400' : 'text-slate-500 group-hover:text-slate-400'}`}>
                    {ch.label}
                  </span>
                  {/* Active underline */}
                  {isActive && (
                    <motion.div
                      className="absolute bottom-0 left-0 right-0 h-[2px] bg-cyan-400"
                      layoutId="active-chapter"
                      transition={{ type: 'spring', stiffness: 380, damping: 36 }}
                    />
                  )}
                </a>
              );
            })}
          </nav>

          {/* Indicators + mail */}
          <div className="ml-auto flex items-center gap-2">
            {INDICATORS.map((ind) => (
              <StatusIndicator
                key={ind.id}
                label={ind.label}
                value={ind.value}
                pulse={ind.pulse as 'cyan' | 'green'}
                period={ind.period}
                tooltip={ind.id === 'sync' ? 'State sync engine active' : 'All systems operational'}
              />
            ))}
            <div className="w-[1px] h-[18px] bg-white/[0.05] mx-1" />
            <a
              href="mailto:panugantishashikanth132@gmail.com"
              className="flex items-center gap-[5px] px-2 py-[4px] border border-white/[0.05] rounded-[3px] text-slate-600 hover:text-cyan-400 hover:border-cyan-400/20 transition-colors duration-150"
            >
              <Mail size={12} />
              <span className="font-mono text-[7px] tracking-[0.08em]">CONTACT</span>
            </a>
          </div>
        </div>

        {/* ── Mobile layout ──────────────────────────────────────────────── */}
        <div className="relative flex md:hidden items-center h-[52px] px-4 justify-between">
          {/* Identity */}
          <div className="flex items-center gap-2">
            <PulseDot color="green" period={2.2} size={5} />
            <span className="font-sans font-bold text-[13px] text-slate-50 tracking-tight">
              SK<span className="text-cyan-400">.</span>
            </span>
            <div className="w-[1px] h-[14px] bg-white/[0.06]" />
            <span className="font-mono text-[9px] text-cyan-400 tracking-[0.05em]">
              <span className="text-cyan-400/40 mr-[2px]">{CHAPTERS[activeChapter].num}</span>
              {CHAPTERS[activeChapter].label}
            </span>
          </div>

          {/* Right: progress + menu toggle */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Mini progress strip */}
            <div className="w-[32px] sm:w-[40px] h-[2px] bg-white/[0.05] rounded-full overflow-hidden">
              <div
                className="h-full bg-cyan-400/70 rounded-full transition-all duration-200"
                style={{ width: `${scrollProgress * 100}%` }}
              />
            </div>
            
            {/* Massive, reliable touch target for mobile menu */}
            <button
              className="relative z-50 flex flex-col justify-center items-center w-[40px] h-[40px] -mr-2 cursor-pointer touch-manipulation focus:outline-none"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Toggle navigation"
            >
              <div className="flex flex-col gap-[5px] w-[18px]">
                <motion.span
                  className="block h-[2px] w-full bg-slate-300 rounded-full origin-center"
                  animate={{ rotate: mobileOpen ? 45 : 0, y: mobileOpen ? 7 : 0 }}
                  transition={{ duration: 0.2 }}
                />
                <motion.span
                  className="block h-[2px] w-full bg-slate-300 rounded-full"
                  animate={{ opacity: mobileOpen ? 0 : 1 }}
                  transition={{ duration: 0.15 }}
                />
                <motion.span
                  className="block h-[2px] w-full bg-slate-300 rounded-full origin-center"
                  animate={{ rotate: mobileOpen ? -45 : 0, y: mobileOpen ? -7 : 0 }}
                  transition={{ duration: 0.2 }}
                />
              </div>
            </button>
          </div>
        </div>

        {/* ── Mobile drawer ──────────────────────────────────────────────── */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.nav
              className="relative md:hidden bg-[#030e1e] border-t border-white/[0.05] overflow-hidden shadow-2xl"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="px-4 py-3 flex flex-col gap-1">
                {CHAPTERS.map((ch, i) => {
                  const isActive = activeChapter === i;
                  return (
                    <motion.a
                      key={ch.label}
                      href={ch.href}
                      onClick={(e) => handleNav(e, ch.href)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-md no-underline transition-colors duration-150 ${isActive ? 'bg-cyan-400/[0.06] border border-cyan-400/10' : 'hover:bg-white/[0.02] border border-transparent'}`}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <span className="font-mono text-[9px] text-slate-600 w-4 flex-shrink-0">{ch.num}</span>
                      <span className={`font-mono text-[12px] tracking-[0.04em] ${isActive ? 'text-cyan-400 font-bold' : 'text-slate-400'}`}>
                        {ch.label}
                      </span>
                      <span className={`ml-auto font-mono text-[9px] tracking-[0.06em] ${isActive ? 'text-cyan-400/50' : 'text-slate-700'}`}>
                        {isActive ? 'CURRENT' : ch.sublabel}
                      </span>
                    </motion.a>
                  );
                })}
                {/* Mobile status row */}
                <div className="flex items-center justify-between pt-4 pb-2 px-3 border-t border-white/[0.04] mt-2">
                  <div className="flex gap-4">
                    {INDICATORS.map((ind) => (
                      <div key={ind.id} className="flex items-center gap-[6px]">
                        <PulseDot color={ind.pulse as 'cyan' | 'green'} period={ind.period} size={5} />
                        <span className="font-mono text-[8px] tracking-[0.08em] text-slate-600">{ind.label}</span>
                      </div>
                    ))}
                  </div>
                  <a
                    href="mailto:panugantishashikanth132@gmail.com"
                    className="flex items-center gap-1.5 text-slate-500 hover:text-cyan-400 transition-colors"
                  >
                    <Mail size={13} />
                    <span className="font-mono text-[8px] tracking-[0.08em]">EMAIL</span>
                  </a>
                </div>
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </motion.header>
    </>
  );
};
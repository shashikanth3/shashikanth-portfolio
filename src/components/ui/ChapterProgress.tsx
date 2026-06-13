import React, { useEffect, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Chapter {
  id: string;
  label: string;
  index: number;
}

const CHAPTERS: Chapter[] = [
  { id: 'philosophy',  label: 'Philosophy',   index: 0 },
  { id: 'moonveil',    label: 'Moonveil',     index: 1 },
  { id: 'projects',    label: 'Architecture', index: 2 },
  { id: 'sk-apps',     label: 'SK Apps',      index: 3 },
  { id: 'reliability', label: 'Dashboard',    index: 4 },
  { id: 'systems-map', label: 'Systems',      index: 5 },
  { id: 'skills',      label: 'Stack',        index: 6 },
  { id: 'contact',     label: 'Contact',      index: 7 },
];

export const ChapterProgress: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tickingRef = useRef(false);
  const isNavigatingRef = useRef(false);

  // ─── Core Logic: Scroll & Auto-hide ──────────────────────────────────────────
  
  const resetHideTimer = useCallback(() => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    
    // Do not hide if user is hovering over the navigation rail
    if (!isHovered) {
      hideTimerRef.current = setTimeout(() => {
        setIsVisible(false);
        isNavigatingRef.current = false;
      }, 1200);
    }
  }, [isHovered]);

  const handleScroll = useCallback(() => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const currentProgress = docHeight > 0 ? scrollTop / docHeight : 0;
    
    setScrollProgress(Math.min(currentProgress, 1));

    if (scrollTop > 120) {
      setIsVisible(true);
      resetHideTimer();
    } else {
      setIsVisible(false); // Instantly hide if we scroll back to the very top hero section
    }
  }, [resetHideTimer]);

  useEffect(() => {
    const onScroll = () => {
      if (!tickingRef.current) {
        window.requestAnimationFrame(() => {
          handleScroll();
          tickingRef.current = false;
        });
        tickingRef.current = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    
    // Initial check
    handleScroll();

    return () => {
      window.removeEventListener('scroll', onScroll);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, [handleScroll]);

  // Handle hover state change (re-trigger timer when mouse leaves)
  useEffect(() => {
    if (isVisible) resetHideTimer();
  }, [isHovered, isVisible, resetHideTimer]);

  // ─── Logic: Intersection Observer for active chapters ────────────────────────

  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    CHAPTERS.forEach((chapter) => {
      const el = document.getElementById(chapter.id);
      if (!el) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          // Only update if not forcefully navigating via click
          if (entry.isIntersecting && !isNavigatingRef.current) {
            setActiveIndex(chapter.index);
          }
        },
        // Trigger earlier to feel more responsive before section fully centers
        { threshold: 0.1, rootMargin: "-20% 0px -40% 0px" } 
      );
      
      observer.observe(el);
      observers.push(observer);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, []);

  // ─── Logic: Interaction ──────────────────────────────────────────────────────

  const scrollTo = (chapter: Chapter) => {
    isNavigatingRef.current = true;
    setActiveIndex(chapter.index);
    
    document.getElementById(chapter.id)?.scrollIntoView({ behavior: 'smooth' });
    
    // Keep visible during the smooth scroll duration
    setIsVisible(true);
    resetHideTimer();
  };

  const active = CHAPTERS[activeIndex] ?? CHAPTERS[0];

  // ─── Render ──────────────────────────────────────────────────────────────────

  // Motion configuration for premium snappy feel
  const springConfig = { type: "spring" as const, stiffness: 400, damping: 30 };
  const fadeConfig = { duration: 0.25, ease: [0.25, 0.1, 0.25, 1] as const };

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* === DESKTOP ARCHITECTURAL RAIL === 
            Hidden on mobile, right-aligned vertical system
          */}
          <motion.nav
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 16 }}
            transition={fadeConfig}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            aria-label="Chapter navigation"
            className="fixed right-6 top-1/2 -translate-y-1/2 z-50 hidden md:flex flex-col items-end gap-5 pointer-events-auto"
          >
            {/* Glass Progress Card */}
            <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 shadow-[0_4px_24px_-1px_rgba(0,0,0,0.3)] rounded-2xl p-3 w-32 relative overflow-hidden group">
              {/* Subtle dynamic glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent pointer-events-none" />
              
              <div className="flex flex-col gap-1.5 relative z-10">
                <div className="flex items-baseline justify-between">
                  <span className="text-[9px] font-mono font-medium text-slate-400 tracking-wider">
                    {String(activeIndex + 1).padStart(2, '0')} / {String(CHAPTERS.length).padStart(2, '0')}
                  </span>
                  <span className="text-[9px] font-mono text-cyan-400/80">
                    {Math.round(scrollProgress * 100)}%
                  </span>
                </div>
                <span className="text-xs font-semibold text-slate-200 tracking-wide truncate">
                  {active.label}
                </span>
                
                {/* Micro Progress Bar */}
                <div className="mt-1 h-[2px] w-full bg-slate-800 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-cyan-400 rounded-full shadow-[0_0_8px_rgba(34,211,238,0.6)]"
                    animate={{ width: `${scrollProgress * 100}%` }}
                    transition={{ duration: 0.1, ease: 'linear' }}
                  />
                </div>
              </div>
            </div>

            {/* Navigation Rail Elements */}
            <div className="flex flex-col gap-1 py-2 pr-2 border-r border-white/5 relative">
              {CHAPTERS.map((chapter) => {
                const isActive = chapter.index === activeIndex;
                
                return (
                  <button
                    key={chapter.id}
                    onClick={() => scrollTo(chapter)}
                    aria-label={`Scroll to ${chapter.label}`}
                    aria-current={isActive ? "step" : undefined}
                    className="group relative flex items-center justify-end h-7 w-12 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 rounded-sm"
                  >
                    {/* Architectural Glass Tooltip */}
                    <span className="absolute right-8 text-[11px] font-medium text-slate-300 whitespace-nowrap opacity-0 -translate-x-2 pointer-events-none group-hover:opacity-100 group-hover:translate-x-0 group-focus-visible:opacity-100 group-focus-visible:translate-x-0 transition-all duration-200 ease-out bg-slate-900/60 backdrop-blur-md px-2.5 py-1 rounded-md border border-white/10 shadow-lg">
                      {chapter.label}
                    </span>

                    {/* Indicator Line */}
                    <motion.div
                      layout
                      animate={{
                        width: isActive ? 24 : 8,
                        backgroundColor: isActive ? '#22d3ee' : '#475569',
                        opacity: isActive ? 1 : 0.4,
                      }}
                      transition={springConfig}
                      className="h-[2px] rounded-full group-hover:opacity-100 group-hover:bg-slate-300 transition-colors duration-200 relative"
                    >
                      {/* Active glow dot */}
                      {isActive && (
                        <motion.div 
                          layoutId="activeGlow"
                          className="absolute right-0 top-1/2 -translate-y-1/2 w-[2px] h-[6px] bg-white rounded-full shadow-[0_0_10px_#22d3ee]"
                        />
                      )}
                    </motion.div>
                  </button>
                );
              })}
            </div>
          </motion.nav>

          {/* === MOBILE BOTTOM PILL === 
            Minimal horizontal footprint for smaller screens
          */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={fadeConfig}
            aria-hidden="true"
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex md:hidden pointer-events-auto"
          >
            <div className="bg-slate-900/70 backdrop-blur-xl border border-white/10 shadow-2xl rounded-full flex items-center gap-4 px-4 py-2 relative overflow-hidden">
              <span className="text-[10px] font-mono text-cyan-400 font-medium">
                {String(activeIndex + 1).padStart(2, '0')}
              </span>
              <span className="text-xs font-medium text-slate-200 tracking-wide whitespace-nowrap">
                {active.label}
              </span>
              
              {/* Background progress fill for mobile */}
              <motion.div
                className="absolute left-0 bottom-0 h-[2px] bg-cyan-400/80"
                animate={{ width: `${scrollProgress * 100}%` }}
                transition={{ duration: 0.1, ease: 'linear' }}
              />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ChapterProgress;

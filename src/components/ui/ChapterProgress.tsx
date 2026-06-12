import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Chapter {
  id: string;
  label: string;
  index: number;
}

const CHAPTERS: Chapter[] = [
  { id: 'philosophy',   label: 'Philosophy',    index: 0 },
  { id: 'moonveil',     label: 'Moonveil',       index: 1 },
  { id: 'projects',     label: 'Architecture',   index: 2 },
  { id: 'sk-apps',      label: 'SK Apps',        index: 3 }, // <-- Updated here!
  { id: 'reliability',  label: 'Dashboard',      index: 4 },
  { id: 'systems-map',  label: 'Systems',        index: 5 },
  { id: 'skills',       label: 'Stack',          index: 6 },
  { id: 'contact',      label: 'Contact',        index: 7 },
];

const ChapterProgress: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const ticking = useRef(false);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    CHAPTERS.forEach((chapter) => {
      const el = document.getElementById(chapter.id);
      if (!el) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setActiveIndex(chapter.index);
          }
        },
        { threshold: 0.3 }
      );
      observer.observe(el);
      observers.push(observer);
    });

    const handleScroll = () => {
      if (ticking.current) return;
      ticking.current = true;
      requestAnimationFrame(() => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = docHeight > 0 ? scrollTop / docHeight : 0;
        setScrollProgress(Math.min(progress, 1));
        setVisible(scrollTop > 120);
        ticking.current = false;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      observers.forEach((o) => o.disconnect());
    };
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const active = CHAPTERS[activeIndex] ?? CHAPTERS[0];

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 24 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="fixed right-6 top-1/2 -translate-y-1/2 z-50 flex flex-col items-end gap-3"
          aria-label="Chapter navigation"
        >
          {/* Progress pill */}
          <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700 rounded-xl px-3 py-2 shadow-xl mb-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-slate-500">
                {String(activeIndex + 1).padStart(2, '0')} / {String(CHAPTERS.length).padStart(2, '0')}
              </span>
              <span className="text-[10px] font-semibold text-slate-300 tracking-wide max-w-[80px] truncate">
                {active.label.toUpperCase()}
              </span>
            </div>
            {/* Progress bar */}
            <div className="mt-2 h-0.5 w-full bg-slate-700 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-cyan-400 rounded-full"
                animate={{ width: `${scrollProgress * 100}%` }}
                transition={{ duration: 0.1, ease: 'linear' }}
              />
            </div>
          </div>

          {/* Chapter dots */}
          {CHAPTERS.map((chapter) => (
            <button
              key={chapter.id}
              onClick={() => scrollTo(chapter.id)}
              aria-label={chapter.label}
              className="group relative flex items-center justify-end gap-2"
            >
              {/* Label tooltip on hover */}
              <span className="absolute right-5 text-[10px] font-mono text-slate-400 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-150 bg-slate-900/90 px-2 py-0.5 rounded border border-slate-700">
                {chapter.label}
              </span>

              <motion.div
                animate={{
                  width: chapter.index === activeIndex ? 20 : 8,
                  backgroundColor: chapter.index === activeIndex ? '#22d3ee' : '#334155',
                }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="h-1.5 rounded-full"
              />
            </button>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ChapterProgress;
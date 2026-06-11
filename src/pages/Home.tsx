import React, { useEffect, Suspense, lazy, useState } from 'react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import HeroSkeleton from '../components/hero/HeroSkeleton';
import GraphSkeleton from '../components/architecture/GraphSkeleton';
import ChapterProgress from '../components/ui/ChapterProgress';
import { useVisualizationMode } from '../hooks/useVisualizationMode';

// ── Lazy imports (progressive enhancement) ──────────────────────────────────
// Step 3: Three.js hero mounts after skeleton
// Ensure compatibility whether Hero module uses a default or named export
const Hero = lazy(() =>
  import('../components/hero/Hero').then((mod) => ({ default: (mod as any).default || (mod as any).Hero }))
);

// Step 4: D3 graphs mount after hero settles
const InteractiveArchitectureMap = lazy(() =>
  import('../components/architecture/InteractiveArchitectureMap')
);
const SystemsMap = lazy(() =>
  import('../components/architecture/SystemsMap')
);

// Step 5: GSAP + scroll storytelling
const MoonveilImmersive = lazy(() =>
  import('../components/projects/MoonveilImmersive')
);

// Step 6: Advanced interactions
const FailureSimulator = lazy(() =>
  import('../components/architecture/FailureSimulator')
);
const ReliabilityDashboard = lazy(() =>
  import('../components/architecture/ReliabilityDashboard')
);
const SkillsMatrix = lazy(() =>
  import('../components/skills/SkillsMatrix').then((mod) => ({
    default: (mod as any).default || (mod as any).SkillsMatrix,
  }))
);

// ─────────────────────────────────────────────────────────────────────────────

export const Home: React.FC = () => {
  const { mode } = useVisualizationMode();

  // Reveal animation observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add('visible');
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );
    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Persistent chapter indicator (mounts immediately, lightweight) */}
      <ChapterProgress />

      <main className="flex-grow">

        {/* ── STEP 1+2: Hero — skeleton → Three.js ──────────────────────── */}
        <Suspense fallback={<HeroSkeleton />}>
          <Hero />
        </Suspense>

        {/* ── Philosophy ────────────────────────────────────────────────── */}
        <section id="philosophy" className="py-24 px-6 bg-[#0f1520]">
          <div className="container mx-auto">
            <div className="text-cyan-400 text-sm font-mono mb-2 tracking-widest">
              PHILOSOPHY
            </div>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-white reveal">
              I design for the edge case,<br />not the happy path.
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl reveal">
              Real systems fail. Networks drop. Storage corrupts. My architecture
              assumes adversarial conditions from the first design decision.
            </p>
          </div>
        </section>

        {/* ── STEP 5: Moonveil — GSAP scroll storytelling ───────────────── */}
        <section id="moonveil">
          <Suspense
            fallback={
              <div className="min-h-screen bg-[#0a0e17] flex items-center justify-center">
                <div className="text-slate-600 text-sm font-mono animate-pulse tracking-widest">
                  LOADING MOONVEIL...
                </div>
              </div>
            }
          >
            <MoonveilImmersive />
          </Suspense>
        </section>
{/* ── STEP 4: Architecture Map — D3 ─────────────────────────────── */}
        <section id="projects" className="py-24 px-6 bg-[#0f1520] relative z-10">
          <div className="container mx-auto">
            <div className="text-cyan-400 text-sm font-mono mb-2 tracking-widest">
              SYSTEMS ARCHITECTURE
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-2 reveal">
              Interactive Architecture Map
            </h2>
            <p className="text-gray-400 mb-8 reveal">
              Explore Freight Desk's data flow — drag nodes, hover for details.
            </p>
            <Suspense fallback={<GraphSkeleton height={500} />}>
              {mode === 'immersive' ? (
                <InteractiveArchitectureMap />
              ) : (
                <GraphSkeleton height={500} />
              )}
            </Suspense>
          </div>
        </section>

        {/* ── STEP 6: Failure Simulation ────────────────────────────────── */}
        <section id="failures" className="py-24 px-6 bg-[#0f1520]">
          <div className="container mx-auto">
            <div className="text-cyan-400 text-sm font-mono mb-2 tracking-widest">
              FAILURE SIMULATION
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-8 reveal">
              Watch the system heal itself.
            </h2>
            <Suspense
              fallback={
                <div className="h-48 bg-[#0f1520] border border-[#1e2d45] rounded-xl animate-pulse" />
              }
            >
              <FailureSimulator />
            </Suspense>
          </div>
        </section>

        {/* ── Reliability Dashboard ─────────────────────────────────────── */}
        <section id="reliability" className="py-24 px-6">
          <div className="container mx-auto">
            <div className="text-cyan-400 text-sm font-mono mb-2 tracking-widest">
              RELIABILITY DASHBOARD
            </div>
            <Suspense
              fallback={
                <div className="h-64 bg-[#0f1520] border border-[#1e2d45] rounded-xl animate-pulse" />
              }
            >
              <ReliabilityDashboard />
            </Suspense>
          </div>
        </section>

        {/* ── Systems Map — D3 ──────────────────────────────────────────── */}
        <section id="systems-map" className="py-24 px-6 bg-[#0f1520]">
          <div className="container mx-auto">
            <div className="text-cyan-400 text-sm font-mono mb-2 tracking-widest">
              CONNECTED ECOSYSTEM
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-8 reveal">
              Unified systems map
            </h2>
            <Suspense fallback={<GraphSkeleton height={600} />}>
              {mode === 'immersive' ? (
                <SystemsMap />
              ) : (
                <GraphSkeleton height={600} />
              )}
            </Suspense>
          </div>
        </section>

        {/* ── Skills ────────────────────────────────────────────────────── */}
        <section id="skills" className="py-24 px-6">
          <div className="container mx-auto">
            <div className="text-cyan-400 text-sm font-mono mb-2 tracking-widest">
              TECHNICAL STACK
            </div>
            <Suspense
              fallback={
                <div className="h-48 bg-[#0f1520] border border-[#1e2d45] rounded-xl animate-pulse" />
              }
            >
              <SkillsMatrix />
            </Suspense>
          </div>
        </section>

        {/* ── Contact ───────────────────────────────────────────────────── */}
        <section id="contact" className="py-24 px-6 text-center bg-[#0f1520]">
          <div className="container mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 reveal">
              Let's build something resilient.
            </h2>
            <p className="text-gray-400 text-lg max-w-xl mx-auto mb-8 reveal">
              Open to senior engineering roles in distributed systems.
            </p>
            <div className="flex justify-center gap-4 mt-8">
              <a
                href="mailto:panugantishashikanth132@gmail.com"
                className="btn-primary"
              >
                Contact me
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};
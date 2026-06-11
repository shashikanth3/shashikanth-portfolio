import React, { useEffect, Suspense, lazy } from 'react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import HeroSkeleton from '../components/hero/HeroSkeleton';
import GraphSkeleton from '../components/architecture/GraphSkeleton';
import ChapterProgress from '../components/ui/ChapterProgress';
import { useVisualizationMode } from '../hooks/useVisualizationMode';

// ── Safe lazy loaders (handles both default and named exports) ─────────────
const Hero = lazy(() =>
  import('../components/hero/Hero').then((module) => ({
    default: (module as any).default || (module as any).Hero,
  }))
);

const InteractiveArchitectureMap = lazy(() =>
  import('../components/architecture/InteractiveArchitectureMap').then((module) => ({
    default: (module as any).default || (module as any).InteractiveArchitectureMap,
  }))
);

const SystemsMap = lazy(() =>
  import('../components/architecture/SystemsMap').then((module) => ({
    default: (module as any).default || (module as any).SystemsMap,
  }))
);

const MoonveilImmersive = lazy(() =>
  import('../components/projects/MoonveilImmersive').then((module) => ({
    default: (module as any).default || (module as any).MoonveilImmersive,
  }))
);

const FailureSimulator = lazy(() =>
  import('../components/architecture/FailureSimulator').then((module) => ({
    default: (module as any).default || (module as any).FailureSimulator,
  }))
);

const ReliabilityDashboard = lazy(() =>
  import('../components/architecture/ReliabilityDashboard').then((module) => ({
    default: (module as any).default || (module as any).ReliabilityDashboard,
  }))
);

const SkillsMatrix = lazy(() =>
  import('../components/skills/SkillsMatrix').then((module) => ({
    default: (module as any).default || (module as any).SkillsMatrix,
  }))
);

// ────────────────────────────────────────────────────────────────────────────

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
    <div className="min-h-screen flex flex-col bg-[#0a0e17]">
      <Header />
      <ChapterProgress />
      <main className="flex-grow">
        {/* Hero */}
        <Suspense fallback={<HeroSkeleton />}>
          <Hero />
        </Suspense>

        {/* Philosophy */}
        <section id="philosophy" className="py-24 px-6 bg-[#0f1520]">
          <div className="container mx-auto max-w-6xl">
            <div className="text-cyan-400 text-sm font-mono mb-2 tracking-widest">PHILOSOPHY</div>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-white reveal">
              I design for the edge case,<br />not the happy path.
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl reveal">
              Real systems fail. Networks drop. Storage corrupts. My architecture
              assumes adversarial conditions from the first design decision.
            </p>
            <div className="grid md:grid-cols-4 gap-4 mt-12 reveal">
              {[
                { icon: '⬡', title: 'Offline-First', desc: 'Connectivity is a bonus, not a requirement. Local state is the source of truth; sync is eventual.' },
                { icon: '⟳', title: 'Self-Healing', desc: 'Systems detect and recover from corruption without human intervention.' },
                { icon: '⊕', title: 'State Determinism', desc: 'Every action resolver is deterministic. Same inputs → same state.' },
                { icon: '◎', title: 'Minimal Trust Surface', desc: 'Never broadcast full state. Each client receives only authorized data.' }
              ].map((item, i) => (
                <div key={i} className="bg-[#0a0e17] border border-[#1e2d45] rounded-xl p-6 hover:border-cyan-500/50 transition-all">
                  <div className="text-3xl mb-3">{item.icon}</div>
                  <h3 className="text-white font-bold mb-2">{item.title}</h3>
                  <p className="text-gray-400 text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Moonveil Immersive */}
        <section id="moonveil">
          <Suspense fallback={<div className="min-h-screen bg-[#0a0e17] flex items-center justify-center"><div className="text-slate-600 text-sm font-mono animate-pulse">LOADING MOONVEIL...</div></div>}>
            <MoonveilImmersive />
          </Suspense>
        </section>

        {/* Architecture Map */}
        <section id="projects" className="py-24 px-6 bg-[#0f1520]">
          <div className="container mx-auto max-w-6xl">
            <div className="text-cyan-400 text-sm font-mono mb-2 tracking-widest">SYSTEMS ARCHITECTURE</div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-2 reveal">Interactive Architecture Map</h2>
            <p className="text-gray-400 mb-8 reveal">Explore Freight Desk's data flow — drag nodes, hover for details.</p>
            <Suspense fallback={<GraphSkeleton height={500} />}>
              {mode === 'immersive' ? <InteractiveArchitectureMap /> : <GraphSkeleton height={500} />}
            </Suspense>
          </div>
        </section>

        {/* Failure Simulation */}
        <section id="failures" className="py-24 px-6 bg-[#0f1520]">
          <div className="container mx-auto max-w-6xl">
            <div className="text-cyan-400 text-sm font-mono mb-2 tracking-widest">FAILURE SIMULATION</div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-8 reveal">Watch the system heal itself.</h2>
            <Suspense fallback={<div className="h-48 bg-[#0f1520] border border-[#1e2d45] rounded-xl animate-pulse" />}>
              <FailureSimulator />
            </Suspense>
          </div>
        </section>

        {/* Reliability Dashboard */}
        <section id="reliability" className="py-24 px-6">
          <div className="container mx-auto max-w-6xl">
            <div className="text-cyan-400 text-sm font-mono mb-2 tracking-widest">RELIABILITY DASHBOARD</div>
            <Suspense fallback={<div className="h-64 bg-[#0f1520] border border-[#1e2d45] rounded-xl animate-pulse" />}>
              <ReliabilityDashboard />
            </Suspense>
          </div>
        </section>

        {/* Systems Map */}
        <section id="systems-map" className="py-24 px-6 bg-[#0f1520]">
          <div className="container mx-auto max-w-6xl">
            <div className="text-cyan-400 text-sm font-mono mb-2 tracking-widest">CONNECTED ECOSYSTEM</div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-8 reveal">Unified systems map</h2>
            <Suspense fallback={<GraphSkeleton height={600} />}>
              {mode === 'immersive' ? <SystemsMap /> : <GraphSkeleton height={600} />}
            </Suspense>
          </div>
        </section>

        {/* Skills */}
        <section id="skills" className="py-24 px-6">
          <div className="container mx-auto max-w-6xl">
            <div className="text-cyan-400 text-sm font-mono mb-2 tracking-widest">TECHNICAL STACK</div>
            <Suspense fallback={<div className="h-48 bg-[#0f1520] border border-[#1e2d45] rounded-xl animate-pulse" />}>
              <SkillsMatrix />
            </Suspense>
          </div>
        </section>

        {/* Contact */}
        <section id="contact" className="py-24 px-6 text-center bg-[#0f1520]">
          <div className="container mx-auto max-w-3xl">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 reveal">Let's build something resilient.</h2>
            <p className="text-gray-400 text-lg max-w-xl mx-auto mb-8 reveal">
              Open to senior engineering roles in distributed systems, mobile architecture, and reliability engineering.
            </p>
            <div className="flex justify-center gap-4 mt-8">
              <a href="mailto:panugantishashikanth132@gmail.com" className="inline-flex items-center gap-2 px-8 py-4 bg-cyan-500 text-[#0a0e17] font-semibold rounded-xl hover:bg-cyan-400 transition-all shadow-lg shadow-cyan-500/20">
                📧 Contact me
              </a>
              <a href="/resume.pdf" className="inline-flex items-center gap-2 px-8 py-4 border border-[#1e2d45] text-gray-300 font-semibold rounded-xl hover:border-cyan-500 hover:text-cyan-400 transition-all">
                📄 Download Resume
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Home;
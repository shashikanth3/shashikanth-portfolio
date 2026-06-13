import React, { Suspense, memo } from 'react';

import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import HeroSkeleton from '../components/hero/HeroSkeleton';
import GraphSkeleton from '../components/architecture/GraphSkeleton';
import ChapterProgress from '../components/ui/ChapterProgress';
import { useVisualizationMode } from '../hooks/useVisualizationMode';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';
import { safeLazy } from '../utils/safeLazy';

// ── Safe lazy loaders ───────────────────────────────────────────────────────
const Hero                = safeLazy(() => import('../components/hero/Hero'));
const EnterpriseShowcase  = safeLazy(() => import('../components/projects/EnterpriseShowcase'));
const SystemsMap          = safeLazy(() => import('../components/architecture/SystemsMap'));
const MoonveilImmersive   = safeLazy(() => import('../components/projects/MoonveilImmersive'));
const SKAppsShowcase      = safeLazy(() => import('../components/projects/SKAppsShowcase'));
const ReliabilityDashboard = safeLazy(() => import('../components/architecture/ReliabilityDashboard'));
const SkillsMatrix        = safeLazy(() => import('../components/skills/SkillsMatrix'));
// ────────────────────────────────────────────────────────────────────────────

// ── Design tokens ────────────────────────────────────────────────────────────
const TOKEN = {
  bg:          '#07090f',
  bgAlt:       '#0b0f1a',
  bgCard:      '#0e1422',
  border:      '#18253a',
  borderHover: '#2a9d8f',
  accent:      '#2a9d8f',   // teal — restraint over cyan
  accentDim:   '#1a6b62',
  accentGlow:  'rgba(42,157,143,0.15)',
  accentGlowStrong: 'rgba(42,157,143,0.35)',
  textPrimary:    '#e8eaf0',
  textSecondary:  '#7a8ba0',
  textTertiary:   '#3d5068',
  mono:           '"JetBrains Mono", "Fira Code", "Cascadia Code", ui-monospace, monospace',
  display:        '"Inter", system-ui, -apple-system, sans-serif',
} as const;

// ── Global styles injected once ──────────────────────────────────────────────
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@300;400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; }

  :root {
    --bg:             ${TOKEN.bg};
    --bg-alt:         ${TOKEN.bgAlt};
    --bg-card:        ${TOKEN.bgCard};
    --border:         ${TOKEN.border};
    --border-hover:   ${TOKEN.borderHover};
    --accent:         ${TOKEN.accent};
    --accent-dim:     ${TOKEN.accentDim};
    --accent-glow:    ${TOKEN.accentGlow};
    --accent-glow-s:  ${TOKEN.accentGlowStrong};
    --text-1:         ${TOKEN.textPrimary};
    --text-2:         ${TOKEN.textSecondary};
    --text-3:         ${TOKEN.textTertiary};
    --font-mono:      ${TOKEN.mono};
    --font-display:   ${TOKEN.display};
    --section-pad-y:  clamp(5rem, 10vw, 9rem);
    --section-pad-x:  clamp(1.25rem, 5vw, 3rem);
    --max-w:          72rem;
    --radius-card:    1rem;
    --radius-pill:    9999px;
    --transition-base: 220ms cubic-bezier(0.4, 0, 0.2, 1);
    --transition-spring: 400ms cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  html { scroll-behavior: smooth; }

  body {
    background: var(--bg);
    color: var(--text-1);
    font-family: var(--font-display);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    overflow-x: hidden;
  }

  /* ── Reveal system ─────────────────────────── */
  .reveal {
    opacity: 0;
    transform: translateY(28px);
    transition: opacity 0.7s cubic-bezier(0.16,1,0.3,1),
                transform 0.7s cubic-bezier(0.16,1,0.3,1);
    will-change: opacity, transform;
  }
  .reveal.visible {
    opacity: 1;
    transform: translateY(0);
  }
  .reveal-delay-1 { transition-delay: 0.08s; }
  .reveal-delay-2 { transition-delay: 0.16s; }
  .reveal-delay-3 { transition-delay: 0.24s; }
  .reveal-delay-4 { transition-delay: 0.32s; }

  @media (prefers-reduced-motion: reduce) {
    .reveal, .reveal.visible {
      opacity: 1 !important;
      transform: none !important;
      transition: none !important;
    }
    * { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
  }

  /* ── Section label ─────────────────────────── */
  .section-label {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    font-family: var(--font-mono);
    font-size: 0.6875rem;
    font-weight: 500;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--accent);
    margin-bottom: 1.25rem;
  }
  .section-label::before {
    content: '';
    display: block;
    width: 1.5rem;
    height: 1px;
    background: var(--accent);
    flex-shrink: 0;
  }

  /* ── Display heading ───────────────────────── */
  .display-heading {
    font-size: clamp(2.25rem, 5vw, 4rem);
    font-weight: 800;
    line-height: 1.08;
    letter-spacing: -0.03em;
    color: var(--text-1);
  }

  /* ── Card ──────────────────────────────────── */
  .card-glass {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius-card);
    transition: border-color var(--transition-base),
                box-shadow var(--transition-base),
                transform var(--transition-spring);
  }
  .card-glass:hover {
    border-color: var(--border-hover);
    box-shadow: 0 0 0 1px var(--accent-glow), 0 16px 48px rgba(0,0,0,0.6);
    transform: translateY(-2px);
  }

  /* ── Divider line ──────────────────────────── */
  .h-divider {
    width: 100%;
    height: 1px;
    background: linear-gradient(90deg, transparent, var(--border) 20%, var(--border) 80%, transparent);
    flex-shrink: 0;
  }

  /* ── Scrollbar ─────────────────────────────── */
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: var(--bg); }
  ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }
  ::-webkit-scrollbar-thumb:hover { background: var(--accent-dim); }

  /* ── Focus ─────────────────────────────────── */
  :focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 3px;
    border-radius: 4px;
  }
`;

// ── Static background grid noise ────────────────────────────────────────────
const BG_GRID_SVG = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60'%3E%3Cpath d='M 60 0 L 0 0 0 60' fill='none' stroke='%23111827' stroke-width='0.5'/%3E%3C/svg%3E")`;

// ── Philosophy doctrine cards ────────────────────────────────────────────────
const DOCTRINES = [
  {
    id: 'D-01',
    glyph: '⬡',
    title: 'Offline-First',
    tagline: 'Connectivity is a bonus',
    desc: 'Local state is the canonical source of truth. Sync is eventual, conflict resolution is deterministic, and the network is treated as an unreliable transport — not a dependency.',
    badge: 'ARCH PRINCIPLE',
  },
  {
    id: 'D-02',
    glyph: '⟳',
    title: 'Self-Healing',
    tagline: 'Resilience without intervention',
    desc: 'Systems detect corruption, restart degraded subsystems, and recover to consistent state without human intervention. Observability is built in from day one.',
    badge: 'RELIABILITY',
  },
  {
    id: 'D-03',
    glyph: '⊕',
    title: 'State Determinism',
    tagline: 'Same inputs, same outcome',
    desc: 'Every action resolver is a pure function. Given identical inputs the state machine produces identical outputs — making bugs reproducible and audits mechanical.',
    badge: 'CORRECTNESS',
  },
  {
    id: 'D-04',
    glyph: '◎',
    title: 'Minimal Trust Surface',
    tagline: 'Need-to-know data access',
    desc: 'Clients receive only the state they are authorized to hold. Full broadcast is never the default. Every field in every payload is a deliberate disclosure decision.',
    badge: 'SECURITY',
  },
] as const;

// ── Doctrine card ────────────────────────────────────────────────────────────
const DoctrineCard = memo(({ item, index }: { item: typeof DOCTRINES[number]; index: number }) => (
  <article
    className={`card-glass reveal reveal-delay-${index + 1}`}
    style={{ padding: 'clamp(1.5rem, 3vw, 2rem)' }}
    aria-label={`Architecture principle: ${item.title}`}
  >
    <header style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
      <span style={{
        fontFamily: TOKEN.mono,
        fontSize: '0.625rem',
        letterSpacing: '0.16em',
        color: TOKEN.textTertiary,
        fontWeight: 500,
      }}>{item.id}</span>
      <span style={{
        fontFamily: TOKEN.mono,
        fontSize: '0.5625rem',
        letterSpacing: '0.14em',
        padding: '0.2rem 0.5rem',
        border: `1px solid ${TOKEN.accentDim}`,
        borderRadius: '2px',
        color: TOKEN.accent,
        fontWeight: 500,
      }}>{item.badge}</span>
    </header>

    <div style={{ fontSize: '2rem', marginBottom: '0.875rem', lineHeight: 1 }}>{item.glyph}</div>

    <h3 style={{
      fontSize: 'clamp(1rem, 2vw, 1.125rem)',
      fontWeight: 700,
      color: TOKEN.textPrimary,
      letterSpacing: '-0.01em',
      marginBottom: '0.25rem',
    }}>{item.title}</h3>

    <p style={{
      fontFamily: TOKEN.mono,
      fontSize: '0.6875rem',
      color: TOKEN.accent,
      letterSpacing: '0.04em',
      marginBottom: '0.875rem',
    }}>{item.tagline}</p>

    <div className="h-divider" style={{ marginBottom: '0.875rem' }} />

    <p style={{
      fontSize: '0.8125rem',
      color: TOKEN.textSecondary,
      lineHeight: 1.65,
    }}>{item.desc}</p>
  </article>
));
DoctrineCard.displayName = 'DoctrineCard';

// ── Ambient dot cluster (pure CSS, GPU only) ─────────────────────────────────
const AmbientOrb = memo(({ top, left, size, delay, opacity }: {
  top: string; left: string; size: string; delay: string; opacity: number;
}) => (
  <div
    aria-hidden="true"
    style={{
      position: 'absolute',
      top, left,
      width: size, height: size,
      borderRadius: '50%',
      background: `radial-gradient(circle, ${TOKEN.accent} 0%, transparent 70%)`,
      opacity,
      filter: 'blur(60px)',
      animation: `ambientPulse 8s ${delay} ease-in-out infinite alternate`,
      willChange: 'opacity, transform',
      pointerEvents: 'none',
    }}
  />
));
AmbientOrb.displayName = 'AmbientOrb';

// ── Section wrapper ──────────────────────────────────────────────────────────
const Section = memo(({
  id, children, alt = false, style = {},
  'aria-label': ariaLabel,
}: {
  id: string;
  children: React.ReactNode;
  alt?: boolean;
  style?: React.CSSProperties;
  'aria-label'?: string;
}) => (
  <section
    id={id}
    aria-label={ariaLabel}
    style={{
      padding: 'var(--section-pad-y) var(--section-pad-x)',
      background: alt ? TOKEN.bgAlt : TOKEN.bg,
      position: 'relative',
      ...style,
    }}
  >
    <div style={{ maxWidth: 'var(--max-w)', margin: '0 auto' }}>
      {children}
    </div>
  </section>
));
Section.displayName = 'Section';

// ── Lazy section skeleton ────────────────────────────────────────────────────
const LazyFallback = memo(({ height = 320 }: { height?: number }) => (
  <div
    aria-hidden="true"
    style={{
      height,
      background: TOKEN.bgCard,
      border: `1px solid ${TOKEN.border}`,
      borderRadius: 'var(--radius-card)',
      animation: 'shimmer 1.8s ease-in-out infinite',
    }}
  />
));
LazyFallback.displayName = 'LazyFallback';

// ── Global keyframes injector ────────────────────────────────────────────────
const StyleInjector = memo(() => (
  <style>{`
    ${GLOBAL_CSS}

    @keyframes ambientPulse {
      from { opacity: 0.06; transform: scale(1); }
      to   { opacity: 0.14; transform: scale(1.15); }
    }

    @keyframes shimmer {
      0%, 100% { opacity: 0.4; }
      50%       { opacity: 0.7; }
    }

    @keyframes scanline {
      0%   { transform: translateY(-100%); }
      100% { transform: translateY(100vh); }
    }

    /* Philosophy grid */
    .doctrine-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(min(100%, 18rem), 1fr));
      gap: clamp(1rem, 2vw, 1.5rem);
      margin-top: clamp(2.5rem, 5vw, 4rem);
    }

    /* Contact CTA */
    .cta-primary {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: clamp(0.875rem, 2vw, 1.125rem) clamp(1.5rem, 3vw, 2rem);
      background: var(--accent);
      color: #05080f;
      font-weight: 700;
      font-size: clamp(0.875rem, 1.5vw, 0.9375rem);
      border-radius: var(--radius-pill);
      border: none;
      cursor: pointer;
      text-decoration: none;
      transition: background var(--transition-base),
                  box-shadow var(--transition-base),
                  transform var(--transition-spring);
    }
    .cta-primary:hover {
      background: #38b2a3;
      box-shadow: 0 0 32px var(--accent-glow-s);
      transform: translateY(-1px);
    }

    .cta-secondary {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: clamp(0.875rem, 2vw, 1.125rem) clamp(1.5rem, 3vw, 2rem);
      background: transparent;
      color: var(--text-2);
      font-weight: 600;
      font-size: clamp(0.875rem, 1.5vw, 0.9375rem);
      border-radius: var(--radius-pill);
      border: 1px solid var(--border);
      cursor: pointer;
      text-decoration: none;
      transition: border-color var(--transition-base),
                  color var(--transition-base),
                  transform var(--transition-spring);
    }
    .cta-secondary:hover {
      border-color: var(--accent);
      color: var(--accent);
      transform: translateY(-1px);
    }

    /* Contact terminal card */
    .contact-terminal {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius-card);
      overflow: hidden;
      max-width: 48rem;
      margin: 3rem auto 0;
    }
    .terminal-bar {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.75rem 1rem;
      background: #0a0d14;
      border-bottom: 1px solid var(--border);
    }
    .terminal-dot {
      width: 10px; height: 10px;
      border-radius: 50%;
    }
    .terminal-body {
      padding: clamp(1.5rem, 3vw, 2.5rem);
      font-family: var(--font-mono);
    }
    .terminal-line {
      display: flex;
      align-items: baseline;
      gap: 0.75rem;
      font-size: 0.8125rem;
      line-height: 1.9;
    }
    .terminal-prompt { color: var(--accent); user-select: none; }
    .terminal-key    { color: var(--text-2); }
    .terminal-val    { color: var(--text-1); }
    .terminal-link   { color: var(--accent); text-decoration: none; }
    .terminal-link:hover { text-decoration: underline; }

    /* Reliability/war-room skeleton override */
    .reliability-wrapper {
      position: relative;
    }
    .reliability-wrapper::before {
      content: '';
      position: absolute;
      inset: -1px;
      border-radius: calc(var(--radius-card) + 1px);
      background: linear-gradient(135deg, var(--accent-glow), transparent 60%);
      pointer-events: none;
    }

    /* Section transition chrome */
    .section-chrome {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: clamp(2rem, 4vw, 3rem);
    }
    .section-chrome-line {
      flex: 1;
      height: 1px;
      background: linear-gradient(90deg, var(--border) 0%, transparent 100%);
    }

    /* Moonveil wrapper breathing room */
    #moonveil { position: relative; overflow: hidden; }
    #moonveil::before {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0;
      height: 1px;
      background: linear-gradient(90deg, transparent, var(--accent-glow-s), transparent);
      z-index: 1;
    }
    #moonveil::after {
      content: '';
      position: absolute;
      bottom: 0; left: 0; right: 0;
      height: 1px;
      background: linear-gradient(90deg, transparent, var(--border), transparent);
      z-index: 1;
    }

    /* Architecture section chrome */
    #architecture {
      position: relative;
    }
    #architecture::before {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0;
      height: 1px;
      background: linear-gradient(90deg, transparent, var(--border) 30%, var(--border) 70%, transparent);
      pointer-events: none;
    }
  `}</style>
));
StyleInjector.displayName = 'StyleInjector';

// ── Background grid overlay ──────────────────────────────────────────────────
const GridOverlay = memo(() => (
  <div
    aria-hidden="true"
    style={{
      position: 'fixed',
      inset: 0,
      backgroundImage: BG_GRID_SVG,
      backgroundSize: '60px 60px',
      opacity: 0.35,
      pointerEvents: 'none',
      zIndex: 0,
    }}
  />
));
GridOverlay.displayName = 'GridOverlay';

// ── Philosophy section ───────────────────────────────────────────────────────
const PhilosophySection = memo(() => (
  <Section id="philosophy" alt aria-label="Engineering philosophy and architecture principles">
    {/* Ambient glow */}
    <AmbientOrb top="-10%" left="60%" size="600px" delay="0s" opacity={0.08} />

    <div className="reveal">
      <div className="section-label">Architecture Philosophy</div>
      <h2 className="display-heading" style={{ maxWidth: '36rem', marginBottom: '1rem' }}>
        I design for the edge case,<br />not the happy path.
      </h2>
      <p style={{
        fontSize: 'clamp(1rem, 2vw, 1.125rem)',
        color: TOKEN.textSecondary,
        maxWidth: '36rem',
        lineHeight: 1.7,
      }}>
        Real systems fail. Networks drop. Storage corrupts. My architecture
        assumes adversarial conditions from the first design decision — not as
        an afterthought.
      </p>
    </div>

    <div className="doctrine-grid">
      {DOCTRINES.map((item, i) => (
        <DoctrineCard key={item.id} item={item} index={i} />
      ))}
    </div>
  </Section>
));
PhilosophySection.displayName = 'PhilosophySection';

// ── Moonveil section ─────────────────────────────────────────────────────────
const MoonveilSection = memo(() => (
  <section id="moonveil" aria-label="Moonveil — flagship project showcase">
    <Suspense fallback={
      <div style={{
        minHeight: '100svh',
        background: TOKEN.bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <span style={{
          fontFamily: TOKEN.mono,
          fontSize: '0.6875rem',
          letterSpacing: '0.18em',
          color: TOKEN.textTertiary,
          animation: 'shimmer 1.8s ease-in-out infinite',
        }}>LOADING MOONVEIL…</span>
      </div>
    }>
      <MoonveilImmersive />
    </Suspense>
  </section>
));
MoonveilSection.displayName = 'MoonveilSection';

// ── Architecture section ─────────────────────────────────────────────────────
const ArchitectureSection = memo(() => (
  <div id="architecture">
    <Suspense fallback={
      <div style={{ padding: 'var(--section-pad-y) var(--section-pad-x)' }}>
        <LazyFallback height={480} />
      </div>
    }>
      <EnterpriseShowcase />
    </Suspense>
  </div>
));
ArchitectureSection.displayName = 'ArchitectureSection';

// ── SK Apps section ──────────────────────────────────────────────────────────
const SKAppsSection = memo(() => (
  <Section id="sk-apps" alt aria-label="SK Apps product showcase">
    <Suspense fallback={<LazyFallback height={320} />}>
      <SKAppsShowcase />
    </Suspense>
  </Section>
));
SKAppsSection.displayName = 'SKAppsSection';

// ── Reliability section ──────────────────────────────────────────────────────
const ReliabilitySection = memo(() => (
  <Section id="reliability" aria-label="Reliability and operations dashboard">
    <div className="section-chrome reveal">
      <div className="section-label" style={{ marginBottom: 0 }}>Reliability Dashboard</div>
      <div className="section-chrome-line" />
      <span style={{
        fontFamily: TOKEN.mono,
        fontSize: '0.5625rem',
        letterSpacing: '0.16em',
        color: TOKEN.textTertiary,
        whiteSpace: 'nowrap',
      }}>LIVE SYSTEM STATE</span>
    </div>
    <div className="reliability-wrapper">
      <Suspense fallback={<LazyFallback height={320} />}>
        <ReliabilityDashboard />
      </Suspense>
    </div>
  </Section>
));
ReliabilitySection.displayName = 'ReliabilitySection';

// ── Systems map section ──────────────────────────────────────────────────────
const SystemsMapSection = memo(({ mode }: { mode: string }) => (
  <Section id="systems-map" alt aria-label="Connected systems ecosystem map">
    <div className="reveal">
      <div className="section-label">Connected Ecosystem</div>
      <h2 className="display-heading" style={{ marginBottom: 'clamp(1.5rem, 3vw, 2.5rem)' }}>
        Unified systems map
      </h2>
    </div>

    <Suspense fallback={<GraphSkeleton height={600} />}>
      {mode === 'immersive' ? <SystemsMap /> : <GraphSkeleton height={600} />}
    </Suspense>
  </Section>
));
SystemsMapSection.displayName = 'SystemsMapSection';

// ── Skills section ───────────────────────────────────────────────────────────
const SkillsSection = memo(() => (
  <Section id="skills" aria-label="Technical skills and capability matrix">
    <div className="reveal">
      <div className="section-label">Technical Stack</div>
    </div>
    <Suspense fallback={<LazyFallback height={320} />}>
      <SkillsMatrix />
    </Suspense>
  </Section>
));
SkillsSection.displayName = 'SkillsSection';

// ── Contact section ──────────────────────────────────────────────────────────
const ContactSection = memo(() => (
  <Section id="contact" alt aria-label="Contact and hiring information">
    <AmbientOrb top="20%" left="10%" size="500px" delay="2s" opacity={0.07} />
    <AmbientOrb top="50%" left="80%" size="400px" delay="0s" opacity={0.06} />

    <div style={{ maxWidth: '52rem', margin: '0 auto', textAlign: 'center' }}>
      <div className="section-label reveal" style={{ justifyContent: 'center' }}>
        Available for opportunities
      </div>
      <h2
        className="display-heading reveal reveal-delay-1"
        style={{ marginBottom: '1rem' }}
      >
        Let's build something resilient.
      </h2>
      <p
        className="reveal reveal-delay-2"
        style={{
          fontSize: 'clamp(1rem, 2vw, 1.125rem)',
          color: TOKEN.textSecondary,
          maxWidth: '34rem',
          margin: '0 auto',
          lineHeight: 1.7,
        }}
      >
        Open to senior engineering roles in distributed systems, mobile
        architecture, and reliability engineering.
      </p>

      {/* Terminal card */}
      <div className="contact-terminal reveal reveal-delay-3" aria-label="Contact details">
        <div className="terminal-bar" aria-hidden="true">
          <div className="terminal-dot" style={{ background: '#ff5f57' }} />
          <div className="terminal-dot" style={{ background: '#febc2e' }} />
          <div className="terminal-dot" style={{ background: '#28c840' }} />
          <span style={{
            fontFamily: TOKEN.mono,
            fontSize: '0.625rem',
            letterSpacing: '0.1em',
            color: TOKEN.textTertiary,
            marginLeft: 'auto',
          }}>contact.sh</span>
        </div>
        <div className="terminal-body">
          {[
            { k: 'email',    v: 'panugantishashikanth132@gmail.com', href: 'mailto:panugantishashikanth132@gmail.com' },
            { k: 'status',   v: 'open_to_work', href: null },
            { k: 'focus',    v: 'distributed_systems · mobile_arch · reliability', href: null },
            { k: 'resume',   v: '/resume.pdf → download', href: '/resume.pdf' },
          ].map(({ k, v, href }) => (
            <div className="terminal-line" key={k}>
              <span className="terminal-prompt">$</span>
              <span className="terminal-key">{k}</span>
              <span style={{ color: TOKEN.textTertiary }}>→</span>
              {href
                ? <a href={href} className="terminal-link" aria-label={`${k}: ${v}`}>{v}</a>
                : <span className="terminal-val">{v}</span>
              }
            </div>
          ))}
        </div>
      </div>

      {/* CTAs */}
      <div
        className="reveal reveal-delay-4"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1rem',
          justifyContent: 'center',
          marginTop: '2.5rem',
        }}
      >
        <a href="mailto:panugantishashikanth132@gmail.com" className="cta-primary">
          <span aria-hidden="true">✉</span> Contact me
        </a>
        <a href="/resume.pdf" className="cta-secondary" download>
          <span aria-hidden="true">↓</span> Download Resume
        </a>
      </div>
    </div>
  </Section>
));
ContactSection.displayName = 'ContactSection';

// ── Root ─────────────────────────────────────────────────────────────────────
export const Home: React.FC = () => {
  const { mode } = useVisualizationMode();

  useIntersectionObserver('.reveal', {
    threshold: 0.08,
    rootMargin: '0px 0px -48px 0px',
  });

  return (
    <>
      <StyleInjector />

      <div
        style={{
          minHeight: '100svh',
          display: 'flex',
          flexDirection: 'column',
          background: TOKEN.bg,
          position: 'relative',
          isolation: 'isolate',
        }}
      >
        <GridOverlay />

        <Header />
        <ChapterProgress />

        <main
          id="main-content"
          style={{ flex: '1 1 auto', position: 'relative', zIndex: 1 }}
        >
          {/* ── Hero ── */}
          <Suspense fallback={<HeroSkeleton />}>
            <Hero />
          </Suspense>

          {/* ── Philosophy ── */}
          <PhilosophySection />

          {/* ── Moonveil (flagship) ── */}
          <MoonveilSection />

          {/* ── Enterprise Architecture ── */}
          <ArchitectureSection />

          {/* ── SK Apps Showcase ── */}
          <SKAppsSection />

          {/* ── Reliability Dashboard ── */}
          <ReliabilitySection />

          {/* ── Systems Map ── */}
          <SystemsMapSection mode={mode} />

          {/* ── Skills Matrix ── */}
          <SkillsSection />

          {/* ── Contact ── */}
          <ContactSection />
        </main>

        <Footer />
      </div>
    </>
  );
};

export default Home;
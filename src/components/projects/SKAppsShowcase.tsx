import React, { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, Wifi, Database, Shield } from 'lucide-react';

import shyamImg from '../../assets/shyam.webp';
import freightImg from '../../assets/freight.webp';
import moonveilImg from '../../assets/moonveil.webp';

// ─── Design Tokens ────────────────────────────────────────────────────────────
const T = {
  bg:            '#060810',
  surface:       '#0D1120',
  border:        'rgba(255,255,255,0.06)',
  indigo:        '#6366F1',
  indigoDim:     'rgba(99,102,241,0.12)',
  gold:          '#F59E0B',
  textPrimary:   '#F1F5F9',
  textSecondary: '#94A3B8',
  textMuted:     '#475569',
} as const;

// ─── Global CSS injected once ─────────────────────────────────────────────────
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;800;900&display=swap');

  .sk-showcase * { box-sizing: border-box; }

  /* ── Fade-up reveal ── */
  .sk-row {
    opacity: 0;
    transform: translateY(28px);
    transition: opacity 0.7s cubic-bezier(0.22,1,0.36,1),
                transform 0.7s cubic-bezier(0.22,1,0.36,1);
  }
  .sk-row.visible { opacity: 1; transform: translateY(0); }

  /* ── Feature row: image + content side by side ── */
  .sk-feature-row {
    display: flex;
    align-items: stretch;
    gap: 48px;
    padding: 56px 0;
    border-top: 1px solid rgba(255,255,255,0.06);
  }
  .sk-feature-row.flip { flex-direction: row-reverse; }

  /* Image box — fixed 55% width, fixed height, image fills exactly */
  .sk-img-box {
    flex: 0 0 55%;
    min-width: 0;
    position: relative;
    border-radius: 16px;
    overflow: hidden;
    background: var(--accent-dim);
    border: 1px solid rgba(255,255,255,0.06);
    /* Fixed aspect ratio — image ALWAYS fills this box perfectly */
    aspect-ratio: 16 / 10;
    align-self: flex-start;
  }
  .sk-img-box img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center top;
    display: block;
  }
  .sk-img-watermark {
    position: absolute;
    bottom: -10px;
    right: -4px;
    font-size: 120px;
    font-weight: 900;
    font-family: 'Inter', sans-serif;
    color: rgba(255,255,255,0.035);
    line-height: 1;
    letter-spacing: -0.05em;
    user-select: none;
    pointer-events: none;
    z-index: 1;
  }
  .sk-feature-row.flip .sk-img-watermark { right: auto; left: -4px; }
  .sk-version-chip {
    position: absolute;
    top: 14px;
    right: 14px;
    z-index: 3;
    background: rgba(6,8,16,0.88);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 6px;
    padding: 4px 10px;
    font-size: 11px;
    font-family: monospace;
    letter-spacing: 0.06em;
    color: #F59E0B;
  }

  /* Content pane — takes remaining space */
  .sk-content-pane {
    flex: 1 1 0;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 18px;
    justify-content: center;
  }

  /* ── Tablet: stack vertically, image full width ── */
  @media (max-width: 900px) {
    .sk-feature-row,
    .sk-feature-row.flip {
      flex-direction: column;
      gap: 28px;
      padding: 40px 0;
    }
    .sk-img-box {
      flex: none;
      width: 100%;
      aspect-ratio: 16 / 9;
    }
    .sk-img-watermark { font-size: 80px; }
  }

  /* ── Mobile ── */
  @media (max-width: 520px) {
    .sk-feature-row { padding: 32px 0; gap: 20px; }
    .sk-img-box { aspect-ratio: 4 / 3; border-radius: 12px; }
    .sk-img-watermark { font-size: 60px; }
  }

  /* ── CTA button ── */
  .sk-cta {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 12px 22px;
    border-radius: 10px;
    border: 1px solid rgba(255,255,255,0.08);
    background: transparent;
    color: #F1F5F9;
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-decoration: none;
    transition: background 0.2s ease, border-color 0.2s ease, color 0.2s ease;
    cursor: pointer;
    width: fit-content;
  }
  .sk-cta:hover {
    background: var(--accent-color);
    border-color: var(--accent-color);
    color: #060810;
  }
  .sk-cta svg {
    transition: transform 0.2s ease;
    flex-shrink: 0;
  }
  .sk-cta:hover svg { transform: translate(2px, -2px); }

  /* ── Tags ── */
  .sk-tag {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 5px 11px;
    border-radius: 6px;
    border: 1px solid rgba(255,255,255,0.06);
    background: #060810;
    font-size: 10px;
    font-family: monospace;
    letter-spacing: 0.07em;
    text-transform: uppercase;
    color: #94A3B8;
    white-space: nowrap;
  }

  /* ── Status dot ── */
  .sk-status {
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }
  .sk-status-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    flex-shrink: 0;
  }
  .sk-status-label {
    font-size: 11px;
    font-family: monospace;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  /* ── Section header ── */
  .sk-header {
    margin-bottom: 16px;
  }
  @media (max-width: 900px) { .sk-header { margin-bottom: 0; } }

  /* ── Eyebrow pill ── */
  .sk-eyebrow-pill {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 6px 14px;
    border-radius: 20px;
    border: 1px solid rgba(255,255,255,0.06);
    background: rgba(99,102,241,0.12);
    margin-bottom: 24px;
  }

  /* ── Scrollbar ── */
  .sk-showcase { scrollbar-width: thin; scrollbar-color: #1e2030 transparent; }
`;

// ─── App Data ─────────────────────────────────────────────────────────────────
interface AppEntry {
  id: string;
  index: string;
  title: string;
  eyebrow: string;
  tagline: string;
  description: string;
  imageUrl: string;
  downloadUrl: string;
  version: string;
  status: 'Live' | 'Beta' | 'In Development';
  tags: { label: string; Icon: React.FC<{ size?: number; strokeWidth?: number }> }[];
  accentColor: string;
  accentDim: string;
}

const apps: AppEntry[] = [
  {
    id: 'shyam-lyrics-vault',
    index: '01',
    title: 'Shyam Lyrics\nVault',
    eyebrow: 'Devotional · Offline-First · Mobile',
    tagline: 'A sacred archive, engineered for permanence.',
    description:
      "A personal vault for devotional PDF lyrics built around uncompromising data integrity. MD5-based deduplication prevents storage bloat, while AES-encrypted backup exports ensure portability without sacrificing privacy. The architecture treats every file as immutable evidence — once it's in, it's provably unchanged.",
    imageUrl: shyamImg,
    downloadUrl: 'https://lyrics-vault-web.vercel.app/',
    version: 'v1.2.0',
    status: 'Live',
    tags: [
      { label: 'SQLite ORM',        Icon: Database },
      { label: 'MD5 Deduplication', Icon: Shield   },
      { label: 'AES Cryptography',  Icon: Shield   },
    ],
    accentColor: '#A78BFA',
    accentDim:   'rgba(167,139,250,0.08)',
  },
  {
    id: 'freight-desk',
    index: '02',
    title: 'Freight\nDesk',
    eyebrow: 'Logistics · Relational DB · On-Device',
    tagline: 'Complexity tamed at the edge.',
    description:
      'A full logistics operations matrix that runs entirely on-device. Point-to-point freight tracking, demurrage calculations, and on-device PDF generation are wired to a self-healing relational SQLite engine with referential integrity enforced at the schema level — not in application code. No cloud dependency. No single point of failure.',
    imageUrl: freightImg,
    downloadUrl: '#',
    version: 'v1.0.0',
    status: 'Beta',
    tags: [
      { label: 'Relational SQLite',   Icon: Database },
      { label: 'pdf-lib',             Icon: Database },
      { label: 'On-Device Analytics', Icon: Shield   },
    ],
    accentColor: '#34D399',
    accentDim:   'rgba(52,211,153,0.08)',
  },
  {
    id: 'moonveil',
    index: '03',
    title: 'Moonveil',
    eyebrow: 'Multiplayer · LAN · Social Deduction',
    tagline: 'A village of secrets. Zero servers required.',
    description:
      'A local-multiplayer social deduction game for Android. Devices discover each other over LAN via mDNS/Zeroconf, connect peer-to-peer over TCP, and are governed by a fully deterministic rules engine — every game state is reproducible from its initial seed. No internet connection, no backend, no latency. Just the room.',
    imageUrl: moonveilImg,
    downloadUrl: '#',
    version: 'v1.0.0',
    status: 'In Development',
    tags: [
      { label: 'UDP/TCP Networking',  Icon: Wifi   },
      { label: 'mDNS Discovery',      Icon: Wifi   },
      { label: 'Deterministic Engine',Icon: Shield },
    ],
    accentColor: '#F472B6',
    accentDim:   'rgba(244,114,182,0.08)',
  },
];

// ─── Status config ────────────────────────────────────────────────────────────
const statusCfg = {
  Live:             { color: '#34D399' },
  Beta:             { color: '#F59E0B' },
  'In Development': { color: '#94A3B8' },
};

const StatusDot: React.FC<{ status: AppEntry['status'] }> = ({ status }) => {
  const { color } = statusCfg[status];
  return (
    <span className="sk-status">
      <span
        className="sk-status-dot"
        style={{
          background:  color,
          boxShadow:   status === 'Live' ? `0 0 6px ${color}` : 'none',
        }}
      />
      <span className="sk-status-label" style={{ color }}>
        {status === 'In Development' ? 'In Dev' : status}
      </span>
    </span>
  );
};

// ─── Intersection observer hook ───────────────────────────────────────────────
function useInView(threshold = 0.1) {
  const ref  = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

// ─── Feature Row ──────────────────────────────────────────────────────────────
const AppRow: React.FC<{ app: AppEntry; flip: boolean; delay: number }> = ({ app, flip, delay }) => {
  const { ref, inView } = useInView();

  return (
    <div
      ref={ref}
      className={`sk-row${inView ? ' visible' : ''}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {/* CSS custom props for accent-aware child elements */}
      <div
        className={`sk-feature-row${flip ? ' flip' : ''}`}
        style={{
          // @ts-ignore
          '--accent-color': app.accentColor,
          '--accent-dim':   app.accentDim,
        }}
      >
        {/* ── Image box ── */}
        <div className="sk-img-box">
          <img
            src={app.imageUrl}
            alt={app.title.replace('\n', ' ')}
            loading="lazy"
            draggable={false}
          />
          <span className="sk-img-watermark">{app.index}</span>
          <span className="sk-version-chip">{app.version}</span>
        </div>

        {/* ── Content ── */}
        <div className="sk-content-pane">
          {/* Eyebrow + status */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
            <span style={{ fontSize: 11, fontFamily: 'monospace', letterSpacing: '0.1em', textTransform: 'uppercase', color: T.textMuted }}>
              {app.eyebrow}
            </span>
            <StatusDot status={app.status} />
          </div>

          {/* Title */}
          <h3
            style={{
              margin: 0,
              fontSize: 'clamp(26px, 3.2vw, 42px)',
              fontWeight: 900,
              lineHeight: 1.1,
              letterSpacing: '-0.035em',
              color: T.textPrimary,
              fontFamily: '"Inter", sans-serif',
              whiteSpace: 'pre-line',
            }}
          >
            {app.title}
          </h3>

          {/* Tagline */}
          <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: app.accentColor, letterSpacing: '0.01em', lineHeight: 1.4 }}>
            {app.tagline}
          </p>

          {/* Description */}
          <p style={{ margin: 0, fontSize: 14, color: T.textSecondary, lineHeight: 1.78 }}>
            {app.description}
          </p>

          {/* Tags */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
            {app.tags.map(({ label, Icon }) => (
              <span key={label} className="sk-tag">
                <Icon size={11} strokeWidth={1.5} />
                {label}
              </span>
            ))}
          </div>

          {/* CTA */}
          <a
            href={app.downloadUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="sk-cta"
            // @ts-ignore
            style={{ '--accent-color': app.accentColor }}
          >
            {app.downloadUrl === '#' ? 'View Details' : 'Open App'}
            <ArrowUpRight size={15} strokeWidth={2.5} />
          </a>
        </div>
      </div>
    </div>
  );
};

// ─── Root Component ───────────────────────────────────────────────────────────
const SKAppsShowcase: React.FC = () => {
  // Inject CSS once
  useEffect(() => {
    const id  = 'sk-showcase-styles';
    if (document.getElementById(id)) return;
    const tag = document.createElement('style');
    tag.id        = id;
    tag.textContent = GLOBAL_CSS;
    document.head.appendChild(tag);
    return () => { document.getElementById(id)?.remove(); };
  }, []);

  const { ref: headerRef, inView: headerVisible } = useInView(0.1);

  return (
    <section
      className="sk-showcase"
      style={{
        background:            T.bg,
        padding:               'clamp(40px, 6vw, 96px) clamp(16px, 5vw, 56px) clamp(56px, 8vw, 112px)',
        fontFamily:            '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
        WebkitFontSmoothing:   'antialiased',
        MozOsxFontSmoothing:   'grayscale',
      }}
    >
      <div style={{ maxWidth: 1120, margin: '0 auto' }}>

        {/* ── Section Header ── */}
        <header
          ref={headerRef}
          className={`sk-row sk-header${headerVisible ? ' visible' : ''}`}
          style={{ marginBottom: 'clamp(32px, 5vw, 72px)' }}
        >
          {/* Eyebrow pill */}
          <div className="sk-eyebrow-pill">
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: T.indigo, boxShadow: `0 0 8px ${T.indigo}`, flexShrink: 0 }} />
            <span style={{ fontSize: 11, fontFamily: 'monospace', letterSpacing: '0.1em', textTransform: 'uppercase', color: T.indigo }}>
              SK Apps — Flagship Ecosystem
            </span>
          </div>

          {/* Headline */}
          <h2
            style={{
              margin:        '0 0 16px',
              fontSize:      'clamp(32px, 5vw, 62px)',
              fontWeight:    900,
              letterSpacing: '-0.04em',
              lineHeight:    1.05,
              color:         T.textPrimary,
              maxWidth:      660,
            }}
          >
            Products built to{' '}
            <span style={{ color: T.indigo }}>last</span>.
          </h2>

          {/* Sub-copy */}
          <p
            style={{
              margin:   0,
              fontSize: 'clamp(14px, 1.6vw, 17px)',
              color:    T.textSecondary,
              lineHeight: 1.72,
              maxWidth: 500,
            }}
          >
            Three production-grade Android applications, engineered for resilience and designed for real users — offline-first, privacy-respecting, and built without compromise.
          </p>
        </header>

        {/* ── App Rows ── */}
        {apps.map((app, i) => (
          <AppRow key={app.id} app={app} flip={i % 2 === 1} delay={0} />
        ))}

        {/* Final rule */}
        <div style={{ height: 1, background: T.border, marginTop: 0 }} />

        {/* Footer note */}
        <footer style={{ marginTop: 36 }}>
          <span style={{ fontSize: 11, fontFamily: 'monospace', letterSpacing: '0.06em', color: T.textMuted }}>
            All applications developed by a single engineer — design, architecture, and implementation.
          </span>
        </footer>

      </div>
    </section>
  );
};

export default SKAppsShowcase;
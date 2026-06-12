/**
 * HeroScene.tsx — Living Distributed Systems Simulation
 *
 * Architecture:
 * - SystemNode: glass-core infrastructure nodes (InstancedMesh for shells, individual meshes for cores)
 * - PacketSystem: meaningful data packets riding connection paths
 * - ConnectionSystem: animated edges with health states (healthy / degraded / failed / recovering)
 * - EventEngine: autonomous storytelling — fault injection, rebalancing, sync waves, integrity repair
 * - CinematicCamera: orbital auto-tour with node inspection focus shifts
 * - AdaptiveQuality: monitors FPS and degrades/upgrades particle density dynamically
 *
 * Storytelling events (recruiter wow moments):
 * 1. Data packet travels Moonveil → State Sync → validated
 * 2. Connection failure + auto-recovery
 * 3. Node overload + load-balance redistribution
 * 4. Orphan record appears → integrity engine repairs it
 * 5. Offline node goes dark → reconnects → sync wave propagates
 */

import { useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';

// ─── Types ────────────────────────────────────────────────────────────────────

interface NodeDef {
  id: string;
  label: string;
  sublabel: string;
  position: [number, number, number];
  radius: number;
  color: number;
  glowColor: number;
  tier: 'app' | 'infra' | 'pattern';
}

interface ConnectionDef {
  from: string;
  to: string;
  weight: number; // 0‒1 relative bandwidth
}

type ConnectionHealth = 'healthy' | 'degraded' | 'failed' | 'recovering';

interface LiveConnection {
  def: ConnectionDef;
  line: THREE.Line;
  pulseT: number;        // 0‒1 animated pulse position
  health: ConnectionHealth;
  healthTimer: number;
  material: THREE.ShaderMaterial;
}

interface DataPacket {
  mesh: THREE.Mesh;
  fromId: string;
  toId: string;
  t: number;            // 0‒1 journey progress
  speed: number;
  type: 'sync' | 'heartbeat' | 'integrity' | 'recovery' | 'data';
  color: THREE.Color;
  trail: THREE.Mesh[];
}

interface LiveNode {
  def: NodeDef;
  group: THREE.Group;
  coreMesh: THREE.Mesh;
  shellMesh: THREE.Mesh;
  ringMesh: THREE.Mesh;
  glowMesh: THREE.Mesh;
  pulsePhase: number;
  loadLevel: number;   // 0‒1
  status: 'online' | 'offline' | 'overloaded' | 'syncing';
  statusRingMaterial: THREE.MeshBasicMaterial;
}

// ─── Node layout — 3D positions designed for readable depth ───────────────────

const NODE_DEFS: NodeDef[] = [
  {
    id: 'freight',
    label: 'Freight Desk',
    sublabel: 'Logistics · TCP · mDNS',
    position: [-2.8, 0.6, -0.5],
    radius: 0.22,
    color: 0x00c8ff,
    glowColor: 0x0066cc,
    tier: 'app',
  },
  {
    id: 'moonveil',
    label: 'Moonveil',
    sublabel: 'Game Server · LAN · WebSocket',
    position: [2.5, 0.3, -1.0],
    radius: 0.26,
    color: 0x9b59ff,
    glowColor: 0x5a00cc,
    tier: 'app',
  },
  {
    id: 'lyrics',
    label: 'Lyrics Vault',
    sublabel: 'Media Index · SQLite · Sync',
    position: [0.4, -1.4, -0.8],
    radius: 0.20,
    color: 0x00e5a0,
    glowColor: 0x007a50,
    tier: 'app',
  },
  {
    id: 'offline',
    label: 'Offline-First',
    sublabel: 'CRDT · Queue · Retry',
    position: [-1.6, 1.4, 0.4],
    radius: 0.18,
    color: 0xffd700,
    glowColor: 0x886600,
    tier: 'pattern',
  },
  {
    id: 'selfheal',
    label: 'Self-Healing',
    sublabel: 'Circuit Breaker · Watchdog',
    position: [1.2, 1.5, 0.2],
    radius: 0.18,
    color: 0xff6b35,
    glowColor: 0x882200,
    tier: 'pattern',
  },
  {
    id: 'statesync',
    label: 'State Sync',
    sublabel: 'Event Source · Reconcile',
    position: [-0.3, -0.2, -2.4],
    radius: 0.24,
    color: 0x00d4ff,
    glowColor: 0x005577,
    tier: 'infra',
  },
  {
    id: 'integrity',
    label: 'Integrity Engine',
    sublabel: 'Constraint · Repair · Audit',
    position: [0.9, -0.8, 0.8],
    radius: 0.16,
    color: 0x88ff44,
    glowColor: 0x336600,
    tier: 'infra',
  },
];

const CONNECTION_DEFS: ConnectionDef[] = [
  { from: 'freight', to: 'offline', weight: 0.9 },
  { from: 'freight', to: 'statesync', weight: 0.7 },
  { from: 'moonveil', to: 'statesync', weight: 1.0 },
  { from: 'moonveil', to: 'selfheal', weight: 0.8 },
  { from: 'lyrics', to: 'statesync', weight: 0.75 },
  { from: 'lyrics', to: 'integrity', weight: 0.6 },
  { from: 'offline', to: 'statesync', weight: 0.85 },
  { from: 'selfheal', to: 'statesync', weight: 0.9 },
  { from: 'integrity', to: 'statesync', weight: 0.7 },
  { from: 'freight', to: 'integrity', weight: 0.5 },
  { from: 'moonveil', to: 'lyrics', weight: 0.4 },
];

// ─── Shader sources ───────────────────────────────────────────────────────────

const CONNECTION_VERT = /* glsl */ `
  attribute float lineProgress;
  varying float vProgress;
  void main() {
    vProgress = lineProgress;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const CONNECTION_FRAG = /* glsl */ `
  uniform vec3 uColor;
  uniform float uHealth;  // 1=healthy 0=failed
  uniform float uPulse;   // 0‒1 pulse head position
  uniform float uTime;
  varying float vProgress;

  void main() {
    float dist = abs(vProgress - uPulse);
    // wrap around for looping pulse
    dist = min(dist, 1.0 - dist);
    float pulse = exp(-dist * 28.0) * 0.9;

    vec3 healthColor = mix(vec3(1.0, 0.15, 0.05), uColor, uHealth);
    // recovering flicker
    float flicker = uHealth < 0.5 ? (sin(uTime * 12.0) * 0.5 + 0.5) : 1.0;

    float alpha = (0.18 + pulse * 0.75) * flicker;
    gl_FragColor = vec4(healthColor, alpha);
  }
`;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function hexToThreeColor(hex: number): THREE.Color {
  return new THREE.Color(hex);
}

function lerp3(
  a: THREE.Vector3,
  b: THREE.Vector3,
  t: number
): THREE.Vector3 {
  return new THREE.Vector3(
    a.x + (b.x - a.x) * t,
    a.y + (b.y - a.y) * t,
    a.z + (b.z - a.z) * t
  );
}

function easeInOut(t: number): number {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

// ─── Component ────────────────────────────────────────────────────────────────

const HeroScene = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  // We keep ALL mutable scene state in a single ref-of-objects
  // so React never re-renders while the loop runs.
  const stateRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    elapsedTime: number;
    raf: number;
    nodes: Map<string, LiveNode>;
    connections: LiveConnection[];
    packets: DataPacket[];
    // Camera tour
    camTargetPos: THREE.Vector3;
    camTargetLook: THREE.Vector3;
    camT: number;
    camStageTimer: number;
    camStage: number;
    // Event engine
    eventTimer: number;
    eventIndex: number;
    // FPS adaptation
    fpsHistory: number[];
    lastQuality: number;      // particle count multiplier
    // Ambient particles (background field)
    ambientParticles: THREE.Points;
    isMobile: boolean;
  } | null>(null);

  const buildScene = useCallback(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const isMobile = window.innerWidth < 768;

    // ── Renderer ──────────────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: !isMobile,
      powerPreference: 'high-performance',
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));
    renderer.sortObjects = true;
    container.appendChild(renderer.domElement);

    // ── Scene & Camera ────────────────────────────────────────────────────
    const scene = new THREE.Scene();
    scene.background = null;
    // Very faint depth fog
    scene.fog = new THREE.FogExp2(0x000814, 0.06);

    const camera = new THREE.PerspectiveCamera(
      50,
      container.clientWidth / container.clientHeight,
      0.1,
      200
    );
    camera.position.set(0, 1, 7);
    camera.lookAt(0, 0, 0);

    // ── Lighting ──────────────────────────────────────────────────────────
    // Deep space ambient — barely visible, nodes provide own illumination
    const ambient = new THREE.AmbientLight(0x050a1a, 1.0);
    scene.add(ambient);

    // Rim light from above-left (cool blue)
    const rimLight = new THREE.DirectionalLight(0x4488ff, 0.4);
    rimLight.position.set(-4, 6, 2);
    scene.add(rimLight);

    // Warm accent from below-right (golden)
    const accentLight = new THREE.PointLight(0xffaa33, 0.6, 20);
    accentLight.position.set(3, -3, 1);
    scene.add(accentLight);

    // ── Nodes ─────────────────────────────────────────────────────────────
    const nodes = new Map<string, LiveNode>();

    for (const def of NODE_DEFS) {
      const group = new THREE.Group();
      group.position.set(...def.position);

      const col = hexToThreeColor(def.color);

      // Glass core
      const coreGeo = new THREE.IcosahedronGeometry(def.radius * 0.55, isMobile ? 1 : 2);
      const coreMat = new THREE.MeshPhysicalMaterial({
        color: col,
        emissive: col,
        emissiveIntensity: 0.7,
        metalness: 0.1,
        roughness: 0.05,
        transmission: 0.6,
        transparent: true,
        opacity: 0.92,
        envMapIntensity: 1.2,
      });
      const coreMesh = new THREE.Mesh(coreGeo, coreMat);

      // Outer glass shell
      const shellGeo = new THREE.SphereGeometry(def.radius, isMobile ? 12 : 24, isMobile ? 8 : 16);
      const shellMat = new THREE.MeshPhysicalMaterial({
        color: col,
        emissive: col,
        emissiveIntensity: 0.08,
        metalness: 0.0,
        roughness: 0.0,
        transmission: 0.88,
        transparent: true,
        opacity: 0.22,
        side: THREE.BackSide,
        depthWrite: false,
      });
      const shellMesh = new THREE.Mesh(shellGeo, shellMat);

      // Status ring (thin torus orbiting equator)
      const ringGeo = new THREE.TorusGeometry(def.radius * 1.35, 0.008, 4, isMobile ? 24 : 48);
      const statusRingMaterial = new THREE.MeshBasicMaterial({
        color: col,
        transparent: true,
        opacity: 0.8,
      });
      const ringMesh = new THREE.Mesh(ringGeo, statusRingMaterial);
      ringMesh.rotation.x = Math.PI / 2;

      // Soft glow plane (additive billboard — simulated with a large transparent sphere)
      const glowGeo = new THREE.SphereGeometry(def.radius * 2.2, 8, 6);
      const glowMat = new THREE.MeshBasicMaterial({
        color: col,
        transparent: true,
        opacity: 0.04,
        side: THREE.FrontSide,
        depthWrite: false,
      });
      const glowMesh = new THREE.Mesh(glowGeo, glowMat);

      group.add(glowMesh);
      group.add(shellMesh);
      group.add(coreMesh);
      group.add(ringMesh);

      scene.add(group);

      nodes.set(def.id, {
        def,
        group,
        coreMesh,
        shellMesh,
        ringMesh,
        glowMesh,
        pulsePhase: Math.random() * Math.PI * 2,
        loadLevel: 0.1 + Math.random() * 0.3,
        status: 'online',
        statusRingMaterial,
      });
    }

    // ── Connections ───────────────────────────────────────────────────────
    const connections: LiveConnection[] = [];
    const SEGMENTS = isMobile ? 40 : 80;

    for (const def of CONNECTION_DEFS) {
      const fromNode = nodes.get(def.from);
      const toNode = nodes.get(def.to);
      if (!fromNode || !toNode) continue;

      const fromPos = new THREE.Vector3(...fromNode.def.position);
      const toPos = new THREE.Vector3(...toNode.def.position);

      // Slight arc (mid-point offset)
      const midpoint = lerp3(fromPos, toPos, 0.5);
      midpoint.y += (Math.random() - 0.5) * 0.5;
      midpoint.z += (Math.random() - 0.5) * 0.3;

      const positions = new Float32Array((SEGMENTS + 1) * 3);
      const progress = new Float32Array(SEGMENTS + 1);

      for (let i = 0; i <= SEGMENTS; i++) {
        const t = i / SEGMENTS;
        // Quadratic bezier
        const p = new THREE.Vector3()
          .copy(fromPos)
          .multiplyScalar((1 - t) * (1 - t))
          .addScaledVector(midpoint, 2 * (1 - t) * t)
          .addScaledVector(toPos, t * t);

        positions[i * 3] = p.x;
        positions[i * 3 + 1] = p.y;
        positions[i * 3 + 2] = p.z;
        progress[i] = t;
      }

      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geo.setAttribute('lineProgress', new THREE.BufferAttribute(progress, 1));

      const fromCol = hexToThreeColor(fromNode.def.color);

      const material = new THREE.ShaderMaterial({
        vertexShader: CONNECTION_VERT,
        fragmentShader: CONNECTION_FRAG,
        uniforms: {
          uColor: { value: fromCol },
          uHealth: { value: 1.0 },
          uPulse: { value: 0.0 },
          uTime: { value: 0.0 },
        },
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });

      const line = new THREE.Line(geo, material);
      scene.add(line);

      connections.push({
        def,
        line,
        pulseT: Math.random(),
        health: 'healthy',
        healthTimer: 0,
        material,
      });
    }

    // ── Ambient particles (background star field — meaningful) ─────────────
    const particleCount = isMobile ? 300 : 700;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(particleCount * 3);
    const pCol = new Float32Array(particleCount * 3);
    const pSize = new Float32Array(particleCount);

    const particleColors = [
      new THREE.Color(0x00c8ff),
      new THREE.Color(0x9b59ff),
      new THREE.Color(0x00e5a0),
      new THREE.Color(0xffd700),
    ];

    for (let i = 0; i < particleCount; i++) {
      // Spread in a flattened sphere — depth of field feel
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 4 + Math.random() * 6;
      pPos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pPos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.5;
      pPos[i * 3 + 2] = r * Math.cos(phi) - 3;

      const c = particleColors[i % particleColors.length];
      pCol[i * 3] = c.r;
      pCol[i * 3 + 1] = c.g;
      pCol[i * 3 + 2] = c.b;

      pSize[i] = 0.01 + Math.random() * 0.025;
    }

    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    pGeo.setAttribute('color', new THREE.BufferAttribute(pCol, 3));

    const pMat = new THREE.PointsMaterial({
      size: 0.018,
      vertexColors: true,
      transparent: true,
      opacity: 0.35,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const ambientParticles = new THREE.Points(pGeo, pMat);
    scene.add(ambientParticles);

    // ── Camera tour stages ─────────────────────────────────────────────────
    // Each stage: {eye, look, duration}
    const CAMERA_STAGES = [
      // Wide establishing shot — "this is a distributed system"
      { eye: [0, 1.2, 7.5], look: [0, 0, 0], duration: 8 },
      // Inspect Moonveil (game server)
      { eye: [3.8, 1.5, 2.0], look: [2.5, 0.3, -1.0], duration: 7 },
      // Inspect State Sync hub (infra core)
      { eye: [-0.3, 1.0, 2.0], look: [-0.3, -0.2, -2.4], duration: 6 },
      // Orbit left — Freight + Offline
      { eye: [-4.5, 0.8, 3.0], look: [-1.5, 0.5, 0], duration: 7 },
      // Top-down systems view
      { eye: [0.5, 6.0, 3.0], look: [0, 0, -1], duration: 6 },
      // Return wide
      { eye: [1.0, 0.8, 7.0], look: [0, 0, 0], duration: 8 },
    ];

    stateRef.current = {
      scene,
      camera,
      renderer,
      elapsedTime: 0,
      raf: 0,
      nodes,
      connections,
      packets: [],
      camTargetPos: new THREE.Vector3(0, 1.2, 7.5),
      camTargetLook: new THREE.Vector3(0, 0, 0),
      camT: 0,
      camStageTimer: 0,
      camStage: 0,
      eventTimer: 3,   // first event fires at t=3s
      eventIndex: 0,
      fpsHistory: [],
      lastQuality: 1,
      ambientParticles,
      isMobile,
    };

    // Store camera stage list on state for access in loop
    (stateRef.current as any).cameraStages = CAMERA_STAGES;
  }, []);

  // ── Packet factory ─────────────────────────────────────────────────────────
  const spawnPacket = useCallback(
    (
      fromId: string,
      toId: string,
      type: DataPacket['type']
    ) => {
      if (!stateRef.current) return;
      const { scene, nodes, packets } = stateRef.current;

      const fromNode = nodes.get(fromId);
      const toNode = nodes.get(toId);
      if (!fromNode || !toNode) return;

      // Packet colors by type
      const typeColor: Record<DataPacket['type'], number> = {
        sync: 0x00d4ff,
        heartbeat: 0x00ff88,
        integrity: 0x88ff44,
        recovery: 0xff6b35,
        data: 0xffd700,
      };

      const col = hexToThreeColor(typeColor[type]);
      const geo = new THREE.SphereGeometry(0.035, 5, 4);
      const mat = new THREE.MeshBasicMaterial({
        color: col,
        transparent: true,
        opacity: 0.95,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const mesh = new THREE.Mesh(geo, mat);
      scene.add(mesh);

      // Build short trail (3 spheres behind the head)
      const isMobile = stateRef.current.isMobile;
      const trailCount = isMobile ? 2 : 4;
      const trail: THREE.Mesh[] = [];
      for (let i = 0; i < trailCount; i++) {
        const scale = 1 - (i + 1) / (trailCount + 1);
        const tGeo = new THREE.SphereGeometry(0.025 * scale, 4, 3);
        const tMat = new THREE.MeshBasicMaterial({
          color: col,
          transparent: true,
          opacity: 0.4 * scale,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        });
        const tMesh = new THREE.Mesh(tGeo, tMat);
        scene.add(tMesh);
        trail.push(tMesh);
      }

      packets.push({
        mesh,
        fromId,
        toId,
        t: 0,
        speed: 0.18 + Math.random() * 0.12,
        type,
        color: col,
        trail,
      });
    },
    []
  );

  // ── Sample bezier point (must mirror how connections were built) ──────────
  const sampleConnection = useCallback(
    (conn: LiveConnection, t: number): THREE.Vector3 => {
      const { nodes } = stateRef.current!;
      const from = nodes.get(conn.def.from)!;
      const to = nodes.get(conn.def.to)!;
      const fromPos = new THREE.Vector3(...from.def.position);
      const toPos = new THREE.Vector3(...to.def.position);
      const mid = lerp3(fromPos, toPos, 0.5);
      // Re-derive midpoint perturbation deterministically per connection ID
      const seed = conn.def.from.charCodeAt(0) + conn.def.to.charCodeAt(0);
      mid.y += ((seed % 7) - 3.5) * 0.07;
      mid.z += ((seed % 5) - 2.5) * 0.06;

      // Quadratic bezier
      const p = new THREE.Vector3()
        .copy(fromPos)
        .multiplyScalar((1 - t) * (1 - t))
        .addScaledVector(mid, 2 * (1 - t) * t)
        .addScaledVector(toPos, t * t);
      return p;
    },
    []
  );

  // ── Event engine — 5 autonomous story moments ──────────────────────────────
  const EVENTS = [
    // 1. Moonveil → State Sync data packet journey
    (s: typeof stateRef.current) => {
      if (!s) return;
      const conn = s.connections.find(
        (c) => c.def.from === 'moonveil' && c.def.to === 'statesync'
      );
      if (conn) spawnPacket('moonveil', 'statesync', 'data');
    },
    // 2. Connection failure + recovery (freight → statesync)
    (s: typeof stateRef.current) => {
      if (!s) return;
      const conn = s.connections.find(
        (c) => c.def.from === 'freight' && c.def.to === 'statesync'
      );
      if (conn) {
        conn.health = 'failed';
        conn.healthTimer = 3.5; // seconds until recovery starts
        conn.material.uniforms.uHealth.value = 0.0;
      }
    },
    // 3. Node overload on Moonveil
    (s: typeof stateRef.current) => {
      if (!s) return;
      const node = s.nodes.get('moonveil');
      if (node) {
        node.loadLevel = 0.95;
        node.status = 'overloaded';
        // Spawn recovery packets to self-heal
        const conn = s.connections.find(
          (c) => c.def.from === 'moonveil' && c.def.to === 'selfheal'
        );
        if (conn) {
          spawnPacket('moonveil', 'selfheal', 'recovery');
        }
        // Auto-normalize after 4s (handled in loop)
      }
    },
    // 4. Orphan integrity repair
    (s: typeof stateRef.current) => {
      if (!s) return;
      const conn = s.connections.find(
        (c) => c.def.from === 'lyrics' && c.def.to === 'integrity'
      );
      if (conn) spawnPacket('lyrics', 'integrity', 'integrity');
      const conn2 = s.connections.find(
        (c) => c.def.from === 'integrity' && c.def.to === 'statesync'
      );
      if (conn2)
        setTimeout(() => spawnPacket('integrity', 'statesync', 'sync'), 800);
    },
    // 5. Offline node goes dark → reconnects → sync wave
    (s: typeof stateRef.current) => {
      if (!s) return;
      const node = s.nodes.get('offline');
      if (node) {
        node.status = 'offline';
        // Re-online after 3.5s
        setTimeout(() => {
          if (!stateRef.current) return;
          const n = stateRef.current.nodes.get('offline');
          if (n) {
            n.status = 'syncing';
            // Spray heartbeat packets
            const targets = ['statesync', 'freight'];
            for (const tId of targets) {
              const c = stateRef.current.connections.find(
                (conn) =>
                  (conn.def.from === 'offline' && conn.def.to === tId) ||
                  (conn.def.to === 'offline' && conn.def.from === tId)
              );
              if (c) spawnPacket('offline', tId, 'heartbeat');
            }
            setTimeout(() => {
              const n2 = stateRef.current?.nodes.get('offline');
              if (n2) n2.status = 'online';
            }, 2000);
          }
        }, 3500);
      }
    },
  ];

  // ── Main animation loop ────────────────────────────────────────────────────
  const startLoop = useCallback(() => {
    if (!stateRef.current) return;

    // Heartbeat packets spawned on a timer (background traffic)
    let heartbeatTimer = 0;
    let prevTime = performance.now();
    let frameCount = 0;
    let fpsAccum = 0;
    let fpsTimer = 0;

    const loop = () => {
      if (!stateRef.current) return;
      const s = stateRef.current;
      s.raf = requestAnimationFrame(loop);

      const now = performance.now();
      const rawDt = Math.min((now - prevTime) / 1000, 0.05); // cap at 50ms
      prevTime = now;

      // Skip if tab hidden
      if (document.hidden) return;

      s.elapsedTime += rawDt;
      const t = s.elapsedTime;

      // FPS measurement
      frameCount++;
      fpsAccum += 1 / rawDt;
      fpsTimer += rawDt;
      if (fpsTimer >= 2) {
        const avgFps = fpsAccum / frameCount;
        s.fpsHistory.push(avgFps);
        if (s.fpsHistory.length > 5) s.fpsHistory.shift();
        fpsAccum = 0;
        frameCount = 0;
        fpsTimer = 0;
      }

      // ── Camera tour ─────────────────────────────────────────────────────
      const stages = (s as any).cameraStages as Array<{
        eye: number[];
        look: number[];
        duration: number;
      }>;
      s.camStageTimer += rawDt;
      const curStage = stages[s.camStage % stages.length];
      const nextStage = stages[(s.camStage + 1) % stages.length];

      if (s.camStageTimer >= curStage.duration) {
        s.camStageTimer = 0;
        s.camStage = (s.camStage + 1) % stages.length;
      }

      const stageProgress = easeInOut(
        Math.min(s.camStageTimer / Math.max(curStage.duration - 1.5, 1), 1)
      );

      const targetEye = new THREE.Vector3(...(nextStage.eye as [number, number, number]));
      const currentEye = new THREE.Vector3(...(curStage.eye as [number, number, number]));
      const targetLook = new THREE.Vector3(...(nextStage.look as [number, number, number]));
      const currentLook = new THREE.Vector3(...(curStage.look as [number, number, number]));

      const desiredEye = lerp3(currentEye, targetEye, stageProgress * 0.3);
      const desiredLook = lerp3(currentLook, targetLook, stageProgress * 0.3);

      // Smooth follow
      s.camera.position.lerp(desiredEye, 0.015);
      s.camTargetLook.lerp(desiredLook, 0.015);
      s.camera.lookAt(s.camTargetLook);

      // Gentle orbital drift (layered on top of tour)
      const orbitDrift = 0.06;
      s.camera.position.x += Math.sin(t * 0.07) * orbitDrift * rawDt;
      s.camera.position.y += Math.cos(t * 0.05) * orbitDrift * 0.4 * rawDt;

      // ── Event engine ────────────────────────────────────────────────────
      s.eventTimer -= rawDt;
      if (s.eventTimer <= 0) {
        const eventFn = EVENTS[s.eventIndex % EVENTS.length];
        eventFn(s);
        s.eventIndex++;
        // Events fire every 5–9 seconds
        s.eventTimer = 5 + Math.random() * 4;
      }

      // ── Node animations ─────────────────────────────────────────────────
      for (const [, node] of s.nodes) {
        const { coreMesh, shellMesh, ringMesh, glowMesh, statusRingMaterial, def } = node;
        node.pulsePhase += rawDt * (0.8 + node.loadLevel);

        // Breathing scale
        const breathe = 1 + Math.sin(node.pulsePhase) * 0.05 * (1 + node.loadLevel);
        coreMesh.scale.setScalar(breathe);

        // Shell slow counter-rotation
        shellMesh.rotation.y += rawDt * 0.12;
        shellMesh.rotation.z += rawDt * 0.07;

        // Status ring orbit
        ringMesh.rotation.z += rawDt * (0.5 + node.loadLevel * 1.5);

        // Status-driven color
        let ringColor: THREE.Color;
        let coreEmissive: number;
        switch (node.status) {
          case 'offline':
            ringColor = new THREE.Color(0x333333);
            coreEmissive = 0.05;
            break;
          case 'overloaded':
            ringColor = new THREE.Color(0xff2200);
            coreEmissive = 1.2;
            break;
          case 'syncing':
            ringColor = new THREE.Color(0xffd700);
            coreEmissive = 0.9 + Math.sin(t * 8) * 0.3;
            break;
          default:
            ringColor = hexToThreeColor(def.color);
            coreEmissive = 0.6 + node.loadLevel * 0.4;
        }
        statusRingMaterial.color.copy(ringColor);
        (coreMesh.material as THREE.MeshPhysicalMaterial).emissiveIntensity = coreEmissive;

        // Auto-heal overloaded node after 5s
        if (node.status === 'overloaded') {
          node.loadLevel = Math.max(0.15, node.loadLevel - rawDt * 0.08);
          if (node.loadLevel < 0.4) node.status = 'online';
        }

        // Glow pulse
        (glowMesh.material as THREE.MeshBasicMaterial).opacity =
          0.03 + Math.abs(Math.sin(node.pulsePhase * 0.7)) * 0.05 * (1 + node.loadLevel);
      }

      // ── Connection animations ───────────────────────────────────────────
      for (const conn of s.connections) {
        conn.pulseT = (conn.pulseT + rawDt * (0.25 + conn.def.weight * 0.3)) % 1.0;
        conn.material.uniforms.uPulse.value = conn.pulseT;
        conn.material.uniforms.uTime.value = t;

        // Health state machine
        if (conn.health === 'failed') {
          conn.healthTimer -= rawDt;
          if (conn.healthTimer <= 0) {
            conn.health = 'recovering';
            conn.healthTimer = 2.0;
          }
        } else if (conn.health === 'recovering') {
          const recovery = 1 - conn.healthTimer / 2.0;
          conn.material.uniforms.uHealth.value = recovery;
          conn.healthTimer -= rawDt;
          if (conn.healthTimer <= 0) {
            conn.health = 'healthy';
            conn.material.uniforms.uHealth.value = 1.0;
            // Spawn sync packet to confirm restored connection
            spawnPacket(conn.def.from, conn.def.to, 'sync');
          }
        }
      }

      // ── Heartbeat background traffic ────────────────────────────────────
      heartbeatTimer -= rawDt;
      if (heartbeatTimer <= 0) {
        heartbeatTimer = 1.2 + Math.random() * 1.5;
        const aliveConns = s.connections.filter((c) => c.health === 'healthy');
        if (aliveConns.length > 0) {
          const picked = aliveConns[Math.floor(Math.random() * aliveConns.length)];
          const type: DataPacket['type'] =
            Math.random() < 0.5
              ? 'heartbeat'
              : Math.random() < 0.6
              ? 'data'
              : 'sync';
          spawnPacket(picked.def.from, picked.def.to, type);
        }
      }

      // ── Packet movement ─────────────────────────────────────────────────
      const deadPackets: DataPacket[] = [];
      for (const packet of s.packets) {
        packet.t += rawDt * packet.speed;
        if (packet.t >= 1.0) {
          deadPackets.push(packet);
          continue;
        }

        const conn = s.connections.find(
          (c) =>
            (c.def.from === packet.fromId && c.def.to === packet.toId) ||
            (c.def.to === packet.fromId && c.def.from === packet.toId)
        );
        if (!conn) continue;

        const pos = sampleConnection(conn, packet.t);
        packet.mesh.position.copy(pos);

        // Trail
        for (let i = 0; i < packet.trail.length; i++) {
          const trailT = Math.max(0, packet.t - (i + 1) * 0.04);
          const tp = sampleConnection(conn, trailT);
          packet.trail[i].position.copy(tp);
        }
      }

      // Clean up dead packets
      for (const p of deadPackets) {
        s.scene.remove(p.mesh);
        p.mesh.geometry.dispose();
        (p.mesh.material as THREE.Material).dispose();
        for (const t of p.trail) {
          s.scene.remove(t);
          t.geometry.dispose();
          (t.material as THREE.Material).dispose();
        }
        s.packets.splice(s.packets.indexOf(p), 1);
      }

      // ── Ambient particles drift ─────────────────────────────────────────
      s.ambientParticles.rotation.y = t * 0.008;
      s.ambientParticles.rotation.x = Math.sin(t * 0.003) * 0.04;

      // ── Render ──────────────────────────────────────────────────────────
      s.renderer.render(s.scene, s.camera);
    };

    loop();
  }, [spawnPacket, sampleConnection]);

  // ── Resize handler ─────────────────────────────────────────────────────────
  const handleResize = useCallback(() => {
    if (!containerRef.current || !stateRef.current) return;
    const { camera, renderer } = stateRef.current;
    const w = containerRef.current.clientWidth;
    const h = containerRef.current.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }, []);

  // ── Lifecycle ──────────────────────────────────────────────────────────────
  useEffect(() => {
    buildScene();
    startLoop();
    window.addEventListener('resize', handleResize);
    handleResize();

    // Pause on hidden tab
    const handleVisibility = () => {
      if (!stateRef.current) return;
      if (document.hidden) {
        cancelAnimationFrame(stateRef.current.raf);
      } else {
        startLoop();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibility);
      if (!stateRef.current) return;
      cancelAnimationFrame(stateRef.current.raf);

      // Full dispose
      const { scene, renderer } = stateRef.current;
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh || obj instanceof THREE.Points || obj instanceof THREE.Line) {
          obj.geometry?.dispose();
          if (Array.isArray(obj.material)) {
            obj.material.forEach((m) => m.dispose());
          } else {
            (obj.material as THREE.Material)?.dispose();
          }
        }
      });
      renderer.dispose();
      if (containerRef.current && renderer.domElement.parentNode === containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
      stateRef.current = null;
    };
  }, [buildScene, startLoop, handleResize]);

  return <div ref={containerRef} className="absolute inset-0 w-full h-full" />;
};

export default HeroScene;
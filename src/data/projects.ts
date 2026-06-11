// src/data/projects.ts

export type Project = {
  id: string;
  title: string;
  role: string;
  domain: string;
  pacsi: {
    problem: string;
    architecture: string;
    challenges: string;
    solution: string;
    impact: string;
  };
  techStack: string[];
  githubUrl?: string;
  liveUrl?: string;
};

export const projectsData: Project[] = [
  {
    id: "freight-desk",
    title: "Freight Desk",
    role: "System Designer",
    domain: "Logistics & Operations Platform",
    pacsi: {
      problem: "Manual railway logbooks caused disconnected data, preventing immediate identification of operational delays and demurrage penalties.",
      architecture: "Offline-first React Native application driven by a relational SQLite matrix with dynamic PTP anchoring.",
      challenges: "Deleting primary data anchors left orphaned child records. Heavy tabular PDF generation caused OOM crashes on low-end devices.",
      solution: "Engineered a self-healing diagnostic engine to prune orphans and built a custom binary-search auto-fit algorithm for memory-safe PDF rendering.",
      impact: "Delivered a 100% offline, fault-tolerant data matrix providing instantaneous, on-device logistical analytics."
    },
    techStack: ["React Native", "SQLite", "pdf-lib", "Offline-First"],
    githubUrl: "https://github.com/Shashikanth/freight-desk"
  },
  {
    id: "moonveil",
    title: "Moonveil",
    role: "Network Architect",
    domain: "Real-Time Multiplayer Networking",
    pacsi: {
      problem: "Traditional multiplayer architectures require centralized cloud servers, introducing latency and preventing off-grid gameplay.",
      architecture: "Decentralized Host-Client topology establishing secure local networking via UDP broadcast discovery and TCP/WebSockets.",
      challenges: "Handling concurrent player actions led to race conditions. Broadcasting complete state allowed packet sniffing.",
      solution: "Built a deterministic ActionResolver state machine to eliminate race conditions and implemented asymmetric state synchronization.",
      impact: "Achieved a seamless, zero-latency local multiplayer experience operating flawlessly without external cloud infrastructure."
    },
    techStack: ["UDP/TCP", "WebSockets", "State Machines", "React Native"],
    githubUrl: "https://github.com/Shashikanth/moonveil"
  },
  {
    id: "shyam-lyrics-vault",
    title: "Shyam Lyrics Vault",
    role: "Full Stack Developer",
    domain: "Secure Offline-First Document Platform",
    pacsi: {
      problem: "Standard cloud syncs consumed excessive bandwidth, duplicate file imports caused storage bloat, and manual exports routinely caused Out-of-Memory (OOM) crashes.",
      architecture: "Service-Oriented Architecture decoupling SQLite metadata from filesystem binaries, syncing incrementally to Google Drive's hidden AppData APIs.",
      challenges: "Repeated file imports led to severe storage bloat. Database transactions occasionally desynced from the physical file system due to sudden application closures.",
      solution: "Implemented MD5 cryptographic hashing for strict deduplication. Engineered a background 'Warden' garbage collector to diff the physical FS against SQLite and purge orphans. Chunked exports (<200MB) with XOR obfuscation.",
      impact: "Created a memory-safe, highly optimized application with drastically reduced bandwidth consumption and zero orphaned binary accumulation over prolonged usage."
    },
    techStack: ["React Native", "SQLite", "Google Drive API", "Cryptography"],
    githubUrl: "https://github.com/Shashikanth/shyam-lyrics-vault"
  }
];
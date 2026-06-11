export type SkillCategory = {
  title: string;
  skills: string[];
};

export const coreCompetencies = [
  "Offline-First Architecture",
  "Database Engineering",
  "State Synchronization",
  "Distributed Systems",
  "React Native Development",
  "Fault Tolerance",
  "Real-Time Networking",
  "System Design",
  "Performance Optimization"
];

export const techArsenal: SkillCategory[] = [
  {
    title: "Core Technologies",
    skills: ["TypeScript", "JavaScript", "Python", "SQL", "React Native", "Django", "Flask", "HTML/CSS"]
  },
  {
    title: "System Design",
    skills: ["Offline-First Architecture", "Distributed Systems", "Service-Oriented Architecture (SOA)", "Event-Driven Workflows"]
  },
  {
    title: "Data & Networking",
    skills: ["SQLite", "MySQL", "TCP/IP", "UDP Broadcast", "WebSockets", "Self-Healing Databases", "Cryptography (MD5, XOR)"]
  },
  {
    title: "Deployment & Tools",
    skills: ["Git", "GitHub", "Android Studio", "VS Code", "REST APIs", "CI/CD Fundamentals"]
  }
];
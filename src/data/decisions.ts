export type Decision = {
  id: string;
  context: string;
  decision: string;
  tradeoffs: string;
  result: string;
};

export const decisionsData: Decision[] = [
  {
    id: "ed-1",
    context: "Freight Desk: Relational Integrity in Offline Environments",
    decision: "Custom Self-Healing Diagnostic Engine over Foreign Key Constraints",
    tradeoffs: "Required manual coding of SQLite PRAGMA integrity checks and background scripts, increasing initial dev time, but prevented total app lockups when anchors were deleted.",
    result: "100% data integrity with silent, automated pruning of orphaned child records without user intervention."
  },
  {
    id: "ed-2",
    context: "Moonveil: Network State Synchronization",
    decision: "Asymmetric TCP Payload Masking over Full State Broadcasts",
    tradeoffs: "Added complexity to the host's ActionResolver (requiring separate state filters per connected client), but mathematically eliminated packet-sniffing cheating.",
    result: "Zero instances of leaked private roles while maintaining sub-second network discovery via UDP."
  },
  {
    id: "ed-3",
    context: "Shyam Lyrics Vault: File Syncing & Export",
    decision: "Incremental MD5 Hashing & XOR Obfuscation over Standard ZIP",
    tradeoffs: "Increased local CPU utilization during export/import (hashing and bit-shifting), but drastically reduced cloud bandwidth and protected intellectual property.",
    result: "Zero duplicate files, eliminated OOM crashes via 200MB chunking, and prevented unzipping by standard extraction tools."
  }
];
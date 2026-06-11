import React, { useEffect, useState } from 'react';
import { Activity, Terminal, Cpu, Zap } from 'lucide-react';

interface LoadingScreenProps {
  onLoadingComplete: () => void;
  minDisplayTime?: number; // minimum ms to show loading (for smooth transition)
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ onLoadingComplete, minDisplayTime = 2000 }) => {
  const [bootProgress, setBootProgress] = useState(0);
  const [bootLogs, setBootLogs] = useState<string[]>([]);
  const [allLoaded, setAllLoaded] = useState(false);

  // Simulated boot sequence
  useEffect(() => {
    const steps = [
      { progress: 10, log: "> INITIALIZING KERNEL... [OK]" },
      { progress: 25, log: "> MOUNTING OFFLINE-FIRST STORAGE... [OK]" },
      { progress: 40, log: "> ESTABLISHING NETWORK TOPOLOGY... [OK]" },
      { progress: 55, log: "> LOADING THREE.JS RENDERER... [OK]" },
      { progress: 70, log: "> STARTING SELF-HEALING DAEMON... [OK]" },
      { progress: 85, log: "> SYNCHRONIZING STATE MACHINES... [OK]" },
      { progress: 100, log: "> SYSTEM READY. WELCOME, OPERATOR." },
    ];

    let stepIndex = 0;
    const interval = setInterval(() => {
      if (stepIndex < steps.length) {
        const step = steps[stepIndex];
        setBootProgress(step.progress);
        setBootLogs(prev => [...prev, step.log]);
        stepIndex++;
      } else {
        clearInterval(interval);
        setAllLoaded(true);
      }
    }, 280);

    return () => clearInterval(interval);
  }, []);

  // Wait for minimum display time before finishing
  useEffect(() => {
    if (allLoaded) {
      const timer = setTimeout(() => {
        onLoadingComplete();
      }, minDisplayTime);
      return () => clearTimeout(timer);
    }
  }, [allLoaded, minDisplayTime, onLoadingComplete]);

  return (
    <div className="fixed inset-0 z-[100] bg-[#0a0e17] flex flex-col items-center justify-center">
      {/* Animated background grid */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
        <div className="w-full h-full bg-[linear-gradient(to_right,#00d4ff_1px,transparent_1px),linear-gradient(to_bottom,#00d4ff_1px,transparent_1px)] bg-[size:40px_40px]"></div>
      </div>

      {/* Terminal container */}
      <div className="relative z-10 w-full max-w-2xl mx-auto px-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8 border-b border-[#1e2d45] pb-4">
          <Terminal className="text-cyan-400" size={28} />
          <div>
            <h1 className="text-white font-mono text-xl font-bold tracking-tight">BOOT_SEQUENCE</h1>
            <p className="text-gray-500 text-xs font-mono">system initialization v2.1.0</p>
          </div>
          <div className="ml-auto flex gap-2">
            <Activity size={16} className="text-cyan-400 animate-pulse" />
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex justify-between text-xs font-mono text-gray-500 mb-1">
            <span>LOADING STATE</span>
            <span>{bootProgress}%</span>
          </div>
          <div className="w-full h-1 bg-[#1e2d45] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-teal-400 rounded-full transition-all duration-200 ease-out"
              style={{ width: `${bootProgress}%` }}
            />
          </div>
        </div>

        {/* Terminal logs */}
        <div className="bg-black/60 border border-[#1e2d45] rounded-lg p-4 font-mono text-xs h-48 overflow-y-auto custom-scrollbar">
          {bootLogs.map((log, idx) => (
            <div key={idx} className="mb-1.5 flex items-start gap-2">
              <span className="text-cyan-400 select-none">$</span>
              <span className={`text-gray-300 ${log.includes('ERROR') ? 'text-red-400' : ''}`}>{log}</span>
            </div>
          ))}
          {!allLoaded && (
            <div className="flex items-center gap-2 mt-2 text-gray-500">
              <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse" />
              <span>executing diagnostics...</span>
            </div>
          )}
        </div>

        {/* Status footer */}
        <div className="mt-6 flex justify-between items-center text-[10px] font-mono text-gray-600">
          <div className="flex items-center gap-2">
            <Cpu size={12} />
            <span>ARCH: x86_64 / ARM64</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap size={12} />
            <span>FAULT_TOLERANCE: ACTIVE</span>
          </div>
        </div>
      </div>

      {/* Custom scrollbar for logs */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #0a0e17;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #1e2d45;
          border-radius: 2px;
        }
      `}</style>
    </div>
  );
};

export default LoadingScreen;
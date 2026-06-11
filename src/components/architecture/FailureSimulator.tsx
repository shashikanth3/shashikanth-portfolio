import React, { useState, useEffect, useRef } from 'react';
import { AlertTriangle, CheckCircle2, Terminal, Activity, ServerCrash, RefreshCw } from 'lucide-react';

type SystemState = 'HEALTHY' | 'CORRUPTED' | 'RECOVERING';

interface Log {
  id: number;
  time: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
}

const FailureSimulator: React.FC = () => {
  const [systemState, setSystemState] = useState<SystemState>('HEALTHY');
  const [logs, setLogs] = useState<Log[]>([
    { id: 1, time: getTimestamp(), message: 'System initialized. Integrity 100%.', type: 'info' },
    { id: 2, time: getTimestamp(), message: 'Warden GC standing by.', type: 'info' }
  ]);
  const [integrity, setIntegrity] = useState(100);
  
  // FIX 1: Use a ref on the container itself to prevent whole-page jumping
  const terminalRef = useRef<HTMLDivElement>(null);
  
  // FIX 2: Use a strict ref lock to prevent state overlaps from rapid clicking
  const isSimulating = useRef(false);

  // Auto-scroll ONLY the terminal box
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [logs]);

  function getTimestamp() {
    const now = new Date();
    return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${now.getMilliseconds().toString().padStart(3, '0')}`;
  }

  const addLog = (message: string, type: Log['type']) => {
    setLogs(prev => [...prev, { id: Date.now() + Math.random(), time: getTimestamp(), message, type }]);
  };

  const triggerFailure = (failureType: string) => {
    // If an animation is already running, completely ignore new clicks
    if (isSimulating.current) return;
    
    isSimulating.current = true;
    setSystemState('CORRUPTED');
    setIntegrity(42);

    // Phase 1: The Crash
    if (failureType === 'ORPHAN') {
      addLog('CRITICAL: 408 primary PTP anchors deleted unexpectedly.', 'error');
      addLog('WARNING: 1,204 orphaned child records detected in SQLite matrix.', 'warning');
    } else if (failureType === 'NETWORK') {
      addLog('CRITICAL: TCP Connection abruptly severed by client.', 'error');
      addLog('WARNING: Action Queue desynchronized. State mismatch imminent.', 'warning');
    } else {
      addLog('CRITICAL: Application terminated mid-transaction.', 'error');
      addLog('WARNING: Physical filesystem desynced from DB metadata.', 'warning');
    }

    // Phase 2: The Detection & Recovery
    setTimeout(() => {
      setSystemState('RECOVERING');
      setIntegrity(75);
      addLog('SYSTEM: Anomaly detected. Initializing self-healing protocols...', 'info');
      
      if (failureType === 'ORPHAN') {
        addLog('ACTION: Running PRAGMA integrity sweep...', 'info');
        addLog('ACTION: Pruning orphaned nodes via foreign_key mismatch...', 'info');
      } else if (failureType === 'NETWORK') {
        addLog('ACTION: Engaging Deterministic Resolver...', 'info');
        addLog('ACTION: Replaying missed sequence events...', 'info');
      } else {
        addLog('ACTION: Booting Warden GC Service...', 'info');
        addLog('ACTION: Reconciling binary hashes against SQLite manifest...', 'info');
      }

      // Phase 3: Restoration
      setTimeout(() => {
        setSystemState('HEALTHY');
        setIntegrity(100);
        addLog('SUCCESS: System integrity fully restored. Zero data loss.', 'success');
        
        // Release the lock so the user can click again
        isSimulating.current = false;
      }, 2500);

    }, 2000);
  };

  // UI Theme Colors based on State
  const stateColors = {
    HEALTHY: { border: 'border-teal-500/50', bg: 'bg-teal-500/10', text: 'text-teal-400', icon: <CheckCircle2 className="text-teal-400" /> },
    CORRUPTED: { border: 'border-red-500/50', bg: 'bg-red-500/10', text: 'text-red-400', icon: <ServerCrash className="text-red-400 animate-bounce" /> },
    RECOVERING: { border: 'border-amber-500/50', bg: 'bg-amber-500/10', text: 'text-amber-400', icon: <RefreshCw className="text-amber-400 animate-spin" /> }
  };

  const currentTheme = stateColors[systemState];

  return (
    <div className="w-full max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* LEFT: Controls & Status */}
      <div className="col-span-1 flex flex-col gap-6">
        
        {/* Live Status Card */}
        <div className={`p-6 rounded-2xl border transition-colors duration-500 ${currentTheme.border} ${currentTheme.bg} backdrop-blur-sm`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-mono tracking-widest text-slate-400">SYSTEM STATUS</h3>
            {currentTheme.icon}
          </div>
          <div className={`text-3xl font-black tracking-tight mb-1 ${currentTheme.text}`}>
            {systemState}
          </div>
          <div className="flex items-center gap-2 mt-4">
            <Activity size={16} className={currentTheme.text} />
            <div className="flex-grow h-2 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-1000 ease-out ${systemState === 'CORRUPTED' ? 'bg-red-500' : systemState === 'RECOVERING' ? 'bg-amber-500' : 'bg-teal-400'}`}
                style={{ width: `${integrity}%` }}
              />
            </div>
            <span className={`text-xs font-mono ${currentTheme.text}`}>{integrity}%</span>
          </div>
        </div>

        {/* Sabotage Controls */}
        <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-6">
            <AlertTriangle size={16} className="text-amber-500" />
            <h3 className="text-sm font-mono tracking-widest text-slate-400">INJECT FAILURE</h3>
          </div>
          
          <div className="flex flex-col gap-3">
            <button 
              onClick={() => triggerFailure('ORPHAN')}
              disabled={systemState !== 'HEALTHY'}
              className="text-left px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 hover:border-red-500/50 hover:bg-red-500/10 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="text-sm font-bold text-slate-200 group-hover:text-red-400">Delete Primary Anchors</div>
              <div className="text-xs text-slate-500 mt-1">Simulates orphaned records (Freight Desk)</div>
            </button>
            
            <button 
              onClick={() => triggerFailure('NETWORK')}
              disabled={systemState !== 'HEALTHY'}
              className="text-left px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 hover:border-red-500/50 hover:bg-red-500/10 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="text-sm font-bold text-slate-200 group-hover:text-red-400">Sever TCP Connection</div>
              <div className="text-xs text-slate-500 mt-1">Simulates packet drop (Moonveil)</div>
            </button>

            <button 
              onClick={() => triggerFailure('STORAGE')}
              disabled={systemState !== 'HEALTHY'}
              className="text-left px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 hover:border-red-500/50 hover:bg-red-500/10 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="text-sm font-bold text-slate-200 group-hover:text-red-400">Corrupt File Metadata</div>
              <div className="text-xs text-slate-500 mt-1">Simulates DB desync (Lyrics Vault)</div>
            </button>
          </div>
        </div>
      </div>

      {/* RIGHT: Live Terminal output */}
      <div className="col-span-1 lg:col-span-2 rounded-2xl border border-slate-800 bg-[#050505] overflow-hidden flex flex-col shadow-2xl relative">
        {/* Terminal Header */}
        <div className="bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center gap-4">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50"></div>
            <div className="w-3 h-3 rounded-full bg-amber-500/20 border border-amber-500/50"></div>
            <div className="w-3 h-3 rounded-full bg-teal-500/20 border border-teal-500/50"></div>
          </div>
          <div className="flex items-center gap-2 text-slate-500">
            <Terminal size={14} />
            <span className="text-xs font-mono">system_recovery_daemon.log</span>
          </div>
        </div>

        {/* Terminal Output (Notice the added terminalRef here) */}
        <div ref={terminalRef} className="p-4 h-[350px] overflow-y-auto font-mono text-xs flex flex-col gap-1.5 scroll-smooth custom-scrollbar">
          {logs.map((log) => (
            <div key={log.id} className="flex gap-4 items-start">
              <span className="text-slate-600 flex-shrink-0">[{log.time}]</span>
              <span className={`
                ${log.type === 'info' ? 'text-slate-300' : ''}
                ${log.type === 'warning' ? 'text-amber-400' : ''}
                ${log.type === 'error' ? 'text-red-400 font-bold' : ''}
                ${log.type === 'success' ? 'text-teal-400 font-bold' : ''}
              `}>
                {log.message}
              </span>
            </div>
          ))}
          {/* Typing indicator when processing */}
          {systemState !== 'HEALTHY' && (
            <div className="flex gap-4 items-start mt-2">
              <span className="text-slate-600">[{getTimestamp()}]</span>
              <span className="text-slate-500 animate-pulse">_</span>
            </div>
          )}
        </div>
        
        {/* Scanline overlay for aesthetic */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(transparent_50%,rgba(0,0,0,1)_50%)] bg-[length:100%_4px]"></div>
      </div>

    </div>
  );
};

export default FailureSimulator;
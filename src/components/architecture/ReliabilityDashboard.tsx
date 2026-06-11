import { useEffect, useState, useRef } from 'react';
import { Activity, Database, Wifi, HardDrive, Clock, AlertTriangle, CheckCircle, Cpu, Zap } from 'lucide-react';

interface MetricHistory {
  timestamp: number;
  value: number;
}

const MetricSparkline = ({ data, color, height = 40 }: { data: number[]; color: string; height?: number }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const width = 120;

  useEffect(() => {
    if (!canvasRef.current || data.length === 0) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = width;
    canvas.height = height;
    ctx.clearRect(0, 0, width, height);

    const maxVal = Math.max(...data, 1);
    const minVal = Math.min(...data, 0);
    const range = maxVal - minVal || 1;

    const points = data.map((val, idx) => ({
      x: (idx / (data.length - 1)) * width,
      y: height - ((val - minVal) / range) * height,
    }));

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Optional: fill area under curve
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    ctx.fillStyle = `${color}20`;
    ctx.fill();
  }, [data, color, height]);

  return <canvas ref={canvasRef} width={width} height={height} className="rounded" />;
};

const MetricCard = ({ 
  label, 
  value, 
  unit, 
  status, 
  icon: Icon, 
  history, 
  color,
  onClick 
}: any) => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div 
      className="relative bg-black/40 rounded-lg border border-[#1e2d45] p-4 hover:border-opacity-100 transition-all cursor-help"
      style={{ borderColor: status === 'healthy' ? `${color}40` : '#ef444440' }}
      onMouseEnter={() => setShowDetails(true)}
      onMouseLeave={() => setShowDetails(false)}
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2">
          {Icon && <Icon size={16} style={{ color }} />}
          <div className="text-gray-400 text-xs uppercase tracking-wide">{label}</div>
        </div>
        <div className={`text-xs px-2 py-0.5 rounded-full ${status === 'healthy' ? 'bg-teal-500/20 text-teal-400' : 'bg-red-500/20 text-red-400'}`}>
          {status === 'healthy' ? 'OK' : 'WARN'}
        </div>
      </div>
      <div className="text-2xl font-bold mt-1">
        {typeof value === 'number' ? value.toFixed(1) : value}
        {unit && <span className="text-sm ml-1">{unit}</span>}
      </div>
      {history && history.length > 0 && (
        <div className="mt-3">
          <MetricSparkline data={history} color={color} height={32} />
        </div>
      )}
      {showDetails && (
        <div className="absolute bottom-full left-0 mb-2 p-2 bg-slate-900 border border-slate-700 rounded-lg shadow-xl text-xs text-gray-300 z-20 whitespace-nowrap">
          Last 30s trend • {history?.[history.length-1]} {unit}
        </div>
      )}
    </div>
  );
};

const ReliabilityDashboard = () => {
  const [metrics, setMetrics] = useState({
    dbIntegrity: 99.8,
    networkLatency: 24,
    orphans: 0,
    syncProgress: 94,
    cpuUsage: 12,
    memoryUsage: 186,
    uptime: 99.97,
    requestRate: 142,
  });

  const [history, setHistory] = useState<Record<string, number[]>>({
    dbIntegrity: Array(20).fill(99.8),
    networkLatency: Array(20).fill(24),
    orphans: Array(20).fill(0),
    cpuUsage: Array(20).fill(12),
    memoryUsage: Array(20).fill(186),
  });

  const [lastEvent, setLastEvent] = useState('System idle');
  const [eventType, setEventType] = useState<'info' | 'warning' | 'success'>('info');

  useEffect(() => {
    const interval = setInterval(() => {
      const newDbIntegrity = Math.min(100, Math.max(95, metrics.dbIntegrity + (Math.random() - 0.5) * 0.5));
      const newLatency = Math.min(80, Math.max(15, metrics.networkLatency + (Math.random() - 0.5) * 3));
      const newOrphans = Math.max(0, metrics.orphans + (Math.random() > 0.92 ? 1 : -0.2));
      const newCpu = Math.min(35, Math.max(5, metrics.cpuUsage + (Math.random() - 0.5) * 1.5));
      const newMemory = Math.min(320, Math.max(120, metrics.memoryUsage + (Math.random() - 0.5) * 2));
      const newSync = Math.min(100, metrics.syncProgress + (Math.random() * 1.5));

      let eventMsg = '';
      let evType: 'info' | 'warning' | 'success' = 'info';
      if (newOrphans > 2 && metrics.orphans <= 2) {
        eventMsg = `⚠️ Orphan records detected: ${Math.floor(newOrphans)} – self‑healing engine engaged`;
        evType = 'warning';
      } else if (newOrphans === 0 && metrics.orphans > 0) {
        eventMsg = `✅ Self‑healing complete: ${Math.floor(metrics.orphans)} orphans pruned`;
        evType = 'success';
      } else if (newLatency > 60 && metrics.networkLatency <= 60) {
        eventMsg = `⚠️ Network latency spike: ${Math.floor(newLatency)}ms – investigating`;
        evType = 'warning';
      } else if (newCpu > 25 && metrics.cpuUsage <= 25) {
        eventMsg = `🔄 High CPU load: ${Math.floor(newCpu)}% – background tasks throttled`;
        evType = 'warning';
      } else if (Math.random() > 0.95) {
        eventMsg = `ℹ️ Integrity check passed – no anomalies`;
        evType = 'success';
      }

      if (eventMsg) {
        setLastEvent(eventMsg);
        setEventType(evType);
        setTimeout(() => {
          setLastEvent('');
        }, 4000);
      }

      setMetrics(prev => ({
        ...prev,
        dbIntegrity: newDbIntegrity,
        networkLatency: newLatency,
        orphans: Math.max(0, newOrphans),
        syncProgress: newSync,
        cpuUsage: newCpu,
        memoryUsage: newMemory,
        uptime: 99.97 + (Math.random() - 0.5) * 0.02,
        requestRate: Math.min(300, Math.max(80, prev.requestRate + (Math.random() - 0.5) * 8)),
      }));

      // Update history
      setHistory(prev => ({
        dbIntegrity: [...prev.dbIntegrity.slice(1), newDbIntegrity],
        networkLatency: [...prev.networkLatency.slice(1), newLatency],
        orphans: [...prev.orphans.slice(1), Math.max(0, newOrphans)],
        cpuUsage: [...prev.cpuUsage.slice(1), newCpu],
        memoryUsage: [...prev.memoryUsage.slice(1), newMemory],
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, [metrics]);

  const getHealthColor = (value: number, thresholds: { warn: number; crit: number }, invert = false) => {
    if (invert) {
      if (value >= thresholds.crit) return '#22c55e';
      if (value >= thresholds.warn) return '#eab308';
      return '#ef4444';
    } else {
      if (value >= thresholds.crit) return '#ef4444';
      if (value >= thresholds.warn) return '#eab308';
      return '#22c55e';
    }
  };

  return (
    <div className="bg-[#151d2e] rounded-xl p-6 border border-[#1e2d45] shadow-xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
        <div className="flex items-center gap-3">
          <Activity className="text-cyan-400" size={22} />
          <h3 className="text-xl font-bold text-white">System Health Dashboard</h3>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            <span className="text-xs text-gray-400 font-mono">LIVE</span>
          </div>
          <div className="text-xs text-gray-500 font-mono bg-black/30 px-2 py-1 rounded">
            v2.1.0 – self‑healing active
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard
          label="Database Integrity"
          value={metrics.dbIntegrity}
          unit="%"
          status={metrics.dbIntegrity > 98 ? 'healthy' : metrics.dbIntegrity > 95 ? 'warning' : 'critical'}
          icon={Database}
          color={getHealthColor(metrics.dbIntegrity, { warn: 95, crit: 98 }, false)}
          history={history.dbIntegrity}
        />
        <MetricCard
          label="Network Latency"
          value={metrics.networkLatency}
          unit="ms"
          status={metrics.networkLatency < 40 ? 'healthy' : metrics.networkLatency < 70 ? 'warning' : 'critical'}
          icon={Wifi}
          color={getHealthColor(metrics.networkLatency, { warn: 40, crit: 70 }, true)}
          history={history.networkLatency}
        />
        <MetricCard
          label="Orphan Counter"
          value={Math.floor(metrics.orphans)}
          unit=""
          status={metrics.orphans === 0 ? 'healthy' : metrics.orphans < 3 ? 'warning' : 'critical'}
          icon={AlertTriangle}
          color={metrics.orphans === 0 ? '#22c55e' : metrics.orphans < 3 ? '#eab308' : '#ef4444'}
          history={history.orphans.map(v => Math.floor(v))}
        />
        <MetricCard
          label="Storage Sync"
          value={metrics.syncProgress}
          unit="%"
          status={metrics.syncProgress > 90 ? 'healthy' : metrics.syncProgress > 70 ? 'warning' : 'critical'}
          icon={HardDrive}
          color={getHealthColor(metrics.syncProgress, { warn: 70, crit: 90 }, false)}
          history={[]}
        />
        <MetricCard
          label="CPU Usage"
          value={metrics.cpuUsage}
          unit="%"
          status={metrics.cpuUsage < 20 ? 'healthy' : metrics.cpuUsage < 35 ? 'warning' : 'critical'}
          icon={Cpu}
          color={getHealthColor(metrics.cpuUsage, { warn: 20, crit: 35 }, false)}
          history={history.cpuUsage}
        />
        <MetricCard
          label="Memory Footprint"
          value={metrics.memoryUsage}
          unit="MB"
          status={metrics.memoryUsage < 200 ? 'healthy' : metrics.memoryUsage < 280 ? 'warning' : 'critical'}
          icon={Zap}
          color={getHealthColor(metrics.memoryUsage, { warn: 200, crit: 280 }, false)}
          history={history.memoryUsage}
        />
        <MetricCard
          label="Uptime"
          value={metrics.uptime}
          unit="%"
          status="healthy"
          icon={Clock}
          color="#22c55e"
          history={[]}
        />
        <MetricCard
          label="Request Rate"
          value={Math.floor(metrics.requestRate)}
          unit="req/s"
          status={metrics.requestRate < 250 ? 'healthy' : 'warning'}
          icon={Activity}
          color={getHealthColor(metrics.requestRate, { warn: 250, crit: 350 }, false)}
          history={[]}
        />
      </div>

      {/* Event Log & Summary */}
      <div className="border-t border-[#1e2d45] pt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex items-center gap-3">
          <div className={`px-3 py-1.5 rounded-md text-xs font-mono ${eventType === 'warning' ? 'bg-red-500/20 text-red-400' : eventType === 'success' ? 'bg-teal-500/20 text-teal-400' : 'bg-slate-800 text-gray-400'}`}>
            {lastEvent || '✅ All systems operational'}
          </div>
        </div>
        <div className="flex gap-4 text-xs text-gray-500 font-mono">
          <span>🕒 Last self‑healing: {new Date().toLocaleTimeString()}</span>
          <span className="hidden sm:inline">|</span>
          <span>📊 Data sampled every 2s</span>
        </div>
      </div>

      {/* Optional: Micro interaction – click any metric to log */}
      <div className="text-center text-[10px] text-gray-600 mt-4 font-mono">
        💡 Hover any card to see trend – click to simulate anomaly
      </div>
    </div>
  );
};

export default ReliabilityDashboard;
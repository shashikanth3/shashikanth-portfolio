import { useEffect, useState } from 'react';

const MetricCard = ({ label, value, unit, status }: any) => (
  <div className="bg-black/40 p-4 rounded-lg border border-[#1e2d45]">
    <div className="text-gray-400 text-xs uppercase tracking-wide">{label}</div>
    <div className="text-2xl font-bold mt-1">{value}{unit && <span className="text-sm ml-1">{unit}</span>}</div>
    <div className={`text-xs mt-2 ${status === 'healthy' ? 'text-teal-400' : 'text-red-400'}`}>
      {status === 'healthy' ? '✓ Operational' : '⚠️ Warning'}
    </div>
  </div>
);

const ReliabilityDashboard = () => {
  const [metrics, setMetrics] = useState({
    dbIntegrity: 100,
    networkStatus: 'healthy',
    orphans: 0,
    syncProgress: 94,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        dbIntegrity: Math.min(100, Math.max(0, prev.dbIntegrity + (Math.random() > 0.8 ? -1 : 0.2))),
        orphans: Math.max(0, prev.orphans + (Math.random() > 0.9 ? 1 : -0.1)),
        syncProgress: Math.min(100, prev.syncProgress + 0.5),
      }));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-[#151d2e] rounded-xl p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold">System Health Dashboard</h3>
        <div className="flex items-center gap-2"><span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> LIVE</div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <MetricCard label="Database Integrity" value={metrics.dbIntegrity.toFixed(0)} unit="%" status={metrics.dbIntegrity > 95 ? 'healthy' : 'warning'} />
        <MetricCard label="Network Status" value={metrics.networkStatus} status={metrics.networkStatus === 'healthy' ? 'healthy' : 'warning'} />
        <MetricCard label="Orphan Counter" value={metrics.orphans} status={metrics.orphans === 0 ? 'healthy' : 'warning'} />
        <MetricCard label="Storage Sync" value={metrics.syncProgress.toFixed(0)} unit="%" status={metrics.syncProgress > 90 ? 'healthy' : 'warning'} />
      </div>
      <div className="border-t border-[#1e2d45] pt-4">
        <div className="text-xs text-gray-500 font-mono">Last event: Self-healing cycle completed at {new Date().toLocaleTimeString()}</div>
      </div>
    </div>
  );
};

export default ReliabilityDashboard;
import React from 'react';
import { decisionsData } from '../../data/decisions';
import { Card } from '../ui/Card';

export const EngineeringDecisions: React.FC = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {decisionsData.map((decision) => (
        <Card key={decision.id} className="flex flex-col h-full bg-slate-900 text-slate-100 border-none">
          <div className="text-brand-400 text-xs font-bold uppercase tracking-wider mb-2">
            {decision.context}
          </div>
          <h3 className="text-xl font-bold mb-4">{decision.decision}</h3>
          <div className="mb-4 flex-grow">
            <span className="text-slate-400 text-sm font-semibold block mb-1">Trade-offs:</span>
            <p className="text-slate-300 text-sm leading-relaxed">{decision.tradeoffs}</p>
          </div>
          <div className="pt-4 border-t border-slate-700">
            <span className="text-emerald-400 text-sm font-semibold block mb-1">Result:</span>
            <p className="text-slate-100 text-sm font-medium">{decision.result}</p>
          </div>
        </Card>
      ))}
    </div>
  );
};
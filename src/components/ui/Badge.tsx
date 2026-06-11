import React from 'react';

export const Badge: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => {
  return (
    <span className={`px-3 py-1 bg-[#1e2d45] text-cyan-300 text-sm font-medium rounded-md border border-cyan-800 ${className}`}>
      {children}
    </span>
  );
};
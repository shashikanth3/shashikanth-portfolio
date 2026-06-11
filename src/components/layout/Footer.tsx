import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-[#1e2d45] bg-[#0a0e17] py-10">
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-gray-500 text-sm">
          © {new Date().getFullYear()} Shashikanth Panuganti. Systems Engineer.
        </p>
        <p className="text-gray-600 text-sm">
          Built with React, Three.js, D3, and resilience.
        </p>
      </div>
    </footer>
  );
};
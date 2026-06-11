import React from 'react';
import { Mail } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="fixed top-0 w-full bg-[#0a0e17]/80 backdrop-blur-md border-b border-[#1e2d45] z-50">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="font-bold text-xl tracking-tight text-white">
          Shashikanth Panuganti<span className="text-cyan-400">.</span>
        </div>
        <nav className="hidden md:flex gap-8 text-sm font-medium text-gray-400">
          <a href="#philosophy" className="hover:text-cyan-400 transition-colors">Philosophy</a>
          <a href="#moonveil" className="hover:text-cyan-400 transition-colors">Moonveil</a>
          <a href="#projects" className="hover:text-cyan-400 transition-colors">Architecture</a>
          <a href="#failures" className="hover:text-cyan-400 transition-colors">Failures</a>
          <a href="#reliability" className="hover:text-cyan-400 transition-colors">Dashboard</a>
        </nav>
        <div className="flex items-center gap-4 text-gray-400">
          <a href="mailto:panugantishashikanth132@gmail.com" className="hover:text-cyan-400 transition-colors">
            <Mail size={20} />
          </a>
        </div>
      </div>
    </header>
  );
};
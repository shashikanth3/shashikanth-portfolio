import HeroScene from './HeroScene';
import { Button } from '../ui/Button';
import { ArrowRight, FileText } from 'lucide-react';

export const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <HeroScene />
      <div className="relative z-10 text-center max-w-4xl mx-auto px-6">
        <div className="font-mono text-xs text-cyan-400 tracking-wider mb-4 flex justify-center items-center gap-2">
          <span className="w-6 h-px bg-cyan-400"></span> SYSTEMS ENGINEERING
        </div>
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-gradient-to-r from-white to-cyan-300 bg-clip-text text-transparent">
          Building systems that <br />
          <span className="text-cyan-400">work when everything else fails</span>
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-8">
          Offline-first architectures · Distributed systems · Real-time networking · Fault tolerance
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button href="#moonveil" variant="primary" className="group">
            Experience Moonveil <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
          <Button variant="secondary" href="/resume.pdf">
            <FileText size={18} className="mr-2" /> Resume
          </Button>
        </div>
      </div>
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce z-10">
        <div className="w-6 h-10 border-2 border-gray-500 rounded-full flex justify-center">
          <div className="w-1 h-2 bg-cyan-400 rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>
  );
};
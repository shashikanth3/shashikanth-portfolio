import React, { useState} from 'react';
import { Terminal, Mail, Copy, CheckCircle2, Download, ArrowRight, Activity, ExternalLink } from 'lucide-react';
import { FiGithub, FiLinkedin } from 'react-icons/fi';

const ContactTerminal: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const email = "panugantishashikanth132@gmail.com";
  const subject = encodeURIComponent("Hello from your Portfolio!");

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportManifest = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      window.open('/resume.pdf', '_blank');
    }, 1500);
  };

  // --- THE SMART EMAIL FALLBACK LOGIC ---
  const handleSmartEmail = (e: React.MouseEvent) => {
    e.preventDefault();

    // 1. Attempt to open the native Mail App (iOS Mail, Outlook, Android Gmail, etc.)
    window.location.href = `mailto:${email}?subject=${subject}`;

    // 2. Set a timer. If the user's computer doesn't react in 500ms, assume failure.
    setTimeout(() => {
      // document.hasFocus() checks if the user is still looking at the website.
      // If a native app opened, the website would lose focus.
      if (document.hasFocus()) {
        // Fallback: Open Gmail Website in a new tab
        window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=${email}&su=${subject}`, '_blank');
      }
    }, 500);
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-6 py-24" id="contact">
      
      {/* Section Header */}
      <div className="mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 mb-6">
          <Activity size={14} className="animate-pulse" />
          <span className="text-xs font-mono font-bold tracking-widest uppercase">Connection Protocol</span>
        </div>
        <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4">
          Initiate Handshake.
        </h2>
        <p className="text-lg text-slate-400 max-w-2xl">
          Currently exploring Senior & Staff engineering roles focused on distributed systems, offline-first architectures, and extreme reliability.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* LEFT: Communication Nodes */}
        <div className="flex flex-col gap-4">
          
          {/* Email Card */}
          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur-sm group hover:border-cyan-500/50 transition-colors">
            <div className="text-xs font-mono text-slate-500 mb-4 uppercase tracking-widest">Primary Comm_Link</div>
            
            <div className="flex flex-col gap-6">
              {/* Email Display */}
              <div className="flex items-center gap-3">
                <div className="p-3 bg-slate-800 rounded-xl text-cyan-400 group-hover:bg-cyan-500/20 transition-colors">
                  <Mail size={24} />
                </div>
                <div>
                  <div className="text-sm text-slate-400 mb-1">Direct Email</div>
                  <div className="text-white font-mono text-sm sm:text-base break-all">{email}</div>
                </div>
              </div>
              
              {/* Action Buttons Container */}
              <div className="flex flex-col sm:flex-row gap-3">
                 {/* SMART EMAIL BUTTON */}
                 <button 
                  onClick={handleSmartEmail}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-lg transition-colors font-bold text-sm shadow-[0_0_15px_rgba(34,211,238,0.2)] hover:shadow-[0_0_25px_rgba(34,211,238,0.4)]"
                >
                  <ExternalLink size={16} /> Compose Message
                </button>

                {/* Existing Copy Button */}
                <button 
                  onClick={handleCopyEmail}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors border border-slate-700 font-medium text-sm"
                >
                  {copied ? <><CheckCircle2 size={16} className="text-teal-400" /> Copied</> : <><Copy size={16} /> Copy ID</>}
                </button>
              </div>
            </div>
          </div>

          {/* Social Nodes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <a 
              href="https://github.com/Shashikanth" 
              target="_blank" 
              rel="noreferrer"
              className="p-6 rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur-sm hover:bg-slate-800 hover:border-slate-600 transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <FiGithub className="text-slate-400 group-hover:text-white transition-colors" size={24} />
                <span className="text-slate-300 font-medium group-hover:text-white transition-colors">GitHub</span>
              </div>
              <ArrowRight size={16} className="text-slate-600 group-hover:text-white group-hover:translate-x-1 transition-all" />
            </a>

            <a 
              href="https://linkedin.com/in/shashikanth" 
              target="_blank" 
              rel="noreferrer"
              className="p-6 rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur-sm hover:bg-slate-800 hover:border-blue-500/50 transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <FiLinkedin className="text-slate-400 group-hover:text-blue-400 transition-colors" size={24} />
                <span className="text-slate-300 font-medium group-hover:text-white transition-colors">LinkedIn</span>
              </div>
              <ArrowRight size={16} className="text-slate-600 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
            </a>
          </div>
        </div>

        {/* RIGHT: Terminal & Export */}
        <div className="rounded-2xl border border-slate-800 bg-[#050505] overflow-hidden flex flex-col shadow-2xl relative">
          
          {/* Terminal Header */}
          <div className="bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50"></div>
                <div className="w-3 h-3 rounded-full bg-amber-500/20 border border-amber-500/50"></div>
                <div className="w-3 h-3 rounded-full bg-teal-500/20 border border-teal-500/50"></div>
              </div>
              <div className="flex items-center gap-2 text-slate-500">
                <Terminal size={14} />
                <span className="text-xs font-mono">panuganti_sys_export.sh</span>
              </div>
            </div>
          </div>

          {/* Terminal Body */}
          <div className="p-6 flex flex-col h-full justify-between">
            <div className="font-mono text-xs sm:text-sm text-slate-400 leading-relaxed mb-8">
              <div className="flex gap-2 text-slate-500 mb-2">
                <span>$</span>
                <span className="text-cyan-400">./extract_manifest.sh --target=recruiter</span>
              </div>
              <div className="text-slate-300 mb-1">{">"} Compiling offline-first architectures... [OK]</div>
              <div className="text-slate-300 mb-1">{">"} Resolving deterministic state logic... [OK]</div>
              <div className="text-slate-300 mb-4">{">"} Packaging reliability metrics... [OK]</div>
              <div className="text-teal-400 font-bold mb-1">{">"} SYSTEM MANIFEST READY FOR EXPORT.</div>
              <div className="animate-pulse text-slate-500 mt-2">_</div>
            </div>

            {/* Resume Button */}
            <button 
              onClick={handleExportManifest}
              disabled={isExporting}
              className={`
                w-full relative overflow-hidden group flex items-center justify-center gap-3 py-4 rounded-xl font-bold font-mono text-sm transition-all duration-300
                ${isExporting 
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/50 cursor-wait' 
                  : 'bg-cyan-500 text-slate-950 hover:bg-cyan-400 hover:shadow-[0_0_30px_rgba(34,211,238,0.4)]'
                }
              `}
            >
              {isExporting ? (
                <>
                  <Activity size={18} className="animate-spin" />
                  COMPILING PDF BINARIES...
                </>
              ) : (
                <>
                  <Download size={18} className="group-hover:-translate-y-1 transition-transform" />
                  EXPORT SYSTEM MANIFEST (.PDF)
                </>
              )}
            </button>
          </div>
          
          {/* Scanline overlay for aesthetic */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(transparent_50%,rgba(0,0,0,1)_50%)] bg-[length:100%_4px]"></div>
        </div>

      </div>
    </div>
  );
};

export default ContactTerminal;
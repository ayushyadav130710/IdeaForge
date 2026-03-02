import React from 'react';
import { Rocket } from 'lucide-react';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const lastUpdated = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(new Date());

  return (
    <footer className="glass border-t border-white/10 py-20 relative z-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center border border-white/10">
              <Rocket className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight text-white">IdeaForge</span>
          </div>
          
          <div className="flex gap-12 text-xs font-bold uppercase tracking-[0.2em] text-white/30">
            <a href="/privacy.html" className="hover:text-purple-400 transition-colors">Privacy</a>
            <a href="/terms.html" className="hover:text-purple-400 transition-colors">Terms</a>
            <a href="/api.html" className="hover:text-purple-400 transition-colors">API</a>
            <a href="/contact.html" className="hover:text-purple-400 transition-colors">Contact</a>
          </div>

          <div className="text-center md:text-right">
            <p className="text-sm text-white/20 font-medium">
              Copyright {currentYear} IdeaForge AI. All rights reserved.
            </p>
            <p className="text-[10px] text-white/10 font-bold uppercase tracking-[0.2em] mt-1">
              Contact: <a href="mailto:ayush.yadav130710@gmail.com" className="hover:text-purple-400 transition-colors">ayush.yadav130710@gmail.com</a>
            </p>
            <p className="text-[10px] text-white/10 font-bold uppercase tracking-[0.2em] mt-1">
              Last updated: {lastUpdated}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

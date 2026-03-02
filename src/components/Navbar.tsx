import React from 'react';
import { motion } from 'motion/react';
import { Rocket } from 'lucide-react';

interface NavbarProps {
  onStart?: () => void;
  isLanding?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ onStart, isLanding = false }) => {
  return (
    <nav className="fixed top-0 w-full z-50 glass border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <a href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg glow-indigo">
            <Rocket className="w-6 h-6 text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight text-glow text-white">IdeaForge</span>
        </a>
        
        <div className="hidden md:flex items-center gap-10">
          <a href="/#home" className="text-sm font-medium text-white/60 hover:text-white transition-colors">Home</a>
          <a href="/#features" className="text-sm font-medium text-white/60 hover:text-white transition-colors">Features</a>
          <a href="/#about" className="text-sm font-medium text-white/60 hover:text-white transition-colors">About</a>
          <a href="/showcase.html" className="text-sm font-medium text-white/60 hover:text-white transition-colors">Showcase</a>
          <a href="/contact.html" className="text-sm font-medium text-white/60 hover:text-white transition-colors">Contact</a>
        </div>

        {onStart && (
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onStart}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-2.5 rounded-full font-bold text-sm transition-all shadow-lg glow-purple active:scale-95"
          >
            Get Started
          </motion.button>
        )}
      </div>
    </nav>
  );
};

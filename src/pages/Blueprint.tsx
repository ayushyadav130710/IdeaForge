import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, Brain } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { CursorTrail } from '../components/CursorTrail';
import { IdeaCard } from '../components/IdeaCard';
import { HackathonIdea } from '../types';

export const Blueprint: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [idea, setIdea] = useState<HackathonIdea | null>(null);

  useEffect(() => {
    const savedIdeas = localStorage.getItem('generated_ideas');
    if (savedIdeas && id !== undefined) {
      try {
        const ideas = JSON.parse(savedIdeas);
        const selectedIdea = ideas[parseInt(id)];
        if (selectedIdea) {
          setIdea(selectedIdea);
        }
      } catch (e) {
        console.error('Failed to parse ideas', e);
      }
    }
  }, [id]);

  if (!idea) {
    return (
      <div className="min-h-screen bg-[#030014] text-white flex items-center justify-center">
        <div className="text-center">
          <Brain className="w-16 h-16 text-white/10 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-white/40 mb-4">Blueprint not found</h2>
          <button 
            onClick={() => navigate('/showcase.html')}
            className="text-purple-400 hover:text-purple-300 font-bold flex items-center gap-2 mx-auto"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Showcase
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030014] text-white font-sans selection:bg-purple-500/30 relative overflow-hidden">
      <CursorTrail />
      
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-600/10 rounded-full blur-[120px] animate-blob" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[45%] h-[45%] bg-blue-600/10 rounded-full blur-[120px] animate-blob animation-delay-2000" />
      </div>

      <Navbar />

      <main className="max-w-7xl mx-auto px-6 pt-40 pb-24 relative z-10">
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm font-bold text-white/40 hover:text-white mb-12 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Showcase
        </motion.button>

        <div className="mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <IdeaCard idea={idea} index={parseInt(id || '0')} />
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

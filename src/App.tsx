/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { 
  Rocket, 
  Brain, 
  Clock, 
  Users, 
  Code2, 
  Sparkles, 
  ChevronRight, 
  Target, 
  Cpu, 
  Lightbulb,
  ArrowRight,
  ShieldCheck,
  Zap,
  Download
} from 'lucide-react';
import { SkillLevel, UserInputs, GeminiResponse, HackathonIdea } from './types';
import { generateHackathonIdeas, refineIdeaFeatures } from './services/gemini';
import { LandingPage } from './components/LandingPage';
import { CursorTrail } from './components/CursorTrail';
import { Showcase } from './pages/Showcase';
import { Blueprint } from './pages/Blueprint';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { IdeaCard } from './components/IdeaCard';
import { downloadIdeaAsPDF } from './services/pdfService';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainApp />} />
        <Route path="/showcase.html" element={<Showcase />} />
        <Route path="/blueprint/:id" element={<Blueprint />} />
      </Routes>
    </Router>
  );
}

const readStoredIdeas = (): HackathonIdea[] => {
  const raw = localStorage.getItem('generated_ideas');
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    localStorage.removeItem('generated_ideas');
    return [];
  }
};

function MainApp() {
  const navigate = useNavigate();
  const [showGenerator, setShowGenerator] = useState(false);
  const [inputs, setInputs] = useState<UserInputs>({
    domain: '',
    skillLevel: SkillLevel.INTERMEDIATE,
    timeLimit: '48 Hours',
    teamSize: 4
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GeminiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const data = await generateHackathonIdeas(inputs);
      
      // Save to localStorage for the Showcase page
      const existingIdeas = readStoredIdeas();
      const updatedIdeas = [...data.ideas, ...existingIdeas].slice(0, 20); // Keep last 20
      localStorage.setItem('generated_ideas', JSON.stringify(updatedIdeas));

      setResult(data);
    } catch (err) {
      console.error(err);
      setError('Failed to generate ideas. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!showGenerator) {
    return (
      <>
        <CursorTrail />
        <LandingPage onStart={() => setShowGenerator(true)} />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#030014] text-white font-sans selection:bg-purple-500/30 relative overflow-hidden">
      <CursorTrail />
      {/* Animated Background Blobs */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-600/20 rounded-full blur-[120px] animate-blob" />
        <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px] animate-blob animation-delay-2000" />
        <div className="absolute bottom-[-10%] left-[20%] w-[45%] h-[45%] bg-pink-600/20 rounded-full blur-[120px] animate-blob animation-delay-4000" />
      </div>

      {/* Header */}
      <Navbar onStart={() => setShowGenerator(true)} />

      <main className="max-w-7xl mx-auto px-6 py-16 pt-32 relative z-10">
        <div className="grid lg:grid-cols-12 gap-12">
          {/* Left Column: Input Form */}
          <div className="lg:col-span-4">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card rounded-[32px] p-8 sticky top-32"
            >
              <div className="mb-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full text-[10px] font-bold uppercase tracking-widest text-purple-400 mb-4 border border-white/10">
                  <Sparkles className="w-3 h-3" /> AI Strategist
                </div>
                <h1 className="text-3xl font-bold tracking-tight mb-3 text-glow">Hackathon Mentor</h1>
                <p className="text-white/50 text-sm leading-relaxed">
                  Input your constraints and let Gemini architect your next winning project.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-white/30 mb-3">Domain / Industry</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. FinTech, Sustainability"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-purple-500/50 transition-all outline-none placeholder:text-white/20 hover:bg-white/10"
                    value={inputs.domain}
                    onChange={(e) => setInputs({ ...inputs, domain: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-white/30 mb-3">Skill Level</label>
                    <div className="relative">
                      <select
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-purple-500/50 outline-none appearance-none cursor-pointer hover:bg-white/10 transition-all"
                        value={inputs.skillLevel}
                        onChange={(e) => setInputs({ ...inputs, skillLevel: e.target.value as SkillLevel })}
                      >
                        {Object.values(SkillLevel).map(level => (
                          <option key={level} value={level} className="bg-[#030014]">{level}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-white/30 mb-3">Team Size</label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-purple-500/50 outline-none hover:bg-white/10 transition-all"
                      value={inputs.teamSize}
                      onChange={(e) => setInputs({ ...inputs, teamSize: parseInt(e.target.value) })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-white/30 mb-3">Time Limit</label>
                  <input
                    type="text"
                    placeholder="e.g. 48 Hours"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-purple-500/50 outline-none hover:bg-white/10 transition-all"
                    value={inputs.timeLimit}
                    onChange={(e) => setInputs({ ...inputs, timeLimit: e.target.value })}
                  />
                </div>

                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white rounded-2xl py-5 font-bold text-sm flex items-center justify-center gap-3 transition-all disabled:opacity-50 disabled:cursor-not-allowed glow-purple group relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Architecting...
                    </>
                  ) : (
                    <>
                      Generate Winning Ideas
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </motion.button>
              </form>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-6 p-4 bg-red-500/10 text-red-400 text-xs rounded-2xl border border-red-500/20 text-center"
                >
                  {error}
                </motion.div>
              )}
            </motion.div>
          </div>

          {/* Right Column: Results */}
          <div className="lg:col-span-8">
            <AnimatePresence mode="wait">
              {!result && !loading && (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full min-h-[500px] flex flex-col items-center justify-center text-center p-12 glass-card rounded-[48px] border-dashed border-white/10"
                >
                  <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center shadow-inner mb-8 border border-white/10">
                    <Brain className="w-10 h-10 text-white/20" />
                  </div>
                  <h2 className="text-2xl font-bold mb-3 text-glow">Ready to Build?</h2>
                  <p className="text-white/40 text-sm max-w-xs mx-auto leading-relaxed">
                    Fill out the form to generate 3 custom-tailored hackathon project ideas with full technical architectures.
                  </p>
                </motion.div>
              )}

              {loading && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-10"
                >
                  <div className="glass-card rounded-[48px] p-12 border border-white/10 animate-pulse">
                    <div className="h-4 bg-white/5 rounded w-1/4 mb-6" />
                    <div className="h-10 bg-white/5 rounded w-3/4 mb-8" />
                    <div className="space-y-4">
                      <div className="h-4 bg-white/5 rounded w-full" />
                      <div className="h-4 bg-white/5 rounded w-full" />
                      <div className="h-4 bg-white/5 rounded w-2/3" />
                    </div>
                  </div>
                  <div className="grid gap-10">
                    {[1, 2].map(i => (
                      <div key={i} className="glass-card rounded-[48px] p-12 border border-white/10 animate-pulse h-[400px]" />
                    ))}
                  </div>
                </motion.div>
              )}

              {result && !loading && (
                <motion.div
                  key="results"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-16"
                >
                  {/* Constraint Analysis */}
                  <div className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white rounded-[48px] p-12 shadow-2xl relative overflow-hidden glow-purple">
                    <div className="absolute top-0 right-0 p-12 opacity-10">
                      <ShieldCheck className="w-48 h-48" />
                    </div>
                    <div className="relative z-10">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-white/10 rounded-lg backdrop-blur-md">
                          <Zap className="w-6 h-6 text-emerald-400" />
                        </div>
                        <span className="text-xs font-bold uppercase tracking-[0.3em] text-emerald-400">Strategist Analysis</span>
                      </div>
                      <h2 className="text-3xl font-bold mb-6 tracking-tight">Constraint Reasoning</h2>
                      <p className="text-white/90 leading-relaxed italic font-serif text-xl">
                        "{result.constraintAnalysis}"
                      </p>
                    </div>
                  </div>

                  {/* Ideas Grid */}
                  <div className="grid gap-16">
                    {result.ideas.map((idea: HackathonIdea, idx: number) => (
                      <IdeaCard key={idx} idea={idea} index={idx} />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* Generated Ideas Showcase Section */}
      <section className="max-w-7xl mx-auto px-6 pb-32 relative z-10">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">Generated Ideas Showcase</h2>
            <p className="text-white/40 text-sm">Recently architected projects from the community.</p>
          </div>
          <Link 
            to="/showcase.html" 
            className="flex items-center gap-2 text-sm font-bold text-purple-400 hover:text-purple-300 transition-colors group"
          >
            View All Showcase
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {(() => {
            const savedIdeas = readStoredIdeas();
            if (savedIdeas.length === 0) {
              return (
                <div className="col-span-full py-20 glass-card rounded-[40px] border border-dashed border-white/10 text-center">
                  <p className="text-white/20 text-sm font-medium">No ideas generated yet. Be the first to architect something amazing.</p>
                </div>
              );
            }
            return savedIdeas.slice(0, 3).map((idea: HackathonIdea, i: number) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -5, scale: 1.02 }}
                onClick={() => navigate(`/blueprint/${i}`)}
                className="glass-card p-8 rounded-[32px] border border-white/10 hover:border-purple-500/30 transition-all group relative overflow-hidden cursor-pointer"
              >
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform">
                      <Rocket className="w-5 h-5 text-purple-400" />
                    </div>
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          downloadIdeaAsPDF(idea);
                        }}
                        className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white/40 hover:text-white transition-all group/btn"
                        title="Download as PDF"
                      >
                        <Download className="w-3 h-3 group-hover/btn:scale-110 transition-transform" />
                      </button>
                      <div className="text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-full border border-emerald-400/20">
                        SCORE: {idea.winningPotential.score}
                      </div>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-400 transition-colors line-clamp-1">{idea.projectTitle}</h3>
                  <p className="text-xs text-white/50 leading-relaxed mb-6 line-clamp-2 italic">"{idea.oneLinePitch}"</p>
                  <div className="space-y-2 mb-6">
                    {idea.coreFeatures.slice(0, 2).map((f, j) => (
                      <div key={j} className="flex items-center gap-2 text-[10px] text-white/30">
                        <div className="w-1 h-1 rounded-full bg-purple-500/50" />
                        <span className="line-clamp-1">{f}</span>
                      </div>
                    ))}
                  </div>
                  <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/40 group-hover:text-white transition-colors">
                      View Blueprint
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </motion.div>
            ));
          })()}
        </div>
      </section>

      <Footer />
    </div>
  );
}

interface IdeaCardProps {
  idea: HackathonIdea;
  index: number;
}

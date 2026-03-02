import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Rocket, Sparkles, Zap, ShieldCheck, ArrowRight, Code2, Brain, Target, Clock } from 'lucide-react';

import { Navbar } from './Navbar';
import { Footer } from './Footer';

interface LandingPageProps {
  onStart: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  return (
    <div className="min-h-screen bg-[#030014] text-white font-sans selection:bg-purple-500/30 overflow-x-hidden relative">
      {/* Animated Background Blobs */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-600/10 rounded-full blur-[120px] animate-blob" />
        <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px] animate-blob animation-delay-2000" />
        <div className="absolute bottom-[-10%] left-[20%] w-[45%] h-[45%] bg-pink-600/10 rounded-full blur-[120px] animate-blob animation-delay-4000" />
      </div>

      <Navbar onStart={onStart} />

      {/* Hero Section */}
      <section id="home" className="relative pt-40 pb-24 lg:pt-56 lg:pb-40 overflow-hidden z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 text-purple-400 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] mb-8 backdrop-blur-md">
                <Sparkles className="w-4 h-4" />
                AI-Powered Innovation
              </div>
              <h1 className="text-6xl lg:text-8xl font-extrabold tracking-tighter text-white mb-10 leading-[0.9] text-glow">
                Architect Your Next <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">Winning</span> Hackathon Project.
              </h1>
              <p className="text-xl text-white/50 leading-relaxed mb-12 max-w-xl font-medium">
                Stop wasting hours brainstorming. Our elite AI strategist generates innovative, practical, and judge-ready project ideas tailored to your constraints in seconds.
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onStart}
                  className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white px-12 py-5 rounded-full font-bold text-lg transition-all shadow-2xl glow-purple flex items-center justify-center gap-3 group relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
                  Start Building Now
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </motion.button>
                <a 
                  href="/showcase.html"
                  className="w-full sm:w-auto px-12 py-5 rounded-full font-bold text-lg text-white/70 hover:text-white hover:bg-white/5 transition-all border border-white/10 backdrop-blur-md flex items-center justify-center"
                >
                  View Showcase
                </a>
              </div>
              
              <div className="mt-16 flex items-center gap-10 opacity-30">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-6 h-6" />
                  <span className="text-xs font-bold uppercase tracking-widest">Judge-Ready</span>
                </div>
                <div className="flex items-center gap-3">
                  <Zap className="w-6 h-6" />
                  <span className="text-xs font-bold uppercase tracking-widest">Instant Generation</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="relative hidden lg:block"
            >
              <div className="relative z-10 glass-card rounded-[64px] p-12 border border-white/10 shadow-2xl glow-purple">
                <div className="bg-[#030014]/80 rounded-[40px] p-8 shadow-2xl border border-white/5">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-3 h-3 rounded-full bg-red-500/50" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                    <div className="w-3 h-3 rounded-full bg-green-500/50" />
                  </div>
                  <div className="space-y-6">
                    <div className="h-4 bg-white/10 rounded-full w-3/4 animate-pulse" />
                    <div className="h-4 bg-white/10 rounded-full w-1/2 animate-pulse" />
                    <div className="grid grid-cols-3 gap-6 pt-6">
                      <div className="h-24 bg-indigo-500/10 rounded-3xl border border-indigo-500/20" />
                      <div className="h-24 bg-purple-500/10 rounded-3xl border border-purple-500/20" />
                      <div className="h-24 bg-pink-500/10 rounded-3xl border border-pink-500/20" />
                    </div>
                    <div className="h-40 bg-white/5 rounded-3xl flex items-center justify-center border border-white/10">
                      <Brain className="w-16 h-16 text-white/10" />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Floating Elements */}
              <motion.div 
                animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-12 -right-12 w-28 h-28 glass-card rounded-3xl flex items-center justify-center z-20 border border-white/20 shadow-2xl glow-indigo"
              >
                <Code2 className="w-12 h-12 text-indigo-400" />
              </motion.div>
              <motion.div 
                animate={{ y: [0, 20, 0], rotate: [0, -5, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute -bottom-12 -left-12 w-24 h-24 glass-card rounded-3xl flex items-center justify-center z-20 border border-white/20 shadow-2xl glow-pink"
              >
                <Target className="w-10 h-10 text-pink-400" />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-24">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 text-indigo-400 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] mb-6">
              Features
            </div>
            <h2 className="text-5xl font-bold text-white mb-8 tracking-tight text-glow">Built for Hackers, by Hackers.</h2>
            <p className="text-xl text-white/40 leading-relaxed">
              We've analyzed thousands of winning hackathon projects to build an AI that understands what judges are actually looking for.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            {[
              {
                icon: <Brain className="w-10 h-10" />,
                title: "Deep Reasoning",
                desc: "Our AI doesn't just list ideas; it architects full technical proposals based on your skill level.",
                glow: "glow-indigo"
              },
              {
                icon: <Zap className="w-10 h-10" />,
                title: "Instant Scaling",
                desc: "Generate core features, monetization plans, and expansion roadmaps in under 10 seconds.",
                glow: "glow-purple"
              },
              {
                icon: <Target className="w-10 h-10" />,
                title: "Judge Optimized",
                desc: "Every idea is scored on 'Winning Potential' based on real-world hackathon judging criteria.",
                glow: "glow-pink"
              }
            ].map((feature, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`glass-card p-12 rounded-[48px] border border-white/10 hover:border-white/20 transition-all group ${feature.glow}`}
              >
                <div className="w-20 h-20 bg-white/5 text-white rounded-[24px] flex items-center justify-center mb-10 border border-white/10 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold text-white mb-6 tracking-tight">{feature.title}</h3>
                <p className="text-white/50 leading-relaxed text-lg">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-32 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-24 items-center">
            <div className="relative">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="relative z-10"
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 text-purple-400 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] mb-8">
                  Our Story
                </div>
                <h3 className="text-5xl font-bold text-white mb-10 leading-[1.1] tracking-tight text-glow">Empowering the Next Generation of Builders.</h3>
                <p className="text-xl text-white/50 mb-12 leading-relaxed font-medium">
                  IdeaForge was born from a simple observation: the hardest part of any hackathon is not coding - it is strategy. We've seen brilliant teams fail because they lacked a clear, innovative blueprint.
                </p>
                <div className="glass-card p-10 rounded-[40px] border border-white/10 mb-12 glow-indigo">
                  <h4 className="font-bold text-white mb-4 flex items-center gap-3 text-lg">
                    <Target className="w-6 h-6 text-indigo-400" /> Mission Statement
                  </h4>
                  <p className="text-white/60 italic text-lg leading-relaxed">
                    "To empower every builder with the strategic blueprints needed to turn raw ideas into winning hackathon projects through the power of advanced AI reasoning."
                  </p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg glow-indigo">
                    <Brain className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-lg">Powered by Google Gemini 3.1 Pro</h4>
                    <p className="text-sm text-white/40">Advanced reasoning for technical feasibility.</p>
                  </div>
                </div>
              </motion.div>
            </div>

            <div className="grid gap-8">
              {[
                {
                  title: "Smart Idea Generation",
                  desc: "Beyond simple brainstorming. We generate deep technical proposals that align with judge expectations.",
                  icon: <Sparkles className="w-8 h-8 text-purple-400" />
                },
                {
                  title: "Constraint-Based Planning",
                  desc: "Whether it's a 24-hour sprint or a week-long build, our AI adjusts the scope to fit your timeline perfectly.",
                  icon: <Clock className="w-8 h-8 text-blue-400" />
                },
                {
                  title: "Innovation Scoring",
                  desc: "Every project is evaluated against real-world hackathon judging criteria to ensure maximum impact.",
                  icon: <ShieldCheck className="w-8 h-8 text-pink-400" />
                }
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="glass-card p-10 rounded-[40px] border border-white/10 hover:border-white/20 transition-all group"
                >
                  <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-white/10 transition-colors border border-white/10">
                    {item.icon}
                  </div>
                  <h4 className="text-2xl font-bold text-white mb-4 tracking-tight">{item.title}</h4>
                  <p className="text-base text-white/40 leading-relaxed">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
        html {
          scroll-behavior: smooth;
        }
      `}</style>
    </div>
  );
};

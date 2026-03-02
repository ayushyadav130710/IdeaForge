import React, { useState } from 'react';
import { motion } from 'motion/react';
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
  Download,
  Layout,
  Server,
  Globe,
  Database as DatabaseIcon
} from 'lucide-react';
import { HackathonIdea } from '../types';
import { refineIdeaFeatures } from '../services/gemini';
import { downloadIdeaAsPDF } from '../services/pdfService';

interface IdeaCardProps {
  idea: HackathonIdea;
  index: number;
}

export const IdeaCard: React.FC<IdeaCardProps> = ({ idea, index }) => {
  const [boosting, setBoosting] = useState(false);
  const [extraFeatures, setExtraFeatures] = useState<string[]>([]);

  const handleBoost = async () => {
    setBoosting(true);
    try {
      const newFeatures = await refineIdeaFeatures(idea);
      setExtraFeatures([...extraFeatures, ...newFeatures]);
    } catch (err) {
      console.error(err);
    } finally {
      setBoosting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="glass-card rounded-[48px] overflow-hidden group hover:border-white/20 transition-all duration-700"
    >
      <div className="p-12">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-10 mb-12">
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-6">
              <span className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 text-white flex items-center justify-center text-sm font-bold shadow-inner">
                {index + 1}
              </span>
              <div className="h-[1px] w-12 bg-white/10" />
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/30">Project Proposal</span>
            </div>
            <h3 className="text-4xl lg:text-5xl font-bold tracking-tighter mb-6 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-indigo-400 group-hover:to-purple-400 transition-all duration-500">
              {idea.projectTitle}
            </h3>
            <p className="text-xl text-white/60 font-medium leading-relaxed max-w-2xl">
              {idea.oneLinePitch}
            </p>
          </div>
          
          <div className="bg-white/5 border border-white/10 p-8 rounded-[32px] text-center min-w-[180px] glow-purple backdrop-blur-md flex flex-col items-center justify-center gap-4">
            <div>
              <div className="text-5xl font-black tracking-tighter mb-2 text-glow">{idea.winningPotential.score}</div>
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">Winning Score</div>
            </div>
            <button 
              onClick={() => downloadIdeaAsPDF(idea)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[10px] font-bold uppercase tracking-widest text-white/50 hover:text-white transition-all group/btn"
            >
              <Download className="w-3 h-3 group-hover/btn:translate-y-0.5 transition-transform" />
              Download PDF
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-16">
          <div className="space-y-12">
            <section>
              <h4 className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.3em] text-white/20 mb-6">
                <Target className="w-4 h-4" /> Problem & Audience
              </h4>
              <p className="text-base leading-relaxed text-white/70 mb-6">
                {idea.problemStatement}
              </p>
              <div className="inline-flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-xs font-bold text-white/50">
                <Users className="w-4 h-4 text-purple-400" /> {idea.targetUsers}
              </div>
            </section>

            <section>
              <h4 className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.3em] text-white/20 mb-6">
                <Sparkles className="w-4 h-4" /> Core Features
              </h4>
              <ul className="space-y-4">
                {idea.coreFeatures.map((feature, i) => (
                  <li key={i} className="flex items-start gap-4 text-sm text-white/70">
                    <div className="mt-2 w-2 h-2 rounded-full bg-indigo-500 shrink-0 shadow-[0_0_10px_rgba(79,70,229,0.8)]" />
                    {feature}
                  </li>
                ))}
                {extraFeatures.map((feature, i) => (
                  <motion.li 
                    key={`extra-${i}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-start gap-4 text-sm text-emerald-400 font-medium"
                  >
                    <div className="mt-2 w-2 h-2 rounded-full bg-emerald-400 shrink-0 shadow-[0_0_12px_rgba(52,211,153,0.8)]" />
                    {feature}
                  </motion.li>
                ))}
              </ul>
              
              <button
                onClick={handleBoost}
                disabled={boosting}
                className="mt-8 flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-400 hover:text-emerald-300 transition-all disabled:opacity-50 group"
              >
                <div className={`p-2 rounded-lg bg-emerald-400/10 border border-emerald-400/20 group-hover:scale-110 transition-transform ${boosting ? 'animate-pulse' : ''}`}>
                  {boosting ? (
                    <div className="w-4 h-4 border-2 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin" />
                  ) : (
                    <Zap className="w-4 h-4" />
                  )}
                </div>
                {boosting ? 'Analyzing Innovation...' : 'Boost with AI Features'}
              </button>
            </section>
          </div>

          <div className="space-y-12">
            <section className="bg-white/5 border border-white/10 p-10 rounded-[40px] backdrop-blur-md">
              <h4 className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.3em] text-white/20 mb-8">
                <Code2 className="w-4 h-4" /> Technical Architecture
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                {[
                  { label: 'Frontend', value: idea.technicalArchitecture.frontend, icon: <Layout className="w-3 h-3" /> },
                  { label: 'Backend', value: idea.technicalArchitecture.backend, icon: <Server className="w-3 h-3" /> },
                  { label: 'APIs', value: idea.technicalArchitecture.apis, icon: <Globe className="w-3 h-3" /> },
                  { label: 'Database', value: idea.technicalArchitecture.database, icon: <DatabaseIcon className="w-3 h-3" /> }
                ].map((tech, i) => (
                  <div key={i} className="space-y-3">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-white/20 uppercase tracking-widest">
                      {tech.icon}
                      {tech.label}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {tech.value.split(',').map((item, idx) => (
                        <span 
                          key={idx} 
                          className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-lg text-[11px] font-semibold text-white/70 hover:bg-white/10 hover:border-white/20 transition-colors cursor-default"
                        >
                          {item.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h4 className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.3em] text-white/20 mb-6">
                <Cpu className="w-4 h-4" /> Gemini AI Integration
              </h4>
              <p className="text-sm leading-relaxed text-white/60">
                {idea.geminiUsage}
              </p>
            </section>
          </div>
        </div>

        <div className="mt-16 pt-16 border-t border-white/10 grid lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2">
            <h4 className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.3em] text-white/20 mb-8">
              <Clock className="w-4 h-4" /> Development Roadmap
            </h4>
            <div className="space-y-6">
              {idea.developmentPlan.map((step, i) => (
                <div key={i} className="flex gap-6 group/step">
                  <div className="text-[10px] font-mono text-white/20 mt-1 group-hover/step:text-purple-400 transition-colors">STEP {i + 1}</div>
                  <p className="text-sm text-white/50 leading-relaxed group-hover/step:text-white/80 transition-colors">{step}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-10">
            <section>
              <h4 className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.3em] text-white/20 mb-6">
                <Lightbulb className="w-4 h-4" /> Monetization
              </h4>
              <p className="text-sm text-white/50 leading-relaxed">{idea.monetizationPotential}</p>
            </section>
            <section>
              <h4 className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.3em] text-white/20 mb-6">
                <ChevronRight className="w-4 h-4" /> Future Expansion
              </h4>
              <p className="text-sm text-white/50 leading-relaxed">{idea.futureExpansion}</p>
            </section>
          </div>
        </div>

        <div className="mt-16 p-8 bg-gradient-to-r from-purple-600/20 to-indigo-600/20 rounded-[32px] border border-white/10 glow-purple">
          <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-purple-400 mb-4">Mentor's Verdict</div>
          <p className="text-base text-white/90 leading-relaxed italic font-serif">
            "{idea.winningPotential.explanation}"
          </p>
        </div>
      </div>
    </motion.div>
  );
};

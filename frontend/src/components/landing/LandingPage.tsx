import React from "react";
import { useNavigate } from "react-router-dom";
import { Zap, Shield, BarChart3, Users, ChevronDown } from "lucide-react";

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="overflow-x-hidden bg-black text-white">
      
      {/* HERO */}
      <section className="h-screen flex flex-col items-center justify-center text-center px-6 relative">
        
        <div className="absolute w-[500px] h-[500px] bg-purple-600/10 blur-[140px] rounded-full -z-10 animate-pulse" />

        <div className="max-w-5xl flex flex-col items-center">
          
          {/* Branding */}
          <div className="text-[10px] tracking-[0.4em] uppercase text-purple-400 mb-6">
            Valen Labs presents
          </div>

          {/* Main Heading */}
          <h1 className="text-7xl md:text-[8rem] font-black tracking-tight leading-[0.85] mb-6">
            VALEN <br />
            <span className="bg-gradient-to-r from-purple-400 to-emerald-400 text-transparent bg-clip-text">
              AI
            </span>
          </h1>

          {/* Subheading */}
          <p className="max-w-xl text-slate-400 text-base leading-relaxed mb-10">
            A next-generation AI platform designed to simulate real-world interviews, analyze performance, 
            and guide you toward industry readiness with precision.
          </p>

          {/* CTA */}
          <button
            onClick={() => navigate("/setup")}
            className="px-10 py-4 bg-white text-black font-bold rounded-xl hover:scale-105 transition-all"
          >
            Get Started
          </button>
        </div>

        {/* Scroll */}
        <div className="absolute bottom-10 flex flex-col items-center gap-2 opacity-30 animate-bounce">
          <span className="text-[10px] tracking-widest uppercase">Scroll</span>
          <ChevronDown size={16} />
        </div>
      </section>

      {/* SECTION 2 */}
      <section className="max-w-6xl mx-auto px-6 py-32 grid md:grid-cols-2 gap-16 items-center">
        
        <div>
          <h2 className="text-5xl font-bold leading-tight mb-6">
            Built for <span className="text-purple-500">Real Outcomes</span>
          </h2>
          <p className="text-slate-400 text-lg leading-relaxed">
            Valen AI bridges the gap between academic learning and industry expectations 
            by providing structured, AI-driven interview simulations and insights.
          </p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-3xl p-12 text-center">
          <p className="text-3xl font-bold">AI-Powered</p>
          <p className="text-sm text-slate-500 mt-2">Adaptive Intelligence Engine</p>
        </div>
      </section>

      {/* FEATURES */}
      <section className="max-w-6xl mx-auto px-6 pb-32">
        
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold">
            Core Capabilities
          </h2>
          <p className="text-slate-500 mt-2 text-sm">
            Built for precision and real-time feedback
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          
          <FeatureBox
            title="Speech Intelligence"
            desc="Detects filler words, tone, and clarity in real time."
            icon={<Shield size={28} />}
          />

          <FeatureBox
            title="Adaptive Interviews"
            desc="Questions evolve based on your performance dynamically."
            icon={<Zap size={28} />}
          />

          <FeatureBox
            title="Performance Insights"
            desc="Detailed analytics to identify strengths and gaps."
            icon={<BarChart3 size={28} />}
          />
        </div>
      </section>

      {/* VISION */}
      <section className="border-t border-white/10 py-24 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          
          <div>
            <h2 className="text-4xl font-bold mb-6">
              Designed for Scale
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              Valen AI is built to integrate with institutions, training platforms, 
              and individual users — creating a unified ecosystem for career preparation.
            </p>

            <div className="flex items-center gap-3 mt-6 text-sm">
              <Users size={18} className="text-purple-400" />
              <span>Institution-ready infrastructure</span>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl h-32 flex items-center justify-center">
            <p className="text-slate-500 text-xs uppercase tracking-widest">
              Scalable AI Platform
            </p>
          </div>
        </div>
      </section>

    </div>
  );
};

function FeatureBox({ title, desc, icon }: any) {
  return (
    <div className="p-8 bg-white/5 border border-white/10 rounded-2xl hover:border-purple-500/40 transition-all">
      <div className="mb-4">{icon}</div>
      <h3 className="font-semibold mb-2">{title}</h3>
      <p className="text-sm text-slate-500">{desc}</p>
    </div>
  );
}

export default LandingPage;
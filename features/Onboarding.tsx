
import React, { useState, useEffect } from 'react';
import { Button } from '../components/Button';
import { ArrowRight, Brain, ShieldCheck, ScanLine, Crown } from 'lucide-react';

interface OnboardingProps {
  onComplete: () => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    setIsAnimating(true);
    const timer = setTimeout(() => setIsAnimating(false), 500);
    return () => clearTimeout(timer);
  }, [step]);

  const steps = [
    {
      title: "King K Neural Net",
      subtitle: "V3 SMARTEST ENGINE",
      desc: "Welcome to King K AI. Our v3 smartest engine processes global liquidity with 100% verified accuracy and zero mistake logic.",
      color: "from-amber-500 to-yellow-600",
      accent: "text-amber-400"
    },
    {
      title: "Infallible Logic",
      subtitle: "GURU ANALYSIS CORE",
      desc: "Institutional multi-timeframe deconstruction. Identify BOS and liquidity sweeps using SMC and ICT tools with surgical precision.",
      color: "from-cyan-500 to-blue-600",
      accent: "text-cyan-400"
    },
    {
      title: "100% Profit Target",
      subtitle: "ELITE EXECUTION",
      desc: "King K AI reads every candle. Secure entries, zero mistake stops, and perfect profits. Designed for total terminal dominance.",
      color: "from-violet-600 to-indigo-600",
      accent: "text-violet-400"
    }
  ];

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      onComplete();
    }
  };

  return (
    <div className="h-screen bg-slate-950 flex flex-col relative overflow-hidden font-sans selection:bg-amber-500/30">
      <div 
        className={`absolute top-[-20%] left-[-20%] w-[140%] h-[80%] bg-gradient-to-br ${steps[step].color} opacity-10 blur-[120px] rounded-full transition-all duration-1000 ease-in-out pointer-events-none`} 
      />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>

      <div className="w-full p-6 pt-12 flex justify-between items-center z-20">
         <div className="flex gap-1.5">
            {[0, 1, 2].map(i => (
                <div key={i} className={`h-1 rounded-full transition-all duration-500 ${i <= step ? 'w-8 bg-white' : 'w-2 bg-slate-800'}`} />
            ))}
         </div>
         <button onClick={onComplete} className="text-xs font-bold text-slate-500 uppercase tracking-widest hover:text-white transition-colors">Skip</button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center relative z-10 w-full perspective-[1000px]">
        <div className={`relative w-72 h-72 mb-12 transition-all duration-700 ease-out transform ${isAnimating ? 'scale-95 opacity-50' : 'scale-100 opacity-100'}`}>
            {step === 0 && (
                <div className="w-full h-full relative flex items-center justify-center">
                    <div className="absolute inset-0 border border-amber-500/20 rounded-full animate-[spin_10s_linear_infinite]"></div>
                    <div className="w-32 h-32 bg-slate-900 rounded-full border border-amber-500/50 shadow-[0_0_50px_rgba(245,158,11,0.3)] flex items-center justify-center relative z-10 backdrop-blur-md">
                        <Crown size={48} className="text-amber-400 relative z-10" />
                    </div>
                </div>
            )}
            {step === 1 && (
                <div className="w-full h-full relative bg-slate-900/50 border border-slate-800 rounded-2xl backdrop-blur-md overflow-hidden flex items-center justify-center shadow-2xl">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/20 to-transparent h-[20%] w-full top-0 animate-[scan_2s_ease-in-out_infinite] border-b border-cyan-400/50"></div>
                    <Brain size={48} className="text-cyan-400 opacity-50" />
                </div>
            )}
            {step === 2 && (
                <div className="w-full h-full relative flex items-center justify-center">
                    <div className="w-40 h-48 bg-gradient-to-b from-slate-900 to-slate-950 border border-violet-500/30 rounded-[2rem] flex flex-col items-center justify-center shadow-[0_0_30_rgba(139,92,246,0.2)]">
                        <ShieldCheck size={48} className="text-violet-400 mb-2" />
                        <span className="text-xl font-mono font-bold text-white">100% ACCURATE</span>
                    </div>
                </div>
            )}
        </div>

        <div className="w-full px-8 text-center relative z-20">
          <div className={`inline-block px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm text-[10px] font-bold uppercase tracking-[0.2em] mb-4 ${steps[step].accent}`}>
             {steps[step].subtitle}
          </div>
          <h1 className="text-3xl font-black text-white mb-4 tracking-tight leading-tight">
            {steps[step].title}
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed max-w-xs mx-auto">
            {steps[step].desc}
          </p>
        </div>
      </div>

      <div className="w-full p-8 pb-12 z-20">
        <Button 
          fullWidth 
          onClick={handleNext} 
        >
          {step === steps.length - 1 ? "Enter King's Terminal" : "Next Step"}
          <ArrowRight size={18} />
        </Button>
      </div>
      <style>{`
        @keyframes scan {
          0% { top: 0%; opacity: 0; }
          100% { top: 100%; opacity: 0; }
        }
      `}</style>
    </div>
  );
};

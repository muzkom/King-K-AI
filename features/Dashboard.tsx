
import React, { useState } from 'react';
import { Crown, Zap, Send, Sparkles, Mic, Radio, Waves } from 'lucide-react';
import { AppScreen } from '../types';

interface DashboardProps {
  onNavigate: (screen: AppScreen) => void;
  onStartChat?: (msg: string) => void;
  userName?: string;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate, onStartChat, userName = "Guru" }) => {
  const [chatInput, setChatInput] = useState("");

  const handleChatSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (chatInput.trim() && onStartChat) {
        onStartChat(chatInput);
        setChatInput("");
    } else {
        onNavigate(AppScreen.ANALYSIS);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] relative flex flex-col items-center pb-32 overflow-x-hidden font-sans">
      <div className="absolute top-[-5%] left-1/2 -translate-x-1/2 w-full h-[500px] bg-amber-500/5 blur-[120px] rounded-full pointer-events-none fixed"></div>

      <div className="w-full px-8 pt-12 flex justify-between items-center z-10 mb-8">
        <div className="group cursor-default">
           <h2 className="text-slate-500 text-[9px] font-black uppercase tracking-[0.4em]">Deep Terminal v3.5</h2>
           <div className="flex items-center gap-2 mt-1.5">
              <div className="w-2 h-2 bg-amber-500 rounded-full shadow-[0_0_12px_#f59e0b] animate-pulse"></div>
              <span className="text-white font-black text-xs uppercase tracking-tighter">KING K PRO CORE</span>
           </div>
        </div>
        <button 
          onClick={() => onNavigate(AppScreen.ASSISTANT)} 
          className="bg-amber-500/10 border border-amber-500/20 text-amber-500 p-3 rounded-full shadow-[0_0_20px_rgba(245,158,11,0.2)] hover:bg-amber-500 hover:text-slate-950 transition-all active:scale-95"
        >
          <Mic size={20} />
        </button>
      </div>

      <div className="relative z-20 flex flex-col items-center mb-10">
        <div className="text-center mb-10">
            <h1 className="text-6xl font-black text-white mb-2 tracking-tighter drop-shadow-2xl">KING K AI</h1>
            <p className="text-amber-500 text-[10px] font-black tracking-[0.6em] uppercase flex items-center gap-3 justify-center">
               <span className="h-[1px] w-6 bg-amber-500/30"></span>
               Institutional Intel
               <span className="h-[1px] w-6 bg-amber-500/30"></span>
            </p>
        </div>

        <button 
          onClick={() => onNavigate(AppScreen.ANALYSIS)}
          className="group relative w-72 h-72 rounded-full flex items-center justify-center transition-all duration-700 active:scale-95"
        >
          {/* Animated Aura Layers */}
          <div className="absolute inset-[-8px] rounded-full bg-[conic-gradient(from_0deg,transparent_0deg,#f59e0b_120deg,transparent_240deg,#f59e0b_360deg)] animate-[spin_3s_linear_infinite] opacity-50 blur-lg"></div>
          <div className="absolute inset-[-4px] rounded-full bg-[conic-gradient(from_180deg,transparent_0deg,#f59e0b_120deg,transparent_240deg,#f59e0b_360deg)] animate-[spin_5s_linear_infinite_reverse] opacity-30 blur-md"></div>
          
          <div className="absolute inset-[3px] bg-[#020617] rounded-full z-10 flex items-center justify-center overflow-hidden">
              <div className="w-[96%] h-[96%] bg-[#0f172a] rounded-full border border-amber-500/30 shadow-[inset_0_0_40px_rgba(245,158,11,0.2)] flex flex-col items-center justify-center relative">
                  <div className="absolute inset-0 opacity-5 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
                  <Radio size={72} className="text-amber-400 mb-2 animate-pulse drop-shadow-[0_0_20px_rgba(245,158,11,0.7)]" />
                  <span className="text-white font-black text-4xl tracking-widest uppercase italic">SCAN</span>
                  <div className="flex items-center gap-2 mt-3 bg-slate-950/80 px-4 py-1.5 rounded-full border border-amber-500/20">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping"></span>
                      <span className="text-amber-500 text-[9px] font-black uppercase tracking-[0.4em]">DEEP LINK</span>
                  </div>
              </div>
          </div>
        </button>
      </div>

      <div className="w-full px-8 z-20 mb-8">
         <div className="bg-slate-900/80 border border-white/5 rounded-[2.5rem] p-7 backdrop-blur-3xl shadow-2xl ring-1 ring-white/5">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <Sparkles size={18} className="text-amber-500" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Terminal Link</span>
                </div>
            </div>
            
            <form onSubmit={handleChatSubmit} className="relative mb-6">
                <input 
                    type="text" 
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Consult the Master Analyst..."
                    className="w-full bg-[#020617] border border-slate-800 rounded-2xl py-4.5 pl-5 pr-14 text-sm text-white focus:border-amber-500 outline-none transition-all"
                />
                <button type="submit" className="absolute right-2 top-2 p-3 bg-amber-500 text-slate-950 rounded-xl shadow-lg active:scale-90"><Send size={18} /></button>
            </form>

            <div className="grid grid-cols-2 gap-3">
                <button onClick={() => onNavigate(AppScreen.ANALYSIS)} className="flex items-center justify-center gap-3 py-4 rounded-2xl bg-[#0f172a] border border-white/5 text-[10px] font-black text-amber-500 uppercase tracking-widest shadow-lg">
                    <Radio size={16} /> Deep Scan
                </button>
                <button onClick={() => onNavigate(AppScreen.ASSISTANT)} className="flex items-center justify-center gap-3 py-4 rounded-2xl bg-[#0f172a] border border-white/5 text-[10px] font-black text-white uppercase tracking-widest shadow-lg">
                    <Mic size={16} /> Voice Link
                </button>
            </div>
         </div>
      </div>
      
      <div className="w-full px-8 z-20">
          <div className="bg-amber-500/5 border-l-2 border-amber-500/50 p-6 rounded-r-3xl backdrop-blur-md flex items-center gap-5">
              <Zap size={24} className="text-amber-500 shrink-0" />
              <p className="text-slate-300 text-[10px] font-black leading-relaxed uppercase tracking-widest">
                Status: Master Core Active. SMC Logic set to 100% precision.
              </p>
          </div>
      </div>
    </div>
  );
};
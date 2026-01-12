
import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Check, Brain, Activity, Target, Zap, Layers, FileText, Share2, ShieldCheck, ChevronRight, BarChart3, Binary, Cpu, Search, X, TrendingUp, Sparkles, Network, Info, Download, Loader2, Crown, MessageSquareText } from 'lucide-react';
import { Button } from '../components/Button';
import { TradeAnalysisResult, ConfluenceFactor } from '../types';
import { fileToGenerativePart, analyzeChartImage, chatWithAssistant } from '../services/geminiService';
import html2canvas from 'html2canvas';
import { supabase } from '../lib/supabaseClient';

interface AnalysisProps {
  onBack: () => void;
}

const ALL_PAIRS = [
    // Forex
    { name: "EUR/USD", category: "Forex", desc: "Euro vs US Dollar" },
    { name: "GBP/USD", category: "Forex", desc: "British Pound" },
    { name: "USD/JPY", category: "Forex", desc: "Japanese Yen" },
    { name: "AUD/USD", category: "Forex", desc: "Australian Dollar" },
    { name: "USD/CHF", category: "Forex", desc: "Swiss Franc" },
    // Commodities
    { name: "XAU/USD", category: "Commodities", desc: "Gold Spot" },
    { name: "XAG/USD", category: "Commodities", desc: "Silver Spot" },
    { name: "USOIL", category: "Commodities", desc: "WTI Crude Oil" },
    // Indices
    { name: "NAS100", category: "Indices", desc: "Nasdaq 100" },
    { name: "US30", category: "Indices", desc: "Dow Jones 30" },
    { name: "SPX500", category: "Indices", desc: "S&P 500" },
    { name: "GER40", category: "Indices", desc: "DAX 40" },
    // Stocks
    { name: "AAPL", category: "Stocks", desc: "Apple Inc." },
    { name: "TSLA", category: "Stocks", desc: "Tesla, Inc." },
    { name: "NVDA", category: "Stocks", desc: "NVIDIA Corp" },
    { name: "MSFT", category: "Stocks", desc: "Microsoft" },
    { name: "AMZN", category: "Stocks", desc: "Amazon" },
    { name: "GOOGL", category: "Stocks", desc: "Alphabet" },
    { name: "META", category: "Stocks", desc: "Meta Platforms" },
    { name: "BABA", category: "Stocks", desc: "Alibaba Group" },
    { name: "COIN", category: "Stocks", desc: "Coinbase Global" },
    // Crypto
    { name: "BTC/USD", category: "Crypto", desc: "Bitcoin" },
    { name: "ETH/USD", category: "Crypto", desc: "Ethereum" },
    { name: "SOL/USD", category: "Crypto", desc: "Solana" },
    { name: "XRP/USD", category: "Crypto", desc: "Ripple" },
    { name: "DOGE/USD", category: "Crypto", desc: "Dogecoin" },
];

export const Analysis: React.FC<AnalysisProps> = ({ onBack }) => {
  const [step, setStep] = useState(1); 
  const [selectedPair, setSelectedPair] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [img4H, setImg4H] = useState<string | null>(null);
  const [img15M, setImg15M] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TradeAnalysisResult | null>(null);
  const [typingReasoning, setTypingReasoning] = useState("");
  const [showConfluence, setShowConfluence] = useState(false);
  
  const [isSharing, setIsSharing] = useState(false);
  const [deepExplainLoading, setDeepExplainLoading] = useState(false);
  const [deepExplanation, setDeepExplanation] = useState<string | null>(null);
  const [showDeepExplain, setShowDeepExplain] = useState(false);

  const signalCardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (result && step === 3) {
      setTypingReasoning("");
      let i = 0;
      const fullText = result.reasoning;
      const interval = setInterval(() => {
        setTypingReasoning(fullText.slice(0, i));
        i += 5;
        if (i > fullText.length) {
          clearInterval(interval);
          setShowConfluence(true);
        }
      }, 20);
      return () => clearInterval(interval);
    }
  }, [result, step]);

  const filteredPairs = ALL_PAIRS.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const runAnalysis = async () => {
    if (!selectedPair || (!img4H && !img15M)) return;
    setLoading(true);
    try {
        const images: string[] = [];
        if (img4H) images.push(img4H);
        if (img15M) images.push(img15M);
        const data = await analyzeChartImage(images, selectedPair, 'Scalp');
        
        // Save to Supabase
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            supabase.from('analyses').insert({
                user_id: user.id,
                pair: data.pair,
                trend: data.trend,
                trade_idea: data.tradeIdea,
                entry_price: data.entry,
                stop_loss: data.sl,
                take_profit_1: data.tp1,
                take_profit_2: data.tp2,
                rr_ratio: data.rr,
                reasoning: data.reasoning,
                confidence: data.confidence,
                confluence_factors: data.confluenceFactors
            }).then(({ error }) => {
                if (error) console.error("Failed to save analysis:", error);
            });
        }

        setResult(data);
        setStep(3);
    } catch (e: any) {
        console.error(e);
        alert("Neural Link Severed. Please try again.");
    } finally {
        setLoading(false);
    }
  };

  const handleShareSignal = async () => {
    if (!signalCardRef.current || isSharing) return;
    setIsSharing(true);
    
    // Slight delay to allow DOM to be ready
    await new Promise(r => setTimeout(r, 100));

    try {
        const canvas = await html2canvas(signalCardRef.current, {
            backgroundColor: '#0f172a',
            scale: 2,
            logging: false,
            useCORS: true,
            allowTaint: true,
            onclone: (clonedDoc) => {
                // Ensure visibility of elements in cloned document
                const el = clonedDoc.querySelector('[data-signal-card]');
                if (el) (el as HTMLElement).style.borderRadius = '40px';
            }
        });

        const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png', 1.0));
        if (!blob) throw new Error("Canvas capture failed");

        const fileName = `KingK_Signal_${selectedPair.replace('/', '_')}.png`;
        const file = new File([blob], fileName, { type: 'image/png' });

        if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
            try {
                await navigator.share({
                    files: [file],
                    title: `King K Institutional Signal: ${selectedPair}`,
                    text: `Verified Deep Scan Signal for ${selectedPair}. Zero Mistake Institutional Logic.`
                });
            } catch (shareErr: any) {
                // User cancelled or share failed, fallback to download
                if (shareErr.name !== 'AbortError') {
                    throw shareErr;
                }
            }
        } else {
            // Standard download fallback
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }
    } catch (err: any) {
        if (err.name !== 'AbortError') {
            console.error("Capture or Share failed:", err);
            alert("Unable to share. Image saved to downloads.");
        }
    } finally {
        setIsSharing(false);
    }
  };

  const handleDeepExplain = async () => {
    if (!result || deepExplainLoading) return;
    if (deepExplanation) {
        setShowDeepExplain(true);
        // Scroll to the explanation
        setTimeout(() => {
            const el = document.getElementById('guru-briefing');
            el?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
        return;
    }

    setDeepExplainLoading(true);
    try {
        const prompt = `Provide a DEEP technical ICT/SMC deconstruction for this ${result.tradeIdea} signal on ${result.pair}. 
        Focus on:
        - Why this specific ${result.tradeIdea} makes sense now.
        - The role of BSL/SSL liquidity.
        - FVG or Order Block tapping.
        - Use a master guru tone. Keep it to 3-4 punchy paragraphs.`;
        
        const history = [{ role: 'user', parts: [{ text: `Analysis context: ${JSON.stringify(result)}` }] }];
        const response = await chatWithAssistant(prompt, history);
        setDeepExplanation(response);
        setShowDeepExplain(true);
        setTimeout(() => {
            const el = document.getElementById('guru-briefing');
            el?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    } catch (err) {
        console.error("Deep explain failed:", err);
    } finally {
        setDeepExplainLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen bg-[#020617] flex flex-col items-center justify-center p-8 animate-in fade-in duration-500">
        <div className="relative mb-12">
            <div className="w-56 h-56 border border-amber-500/20 rounded-full flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-2 border-amber-500/40 animate-ping opacity-20"></div>
                <div className="absolute inset-0 rounded-full border border-amber-500/10 animate-[spin_3s_linear_infinite]"></div>
                <Brain size={64} className="text-amber-400 animate-pulse relative z-10" />
            </div>
        </div>
        <div className="bg-[#0f172a] p-10 rounded-[3rem] border border-amber-500/30 text-center shadow-2xl relative overflow-hidden">
            <Activity size={24} className="text-amber-500 animate-spin mx-auto mb-4" />
            <p className="text-amber-500 font-black text-[10px] uppercase tracking-[0.5em] mb-2">Engaging Core Analyst</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#020617] text-white flex flex-col relative overflow-hidden">
      
      {/* Step 1: Select Asset */}
      <div className={`absolute inset-0 flex flex-col transition-transform duration-500 ease-in-out ${step === 1 ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 pt-12 shrink-0">
          <div className="flex items-center gap-4 mb-8">
              <button onClick={onBack} className="p-3 bg-slate-900 border border-white/10 rounded-full active:scale-90 transition-transform"><ArrowLeft size={18} /></button>
              <h2 className="text-xl font-black uppercase tracking-[0.3em]">Select Asset</h2>
          </div>
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-amber-500 transition-colors" size={18} />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search assets..."
              className="w-full bg-slate-900/60 border border-white/10 rounded-[1.5rem] py-4.5 pl-12 pr-4 text-sm font-medium focus:outline-none focus:border-amber-500 transition-all placeholder:text-slate-600 shadow-inner"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-3 no-scrollbar pb-60">
            {filteredPairs.map((pair) => (
                <button 
                    key={pair.name} 
                    onClick={() => setSelectedPair(pair.name)}
                    className={`p-6 rounded-[1.5rem] border text-left transition-all w-full relative overflow-hidden ${selectedPair === pair.name ? 'bg-amber-500/10 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.1)]' : 'bg-slate-900/40 border-white/5 hover:border-white/10'}`}
                >
                    <div className="flex justify-between items-center relative z-10">
                        <div>
                            <div className="flex items-center gap-3">
                              <h4 className="text-lg font-black text-white">{pair.name}</h4>
                              <span className="text-[7px] px-2.5 py-1 rounded-full bg-slate-950 text-slate-400 border border-white/10 font-black uppercase tracking-[0.2em]">{pair.category}</span>
                            </div>
                            <p className="text-[10px] text-slate-500 font-mono uppercase mt-1.5 tracking-wider">{pair.desc}</p>
                        </div>
                        {selectedPair === pair.name && <Check className="text-amber-500" size={24} />}
                    </div>
                </button>
            ))}
        </div>
        <div className="p-6 bg-gradient-to-t from-[#020617] via-[#020617] to-transparent border-white/5 shrink-0 pb-20">
            <Button fullWidth disabled={!selectedPair} onClick={() => setStep(2)} className="bg-amber-600 text-slate-950 font-black py-5 uppercase tracking-[0.2em] shadow-2xl active:scale-95">
              Continue to Scan
            </Button>
        </div>
      </div>

      {/* Step 2: Feed Scan */}
      <div className={`absolute inset-0 flex flex-col transition-transform duration-500 ease-in-out ${step === 2 ? 'translate-x-0' : (step < 2 ? 'translate-x-full' : '-translate-x-full')}`}>
        <div className="p-6 pt-12 shrink-0">
          <div className="flex items-center gap-4 mb-8">
              <button onClick={() => setStep(1)} className="p-3 bg-slate-900 border border-white/10 rounded-full"><ArrowLeft size={18} /></button>
              <h2 className="text-xl font-black uppercase tracking-[0.3em]">Feed Scan</h2>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar pb-60">
            <div className="grid grid-cols-2 gap-6">
                <div onClick={() => document.getElementById('f1')?.click()} className="aspect-[4/5] bg-slate-900/40 border-2 border-dashed border-slate-800 rounded-[2.5rem] flex flex-col items-center justify-center relative overflow-hidden group hover:border-amber-500/50 transition-all cursor-pointer shadow-xl">
                    {img4H ? <img src={`data:image/png;base64,${img4H}`} className="absolute inset-0 w-full h-full object-cover" /> : <><Target size={32} className="text-slate-700 mb-3 group-hover:text-amber-500"/><span className="text-[10px] font-black text-slate-600 uppercase tracking-widest text-center px-4">HTF Context<br/>(4H Chart)</span></>}
                    <input id="f1" type="file" hidden onChange={async (e) => setImg4H(await fileToGenerativePart(e.target.files![0]))} />
                </div>
                <div onClick={() => document.getElementById('f2')?.click()} className="aspect-[4/5] bg-slate-900/40 border-2 border-dashed border-slate-800 rounded-[2.5rem] flex flex-col items-center justify-center relative overflow-hidden group hover:border-amber-500/50 transition-all cursor-pointer shadow-xl">
                    {img15M ? <img src={`data:image/png;base64,${img15M}`} className="absolute inset-0 w-full h-full object-cover" /> : <><Layers size={32} className="text-slate-700 mb-3 group-hover:text-amber-500"/><span className="text-[10px] font-black text-slate-600 uppercase tracking-widest text-center px-4">LTF Entry<br/>(15M Chart)</span></>}
                    <input id="f2" type="file" hidden onChange={async (e) => setImg15M(await fileToGenerativePart(e.target.files![0]))} />
                </div>
            </div>
            
            <div className="bg-[#0f172a] border border-white/5 p-8 rounded-[3rem] shadow-2xl relative overflow-hidden flex flex-col items-center justify-center text-center">
                <Sparkles size={24} className="text-amber-500/40 mb-3" />
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] leading-relaxed">
                  Institutional Intelligence ready.<br/>Upload Multi-TF charts to begin.
                </p>
            </div>
        </div>
        <div className="p-6 bg-gradient-to-t from-[#020617] via-[#020617] to-transparent border-white/5 shrink-0 pb-20">
            <Button fullWidth onClick={runAnalysis} disabled={!img4H && !img15M} className="bg-amber-600 text-slate-950 font-black py-5 uppercase tracking-[0.3em] shadow-[0_0_30px_rgba(245,158,11,0.2)]">
              Initiate Neural Scan
            </Button>
        </div>
      </div>

      {/* Step 3: Result */}
      <div className={`absolute inset-0 flex flex-col transition-transform duration-500 ease-in-out overflow-y-auto no-scrollbar pb-40 ${step === 3 ? 'translate-x-0' : 'translate-x-full'}`}>
        {result && (
          <div className="p-6 pt-12 pb-24">
            <div className="flex items-center justify-between mb-10">
                <button onClick={() => setStep(1)} className="p-3 bg-slate-900 border border-white/10 rounded-full"><ArrowLeft size={18} /></button>
                <div className="flex items-center gap-3">
                   <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse shadow-[0_0_10px_#f59e0b]"></div>
                   <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-white">Neural Logic Verified</h2>
                </div>
                <button onClick={handleShareSignal} disabled={isSharing} className="p-3 bg-slate-900 border border-white/10 rounded-full text-slate-500 active:scale-90 transition-transform">
                    {isSharing ? <Loader2 className="animate-spin" size={18} /> : <Share2 size={18} />}
                </button>
            </div>

            {/* Signal Card for Image Export */}
            <div 
                ref={signalCardRef} 
                data-signal-card
                className="bg-[#0f172a] border border-white/10 rounded-[3.5rem] p-10 shadow-2xl relative overflow-hidden mb-12 shrink-0"
            >
                <div className={`absolute top-0 right-0 w-64 h-64 blur-[100px] rounded-full opacity-20 -translate-y-1/2 translate-x-1/2 transition-colors duration-1000 ${result.tradeIdea === 'Buy' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                
                {/* Branding on Card */}
                <div className="absolute top-8 left-10 flex items-center gap-2 opacity-30">
                    <Crown size={12} className="text-amber-500" />
                    <span className="text-[8px] font-black uppercase tracking-widest text-white">King K Institutional</span>
                </div>

                <div className="flex justify-between items-start mb-12 mt-4 relative z-10">
                    <div>
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] block mb-2">Bias Pattern</span>
                        <h1 className="text-5xl font-black tracking-tighter text-white drop-shadow-2xl">{result.pair}</h1>
                    </div>
                    <div className={`px-10 py-6 rounded-[2.5rem] border-2 font-black uppercase tracking-[0.4em] shadow-2xl transition-all duration-700 ${result.tradeIdea === 'Buy' ? 'text-green-400 border-green-500/50 bg-green-500/10' : 'text-red-400 border-red-500/50 bg-red-500/10'}`}>
                        {result.tradeIdea}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-8 mb-12 relative z-10">
                    <div className="bg-slate-950/80 p-8 rounded-[2.5rem] border border-white/5 flex flex-col items-center shadow-inner">
                         <p className="text-[9px] text-slate-600 font-black uppercase mb-3 tracking-[0.2em]">Entry</p>
                         <p className="text-2xl font-mono font-black text-white">{result.entry}</p>
                    </div>
                    <div className="bg-slate-950/80 p-8 rounded-[2.5rem] border border-white/5 flex flex-col items-center shadow-inner">
                         <p className="text-[9px] text-slate-600 font-black uppercase mb-3 tracking-[0.2em]">Stop</p>
                         <p className="text-2xl font-mono font-black text-red-500">{result.sl}</p>
                    </div>
                </div>

                <div className="space-y-4 mb-12 relative z-10">
                     <div className="flex justify-between items-center px-8 py-6 bg-slate-950/40 rounded-[2.5rem] border border-white/5">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">TP1</span>
                        <span className="text-2xl font-mono font-black text-green-400">{result.tp1}</span>
                     </div>
                     <div className="flex justify-between items-center px-8 py-6 bg-slate-950/40 rounded-[2.5rem] border border-white/5">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">TP2</span>
                        <span className="text-2xl font-mono font-black text-green-400">{result.tp2}</span>
                     </div>
                </div>

                <div className="flex justify-between items-center pt-8 border-t border-white/5 opacity-50 relative z-10">
                    <span className="text-[7px] font-black uppercase tracking-widest text-slate-500">Verified by King K Neural Grid v3.5</span>
                    <span className="text-[7px] font-black uppercase tracking-widest text-slate-500">{new Date().toLocaleDateString()}</span>
                </div>
            </div>

            {/* Analyst Reasoning Visualization */}
            <div className="bg-[#0f172a] border border-white/10 rounded-[3rem] p-10 mb-8 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-6 opacity-10">
                    <Network size={40} className="text-amber-500 animate-[spin_10s_linear_infinite]" />
                </div>
                <div className="flex items-center gap-4 mb-8">
                   <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20">
                      <Binary size={20} className="text-amber-500" />
                   </div>
                   <h3 className="text-[10px] font-black text-white uppercase tracking-[0.5em]">Neural Deconstruction</h3>
                </div>
                <div className="text-sm text-slate-300 leading-[2.2] font-medium italic min-h-[140px] relative z-10 bg-slate-900/40 p-6 rounded-2xl border border-white/5">
                    {typingReasoning}
                    <span className="inline-block w-2 h-5 bg-amber-500 animate-[pulse_0.6s_infinite] ml-2 align-middle rounded-full shadow-[0_0_10px_#f59e0b]"></span>
                </div>
                
                <button 
                  onClick={handleDeepExplain}
                  disabled={deepExplainLoading}
                  className="mt-6 w-full py-5 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-[10px] font-black text-amber-500 uppercase tracking-[0.4em] flex items-center justify-center gap-3 hover:bg-amber-500/20 transition-all shadow-inner active:scale-[0.98]"
                >
                    {deepExplainLoading ? <Loader2 size={16} className="animate-spin" /> : <MessageSquareText size={16} />}
                    Ask Guru to Deconstruct
                </button>
            </div>

            {/* Deep Explanation Modal/Section */}
            {showDeepExplain && deepExplanation && (
                <div id="guru-briefing" className="bg-slate-900 border-2 border-amber-500/30 rounded-[3rem] p-10 mb-12 shadow-[0_0_50px_rgba(245,158,11,0.1)] animate-in slide-in-from-bottom duration-500 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-amber-500 animate-pulse"></div>
                    <div className="flex justify-between items-center mb-8">
                        <div className="flex items-center gap-3">
                            <Cpu size={20} className="text-amber-500" />
                            <h3 className="text-xs font-black uppercase tracking-[0.5em] text-white">Institutional Briefing</h3>
                        </div>
                        <button onClick={() => setShowDeepExplain(false)} className="text-slate-500 hover:text-white p-2"><X size={24} /></button>
                    </div>
                    <div className="text-sm font-medium text-slate-300 leading-relaxed whitespace-pre-wrap font-sans">
                        {deepExplanation}
                    </div>
                </div>
            )}
            
            <div className="mt-8 flex gap-5 pb-12">
                <button 
                    onClick={handleShareSignal}
                    disabled={isSharing}
                    className="flex-[3] py-6 rounded-[2rem] bg-amber-500 text-slate-950 font-black text-xs uppercase tracking-[0.4em] shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-3 hover:bg-amber-400"
                >
                    {isSharing ? <Loader2 className="animate-spin" size={20} /> : <Share2 size={20} />}
                    {isSharing ? "GENERATING..." : "Share Signal"}
                </button>
                <button onClick={() => setStep(1)} className="flex-1 py-6 rounded-[2rem] bg-slate-900 border border-white/10 text-slate-500 font-black text-xs uppercase tracking-widest active:scale-95 transition-all hover:bg-slate-800 hover:text-white">
                    New Scan
                </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes scan-line {
          0% { top: 0%; opacity: 0; }
          50% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        .scan-line {
          position: absolute;
          height: 2px;
          width: 100%;
          animation: scan-line 2.5s linear infinite;
        }
      `}</style>
    </div>
  );
};

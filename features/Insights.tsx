
import React, { useState } from 'react';
import { ArrowUpRight, ArrowDownRight, Clock, ShieldCheck, Activity, Globe, Zap, Crown } from 'lucide-react';

export const Insights = () => {
    const [signals] = useState([
        { pair: 'XAU/USD', type: 'BUY', time: '12 min ago', price: '2042.85', status: 'Active', pips: '+24', conf: 98, cat: 'Forex' },
        { pair: 'NAS100', type: 'SELL', time: '42 min ago', price: '18240', status: 'Hit TP1', pips: '+140', conf: 94, cat: 'Indices' },
        { pair: 'NVDA', type: 'BUY', time: '1h ago', price: '924.15', status: 'Active', pips: '+2.4%', conf: 96, cat: 'Stocks' },
        { pair: 'EUR/USD', type: 'BUY', time: '2h ago', price: '1.0842', status: 'Active', pips: '+12', conf: 91, cat: 'Forex' },
        { pair: 'BTC/USD', type: 'SELL', time: '3h ago', price: '68420', status: 'Closed', pips: '-15', conf: 89, cat: 'Crypto' },
    ]);

    return (
        <div className="min-h-screen bg-[#020617] text-white pb-48 no-scrollbar overflow-y-auto">
            <div className="p-8 pt-16">
                <div className="flex justify-between items-center mb-12">
                    <div>
                      <h1 className="text-4xl font-black uppercase tracking-tighter text-white drop-shadow-2xl">Market Feed</h1>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] mt-2 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                        Live Global Scan
                      </p>
                    </div>
                    <div className="w-14 h-14 bg-amber-500/10 border border-amber-500/30 rounded-[1.5rem] flex items-center justify-center text-amber-500 shadow-2xl">
                        <Activity size={28} className="animate-pulse" />
                    </div>
                </div>

                <div className="bg-[#0f172a] border border-white/10 rounded-[3rem] p-8 mb-12 flex items-center gap-6 backdrop-blur-3xl shadow-[0_40px_80px_rgba(0,0,0,0.5)] relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-6 opacity-5 animate-float group-hover:scale-110 transition-transform duration-1000"><Globe size={80} /></div>
                    <div className="w-16 h-16 bg-green-500/10 border border-green-500/30 rounded-[1.5rem] flex items-center justify-center text-green-500 shadow-inner">
                        <Zap size={32} className="animate-pulse" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-1.5">Global Liquidity</p>
                        <h3 className="text-2xl font-black text-white tracking-tight uppercase group-hover:text-amber-400 transition-colors">High Volatility</h3>
                    </div>
                </div>

                <div className="space-y-6">
                    {signals.map((signal, i) => (
                        <div key={i} className="bg-slate-900/40 backdrop-blur-xl border border-white/10 p-7 rounded-[2.5rem] relative overflow-hidden group hover:bg-slate-900 transition-all shadow-2xl">
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex items-center gap-5">
                                    <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center shadow-inner transition-transform group-hover:scale-110 ${signal.type === 'BUY' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                                        {signal.type === 'BUY' ? <ArrowUpRight size={32} /> : <ArrowDownRight size={32} />}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3 mb-1.5">
                                           <h3 className="font-black text-2xl tracking-tight text-white">{signal.pair}</h3>
                                           <div className={`text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${signal.type === 'BUY' ? 'bg-green-500 text-slate-950' : 'bg-red-500 text-slate-950'}`}>
                                              {signal.type}
                                           </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                           <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">In: {signal.price}</span>
                                           <span className="w-1 h-1 bg-slate-800 rounded-full"></span>
                                           <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{signal.cat}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className={`text-2xl font-mono font-black ${signal.pips.includes('+') ? 'text-green-400' : 'text-slate-500'}`}>{signal.pips}</p>
                                    <p className="text-[10px] text-slate-600 font-black flex items-center justify-end gap-2 mt-1.5 uppercase tracking-widest">
                                       <Clock size={12} /> {signal.time}
                                    </p>
                                </div>
                            </div>
                            
                            <div className="flex justify-between items-center pt-6 border-t border-white/10">
                                <div className="flex items-center gap-3">
                                    <ShieldCheck size={16} className="text-amber-500" />
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Neural Conf: {signal.conf}%</span>
                                </div>
                                <div className={`text-[11px] font-black uppercase tracking-[0.2em] flex items-center gap-3 ${signal.status.includes('Hit') ? 'text-amber-400' : 'text-slate-500'}`}>
                                    <div className={`w-2 h-2 rounded-full ${signal.status.includes('Hit') ? 'bg-amber-500 animate-pulse' : 'bg-slate-700'}`}></div>
                                    {signal.status}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                
                <div className="mt-16 p-10 bg-gradient-to-br from-amber-500/5 to-transparent border border-white/5 rounded-[3rem] text-center shadow-inner group">
                    <Crown size={40} className="text-amber-500/20 mx-auto mb-5 transition-transform group-hover:scale-110 duration-700" />
                    <p className="text-slate-500 text-[11px] font-black uppercase tracking-[0.5em] leading-loose">
                       Neural link maintained across global data nodes. King K Guru monitoring active 24/7.
                    </p>
                </div>
            </div>
        </div>
    );
};


import React, { useState } from 'react';
import { Button } from '../components/Button';
import { Mail, Lock, Shield, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

interface AuthProps {
  onLogin: () => void;
}

export const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
      }
      onLogin();
    } catch (err: any) {
      setError(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen bg-slate-950 p-6 flex flex-col justify-center relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-amber-900/10 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="mb-12 relative z-10 text-center">
        <div className="w-16 h-16 bg-slate-900 border border-slate-800 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
            <Shield size={32} className="text-amber-400" />
        </div>
        <h2 className="text-4xl font-black text-white mb-2 tracking-tighter uppercase">
          King K AI
        </h2>
        <p className="text-slate-400 text-sm font-medium tracking-wide">
          {isLogin ? "Institutional Terminal Entrance" : "Initialize Guru Profile"}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Identity Vector</label>
          <div className="relative">
            <Mail className="absolute left-4 top-4 text-slate-600" size={18} />
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-900/50 border border-slate-800 text-white rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-amber-500 transition-all placeholder-slate-600 font-medium"
              placeholder="operator@kingk.ai"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Encrypted Key</label>
          <div className="relative">
            <Lock className="absolute left-4 top-4 text-slate-600" size={18} />
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-900/50 border border-slate-800 text-white rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-amber-500 transition-all placeholder-slate-600 font-medium"
              placeholder="••••••••"
              minLength={6}
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex items-center gap-2 text-red-400 text-xs font-bold">
            <AlertCircle size={14} />
            <span>{error}</span>
          </div>
        )}
        
        <div className="pt-4">
            <Button fullWidth type="submit" disabled={loading} className="bg-amber-600 hover:bg-amber-500 border-amber-500 text-slate-950 font-black py-4">
                {loading ? "VERIFYING..." : (isLogin ? "SECURE ENTRANCE" : "CREATE IDENTITY")}
            </Button>
        </div>
      </form>

      <div className="mt-auto pt-8 text-center relative z-10">
        <button 
          onClick={() => { setIsLogin(!isLogin); setError(null); }} 
          className="text-amber-500 text-xs font-black uppercase tracking-widest hover:text-amber-400 transition-colors"
        >
          {isLogin ? "Need Guru Status? Register" : "Already Verified? Entrance"}
        </button>
      </div>
    </div>
  );
};

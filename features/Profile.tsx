
import React, { useEffect, useState } from 'react';
import { LogOut, Crown, Shield, Activity } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { User } from '@supabase/supabase-js';

interface ProfileProps {
  onLogout: () => void;
}

export const Profile: React.FC<ProfileProps> = ({ onLogout }) => {
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState({ scans: 0 });

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      if (user) fetchStats(user.id);
    });
  }, []);

  const fetchStats = async (userId: string) => {
    const { count } = await supabase
        .from('analyses')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);
    setStats({ scans: count || 0 });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    onLogout();
  };

  const email = user?.email || 'Loading...';
  const initial = email[0] ? email[0].toUpperCase() : 'K';
  const name = email.split('@')[0];

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 pt-12">
        <h1 className="text-2xl font-black mb-8 tracking-tight uppercase tracking-widest">King's Vault</h1>
        
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex items-center gap-5 mb-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <Crown size={80} />
            </div>
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white text-3xl font-bold shadow-[0_0_20px_rgba(245,158,11,0.3)]">
                {initial}
            </div>
            <div>
                <h2 className="text-white font-bold text-xl">{name}</h2>
                <div className="flex items-center gap-2 mt-1">
                    <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">Deep Institutional</span>
                    <span className="text-slate-500 text-xs">• Rank: Guru</span>
                </div>
            </div>
        </div>

        <div className="space-y-4 mb-8">
            <div className="p-5 bg-slate-900/50 border border-slate-800 rounded-2xl flex items-center gap-4">
                <Shield size={20} className="text-amber-500" />
                <div>
                    <h4 className="font-bold text-sm">King K Status</h4>
                    <p className="text-xs text-slate-500">Tier 3 Master Institutional Access</p>
                </div>
            </div>
            <div className="p-5 bg-slate-900/50 border border-slate-800 rounded-2xl flex items-center gap-4">
                <Activity size={20} className="text-amber-500" />
                <div>
                    <h4 className="font-bold text-sm">Total Deep Scans</h4>
                    <p className="text-xs text-slate-500">{stats.scans} Analyses Performed</p>
                </div>
            </div>
        </div>

        <button onClick={handleLogout} className="w-full bg-red-500/5 border border-red-500/20 p-5 rounded-2xl flex justify-between items-center text-red-400 hover:bg-red-500/10 transition-colors group">
            <span className="text-sm font-bold">Disconnect session</span>
            <LogOut size={18} />
        </button>

        <div className="mt-12 text-center">
            <p className="text-[10px] text-slate-600 font-mono uppercase tracking-[0.2em]">King K AI • Zero Mistake v3 Smartest</p>
        </div>
    </div>
  );
};

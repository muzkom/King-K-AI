
import React from 'react';
import { Home, Scan, User } from 'lucide-react';
import { AppScreen } from '../types';

interface BottomNavProps {
  currentScreen: AppScreen;
  setScreen: (screen: AppScreen) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentScreen, setScreen }) => {
  const navItems = [
    { id: AppScreen.DASHBOARD, icon: Home, label: 'Core' },
    { id: AppScreen.ANALYSIS, icon: Scan, label: 'Guru' },
    { id: AppScreen.PROFILE, icon: User, label: 'Vault' },
  ];

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-[340px] bg-slate-900/60 backdrop-blur-2xl border border-white/10 rounded-full p-1.5 flex justify-around items-center z-50 shadow-[0_20px_50px_rgba(0,0,0,0.5)] ring-1 ring-white/5">
      {navItems.map((item) => {
        const isActive = currentScreen === item.id;
        return (
          <button
            key={item.label}
            onClick={() => setScreen(item.id)}
            className={`relative flex flex-col items-center gap-0.5 transition-all duration-500 px-4 py-2 rounded-full ${
              isActive 
                ? 'text-amber-400 bg-white/5' 
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <item.icon size={16} strokeWidth={isActive ? 2.5 : 2} className="transition-transform duration-300 group-active:scale-90" />
            <span className={`text-[6px] font-black uppercase tracking-[0.2em] transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'}`}>
              {item.label}
            </span>
            {isActive && (
              <div className="absolute -bottom-0.5 w-1 h-1 bg-amber-400 rounded-full shadow-[0_0_8px_#f59e0b]"></div>
            )}
          </button>
        )
      })}
    </div>
  );
};

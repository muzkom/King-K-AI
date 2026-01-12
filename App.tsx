
import React, { useState, useEffect, useRef } from 'react';
import { AppScreen } from './types';
import { Onboarding } from './features/Onboarding';
import { Auth } from './features/Auth';
import { Dashboard } from './features/Dashboard';
import { BottomNav } from './components/BottomNav';
import { Analysis } from './features/Analysis';
import { Assistant } from './features/Assistant';
import { Profile } from './features/Profile';
import { supabase } from './lib/supabaseClient';
import { Session } from '@supabase/supabase-js';

const App = () => {
  const [screen, setScreen] = useState<AppScreen>(AppScreen.ONBOARDING);
  const [session, setSession] = useState<Session | null>(null);
  const [initialChatMessage, setInitialChatMessage] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // Keep track of screen in ref for the auth listener closure to access current state
  const screenRef = useRef(screen);
  useEffect(() => {
    screenRef.current = screen;
  }, [screen]);

  useEffect(() => {
    // Initial Session Check
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        setScreen(AppScreen.DASHBOARD);
      }
      setLoading(false);
    }).catch(err => {
      console.error("Supabase connection error:", err);
      setLoading(false);
    });

    // Auth State Listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      
      // Robust navigation logic:
      // 1. SIGNED_IN: Explicitly entered -> Go to Dashboard
      // 2. SIGNED_OUT: Explicitly left -> Go to Auth (unless in Onboarding)
      // 3. TOKEN_REFRESHED / Others: Do NOT interfere with current screen (fixes "back to home" bug)
      
      if (event === 'SIGNED_IN') {
        setScreen(AppScreen.DASHBOARD);
      } else if (event === 'SIGNED_OUT') {
        if (screenRef.current !== AppScreen.ONBOARDING) {
          setScreen(AppScreen.AUTH);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []); // Empty dependency array ensures listener is only attached once

  const renderScreen = () => {
    if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-amber-500 font-black tracking-widest animate-pulse">CONNECTING...</div>;

    switch (screen) {
      case AppScreen.ONBOARDING:
        return <Onboarding onComplete={() => setScreen(AppScreen.AUTH)} />;
      case AppScreen.AUTH:
        return <Auth onLogin={() => {
            // Screen transition handled by onAuthStateChange (SIGNED_IN) or manually here if needed for speed
            // setScreen(AppScreen.DASHBOARD); 
        }} />;
      case AppScreen.DASHBOARD:
        return <Dashboard 
          onNavigate={setScreen} 
          onStartChat={(msg) => {
            setInitialChatMessage(msg);
            setScreen(AppScreen.ASSISTANT);
          }}
        />;
      case AppScreen.PROFILE:
        return <Profile onLogout={() => {
            // Logout logic handled in component
        }} />;
      case AppScreen.ANALYSIS:
        return <Analysis onBack={() => setScreen(AppScreen.DASHBOARD)} />;
      case AppScreen.ASSISTANT:
        return <Assistant 
          onBack={() => setScreen(AppScreen.DASHBOARD)} 
          initialMessage={initialChatMessage}
          onClearInitialMessage={() => setInitialChatMessage('')}
        />;
      default:
        return <Dashboard onNavigate={setScreen} />;
    }
  };

  const showNav = session && 
                  screen !== AppScreen.ASSISTANT &&
                  screen !== AppScreen.ONBOARDING &&
                  screen !== AppScreen.AUTH;

  return (
    <div className="mx-auto max-w-md w-full min-h-screen bg-slate-950 shadow-2xl overflow-hidden relative font-sans text-slate-100">
      {renderScreen()}
      {showNav && <BottomNav currentScreen={screen} setScreen={setScreen} />}
    </div>
  );
};

export default App;

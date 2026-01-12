
import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Send, Mic, MicOff, Radio } from 'lucide-react';
import { chatWithAssistant, decode, decodeAudioData, encode } from '../services/geminiService';
import { ChatMessage } from '../types';
import { GoogleGenAI, Modality, LiveServerMessage } from '@google/genai';
import { supabase } from '../lib/supabaseClient';

interface AssistantProps {
  onBack: () => void;
  initialMessage?: string;
  onClearInitialMessage?: () => void;
}

export const Assistant: React.FC<AssistantProps> = ({ onBack, initialMessage, onClearInitialMessage }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Voice session refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const sessionPromiseRef = useRef<any>(null);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const nextStartTimeRef = useRef(0);

  useEffect(() => {
    loadChatHistory();
  }, []);

  useEffect(() => {
    if (initialMessage && !loading && messages.length > 0) {
        // Handle initial message if provided from Dashboard
        // Only trigger if we have loaded history (messages.length > 0 check isn't perfect but simple)
        // Better to check a loaded flag, but for now this suffices as history loading is fast
        handleInitialMessage(initialMessage);
        if (onClearInitialMessage) onClearInitialMessage();
    }
  }, [initialMessage, messages]);

  const loadChatHistory = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

    if (data) {
        const history: ChatMessage[] = data.map(msg => ({
            role: msg.role as 'user' | 'model',
            text: msg.message,
            timestamp: new Date(msg.created_at).getTime()
        }));

        if (history.length === 0) {
             setMessages([{ role: 'model', text: 'Voice Link initialized. I am King K, the Guru. Speak your query for real-money execution.', timestamp: Date.now() }]);
        } else {
             setMessages(history);
        }
    } else {
        setMessages([{ role: 'model', text: 'Voice Link initialized. I am King K, the Guru. Speak your query for real-money execution.', timestamp: Date.now() }]);
    }
  };

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading]);

  const toggleVoice = async () => {
    if (isVoiceActive) {
      setIsVoiceActive(false);
      if (sessionPromiseRef.current) {
        const session = await sessionPromiseRef.current;
        session.close();
      }
      return;
    }
    setIsVoiceActive(true);
    startVoiceSession();
  };

  const startVoiceSession = async () => {
    try {
      // Use direct process.env.API_KEY for SDK initialization
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      audioContextRef.current = outputCtx;

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            const source = inputCtx.createMediaStreamSource(stream);
            const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const int16 = new Int16Array(inputData.length);
              for (let i = 0; i < inputData.length; i++) {
                int16[i] = inputData[i] * 32768;
              }
              const pcmBlob = {
                data: encode(new Uint8Array(int16.buffer)),
                // Supported audio MIME type is strictly 'audio/pcm'
                mimeType: 'audio/pcm;rate=16000',
              };
              // Critical: Use resolved sessionPromise to send data
              sessionPromise.then((session) => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputCtx.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio) {
              // Exact scheduling for smooth playback
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputCtx.currentTime);
              const audioBuffer = await decodeAudioData(decode(base64Audio), outputCtx, 24000, 1);
              const source = outputCtx.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(outputCtx.destination);
              
              // Tracking sources for potential interruption
              source.addEventListener('ended', () => {
                sourcesRef.current.delete(source);
              });

              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              sourcesRef.current.add(source);
            }

            // Handling model interruptions
            const interrupted = message.serverContent?.interrupted;
            if (interrupted) {
              for (const source of sourcesRef.current.values()) {
                source.stop();
                sourcesRef.current.delete(source);
              }
              nextStartTimeRef.current = 0;
            }
          },
          onerror: (e: ErrorEvent) => {
            console.debug('Neural link error', e);
          },
          onclose: (e: CloseEvent) => {
            console.debug('Neural link closed', e);
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
          systemInstruction: "You are King K, the institutional trading guru. You talk strictly about SMC, liquidity, and professional trading. Your tone is clinical, sharp, and authoritative."
        }
      });
      sessionPromiseRef.current = sessionPromise;
    } catch (err) {
      console.error('Failed to connect to Neural Link', err);
      setIsVoiceActive(false);
    }
  };

  const handleInitialMessage = (msg: string) => {
    setInput(msg);
    // Use a timeout to simulate next tick submission
    setTimeout(() => {
        handleSend(msg);
    }, 100);
  };

  const handleSend = async (manualInput?: string) => {
    const textToSend = manualInput || input;
    if (!textToSend.trim() || loading) return;
    
    const userMsg: ChatMessage = { role: 'user', text: textToSend, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    // Save User Msg
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
         await supabase.from('chat_messages').insert({
             user_id: user.id,
             role: 'user',
             message: userMsg.text
         });
    }

    const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
    }));
    const responseText = await chatWithAssistant(userMsg.text, history);
    
    const aiMsg: ChatMessage = { role: 'model', text: responseText, timestamp: Date.now() };

    // Save AI Msg
    if (user) {
         await supabase.from('chat_messages').insert({
             user_id: user.id,
             role: 'model',
             message: responseText
         });
    }

    setMessages(prev => [...prev, aiMsg]);
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-screen bg-[#020617] text-white relative">
      <div className="p-6 pt-12 flex items-center justify-between border-b border-white/5 bg-[#0f172a]/80 backdrop-blur-xl z-20">
        <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2.5 bg-slate-900 border border-white/5 rounded-full"><ArrowLeft size={18} /></button>
            <div>
               <h2 className="font-black text-sm uppercase tracking-[0.3em]">Master Guru</h2>
               <p className="text-[10px] text-amber-500 font-mono tracking-widest">DEEP NEURAL LINK</p>
            </div>
        </div>
        <button onClick={toggleVoice} className={`p-3 rounded-full transition-all ${isVoiceActive ? 'bg-red-500 shadow-[0_0_30px_rgba(239,68,68,0.5)]' : 'bg-amber-500 text-slate-950'}`}>
           {isVoiceActive ? <MicOff size={22} /> : <Mic size={22} />}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar pb-32" ref={scrollRef}>
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`p-6 rounded-[2rem] text-sm leading-relaxed max-w-[85%] font-medium ${msg.role === 'user' ? 'bg-amber-500 text-slate-950 rounded-tr-none shadow-xl' : 'bg-slate-900 border border-white/5 text-slate-200 rounded-tl-none shadow-xl'}`}>
               {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
             <div className="p-6 rounded-[2rem] bg-slate-900 border border-white/5 rounded-tl-none shadow-xl flex items-center gap-2">
                 <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                 <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                 <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
             </div>
          </div>
        )}
      </div>

      {isVoiceActive && (
        <div className="absolute inset-0 bg-[#020617]/95 z-40 flex flex-col items-center justify-center p-10 backdrop-blur-3xl animate-in fade-in duration-500">
            <div className="relative mb-12">
                <div className="w-40 h-40 rounded-full border-4 border-amber-500/20 flex items-center justify-center">
                    <div className="w-32 h-32 bg-amber-500 rounded-full animate-ping opacity-10 absolute"></div>
                    <Radio size={64} className="text-amber-500 animate-pulse" />
                </div>
            </div>
            <h3 className="text-white font-black text-2xl tracking-[0.3em] uppercase mb-4 italic">Guru Link Live</h3>
            <p className="text-slate-500 text-xs font-bold text-center mb-12 leading-relaxed tracking-widest uppercase">Institutional voice command link established. Speak now.</p>
            <button onClick={toggleVoice} className="bg-red-500/10 text-red-500 border border-red-500/30 px-12 py-5 rounded-full font-black text-xs uppercase tracking-[0.4em] hover:bg-red-500 hover:text-white transition-all">Close Neural Link</button>
        </div>
      )}

      <div className="p-6 bg-[#020617] border-t border-white/5 pb-24 fixed bottom-0 left-0 right-0 z-10">
        <div className="flex gap-3 bg-[#0f172a] p-2.5 rounded-[2rem] border border-white/5 shadow-2xl">
          <input className="flex-1 bg-transparent px-5 focus:outline-none text-sm text-white font-medium" placeholder="Consult the Master Guru..." value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} />
          <button onClick={() => handleSend()} className="p-4 bg-amber-500 text-slate-950 rounded-full shadow-lg active:scale-90"><Send size={20} /></button>
        </div>
      </div>
    </div>
  );
};

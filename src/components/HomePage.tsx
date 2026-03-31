import React from 'react';
import { motion } from 'motion/react';
import { useGameStore } from '../store';
import { Play, Star, Zap, Activity, Shield, TrendingUp, Users } from 'lucide-react';
import pliceItBg from '../assets/plice-it-bg.jpg';
import signalOverloadBg from '../assets/signal-overload-bg.jpg';
import pythRaceBg from '../assets/pyth-race-bg.jpg';

const GAMES = [
  {
    id: 'PLICE_IT',
    title: 'PLICE IT',
    description: 'Master the markets with Pyth Network. Slice bullish assets up and bearish assets down in this fast-paced trading game.',
    image: pliceItBg,
    color: '#bef264',
    tags: ['Action', 'Real-time', 'Pyth'],
    status: 'AVAILABLE'
  },
  {
    id: 'SIGNAL_OVERLOAD',
    title: 'SIGNAL OVERLOAD',
    description: 'Process rapid market signals. Identify the strongest bullish or bearish moves under extreme time pressure.',
    image: signalOverloadBg,
    color: '#7c3aed',
    tags: ['Cognitive', 'Speed', 'Trading'],
    status: 'AVAILABLE'
  },
  {
    id: 'PYTH_RACE',
    title: 'PYTH RACE',
    description: 'Enter participant names and watch them race across the screen, fueled by real-time financial data and market events.',
    image: pythRaceBg,
    color: '#f43f5e',
    tags: ['Racing', 'Data', 'Pyth'],
    status: 'AVAILABLE'
  }
];

export const HomePage: React.FC = () => {
  const { setView } = useGameStore();

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar p-6 sm:p-10 relative">
      {/* Arcade Cabinet Frame Overlay */}
      <div className="absolute inset-0 border-[20px] border-ink pointer-events-none z-50 opacity-50" />
      
      <div className="max-w-6xl mx-auto relative z-10">
        {/* Hero Section */}
        <header className="mb-24 pt-10 text-center relative">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative inline-block"
          >
            {/* Retro Glow Behind Title */}
            <div className="absolute -inset-10 bg-brand-purple/20 blur-[100px] rounded-full animate-pulse" />
            
            <h1 className="text-7xl sm:text-[12rem] font-black text-white leading-[0.8] tracking-tighter italic uppercase mb-8 relative neon-text-purple">
              PYTH<br />
              <span className="neon-text-lime">ARCADE</span>
            </h1>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-12"
          >
            <button 
              onClick={() => {
                const el = document.getElementById('missions');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="group relative inline-flex items-center justify-center"
            >
              <span className="absolute inset-0 bg-brand-lime blur-xl opacity-20 group-hover:opacity-40 transition-opacity" />
              <span className="text-2xl sm:text-4xl font-black text-brand-lime animate-blink uppercase tracking-[0.2em] italic cursor-pointer">
                INSERT COIN TO PLAY
              </span>
            </button>
            
            <p className="mt-8 text-zinc-500 text-[10px] font-mono uppercase tracking-[0.4em]">
              INSERT COIN TO CONTINUE
            </p>
          </motion.div>
        </header>

        {/* Featured Games Grid */}
        <section id="missions" className="scroll-mt-20 mb-20">
          <div className="flex items-center justify-between mb-12">
            <div className="flex items-center gap-3">
              <div className="w-3 h-8 bg-brand-lime" />
              <h2 className="text-3xl font-black text-white uppercase tracking-tighter italic">SELECT MISSION</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {GAMES.map((game, index) => (
              <motion.div
                key={game.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group"
              >
                <div className="arcade-card relative aspect-[4/5] overflow-hidden rounded-sm transition-all duration-300 transform group-hover:-translate-y-2">
                  {/* Scanline Overlay for Card */}
                  <div className="absolute inset-0 pointer-events-none z-20 opacity-30 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px]" />
                  
                  {/* Game Image */}
                  <img 
                    src={game.image} 
                    alt={game.title}
                    className="w-full h-full object-cover opacity-50 group-hover:opacity-80 transition-all duration-500 grayscale group-hover:grayscale-0"
                    referrerPolicy="no-referrer"
                  />
                  
                  {/* Overlay Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/60 to-transparent z-10" />

                  {/* Content */}
                  <div className="absolute inset-0 p-8 flex flex-col justify-end z-30">
                    <div className="mb-4">
                      <span className="text-[9px] font-mono text-brand-lime border border-brand-lime/30 px-2 py-1 rounded uppercase tracking-widest">
                        MISSION {index + 1}
                      </span>
                    </div>
                    
                    <h3 className="text-3xl font-black text-white italic tracking-tighter mb-3 uppercase group-hover:neon-text-lime transition-all">
                      {game.title}
                    </h3>
                    
                    <p className="text-zinc-400 text-[11px] leading-relaxed mb-8 font-mono uppercase tracking-tight">
                      {game.description}
                    </p>

                    {game.status === 'AVAILABLE' ? (
                      <button
                        onClick={() => setView(game.id as any)}
                        className="w-full bg-brand-lime text-black font-black py-4 rounded-none flex items-center justify-center gap-3 hover:bg-white transition-all uppercase tracking-widest text-sm shadow-[0_0_20px_rgba(190,242,100,0.3)]"
                      >
                        <Play className="w-5 h-5 fill-current" />
                        START MISSION
                      </button>
                    ) : (
                      <div className="w-full bg-white/5 border border-white/10 text-zinc-600 font-black py-4 rounded-none flex items-center justify-center gap-3 uppercase tracking-widest text-sm cursor-not-allowed">
                        <Shield className="w-5 h-5" />
                        LOCKED
                      </div>
                    )}
                  </div>

                  {/* Cabinet Edge Glow */}
                  <div className="absolute inset-0 border-2 border-transparent group-hover:border-brand-lime/50 transition-all duration-300" />
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Arcade Footer Stats */}
        <section className="mt-32 grid grid-cols-2 md:grid-cols-4 gap-8 border-t-2 border-white/5 pt-12">
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">NETWORK STATUS</span>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-brand-lime" />
              <span className="text-xs font-mono text-white uppercase">CONNECTED</span>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">ACTIVE AGENTS</span>
            <span className="text-xs font-mono text-white uppercase tracking-widest">14,209</span>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">TOTAL VOLUME</span>
            <span className="text-xs font-mono text-white uppercase tracking-widest">$1.2B</span>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">SYSTEM VERSION</span>
            <span className="text-xs font-mono text-white uppercase tracking-widest">V2.5.0-STABLE</span>
          </div>
        </section>
      </div>
    </div>
  );
};

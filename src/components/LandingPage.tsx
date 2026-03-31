import React from 'react';
import { motion } from 'motion/react';
import { Play, Lock, ChevronRight, Gamepad2, Zap, Trophy, Cpu } from 'lucide-react';

interface LandingPageProps {
  onStartGame: () => void;
}

const FUTURE_GAMES = [
  { id: 'neon-slice', name: 'NEON SLICE', status: 'COMING SOON', icon: <Zap className="w-4 h-4" />, color: 'text-brand-lime' },
  { id: 'cyber-cut', name: 'CYBER CUT', status: 'DEVELOPMENT', icon: <Cpu className="w-4 h-4" />, color: 'text-brand-purple' },
  { id: 'void-shred', name: 'VOID SHRED', status: 'LOCKED', icon: <Lock className="w-4 h-4" />, color: 'text-white/20' },
];

export function LandingPage({ onStartGame }: LandingPageProps) {
  return (
    <div className="relative w-full h-full flex flex-col overflow-y-auto overflow-x-hidden bg-ink">
      {/* Hero Section */}
      <section className="relative min-h-[70vh] flex flex-col items-center justify-center px-6 pt-20 pb-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center z-10"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="px-2 py-0.5 bg-brand-lime text-ink text-[10px] font-mono font-bold tracking-widest rounded-sm uppercase">
              LIVE NOW
            </div>
            <div className="text-[10px] font-mono text-white/40 tracking-widest uppercase italic">
              V2.5.0 STABLE
            </div>
          </div>
          
          <h1 className="text-[15vw] sm:text-[12vw] font-black leading-[0.85] tracking-tighter uppercase italic text-white mb-8 select-none">
            PLICE <span className="text-brand-purple">IT</span>
          </h1>
          
          <p className="max-w-md mx-auto text-sm sm:text-base text-white/60 font-sans leading-relaxed mb-10">
            The ultimate precision slicing challenge powered by Pyth real-time data. 
            Test your reflexes in the digital void.
          </p>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onStartGame}
            className="group relative px-8 py-4 bg-white text-ink font-mono font-bold text-lg tracking-widest rounded-none overflow-hidden transition-colors hover:bg-brand-lime"
          >
            <div className="relative z-10 flex items-center gap-3">
              <Play className="w-5 h-5 fill-current" />
              <span>INITIALIZE GAME</span>
            </div>
            <div className="absolute inset-0 bg-brand-purple translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          </motion.button>
        </motion.div>

        {/* Background Decorative Elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] pointer-events-none opacity-20">
          <div className="absolute inset-0 bg-radial-[at_50%_50%] from-brand-purple/30 via-transparent to-transparent blur-3xl" />
        </div>
      </section>

      {/* Games List Section */}
      <section className="relative z-10 px-6 pb-20 max-w-5xl mx-auto w-full">
        <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <Gamepad2 className="w-5 h-5 text-brand-lime" />
            <h2 className="text-xs font-mono font-bold tracking-[0.3em] uppercase italic">GAME DIRECTORY</h2>
          </div>
          <div className="text-[10px] font-mono text-white/30 uppercase tracking-widest">
            3 NEW ENTRIES PENDING
          </div>
        </div>

        <div className="grid gap-4">
          {/* Active Game: PLICE IT */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            onClick={onStartGame}
            className="group relative flex items-center justify-between p-6 bg-white/5 border border-white/10 hover:border-brand-lime cursor-pointer transition-all hover:bg-white/10"
          >
            <div className="flex items-center gap-6">
              <div className="w-12 h-12 flex items-center justify-center bg-brand-lime/10 border border-brand-lime/20 rounded-full">
                <Trophy className="w-6 h-6 text-brand-lime" />
              </div>
              <div>
                <h3 className="text-xl font-black italic tracking-tight text-white group-hover:text-brand-lime transition-colors">PLICE IT</h3>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-[10px] font-mono text-brand-lime uppercase tracking-widest">ACTIVE SESSION</span>
                  <span className="text-[10px] font-mono text-white/30 uppercase tracking-widest">• HIGH PRECISION</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden sm:block text-right">
                <div className="text-[10px] font-mono text-white/40 uppercase tracking-widest">CURRENT RANK</div>
                <div className="text-sm font-mono font-bold text-white">#001 GLOBAL</div>
              </div>
              <ChevronRight className="w-5 h-5 text-white/20 group-hover:text-brand-lime transition-colors" />
            </div>
          </motion.div>

          {/* Future Games */}
          {FUTURE_GAMES.map((game, index) => (
            <motion.div 
              key={game.id}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="relative flex items-center justify-between p-6 bg-white/[0.02] border border-white/5 grayscale opacity-50"
            >
              <div className="flex items-center gap-6">
                <div className="w-12 h-12 flex items-center justify-center bg-white/5 border border-white/10 rounded-full">
                  {game.icon}
                </div>
                <div>
                  <h3 className="text-xl font-black italic tracking-tight text-white/40">{game.name}</h3>
                  <div className="flex items-center gap-3 mt-1">
                    <span className={`text-[10px] font-mono ${game.color} uppercase tracking-widest`}>{game.status}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Lock className="w-4 h-4 text-white/10" />
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Decorative Marquee */}
      <div className="fixed bottom-12 left-0 w-full overflow-hidden pointer-events-none opacity-5 z-0">
        <div className="flex whitespace-nowrap animate-marquee py-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <span key={i} className="text-[10vh] font-black italic tracking-tighter uppercase mx-8">
              PLICE IT • PRECISION • REFLEX • SPEED • PYTH • 
            </span>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 40s linear infinite;
        }
      `}</style>
    </div>
  );
}

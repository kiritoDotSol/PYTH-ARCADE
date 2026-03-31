import React from 'react';
import { motion } from 'motion/react';
import { Game } from '../types';
import { Play, ArrowRight } from 'lucide-react';

interface ShowcaseProps {
  game: Game;
  onPlay: (game: Game) => void;
}

export const Showcase: React.FC<ShowcaseProps> = ({ game, onPlay }) => {
  return (
    <section className="relative h-[80vh] w-full overflow-hidden bg-black flex items-center justify-center">
      {/* Background with blur and gradient */}
      <div 
        className="absolute inset-0 opacity-40 blur-3xl"
        style={{ 
          background: `radial-gradient(circle at 50% 50%, ${game.accent} 0%, transparent 70%)` 
        }}
      />
      
      <div className="container mx-auto px-8 relative z-10 flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-4"
        >
          <span className="text-[11px] uppercase tracking-[0.2em] font-mono text-white/50 mb-4 block">Featured Game</span>
          <h1 className="text-[15vw] font-display uppercase leading-[0.85] tracking-tighter text-white mb-8">
            {game.title}
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="max-w-2xl"
        >
          <p className="text-xl text-white/60 mb-12 font-sans leading-relaxed">
            {game.description}
          </p>

          <div className="flex gap-6 justify-center">
            <button
              onClick={() => onPlay(game)}
              className="group relative flex items-center gap-3 bg-white text-black px-12 py-5 rounded-full font-bold text-lg transition-all hover:scale-105"
            >
              <Play size={24} fill="currentColor" />
              PLAY NOW
              <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </motion.div>
      </div>

      {/* Decorative vertical text */}
      <div className="absolute left-8 bottom-8 hidden lg:block">
        <span className="writing-mode-vertical-rl rotate-180 text-[10px] uppercase tracking-[0.5em] text-white/20 font-mono">
          GAME NEXUS // SHOWCASE // 2026
        </span>
      </div>
    </section>
  );
};

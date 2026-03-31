import React from 'react';
import { motion } from 'motion/react';
import { Game } from '../types';
import { Play, ArrowUpRight } from 'lucide-react';

interface GameGridProps {
  games: Game[];
  onPlay: (game: Game) => void;
}

export const GameGrid: React.FC<GameGridProps> = ({ games, onPlay }) => {
  return (
    <section className="bg-[#E4E3E0] py-24 px-8 min-h-screen">
      <div className="container mx-auto">
        <div className="flex justify-between items-end mb-16 border-b border-black/10 pb-8">
          <div>
            <span className="text-[11px] uppercase tracking-[0.2em] font-mono text-black/40 mb-4 block">Archive</span>
            <h2 className="text-6xl font-serif italic text-black">Available Games</h2>
          </div>
          <div className="hidden md:block">
            <span className="text-[11px] uppercase tracking-[0.2em] font-mono text-black/40 mb-4 block">Total</span>
            <span className="text-4xl font-mono text-black">{games.length}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-black/10 border border-black/10">
          {games.map((game, index) => (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => onPlay(game)}
              className="group relative bg-[#E4E3E0] p-12 cursor-pointer transition-colors hover:bg-black hover:text-foreground"
            >
              <div className="flex justify-between items-start mb-12">
                <span className="text-[11px] uppercase tracking-[0.2em] font-mono opacity-40 group-hover:opacity-60">
                  0{index + 1}
                </span>
                <ArrowUpRight size={24} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>

              <h3 className="text-4xl font-serif italic mb-4">{game.title}</h3>
              <p className="text-sm opacity-60 mb-12 max-w-[280px] font-sans leading-relaxed">
                {game.description}
              </p>

              <div className="flex items-center gap-4">
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center border border-current"
                >
                  <Play size={16} fill="currentColor" />
                </div>
                <span className="text-[11px] uppercase tracking-[0.2em] font-mono">Launch Game</span>
              </div>

              {/* Hover background accent */}
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none"
                style={{ backgroundColor: game.accent }}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

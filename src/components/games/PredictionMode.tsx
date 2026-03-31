import React from 'react';
import { motion } from 'motion/react';
import { Shield, TrendingUp, TrendingDown } from 'lucide-react';

export const PredictionMode: React.FC = () => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-12 relative">
      <div className="absolute top-0 left-0 right-0 flex justify-between items-center p-4">
        <div className="flex flex-col">
          <span className="text-[10px] font-mono text-brand-lime uppercase">MODE</span>
          <span className="text-4xl font-black italic text-brand-lime">PREDICTION</span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[10px] font-mono text-brand-purple uppercase">STAKE</span>
          <span className="text-2xl font-mono text-foreground">100 XP</span>
        </div>
      </div>

      <motion.div 
        animate={{ 
          scale: [1, 1.05, 1],
          rotate: [0, 5, -5, 0]
        }}
        transition={{ duration: 2, repeat: Infinity }}
        className="relative w-64 h-64 bg-brand-lime/10 rounded-3xl border-4 border-brand-lime flex flex-col items-center justify-center gap-6 shadow-[0_0_50px_rgba(190,242,100,0.2)]"
      >
        <TrendingUp className="w-32 h-32 text-brand-lime" />
        <span className="text-xl font-black italic text-foreground uppercase tracking-widest">INITIALIZING...</span>
      </motion.div>

      <div className="flex gap-8">
        <div className="w-32 h-32 bg-green-500/10 border-2 border-green-500 rounded-2xl flex items-center justify-center animate-pulse">
          <TrendingUp className="w-12 h-12 text-green-500" />
        </div>
        <div className="w-32 h-32 bg-red-500/10 border-2 border-red-500 rounded-2xl flex items-center justify-center animate-pulse">
          <TrendingDown className="w-12 h-12 text-red-500" />
        </div>
      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[10px] font-mono text-foreground/20 uppercase tracking-widest text-center">
        Predict the next candle using real-time Pyth data • High stakes, high rewards
      </div>
    </div>
  );
};

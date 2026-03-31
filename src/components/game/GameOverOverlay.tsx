import React from 'react';
import { motion } from 'motion/react';
import { RotateCcw, Home, Zap, Star } from 'lucide-react';
import { useGameStore } from '../../store';
import { calculateRank, getRankColor } from '../../lib/rank';

export const GameOverOverlay: React.FC = () => {
  const { 
    score, highScore, maxCombo, totalSlices, correctSlices, totalReactionTime, xp, resetGame, setStatus 
  } = useGameStore();

  const accuracy = totalSlices > 0 ? (correctSlices / totalSlices) * 100 : 0;
  const avgReactionTime = correctSlices > 0 ? totalReactionTime / correctSlices : 0;
  const rank = calculateRank({ accuracy, maxCombo, avgReactionTime });
  const rankColor = getRankColor(rank);

  return (
    <motion.div
      key="game-over"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full bg-background/95 backdrop-blur-xl border border-border p-6 sm:p-8 rounded-[2rem] shadow-2xl text-center relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-full h-1.5 bg-brand-purple" />
      
      <span className="text-[10px] font-mono text-foreground/40 uppercase tracking-[0.5em] mb-8 block">Session Terminated</span>
      
      <div className="mb-6">
        <p className="text-[10px] font-mono text-brand-lime uppercase tracking-widest mb-2">Final P&L</p>
        <h2 className="text-5xl sm:text-7xl font-black text-foreground italic tracking-tighter leading-none">
          ${score.toLocaleString()}
        </h2>
      </div>

      {/* Rank Display */}
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mb-8 p-6 rounded-3xl border bg-white/5 relative overflow-hidden"
        style={{ borderColor: `${rankColor}40` }}
      >
        <div className="absolute top-0 right-0 p-4">
          <Zap className="w-6 h-6" style={{ color: rankColor }} />
        </div>
        <p className="text-[10px] font-mono uppercase tracking-[0.4em] mb-3" style={{ color: rankColor }}>Trader Rank</p>
        <h3 className="text-5xl font-black italic uppercase tracking-tighter mb-6" style={{ color: rankColor }}>
          {rank}
        </h3>
        
        <div className="grid grid-cols-3 gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-[9px] font-mono text-foreground/40 uppercase tracking-widest">Accuracy</span>
            <span className="text-sm font-mono font-bold text-foreground">{accuracy.toFixed(1)}%</span>
          </div>
          <div className="flex flex-col gap-1 border-x border-border">
            <span className="text-[9px] font-mono text-foreground/40 uppercase tracking-widest">Max Combo</span>
            <span className="text-sm font-mono font-bold text-foreground">{maxCombo}x</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[9px] font-mono text-foreground/40 uppercase tracking-widest">Reaction</span>
            <span className="text-sm font-mono font-bold text-foreground">{avgReactionTime.toFixed(0)}ms</span>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-white/5 rounded-2xl p-4 border border-border flex flex-col gap-1">
          <p className="text-[10px] font-mono text-foreground/40 uppercase tracking-widest">Peak Value</p>
          <p className="text-xl font-mono font-bold text-foreground">${highScore.toLocaleString()}</p>
        </div>
        <div className="bg-white/5 rounded-2xl p-4 border border-border flex flex-col gap-1">
          <p className="text-[10px] font-mono text-foreground/40 uppercase tracking-widest">Max Streak</p>
          <p className="text-xl font-mono font-bold text-brand-lime">{maxCombo}x</p>
        </div>
      </div>

      <div className="bg-brand-purple/10 border border-brand-purple/20 rounded-3xl p-6 mb-8 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-brand-purple/20 flex items-center justify-center text-brand-purple border border-brand-purple/30">
            <Star size={32} />
          </div>
          <div className="text-left">
            <p className="text-[10px] font-mono text-brand-purple uppercase tracking-widest mb-1">XP Earned</p>
            <p className="text-3xl font-black text-foreground">+{Math.max(0, Math.floor(score * 0.1))} XP</p>
          </div>
        </div>
        <div className="text-right flex flex-col gap-1">
          <p className="text-[10px] font-mono text-foreground/40 uppercase tracking-widest">Total XP</p>
          <p className="text-2xl font-mono font-bold text-muted">{xp}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          onClick={() => resetGame()}
          className="w-full bg-white text-black font-black py-6 rounded-2xl flex items-center justify-center gap-3 hover:bg-zinc-200 transition-all hover:scale-[1.02] active:scale-95 shadow-xl uppercase tracking-widest"
        >
          <RotateCcw size={24} />
          Restart Session
        </button>
        <button
          onClick={() => {
            resetGame();
            setStatus('START');
          }}
          className="w-full bg-white/5 border border-border text-foreground font-black py-6 rounded-2xl flex items-center justify-center gap-3 hover:bg-white/10 transition-all hover:scale-[1.02] active:scale-95 shadow-xl uppercase tracking-widest"
        >
          <Home size={24} />
          Main Menu
        </button>
      </div>
    </motion.div>
  );
};

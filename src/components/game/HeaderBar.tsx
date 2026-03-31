import React from 'react';
import { motion } from 'motion/react';
import { Star, Zap } from 'lucide-react';
import { useGameStore } from '../../store';
import { getCurrentLevel, getNextLevel } from '../../lib/progression';
import { getRankColor } from '../../lib/rank';
import { calculateRank } from '../../lib/rank';

export const HeaderBar: React.FC = () => {
  const { 
    score, timeLeft, combo, xp, lives, highScore, playerName,
    totalSlices, correctSlices, totalReactionTime, maxCombo
  } = useGameStore();

  const accuracy = totalSlices > 0 ? (correctSlices / totalSlices) * 100 : 0;
  const avgReactionTime = correctSlices > 0 ? totalReactionTime / correctSlices : 0;
  const rank = calculateRank({ accuracy, maxCombo, avgReactionTime });
  const rankColor = getRankColor(rank);

  return (
    <div className="w-full border-b border-border bg-background/80 backdrop-blur-md z-50 shrink-0">
      <div className="max-w-7xl mx-auto px-4 h-14 sm:h-16 flex items-center justify-between gap-4">
        {/* Left: Player Stats */}
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-[9px] sm:text-[10px] font-mono text-foreground/40 uppercase tracking-widest truncate max-w-[80px] sm:max-w-[120px]">
                {playerName || 'AGENT'}
              </span>
              <div className="w-1 h-1 rounded-full bg-brand-lime animate-pulse shrink-0" />
              <span className="text-[9px] sm:text-[10px] font-mono uppercase tracking-widest shrink-0" style={{ color: rankColor }}>
                {rank}
              </span>
            </div>
            <span className="text-lg sm:text-xl font-mono font-bold text-brand-lime tabular-nums tracking-tighter">
              ${score.toLocaleString()}
            </span>
          </div>

          <div className="hidden lg:flex flex-col border-l border-border pl-4">
            <span className="text-[10px] font-mono text-foreground/40 uppercase tracking-widest flex items-center gap-1">
              <Star className="w-3 h-3 text-brand-purple" /> Lvl {getCurrentLevel(xp).level}
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <div className="w-20 h-1 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-brand-purple rounded-full" 
                  style={{ 
                    width: `${getNextLevel(xp) ? ((xp - getCurrentLevel(xp).requiredXP) / (getNextLevel(xp)!.requiredXP - getCurrentLevel(xp).requiredXP)) * 100 : 100}%` 
                  }} 
                />
              </div>
              <span className="text-[10px] font-mono text-foreground/60">{xp} XP</span>
            </div>
          </div>

          {combo > 1 && (
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-brand-purple/20 border border-brand-purple/50 px-2 sm:px-3 py-0.5 sm:py-1 rounded-sm shrink-0"
            >
              <span className="text-[10px] sm:text-xs font-mono font-bold text-brand-purple uppercase tracking-tighter">
                {combo}x
              </span>
            </motion.div>
          )}
        </div>

        {/* Center: Timer */}
        <div className="flex flex-col items-center shrink-0">
          <div className="hidden sm:flex items-center gap-2 mb-0.5">
            <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
            <span className="text-[10px] font-mono text-foreground/40 uppercase tracking-widest">Market Open</span>
          </div>
          <span className={`text-2xl sm:text-3xl font-mono font-bold tabular-nums tracking-tighter ${timeLeft < 10 ? 'text-rose-500' : 'text-foreground'}`}>
            {timeLeft.toString().padStart(2, '0')}:00
          </span>
        </div>

        {/* Right: Risk & High Score */}
        <div className="flex items-center gap-4 sm:gap-6 shrink-0">
          <div className="flex flex-col items-end">
            <span className="text-[9px] sm:text-[10px] font-mono text-foreground/40 uppercase tracking-widest">Risk</span>
            <div className="flex gap-1 mt-1">
              {[...Array(3)].map((_, i) => (
                <div 
                  key={i} 
                  className={`w-2.5 sm:w-3 h-1 sm:h-1.5 rounded-full transition-all duration-300 ${i < lives ? 'bg-brand-purple shadow-[0_0_10px_rgba(124,58,237,0.5)]' : 'bg-white/10'}`} 
                />
              ))}
            </div>
          </div>

          <div className="hidden sm:flex flex-col items-end border-l border-border pl-4 sm:pl-6">
            <span className="text-[10px] font-mono text-foreground/40 uppercase tracking-widest">Best</span>
            <span className="text-xs sm:text-sm font-mono text-foreground/60">${highScore.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

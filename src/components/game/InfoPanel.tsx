import React from 'react';
import { motion } from 'motion/react';
import { Star, Zap, Activity, Target, Clock, TrendingUp } from 'lucide-react';
import { useGameStore } from '../../store';
import { getCurrentLevel, getNextLevel } from '../../lib/progression';
import { calculateRank, getRankColor } from '../../lib/rank';

export const InfoPanel: React.FC = () => {
  const { 
    xp, playerName, highScore, totalSlices, correctSlices, totalReactionTime, maxCombo 
  } = useGameStore();

  const currentLevel = getCurrentLevel(xp);
  const nextLevel = getNextLevel(xp);
  const accuracy = totalSlices > 0 ? (correctSlices / totalSlices) * 100 : 0;
  const avgReactionTime = correctSlices > 0 ? totalReactionTime / correctSlices : 0;
  const rank = calculateRank({ accuracy, maxCombo, avgReactionTime });
  const rankColor = getRankColor(rank);

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Profile Card */}
      <div className="bg-ink/40 backdrop-blur-xl border border-white/10 rounded-2xl p-5 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-purple/20 flex items-center justify-center text-brand-purple border border-brand-purple/30">
            <Zap size={20} />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Agent ID</span>
            <span className="text-sm font-bold text-white truncate max-w-[120px]">{playerName || 'UNKNOWN'}</span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Trader Rank</span>
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest" style={{ color: rankColor }}>{rank}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Level</span>
            <span className="text-[10px] font-mono font-bold text-brand-purple uppercase tracking-widest">{currentLevel.level}</span>
          </div>
          
          {nextLevel && (
            <div className="mt-1">
              <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden mb-1.5">
                <div 
                  className="h-full bg-brand-purple rounded-full" 
                  style={{ 
                    width: `${((xp - currentLevel.requiredXP) / (nextLevel.requiredXP - currentLevel.requiredXP)) * 100}%` 
                  }} 
                />
              </div>
              <div className="flex justify-between text-[8px] font-mono text-white/40 uppercase tracking-widest">
                <span>{xp} XP</span>
                <span>{nextLevel.requiredXP} XP</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stats Card */}
      <div className="bg-ink/40 backdrop-blur-xl border border-white/10 rounded-2xl p-5 flex flex-col gap-4">
        <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest flex items-center gap-2">
          <Activity className="w-3 h-3 text-brand-lime" /> Performance Metrics
        </span>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-[9px] font-mono text-white/30 uppercase tracking-widest">Accuracy</span>
            <span className="text-xs font-mono font-bold text-white">{accuracy.toFixed(1)}%</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[9px] font-mono text-white/30 uppercase tracking-widest">Max Combo</span>
            <span className="text-xs font-mono font-bold text-white">{maxCombo}x</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[9px] font-mono text-white/30 uppercase tracking-widest">Avg Reaction</span>
            <span className="text-xs font-mono font-bold text-white">{avgReactionTime.toFixed(0)}ms</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[9px] font-mono text-white/30 uppercase tracking-widest">High Score</span>
            <span className="text-xs font-mono font-bold text-brand-lime">${highScore.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Unlocks Card */}
      <div className="bg-ink/40 backdrop-blur-xl border border-white/10 rounded-2xl p-5 flex flex-col gap-3">
        <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest flex items-center gap-2">
          <Target className="w-3 h-3 text-brand-purple" /> Equipment
        </span>
        
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-mono text-white/30 uppercase tracking-widest">Blade</span>
            <span className="text-[10px] font-mono font-bold" style={{ color: currentLevel.bladeColor }}>{currentLevel.bladeName}</span>
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-[9px] font-mono text-white/30 uppercase tracking-widest">Assets</span>
            <div className="flex flex-wrap gap-1">
              {currentLevel.assets.map(a => (
                <span key={a} className="text-[8px] font-mono bg-white/5 border border-white/10 px-1.5 py-0.5 rounded text-white/60 uppercase">
                  {a}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

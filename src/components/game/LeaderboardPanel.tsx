import React, { useState } from 'react';
import { Leaderboard } from '../Leaderboard';
import { Trophy, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const LeaderboardPanel: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="flex flex-col h-full">
      {/* Mobile Toggle */}
      <div className="lg:hidden mb-4">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full bg-ink/40 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex items-center justify-between text-white hover:bg-white/5 transition-all"
        >
          <div className="flex items-center gap-3">
            <Trophy className="w-5 h-5 text-brand-purple" />
            <span className="text-sm font-bold uppercase tracking-widest">Global Leaderboard</span>
          </div>
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
      </div>

      {/* Leaderboard Content */}
      <div className={`flex-1 ${isExpanded ? 'block' : 'hidden lg:block'}`}>
        <Leaderboard />
      </div>
    </div>
  );
};

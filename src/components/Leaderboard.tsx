import React from 'react';
import { Trophy } from 'lucide-react';

export const Leaderboard: React.FC = () => {
  const mockData = [
    { rank: 1, name: '0xAlpha', score: 12500 },
    { rank: 2, name: 'WhaleSniper', score: 10200 },
    { rank: 3, name: 'DegenKing', score: 8900 },
    { rank: 4, name: 'PythMaxi', score: 7500 },
    { rank: 5, name: 'ApeTrader', score: 6200 },
  ];

  return (
    <div className="bg-background/40 backdrop-blur-xl border border-border rounded-3xl p-6 h-full flex flex-col">
      <div className="flex items-center gap-3 mb-6">
        <Trophy className="w-5 h-5 text-brand-purple" />
        <h2 className="text-sm font-bold uppercase tracking-widest text-foreground">Global Leaderboard</h2>
      </div>
      
      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
        <div className="flex flex-col gap-3">
          {mockData.map((player) => (
            <div 
              key={player.rank}
              className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-border hover:bg-white/10 transition-colors"
            >
              <div className="flex items-center gap-4">
                <span className={`text-xs font-mono font-bold ${
                  player.rank === 1 ? 'text-brand-lime' : 
                  player.rank === 2 ? 'text-brand-purple' : 
                  player.rank === 3 ? 'text-rose-500' : 'text-foreground/40'
                }`}>
                  #{player.rank}
                </span>
                <span className="text-sm font-medium text-foreground/80">{player.name}</span>
              </div>
              <span className="text-xs font-mono text-foreground">{player.score.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

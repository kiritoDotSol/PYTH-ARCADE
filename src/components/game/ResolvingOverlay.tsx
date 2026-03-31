import React from 'react';
import { motion } from 'motion/react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { useGameStore } from '../../store';
import { usePythPrices } from '../../hooks/usePythPrices';

interface ResolvingOverlayProps {
  resolvingIndex: number;
  tempScore: number;
  tempCombo: number;
}

export const ResolvingOverlay: React.FC<ResolvingOverlayProps> = ({ resolvingIndex, tempScore, tempCombo }) => {
  const prices = usePythPrices();
  const { predictions, setStatus } = useGameStore();

  return (
    <motion.div
      key="resolving"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      className="w-full max-w-xl bg-ink border border-white/10 p-6 sm:p-8 rounded-3xl shadow-2xl relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-full h-1 bg-brand-lime" />
      
      <div className="text-center mb-6">
        <span className="text-[10px] font-mono text-white/40 uppercase tracking-[0.4em] mb-2 block animate-pulse">Market Settlement</span>
        <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase">
          Resolving Trades...
        </h2>
      </div>

      <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
        {predictions.map((p, index) => {
          const isRevealed = index < resolvingIndex;
          const currentPriceData = prices[p.assetId];
          let isCorrect = false;
          if (p.guaranteedCorrect !== undefined) {
            isCorrect = p.guaranteedCorrect;
          } else if (currentPriceData) {
            const isPriceUp = currentPriceData.price > p.spawnPrice;
            isCorrect = (p.direction === 'up' && isPriceUp) || (p.direction === 'down' && !isPriceUp);
          } else {
            isCorrect = (parseInt(p.id, 36) % 2 === 0);
          }
          
          return (
            <motion.div 
              key={p.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`flex items-center justify-between p-4 rounded-xl border transition-all ${isRevealed ? (isCorrect ? 'bg-brand-lime/10 border-brand-lime/30' : 'bg-rose-500/10 border-rose-500/30') : 'bg-white/5 border-white/10'}`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${p.direction === 'up' ? 'bg-brand-lime/20 text-brand-lime' : 'bg-rose-500/20 text-rose-500'}`}>
                  {p.direction === 'up' ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                </div>
                <div>
                  <p className="font-bold text-white text-base">{p.symbol}</p>
                  <p className="text-[10px] font-mono text-white/40">Entry: ${p.spawnPrice.toFixed(2)}</p>
                </div>
              </div>
              
              <div className="text-right">
                {isRevealed ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className={`font-black text-lg ${isCorrect ? 'text-brand-lime' : 'text-rose-500'}`}
                  >
                    {isCorrect ? 'PROFIT' : 'LOSS'}
                  </motion.div>
                ) : (
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-white/20 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 rounded-full bg-white/20 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 rounded-full bg-white/20 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
        {predictions.length === 0 && (
          <div className="text-center py-12 text-white/30 font-mono text-sm uppercase tracking-widest border border-dashed border-white/10 rounded-2xl">
            No trades executed this session.
          </div>
        )}
      </div>

      <div className="mt-8 pt-6 border-t border-white/10 flex justify-between items-end">
        <div className="flex flex-col gap-1">
          <p className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Projected P&L</p>
          <p className="text-3xl font-black text-white italic tracking-tighter">${tempScore.toLocaleString()}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <p className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Current Streak</p>
          <p className="text-2xl font-mono font-bold text-brand-purple">{tempCombo}x</p>
        </div>
      </div>

      {resolvingIndex > predictions.length && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8"
        >
          <button
            onClick={() => setStatus('GAMEOVER')}
            className="w-full bg-brand-lime text-black font-black py-4 rounded-2xl flex items-center justify-center gap-3 hover:bg-white transition-all hover:scale-[1.02] active:scale-95 shadow-xl uppercase tracking-widest text-sm"
          >
            Exit Session
          </button>
        </motion.div>
      )}
    </motion.div>
  );
};

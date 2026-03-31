import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, RotateCcw, Play, Pause, Zap, MousePointer2, Clock, Target } from 'lucide-react';

const GAME_DURATION = 15; // 15 seconds

export const ClickerGame: React.FC = () => {
  const [clicks, setClicks] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'finished'>('idle');
  const [highScore, setHighScore] = useState(0);
  const [clickParticles, setClickParticles] = useState<{ id: number; x: number; y: number }[]>([]);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startGame = () => {
    setClicks(0);
    setTimeLeft(GAME_DURATION);
    setGameState('playing');
    setClickParticles([]);
  };

  const handleClick = (e: React.MouseEvent) => {
    if (gameState !== 'playing') return;

    setClicks(c => c + 1);
    const newParticle = {
      id: Date.now(),
      x: e.clientX,
      y: e.clientY,
    };
    setClickParticles(prev => [...prev, newParticle]);
    setTimeout(() => {
      setClickParticles(prev => prev.filter(p => p.id !== newParticle.id));
    }, 500);
  };

  useEffect(() => {
    if (gameState === 'playing' && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(t => t - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setGameState('finished');
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState, timeLeft]);

  useEffect(() => {
    if (gameState === 'finished' && clicks > highScore) {
      setHighScore(clicks);
    }
  }, [gameState, clicks, highScore]);

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-black rounded-2xl shadow-2xl border border-white/10 max-w-2xl mx-auto overflow-hidden relative">
      <div className="flex justify-between w-full mb-8 z-10">
        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-widest text-[#00FF00] font-mono">Time Left</span>
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-[#00FF00]" />
            <span className="text-4xl font-mono text-white">{timeLeft}s</span>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[10px] uppercase tracking-widest text-[#00FF00] font-mono">High Score</span>
          <div className="flex items-center gap-2">
            <Trophy size={16} className="text-yellow-500" />
            <span className="text-4xl font-mono text-white">{highScore}</span>
          </div>
        </div>
      </div>

      <div className="relative flex flex-col items-center justify-center w-full aspect-video bg-white/5 rounded-2xl border border-white/10 overflow-hidden cursor-crosshair" onClick={handleClick}>
        <AnimatePresence>
          {gameState === 'idle' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center"
            >
              <h2 className="text-6xl font-display uppercase tracking-tighter text-white mb-6">Clicker Frenzy</h2>
              <button
                onClick={(e) => { e.stopPropagation(); startGame(); }}
                className="bg-[#00FF00] hover:bg-[#00CC00] text-black font-bold py-4 px-12 rounded-full transition-all flex items-center gap-2 text-xl"
              >
                <Play size={24} />
                Start Game
              </button>
            </motion.div>
          )}

          {gameState === 'playing' && (
            <motion.div
              key="playing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center select-none"
            >
              <motion.span
                key={clicks}
                initial={{ scale: 1.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-9xl font-display text-[#00FF00] drop-shadow-[0_0_20px_rgba(0,255,0,0.5)]"
              >
                {clicks}
              </motion.span>
              <span className="text-white/40 uppercase tracking-widest font-mono mt-4">Click anywhere!</span>
            </motion.div>
          )}

          {gameState === 'finished' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center z-20"
            >
              <h2 className="text-6xl font-display uppercase tracking-tighter text-white mb-2">Time's Up!</h2>
              <p className="text-[#00FF00] text-2xl font-mono mb-8">Score: {clicks} clicks</p>
              <button
                onClick={(e) => { e.stopPropagation(); startGame(); }}
                className="bg-white hover:bg-white/90 text-black font-bold py-4 px-12 rounded-full transition-all flex items-center gap-2 text-xl"
              >
                <RotateCcw size={24} />
                Play Again
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Click Particles */}
        {clickParticles.map(p => (
          <motion.div
            key={p.id}
            initial={{ opacity: 1, scale: 0, y: 0 }}
            animate={{ opacity: 0, scale: 2, y: -50 }}
            className="absolute pointer-events-none text-[#00FF00] font-bold text-xl"
            style={{ left: p.x - 100, top: p.y - 300 }} // Offset for relative container
          >
            +1
          </motion.div>
        ))}
      </div>

      <div className="mt-8 flex gap-8 w-full">
        <div className="flex-1 p-4 bg-white/5 rounded-xl border border-white/10">
          <span className="text-[10px] uppercase tracking-widest text-white/40 font-mono block mb-2">Stats</span>
          <div className="flex justify-between items-center text-white/80 text-xs font-mono">
            <span>CPS (Clicks Per Second)</span>
            <span className="text-[#00FF00]">{(clicks / (GAME_DURATION - timeLeft || 1)).toFixed(1)}</span>
          </div>
        </div>
        <div className="flex-1 p-4 bg-white/5 rounded-xl border border-white/10">
          <span className="text-[10px] uppercase tracking-widest text-white/40 font-mono block mb-2">Goal</span>
          <div className="flex justify-between items-center text-white/80 text-xs font-mono">
            <span>Target</span>
            <span className="text-white">100+ Clicks</span>
          </div>
        </div>
      </div>
    </div>
  );
};

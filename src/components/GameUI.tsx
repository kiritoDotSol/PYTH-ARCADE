import React, { useEffect, useState } from 'react';
import { useGameStore } from '../store';
import { usePythPrices } from '../hooks/usePythPrices';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { TrendingUp, TrendingDown } from 'lucide-react';

// New Modular Components
import { HeaderBar } from './game/HeaderBar';
import { ControlPanel } from './game/ControlPanel';
import { ResolvingOverlay } from './game/ResolvingOverlay';
import { GameOverOverlay } from './game/GameOverOverlay';
import { GameViewport } from './GameViewport';
import { GameInstructions } from './GameInstructions';

export const GameUI: React.FC = () => {
  const prices = usePythPrices();
  const { 
    score, timeLeft, status, gameMode, highScore, 
    predictions, setStatus, setTimeLeft, 
    addXP, addScoreToHistory, setScore, setCombo, 
    setMaxCombo, setHighScore 
  } = useGameStore();

  const [resolvingIndex, setResolvingIndex] = useState(-1);
  const [tempScore, setTempScore] = useState(0);
  const [tempCombo, setTempCombo] = useState(0);
  const [tempMaxCombo, setTempMaxCombo] = useState(0);
  const [showInstructions, setShowInstructions] = useState(true);

  // Game Timer Logic
  useEffect(() => {
    let timer: number;
    if (status === 'PLAYING' && timeLeft > 0) {
      timer = window.setInterval(() => setTimeLeft(timeLeft - 1), 1000);
    } else if (timeLeft === 0 && status === 'PLAYING') {
      setStatus(gameMode === 'LIVE' ? 'GAMEOVER' : 'RESOLVING');
    }
    return () => clearInterval(timer);
  }, [status, timeLeft, gameMode, setStatus, setTimeLeft]);

  // XP & History Management
  useEffect(() => {
    if (status === 'GAMEOVER') {
      const earnedXP = Math.floor(score * 0.1);
      if (earnedXP > 0) addXP(earnedXP);
      addScoreToHistory(score);
    }
  }, [status, score, addXP, addScoreToHistory]);

  // Resolving Logic
  useEffect(() => {
    if (status === 'RESOLVING') {
      setResolvingIndex(0);
      setTempScore(0);
      setTempCombo(0);
      setTempMaxCombo(0);
    }
  }, [status]);

  useEffect(() => {
    if (status === 'RESOLVING' && resolvingIndex >= 0) {
      if (resolvingIndex < predictions.length) {
        const timer = setTimeout(() => {
          const p = predictions[resolvingIndex];
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
          
          let newScore = tempScore;
          let newCombo = tempCombo;
          let newMaxCombo = tempMaxCombo;

          if (isCorrect) {
            newCombo++;
            if (newCombo > newMaxCombo) newMaxCombo = newCombo;
            let multiplier = 1;
            if (newCombo >= 10) multiplier = 3;
            else if (newCombo >= 6) multiplier = 2;
            else if (newCombo >= 3) multiplier = 1.5;
            newScore += 100 * multiplier;
          } else {
            newCombo = 0;
            newScore -= 50;
          }

          setTempScore(newScore);
          setTempCombo(newCombo);
          setTempMaxCombo(newMaxCombo);
          setResolvingIndex(resolvingIndex + 1);
        }, 500);
        return () => clearTimeout(timer);
      } else if (resolvingIndex === predictions.length) {
        setScore(tempScore);
        setCombo(tempCombo);
        setMaxCombo(tempMaxCombo);
        if (tempScore > highScore) setHighScore(tempScore);
        
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#F7931A', '#627EEA', '#14F195']
        });
        
        setResolvingIndex(resolvingIndex + 1);
      }
    }
  }, [status, resolvingIndex, predictions, tempScore, tempCombo, tempMaxCombo, highScore, prices, setScore, setCombo, setMaxCombo, setHighScore]);

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col select-none overflow-hidden">
      <HeaderBar />

      <div className="bg-brand-purple/5 border-b border-border h-6 overflow-hidden flex items-center shrink-0">
        <motion.div 
          animate={{ x: [0, -1000] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="flex gap-8 whitespace-nowrap text-[10px] font-mono text-brand-purple/60 uppercase tracking-widest"
        >
          {[...Array(10)].map((_, i) => (
            <span key={i}>PYTH NETWORK REAL-TIME DATA FEED • LOW LATENCY • HIGH PRECISION • </span>
          ))}
        </motion.div>
      </div>

      <div className="flex-1 relative overflow-hidden pointer-events-auto">
        <div className="max-w-3xl mx-auto px-4 py-4 md:py-8 h-full flex flex-col">
          <AnimatePresence mode="wait">
            {status === 'START' && (
              <motion.div
                key="start-panel"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                className="flex flex-col gap-6 my-auto mx-auto w-full"
              >
                <ControlPanel />
              </motion.div>
            )}

            {status === 'RESOLVING' && (
              <div className="flex items-center justify-center h-full">
                <ResolvingOverlay 
                  resolvingIndex={resolvingIndex} 
                  tempScore={tempScore} 
                  tempCombo={tempCombo} 
                />
              </div>
            )}

            {status === 'GAMEOVER' && (
              <div className="flex justify-center h-full overflow-y-auto custom-scrollbar py-4">
                <div className="my-auto w-full">
                  <GameOverOverlay />
                </div>
              </div>
            )}

            {status === 'PLAYING' && (
              <GameViewport />
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="hidden lg:flex absolute bottom-8 left-0 right-0 justify-center items-center gap-12 pointer-events-none">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-brand-lime/10 border border-brand-lime/20 rounded-full">
            <TrendingUp size={14} className="text-brand-lime" />
            <span className="text-[10px] font-mono text-brand-lime uppercase tracking-widest">Bullish = Slice Up</span>
          </div>
          <div className="w-12 h-px bg-white/10" />
          <div className="flex items-center gap-2 px-4 py-2 bg-rose-500/10 border border-rose-500/20 rounded-full">
            <TrendingDown size={14} className="text-rose-500" />
            <span className="text-[10px] font-mono text-rose-500 uppercase tracking-widest">Bearish = Slice Down</span>
          </div>
        </div>
      </div>

      <GameInstructions
        isOpen={showInstructions && status === 'START'}
        onClose={() => setShowInstructions(false)}
        title="Plice It"
        description="Master the markets with Pyth Network real-time updates."
        instructions={[
          "Analyze the rapidly spawning Pyth crypto assets.",
          "Look at the global market trend and price changes.",
          "Slice BULLISH assets UP.",
          "Slice BEARISH assets DOWN."
        ]}
        accentColor="#bef264"
      />
    </div>
  );
};

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TrendingUp, TrendingDown, Play, RotateCcw, Brain, Zap, Activity, Shield, CheckCircle2, XCircle, Trophy } from 'lucide-react';
import { useGameStore } from '../../store';
import confetti from 'canvas-confetti';
import { usePythPrices, usePythConnection } from '../../hooks/usePythPrices';
import { formatPrice, PYTH_ASSETS } from '../../pyth';
import { GameInstructions } from '../GameInstructions';
import { AssetIcon } from '../AssetIcon';
import { useEntropyRandomness } from '../../hooks/useEntropyRandomness';
import { hexToSeeds, mulberry32 } from '../../utils/prng';

type Direction = 'UP' | 'DOWN';
type Strength = 'WEAK' | 'MEDIUM' | 'STRONG';
type GamePhase = 'START' | 'MODE_SELECT' | 'FLASH' | 'RECALL' | 'RESULT';
type GameMode = 'TRAINING' | 'CHAOS';

interface Signal {
  id: string;
  symbol: string;
  direction: Direction;
  strength: Strength;
  color: string;
  isFake?: boolean;
  livePrice?: string;
}

const ASSETS = [
  { symbol: 'BTC', color: '#F7931A' },
  { symbol: 'ETH', color: '#627EEA' },
  { symbol: 'SOL', color: '#14F195' },
  { symbol: 'ADA', color: '#0033AD' },
  { symbol: 'DOT', color: '#E6007A' },
  { symbol: 'AVAX', color: '#E84142' },
  { symbol: 'MATIC', color: '#8247E5' },
  { symbol: 'LINK', color: '#2A5ADA' },
  { symbol: 'UNI', color: '#FF007A' },
  { symbol: 'ATOM', color: '#2E3148' },
];

const STRENGTH_VALUES = {
  WEAK: 1,
  MEDIUM: 2,
  STRONG: 3,
};

export const SignalOverloadTest: React.FC = () => {
  const { setView, addXP, setScore: setGlobalScore } = useGameStore();
  const prices = usePythPrices();
  const connectionStatus = usePythConnection();

  const { requestEntropy, loading: entropyLoading } = useEntropyRandomness();

  const [phase, setPhase] = useState<GamePhase>('START');
  const [mode, setMode] = useState<GameMode>('TRAINING');
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [signals, setSignals] = useState<Signal[]>([]);
  const [currentSignalIndex, setCurrentSignalIndex] = useState(0);
  const [question, setQuestion] = useState<{ type: 'BULLISH' | 'BEARISH', text: string } | null>(null);
  const [options, setOptions] = useState<Signal[]>([]);
  const [correctAnswer, setCorrectAnswer] = useState<Signal | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<Signal | null>(null);
  const [timeLeft, setTimeLeft] = useState(5);
  const [flashColor, setFlashColor] = useState<string | null>(null);
  const [showInstructions, setShowInstructions] = useState(true);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const generateSignals = useCallback((getRand: () => number) => {
    const numSignals = mode === 'CHAOS' 
      ? Math.min(6 + Math.floor(level / 2), 12) 
      : Math.min(4 + Math.floor(level / 2), 8);
    
    let shuffledAssets = [...ASSETS].sort(() => getRand() - 0.5);
    
    // In Chaos mode, add some "fake" data
    const fakeSymbols = ['DOGE', 'SHIB', 'PEPE', 'FLOKI', 'BONK', 'MEME', 'SCAM', 'RUG'];
    const fakeColors = ['#FFD700', '#FFA500', '#FF4500', '#DA70D6', '#32CD32'];
    
    const finalAssets = [];
    if (mode === 'CHAOS') {
      const numFake = Math.floor(numSignals / 3);
      const realAssets = shuffledAssets.slice(0, numSignals - numFake);
      const fakeAssets = Array.from({ length: numFake }, (_, i) => ({
        symbol: fakeSymbols[Math.floor(getRand() * fakeSymbols.length)],
        color: fakeColors[Math.floor(getRand() * fakeColors.length)],
        isFake: true
      }));
      finalAssets.push(...realAssets, ...fakeAssets);
    } else {
      finalAssets.push(...shuffledAssets.slice(0, numSignals));
    }
    
    // Final shuffle of assets
    finalAssets.sort(() => getRand() - 0.5);
    
    // Determine the target question type
    const targetType = getRand() > 0.5 ? 'BULLISH' : 'BEARISH';
    const targetDirection = targetType === 'BULLISH' ? 'UP' : 'DOWN';
    const oppositeDirection = targetDirection === 'UP' ? 'DOWN' : 'UP';
    
    // Create signals — seed direction/strength from real Pyth data when available
    const generatedSignals: Signal[] = finalAssets.map((asset, index) => {
      const pythData = prices[(asset as any).symbol];
      let direction: Direction = 'UP';
      let strength: Strength = 'WEAK';

      // If we have real Pyth data, use it to seed signal properties
      if (pythData && !((asset as any).isFake)) {
        direction = pythData.delta >= 0 ? 'UP' : 'DOWN';
        const deltaPct = pythData.price > 0 ? Math.abs(pythData.delta / pythData.price) * 100 : 0;
        if (deltaPct >= 0.05) strength = 'STRONG';
        else if (deltaPct >= 0.01) strength = 'MEDIUM';
        else strength = 'WEAK';
      }

      return {
        id: `${asset.symbol}-${index}`,
        symbol: asset.symbol,
        color: asset.color,
        direction,
        strength,
        isFake: (asset as any).isFake || false,
        livePrice: pythData ? formatPrice(pythData.price) : '---'
      };
    });

    // 1. Set the Correct Answer (Strongest in target direction)
    const correctIndex = 0;
    generatedSignals[correctIndex].direction = targetDirection;
    generatedSignals[correctIndex].strength = 'STRONG';

    // 2. Set the "Near-Miss" (Same direction, but weaker)
    const nearMissIndex = 1;
    generatedSignals[nearMissIndex].direction = targetDirection;
    generatedSignals[nearMissIndex].strength = 'MEDIUM';

    // 3. Set the "Red Herring" (Opposite direction, but maximum strength)
    const redHerringIndex = 2;
    generatedSignals[redHerringIndex].direction = oppositeDirection;
    generatedSignals[redHerringIndex].strength = 'STRONG';

    // 4. Fill the rest with random distractors (supplemented by real data above)
    for (let i = 3; i < generatedSignals.length; i++) {
      const sig = generatedSignals[i];
      // If we didn't get data from Pyth, fall back to randomized
      const pythData = prices[sig.symbol];
      if (!pythData) {
        const isTargetDir = getRand() > 0.4;
        sig.direction = isTargetDir ? targetDirection : oppositeDirection;
        
        if (isTargetDir) {
          sig.strength = getRand() > 0.5 ? 'MEDIUM' : 'WEAK';
        } else {
          const r = getRand();
          if (r > 0.7) sig.strength = 'STRONG';
          else if (r > 0.3) sig.strength = 'MEDIUM';
          else sig.strength = 'WEAK';
        }
      }
    }

    const finalSignals = [...generatedSignals].sort(() => getRand() - 0.5);
    setSignals(finalSignals);
    
    const actualCorrect = finalSignals.find(s => s.id === generatedSignals[correctIndex].id)!;
    setCorrectAnswer(actualCorrect);
    
    setQuestion({
      type: targetType,
      text: `Which asset had the STRONGEST ${targetType} move?`
    });

    const nearMiss = finalSignals.find(s => s.id === generatedSignals[nearMissIndex].id)!;
    const redHerring = finalSignals.find(s => s.id === generatedSignals[redHerringIndex].id)!;
    
    const selectedOptions = [actualCorrect];
    if (nearMiss) selectedOptions.push(nearMiss);
    if (redHerring) selectedOptions.push(redHerring);
    
    const remainingPool = finalSignals.filter(s => 
      s.id !== actualCorrect.id && 
      s.id !== nearMiss.id && 
      s.id !== redHerring.id
    ).sort(() => getRand() - 0.5);
    
    while (selectedOptions.length < 4 && remainingPool.length > 0) {
      selectedOptions.push(remainingPool.shift()!);
    }
    
    setOptions(selectedOptions.sort(() => getRand() - 0.5));

  }, [level, mode, prices]);

  const startGame = (selectedMode: GameMode) => {
    setMode(selectedMode);
    setScore(0);
    setCombo(0);
    setLevel(1);
    startLevel();
  };

  const startLevel = useCallback(async () => {
    const entropyHex = await requestEntropy();
    const seeds = hexToSeeds(entropyHex || '0x42');
    const getRand = mulberry32(seeds[0]);
    generateSignals(getRand);
    setPhase('FLASH');
    setCurrentSignalIndex(0);
  }, [generateSignals, requestEntropy]);

  // Flash Phase Loop
  useEffect(() => {
    if (phase === 'FLASH') {
      const baseTime = mode === 'CHAOS' ? 400 : 1000;
      const displayTime = Math.max(mode === 'CHAOS' ? 150 : 400, baseTime - level * (mode === 'CHAOS' ? 40 : 80));
      
      const timer = setTimeout(() => {
        if (currentSignalIndex < signals.length - 1) {
          setCurrentSignalIndex(prev => prev + 1);
        } else {
          setPhase('RECALL');
          const baseRecallTime = mode === 'CHAOS' ? 3 : 8;
          setTimeLeft(Math.max(mode === 'CHAOS' ? 1.5 : 3, baseRecallTime - Math.floor(level / 2)));
        }
      }, displayTime);
      return () => clearTimeout(timer);
    }
  }, [phase, currentSignalIndex, signals.length, level, mode]);

  // Recall Phase Timer
  useEffect(() => {
    if (phase === 'RECALL') {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            handleTimeout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }
  }, [phase]);

  const handleTimeout = () => {
    setSelectedAnswer(null);
    setCombo(0);
    setPhase('RESULT');
  };

  const handleAnswer = (option: Signal) => {
    if (phase !== 'RECALL') return;
    if (timerRef.current) clearInterval(timerRef.current);
    
    setSelectedAnswer(option);
    
    if (option.id === correctAnswer?.id) {
      const points = 10 * (1 + combo * 0.5);
      setScore(prev => prev + points);
      setCombo(prev => prev + 1);
      addXP(points * 5);
      setGlobalScore(score + points);
      
      setFlashColor('rgba(190,242,100,0.15)');
      setTimeout(() => setFlashColor(null), 300);

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#bef264', '#7c3aed', '#ffffff']
      });
    } else {
      setCombo(0);
      setFlashColor('rgba(244,63,94,0.15)');
      setTimeout(() => setFlashColor(null), 300);
    }
    
    setPhase('RESULT');
  };

  const nextLevel = () => {
    setLevel(prev => prev + 1);
    startLevel();
  };

  const getStrengthAnimation = (strength: Strength, direction: Direction, isFake?: boolean) => {
    const baseColor = direction === 'UP' ? 'text-brand-lime' : 'text-rose-500';
    const glowColor = direction === 'UP' ? 'rgba(190,242,100,0.8)' : 'rgba(244,63,94,0.8)';
    
    const chaosJitter = mode === 'CHAOS' ? {
      x: [0, -5, 5, -5, 0],
      rotate: [0, -2, 2, -2, 0],
      opacity: [1, 0.8, 1, 0.9, 1]
    } : {};

    const chaosTransition = mode === 'CHAOS' ? {
      duration: 0.1,
      repeat: Infinity,
      ease: "linear"
    } : {};
    
    switch (strength) {
      case 'STRONG':
        return {
          className: baseColor,
          animate: { 
            scale: [1.5, 2.0, 1.5], 
            filter: [`drop-shadow(0 0 30px ${glowColor})`, `drop-shadow(0 0 80px ${glowColor})`, `drop-shadow(0 0 30px ${glowColor})`],
            ...chaosJitter
          },
          transition: { duration: 0.3, repeat: Infinity, ease: "easeInOut", ...chaosTransition }
        };
      case 'MEDIUM':
        return {
          className: baseColor,
          animate: { 
            scale: [1.1, 1.3, 1.1], 
            filter: [`drop-shadow(0 0 15px ${glowColor})`, `drop-shadow(0 0 35px ${glowColor})`, `drop-shadow(0 0 15px ${glowColor})`],
            ...chaosJitter
          },
          transition: { duration: 0.5, repeat: Infinity, ease: "easeInOut", ...chaosTransition }
        };
      case 'WEAK':
        return {
          className: `${baseColor} opacity-70`,
          animate: { 
            scale: [0.8, 0.9, 0.8], 
            filter: [`drop-shadow(0 0 5px ${glowColor})`, `drop-shadow(0 0 10px ${glowColor})`, `drop-shadow(0 0 5px ${glowColor})`],
            ...chaosJitter
          },
          transition: { duration: 0.7, repeat: Infinity, ease: "easeInOut", ...chaosTransition }
        };
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-8">
      {/* Game Header */}
      <div className="flex justify-between items-center bg-ink/60 backdrop-blur-xl border border-white/10 p-4 rounded-2xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-brand-purple/20 flex items-center justify-center text-brand-purple border border-brand-purple/30">
            <Activity size={24} />
          </div>
          <div>
            <h2 className="text-xl font-black text-white italic uppercase tracking-tighter">Signal Overload</h2>
            <div className="flex gap-2 items-center">
              <div className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Level {level}</div>
              <div className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${mode === 'CHAOS' ? 'bg-rose-500/10 border-rose-500/30 text-rose-500' : 'bg-brand-lime/10 border-brand-lime/30 text-brand-lime'} uppercase tracking-widest`}>
                {mode}
              </div>
              <div className={`text-[10px] font-mono px-1.5 py-0.5 rounded border flex items-center gap-1 ${
                connectionStatus === 'connected' ? 'bg-brand-lime/10 border-brand-lime/30 text-brand-lime' :
                connectionStatus === 'simulated' ? 'bg-orange-400/10 border-orange-400/30 text-orange-400' :
                'bg-yellow-400/10 border-yellow-400/30 text-yellow-400 animate-pulse'
              }`}>
                <span className={`w-1 h-1 rounded-full ${
                  connectionStatus === 'connected' ? 'bg-brand-lime' :
                  connectionStatus === 'simulated' ? 'bg-orange-400' : 'bg-yellow-400'
                }`} />
                {connectionStatus === 'connected' ? 'LIVE' : connectionStatus === 'simulated' ? 'SIM' : '...'}
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-8">
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Score</span>
            <span className="text-2xl font-black text-brand-lime tracking-tighter">{Math.floor(score)}</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Combo</span>
            <motion.span 
              key={combo}
              initial={{ scale: 1.5, color: '#bef264' }}
              animate={{ scale: 1, color: combo > 2 ? '#a78bfa' : '#ffffff' }}
              className={`text-2xl font-black tracking-tighter ${combo > 2 ? 'animate-pulse' : ''}`}
            >
              x{1 + combo * 0.5}
            </motion.span>
          </div>
        </div>
      </div>

      {/* Main Game Area */}
      <div className="bg-ink/60 backdrop-blur-2xl border border-white/10 rounded-[32px] overflow-hidden shadow-2xl relative min-h-[500px] flex flex-col items-center justify-center p-8">
        
        {/* Flash Overlay */}
        <AnimatePresence>
          {flashColor && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 pointer-events-none z-50"
              style={{ backgroundColor: flashColor }}
            />
          )}
        </AnimatePresence>

        {/* Background Effects */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand-purple/5 blur-[120px] rounded-full" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)]" />
        </div>

        <AnimatePresence mode="wait">
          {phase === 'START' && (
            <motion.div
              key="start"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center relative z-10 flex flex-col items-center max-w-lg"
            >
              <div className="w-24 h-24 rounded-full bg-brand-purple/10 border border-brand-purple/30 flex items-center justify-center mb-8">
                <Brain className="w-12 h-12 text-brand-purple animate-pulse" />
              </div>
              <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter mb-4">Signal Overload Test</h1>
              <p className="text-white/60 text-sm leading-relaxed mb-10 font-mono uppercase tracking-tight">
                Process rapid market signals. Identify the strongest bullish or bearish moves under extreme time pressure.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setPhase('MODE_SELECT')}
                  className="px-10 py-4 bg-brand-lime text-black font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all rounded-xl flex items-center gap-3 shadow-[0_0_30px_rgba(190,242,100,0.3)]"
                >
                  <Play className="w-5 h-5 fill-current" />
                  Enter Simulation
                </button>
                <button
                  onClick={() => setView('HOME')}
                  className="px-8 py-4 bg-white/5 border border-white/10 text-white/60 font-black uppercase tracking-widest hover:bg-white/10 hover:text-white transition-all rounded-xl"
                >
                  Back
                </button>
              </div>
            </motion.div>
          )}

          {phase === 'MODE_SELECT' && (
            <motion.div
              key="mode-select"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="text-center relative z-10 flex flex-col items-center w-full max-w-2xl"
            >
              <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter mb-12">Select Operation Mode</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                <button
                  onClick={() => startGame('TRAINING')}
                  disabled={entropyLoading}
                  className="group p-8 bg-ink/40 border border-white/10 rounded-3xl hover:border-brand-lime/50 transition-all text-left flex flex-col gap-4 relative overflow-hidden disabled:opacity-50"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Brain size={80} />
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-brand-lime/20 flex items-center justify-center text-brand-lime border border-brand-lime/30">
                    <Brain size={24} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">Training Mode</h3>
                    <p className="text-white/40 text-xs font-mono uppercase mt-2 leading-relaxed">
                      Slower flash speeds. Clear signals. Perfect for building foundational pattern recognition.
                    </p>
                  </div>
                  <div className="mt-4 flex items-center gap-2 text-brand-lime font-black uppercase tracking-widest text-[10px]">
                    <span>Select Training</span>
                    <Play size={10} className="fill-current" />
                  </div>
                </button>

                <button
                  onClick={() => startGame('CHAOS')}
                  disabled={entropyLoading}
                  className="group p-8 bg-ink/40 border border-white/10 rounded-3xl hover:border-rose-500/50 transition-all text-left flex flex-col gap-4 relative overflow-hidden disabled:opacity-50"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Zap size={80} />
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-rose-500/20 flex items-center justify-center text-rose-500 border border-rose-500/30">
                    <Zap size={24} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">Chaos Mode</h3>
                    <p className="text-white/40 text-xs font-mono uppercase mt-2 leading-relaxed">
                      Extreme speeds. Unstable visuals. Fake data distractors. Test your limits in market noise.
                    </p>
                  </div>
                  <div className="mt-4 flex items-center gap-2 text-rose-500 font-black uppercase tracking-widest text-[10px]">
                    <span>Select Chaos</span>
                    <Zap size={10} className="fill-current" />
                  </div>
                </button>
              </div>

              <button
                onClick={() => setPhase('START')}
                className="mt-12 text-white/40 hover:text-white font-mono uppercase text-[10px] tracking-widest transition-colors"
              >
                Go Back
              </button>
            </motion.div>
          )}

          {phase === 'FLASH' && signals.length > 0 && (
            <motion.div
              key={`signal-${currentSignalIndex}`}
              initial={{ opacity: 0, scale: 0.5, filter: 'blur(20px)' }}
              animate={{ 
                opacity: 1, 
                scale: 1, 
                filter: 'blur(0px)',
                x: mode === 'CHAOS' ? [0, -10, 10, -10, 0] : 0,
                y: mode === 'CHAOS' ? [0, 5, -5, 5, 0] : 0
              }}
              exit={{ opacity: 0, scale: 1.5, filter: 'blur(20px)' }}
              transition={{ 
                duration: mode === 'CHAOS' ? 0.15 : 0.25, 
                ease: "easeOut",
                x: { duration: 0.1, repeat: mode === 'CHAOS' ? Infinity : 0 },
                y: { duration: 0.1, repeat: mode === 'CHAOS' ? Infinity : 0 }
              }}
              className="relative z-10 flex flex-col items-center justify-center"
            >
              <div className="text-[10px] font-mono text-white/40 uppercase tracking-[0.5em] mb-8">
                Signal {currentSignalIndex + 1} / {signals.length}
              </div>
              
              <div className="flex flex-col items-center gap-8">
                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ 
                    y: 0, 
                    opacity: 1,
                    skewX: mode === 'CHAOS' ? [-5, 5, -5] : 0
                  }}
                  transition={{
                    skewX: { duration: 0.1, repeat: Infinity }
                  }}
                  className="flex items-center gap-4 text-7xl font-black italic tracking-tighter"
                  style={{ color: signals[currentSignalIndex].color, textShadow: `0 0 60px ${signals[currentSignalIndex].color}80, 0 0 20px ${signals[currentSignalIndex].color}` }}
                >
                  <AssetIcon 
                    symbol={signals[currentSignalIndex].symbol} 
                    className="w-16 h-16 md:w-20 md:h-20 rounded-full shrink-0 shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                    fallbackColor={signals[currentSignalIndex].color} 
                  />
                  <span>{signals[currentSignalIndex].symbol}</span>
                </motion.div>
                {signals[currentSignalIndex].livePrice !== '---' && (
                  <span className="text-3xl opacity-80 block mt-2 tracking-widest font-mono text-center" style={{ color: signals[currentSignalIndex].color }}>
                    @ ${signals[currentSignalIndex].livePrice}
                  </span>
                )}
                
                <motion.div {...getStrengthAnimation(signals[currentSignalIndex].strength, signals[currentSignalIndex].direction, signals[currentSignalIndex].isFake)}>
                  {signals[currentSignalIndex].direction === 'UP' ? (
                    <TrendingUp size={100} strokeWidth={3} />
                  ) : (
                    <TrendingDown size={100} strokeWidth={3} />
                  )}
                </motion.div>

                {signals[currentSignalIndex].isFake && mode === 'CHAOS' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 0.2, repeat: Infinity }}
                    className="absolute -top-4 -right-4 bg-rose-500 text-white text-[8px] font-bold px-1 rounded"
                  >
                    UNSTABLE
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}

          {phase === 'RECALL' && question && (
            <motion.div
              key="recall"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative z-10 w-full max-w-2xl flex flex-col items-center"
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-full border-4 border-brand-lime/30 flex items-center justify-center relative">
                  <svg className="absolute inset-0 w-full h-full -rotate-90">
                    <circle
                      cx="24" cy="24" r="20"
                      fill="none"
                      stroke="#bef264"
                      strokeWidth="4"
                      strokeDasharray="125.6"
                      strokeDashoffset={125.6 * (1 - timeLeft / (mode === 'CHAOS' ? Math.max(1.5, 3 - Math.floor(level / 2)) : Math.max(3, 8 - Math.floor(level / 2))))}
                      className="transition-all duration-1000 linear"
                    />
                  </svg>
                  <span className="text-xl font-black text-white">{timeLeft}</span>
                </div>
              </div>

              <h3 className="text-2xl sm:text-3xl font-black text-white uppercase italic tracking-tighter mb-12 text-center">
                {question.text}
              </h3>

              <div className="grid grid-cols-2 gap-4 w-full">
                {options.map((option, idx) => (
                  <motion.button
                    key={option.id}
                    initial={{ opacity: 0, y: 20, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    whileHover={{ scale: 1.05, boxShadow: `0 0 20px ${option.color}40` }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ delay: idx * 0.1, type: 'spring', stiffness: 300 }}
                    onClick={() => handleAnswer(option)}
                    className="p-6 bg-ink/80 border border-white/10 rounded-2xl flex flex-col items-center gap-3 transition-colors group relative overflow-hidden"
                  >
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300" style={{ backgroundColor: option.color }} />
                    <div 
                      className="text-3xl font-black italic tracking-tighter relative z-10"
                      style={{ color: option.color, textShadow: `0 0 20px ${option.color}80` }}
                    >
                      {option.symbol}
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {phase === 'RESULT' && (
            <motion.div
              key="result"
              initial={selectedAnswer?.id === correctAnswer?.id ? { opacity: 0, scale: 0.5 } : { opacity: 0, x: -20 }}
              animate={selectedAnswer?.id === correctAnswer?.id ? { opacity: 1, scale: 1 } : { opacity: 1, x: [-20, 20, -20, 20, 0] }}
              transition={selectedAnswer?.id === correctAnswer?.id ? { duration: 0.5, type: 'spring' } : { duration: 0.5, type: 'tween' }}
              className="relative z-10 flex flex-col items-center text-center"
            >
              {selectedAnswer?.id === correctAnswer?.id ? (
                <div className="flex flex-col items-center">
                  <div className="w-24 h-24 rounded-full bg-brand-lime/20 border border-brand-lime flex items-center justify-center mb-6 shadow-[0_0_50px_rgba(190,242,100,0.4)]">
                    <CheckCircle2 className="w-12 h-12 text-brand-lime" />
                  </div>
                  <h3 className="text-4xl font-black text-brand-lime uppercase italic tracking-tighter mb-2">Signal Verified</h3>
                  <p className="text-brand-lime/80 font-mono uppercase tracking-widest mb-8">Streak x{combo}</p>
                  
                  <button
                    onClick={nextLevel}
                    disabled={entropyLoading}
                    className="px-10 py-4 bg-brand-lime text-black font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all rounded-xl disabled:opacity-50"
                  >
                    {entropyLoading ? 'Decrypting...' : 'Next Level'}
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <motion.div 
                    animate={{ x: [-10, 10, -10, 10, 0] }}
                    transition={{ duration: 0.4 }}
                    className="w-24 h-24 rounded-full bg-rose-500/20 border border-rose-500 flex items-center justify-center mb-6 shadow-[0_0_50px_rgba(244,63,94,0.4)]"
                  >
                    <XCircle className="w-12 h-12 text-rose-500" />
                  </motion.div>
                  <h3 className="text-4xl font-black text-rose-500 uppercase italic tracking-tighter mb-2">Signal Lost</h3>
                  <p className="text-white/60 font-mono uppercase tracking-widest mb-8">
                    {selectedAnswer === null ? 'Timeout' : `Correct answer was ${correctAnswer?.symbol}`}
                  </p>
                  
                  <div className="flex gap-4">
                    <button
                      onClick={() => startGame(mode)}
                      className="px-10 py-4 bg-brand-purple text-white font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all rounded-xl flex items-center gap-2"
                    >
                      <RotateCcw size={18} />
                      Restart
                    </button>
                    <button
                      onClick={() => setView('HOME')}
                      className="px-8 py-4 bg-white/5 border border-white/10 text-white/60 font-black uppercase tracking-widest hover:bg-white/10 hover:text-white transition-all rounded-xl"
                    >
                      Exit
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <GameInstructions
        isOpen={showInstructions && phase === 'START'}
        onClose={() => setShowInstructions(false)}
        title="Signal Overload"
        description="Process rapid Pyth market signals. Identify the strongest bullish or bearish moves under extreme time pressure."
        instructions={[
          "Watch the lightning-fast flashes of Pyth Assets.",
          "Note the asset, direction (UP/DOWN), and live price.",
          "Identify the STRONGEST signal shown in the sequence.",
          "In chaos mode, beware of unstable fake signals!"
        ]}
        accentColor="#7c3aed"
      />
    </div>
  );
};

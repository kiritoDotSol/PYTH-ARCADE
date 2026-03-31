import React, { useEffect, useState } from 'react';
import { useGameStore } from '../store';
import { usePythPrices } from '../hooks/usePythPrices';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { socketService } from '../lib/socket';
import { Gamepad2, BarChart3, Trophy, TrendingUp, TrendingDown } from 'lucide-react';

// New Modular Components
import { HeaderBar } from './game/HeaderBar';
import { InfoPanel } from './game/InfoPanel';
import { ControlPanel } from './game/ControlPanel';
import { LeaderboardPanel } from './game/LeaderboardPanel';
import { ResolvingOverlay } from './game/ResolvingOverlay';
import { GameOverOverlay } from './game/GameOverOverlay';
import { MultiplayerOverlay } from './game/MultiplayerOverlay';
import { GameViewport } from './GameViewport';
import { GameInstructions } from './GameInstructions';

type MobileView = 'GAME' | 'STATS' | 'RANK';

export const GameUI: React.FC = () => {
  const prices = usePythPrices();
  const { 
    score, timeLeft, status, gameMode, highScore, xp, 
    predictions, setRoomId, setStatus, setTimeLeft, 
    addXP, addScoreToHistory, setScore, setCombo, 
    setMaxCombo, setHighScore 
  } = useGameStore();

  const [availableRooms, setAvailableRooms] = useState<{ id: string, playerCount: number }[]>([]);
  const [showMultiplayer, setShowMultiplayer] = useState(false);
  const [resolvingIndex, setResolvingIndex] = useState(-1);
  const [tempScore, setTempScore] = useState(0);
  const [tempCombo, setTempCombo] = useState(0);
  const [tempMaxCombo, setTempMaxCombo] = useState(0);
  const [mobileView, setMobileView] = useState<MobileView>('GAME');
  const [showInstructions, setShowInstructions] = useState(true);

  // Socket Connection & Room Management
  useEffect(() => {
    const socket = socketService.connect();
    socket.emit("get-rooms");
    
    socket.on("rooms-list", (rooms) => setAvailableRooms(rooms));
    socket.on("room-joined", (id) => {
      setRoomId(id);
      setShowMultiplayer(false);
    });
    socket.on("error", (msg) => alert(msg));

    return () => {
      socket.off("rooms-list");
      socket.off("room-joined");
      socket.off("error");
    };
  }, [setRoomId]);

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
      {/* 1. Header Bar */}
      <HeaderBar />

      {/* Ticker Tape (Decorative) */}
      <div className="bg-brand-purple/5 border-b border-white/10 h-6 overflow-hidden flex items-center shrink-0">
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

      {/* 2. Main Layout Grid */}
      <div className="flex-1 relative overflow-hidden pointer-events-auto">
        <div className="max-w-7xl mx-auto px-4 py-4 md:py-8 h-full flex flex-col">
          <div className="grid grid-cols-1 md:grid-cols-12 lg:grid-cols-12 gap-6 flex-1 min-h-0">
            
            {/* Left Column: Info Panel (Desktop/Tablet) */}
            <div className={`
              ${mobileView === 'STATS' ? 'block' : 'hidden'} 
              lg:block lg:col-span-3 h-full overflow-y-auto custom-scrollbar
            `}>
              <InfoPanel />
            </div>

            {/* Center Column: Main Game Area */}
            <div className={`
              ${mobileView === 'GAME' ? 'flex' : 'hidden lg:flex'} 
              col-span-1 md:col-span-8 lg:col-span-6 flex-col gap-6 h-full overflow-y-auto custom-scrollbar
            `}>
              <AnimatePresence mode="wait">
                {status === 'START' && (
                  <motion.div
                    key="start-panel"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.05 }}
                    className="flex flex-col gap-6"
                  >
                    {/* Hero Section */}
                    <div className="bg-ink/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-10 relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-full h-full bg-brand-purple/5 pointer-events-none" />
                      <div className="flex items-center gap-2 mb-4 sm:mb-6">
                        <div className="w-8 h-1 bg-brand-lime" />
                        <span className="text-[10px] font-mono text-brand-lime uppercase tracking-[0.3em]">System v2.5</span>
                      </div>
                      <h1 className="text-4xl sm:text-6xl font-black text-white leading-[0.85] tracking-tighter mb-4 sm:mb-6 italic uppercase">
                        PLICE<br />
                        <span className="text-brand-purple">IT</span>
                      </h1>
                      <p className="text-white/60 text-xs sm:text-sm leading-relaxed max-w-md">
                        Master the markets with Pyth Network. Slice bullish assets up and bearish assets down in high-frequency trading simulation.
                      </p>
                    </div>

                    {/* Control Panel */}
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
                  <div className="flex items-center justify-center h-full">
                    <GameOverOverlay />
                  </div>
                )}

                {status === 'PLAYING' && (
                  <GameViewport />
                )}
              </AnimatePresence>
            </div>

            {/* Right Column: Leaderboard Panel */}
            <div className={`
              ${mobileView === 'RANK' ? 'block' : 'hidden'} 
              md:block md:col-span-4 lg:col-span-3 h-full overflow-y-auto custom-scrollbar
            `}>
              <LeaderboardPanel />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Bar */}
      <div className="lg:hidden bg-ink/90 backdrop-blur-xl border-t border-white/10 px-6 py-3 flex justify-between items-center pointer-events-auto shrink-0">
        {[
          { id: 'STATS', icon: BarChart3, label: 'Stats' },
          { id: 'GAME', icon: Gamepad2, label: 'Game' },
          { id: 'RANK', icon: Trophy, label: 'Rank' }
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setMobileView(item.id as MobileView)}
            className={`flex flex-col items-center gap-1 transition-all ${
              mobileView === item.id ? 'text-brand-lime' : 'text-white/40'
            }`}
          >
            <item.icon size={20} className={mobileView === item.id ? 'animate-pulse' : ''} />
            <span className="text-[9px] font-mono uppercase tracking-widest">{item.label}</span>
          </button>
        ))}
      </div>

      {/* Footer Hints (Desktop Only) */}
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

      {/* Multiplayer Overlay */}
      <AnimatePresence>
        {showMultiplayer && (
          <MultiplayerOverlay 
            onClose={() => setShowMultiplayer(false)} 
            availableRooms={availableRooms} 
          />
        )}
      </AnimatePresence>

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

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Play, RefreshCw, Zap, TrendingDown, TrendingUp, AlertTriangle, Home } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useGameStore } from '../../store';
import { usePythPrices, usePythConnection } from '../../hooks/usePythPrices';
import { useEntropyRandomness } from '../../hooks/useEntropyRandomness';
import { hexToSeeds, mulberry32 } from '../../utils/prng';
import { AssetIcon } from '../AssetIcon';
import { PYTH_ASSETS } from '../../pyth';
import { GameInstructions } from '../GameInstructions';
// --- Types ---
type GamePhase = 'INPUT' | 'RACING' | 'FINISHED';

interface Racer {
  id: string;
  name: string;
  asset: string;
  color: string;
  progress: number; // 0 to 100
  speed: number;
  event?: 'PUMP' | 'DUMP' | null;
  eventTimer?: number;
  eventAccumulator: number;
  simulatedPrice: number;
  priceDelta: number;
  startPrice: number;
}

export const PythRace: React.FC = () => {
  const { setView } = useGameStore();
  const prices = usePythPrices();
  const connectionStatus = usePythConnection();
  const [phase, setPhase] = useState<GamePhase>('INPUT');
  const [namesInput, setNamesInput] = useState('Alice\nBob\nCharlie\nDiana');
  const [racers, setRacers] = useState<Racer[]>([]);
  const [winner, setWinner] = useState<Racer | null>(null);
  const [globalEvent, setGlobalEvent] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(60);
  const [selectedDuration, setSelectedDuration] = useState<30 | 60>(60);
  const [showInstructions, setShowInstructions] = useState(true);

  const { requestEntropy, loading: entropyLoading } = useEntropyRandomness();
  const [prng, setPrng] = useState<(() => number) | null>(null);

  const requestRef = useRef<number>();
  const lastTimeRef = useRef<number>();
  const racersRef = useRef<Racer[]>([]);
  const pricesRef = useRef(prices);
  const startTimeRef = useRef<number | null>(null);
  const durationRef = useRef<number>(60);

  useEffect(() => {
    pricesRef.current = prices;
  }, [prices]);

  // --- Input Phase ---
  const handleStartRace = async () => {
    const names = namesInput
      .split('\n')
      .map(n => n.trim())
      .filter(n => n.length > 0);

    if (names.length < 2 || names.length > PYTH_ASSETS.length) {
      alert(`Please enter between 2 and ${PYTH_ASSETS.length} names to ensure unique assets for each racer.`);
      return;
    }

    const entropyStr = await requestEntropy();
    const seeds = hexToSeeds(entropyStr || '0x42');
    const getRand = mulberry32(seeds[0]);
    setPrng(() => getRand);

    // Shuffle assets using PRNG
    const shuffledAssets = [...PYTH_ASSETS].sort(() => getRand() - 0.5);

    const initialRacers: Racer[] = names.map((name, index) => {
      const asset = shuffledAssets[index];
      const initialPrice = pricesRef.current[asset.symbol]?.price || asset.basePrice;
      return {
        id: `racer-${index}`,
        name,
        asset: asset.symbol,
        color: asset.color,
        progress: 0,
        speed: 0,
        simulatedPrice: initialPrice,
        priceDelta: 0,
        startPrice: initialPrice,
        eventAccumulator: 0,
      };
    });

    setRacers(initialRacers);
    racersRef.current = initialRacers;
    durationRef.current = selectedDuration;
    setWinner(null);
    setGlobalEvent(null);
    setTimeLeft(selectedDuration);
    startTimeRef.current = null;
    setPhase('RACING');
  };

  // --- Racing Loop ---
  const updateRace = (time: number) => {
    if (!lastTimeRef.current) {
      lastTimeRef.current = time;
    }
    if (!startTimeRef.current) {
      startTimeRef.current = time;
    }

    const deltaTime = (time - lastTimeRef.current) / 1000; // in seconds
    lastTimeRef.current = time;

    const elapsedSeconds = (time - startTimeRef.current) / 1000;
    const remaining = Math.max(0, durationRef.current - elapsedSeconds);
    setTimeLeft(Math.ceil(remaining));

    let currentRacers = [...racersRef.current];
    let raceFinished = false;
    let newWinner: Racer | null = null;

    // Check if time is up
    if (remaining <= 0) {
      raceFinished = true;
      // Find the racer with the most progress
      newWinner = currentRacers.reduce((prev, current) =>
        (prev.progress > current.progress) ? prev : current
      );
    }

    const maxProgress = Math.max(...currentRacers.map(r => r.progress));
    const inSuspenseZone = maxProgress > 85 || remaining < 10;

    // Use established PRNG or fallback
    const rand = prng ? prng() : Math.random();

    // Random global events
    if (rand < 0.01 && !inSuspenseZone) {
      const isPump = (prng ? prng() : Math.random()) > 0.5;
      const targetIndex = Math.floor((prng ? prng() : Math.random()) * currentRacers.length);
      currentRacers[targetIndex].event = isPump ? 'PUMP' : 'DUMP';
      currentRacers[targetIndex].eventTimer = 2; // 2 seconds
      setGlobalEvent(`${currentRacers[targetIndex].asset} ${isPump ? 'PUMP 🚀' : 'DUMP 💥'}`);
      setTimeout(() => setGlobalEvent(null), 2000);
    }

    currentRacers = currentRacers.map(racer => {
      // Base progress based on time (reaches 80% at 60 seconds)
      const timeProgress = (elapsedSeconds / 60) * 80;

      // Pyth Price Integration
      const pythData = pricesRef.current[racer.asset];
      let priceChange = 0;
      let newPrice = racer.simulatedPrice;

      if (pythData) {
        // Use real price data
        newPrice = pythData.price;
        priceChange = pythData.delta;
      } else {
        // Fallback to simulated price
        priceChange = ((prng ? prng() : Math.random()) - 0.5) * (racer.simulatedPrice * 0.001);
        newPrice = racer.simulatedPrice + priceChange;
      }

      // Calculate cumulative performance percentage
      const performancePct = (newPrice - racer.startPrice) / racer.startPrice;

      // Multiplier to make small crypto moves visible on the 0-100 progress scale
      // 0.1% move (0.001) * 20000 = 20 progress points
      const performanceProgress = performancePct * 20000;

      // Apply random events (PUMP/DUMP) as artificial performance boosts
      let currentEventAccumulator = racer.eventAccumulator;
      if (racer.eventTimer && racer.eventTimer > 0) {
        racer.eventTimer -= deltaTime;
        if (racer.event === 'PUMP') currentEventAccumulator += 10 * deltaTime;
        if (racer.event === 'DUMP') currentEventAccumulator -= 10 * deltaTime;
        if (racer.eventTimer <= 0) racer.event = null;
      }
      // Total progress is time + performance + events + volatility jitter
      const volatility = pythData?.volatility || 0.1;
      const jitter = ((prng ? prng() : Math.random()) - 0.5) * volatility * 2;

      let newProgress = timeProgress + performanceProgress + currentEventAccumulator + jitter;

      // Ensure progress doesn't go below 0
      newProgress = Math.max(0, newProgress);

      if (raceFinished && newWinner && racer.id === newWinner.id) {
        // Ensure the winner's data is updated with the latest price
        newWinner = { ...racer, progress: newProgress, simulatedPrice: newPrice, priceDelta: priceChange, eventAccumulator: currentEventAccumulator };
      }

      return {
        ...racer,
        progress: newProgress,
        speed: Math.max(0, performanceProgress), // Use performance for speed indicator
        simulatedPrice: newPrice,
        priceDelta: priceChange,
        eventAccumulator: currentEventAccumulator
      };
    });

    racersRef.current = currentRacers;
    setRacers(currentRacers);

    if (raceFinished && newWinner) {
      setWinner(newWinner);
      setPhase('FINISHED');
      triggerConfetti();
    } else {
      requestRef.current = requestAnimationFrame(updateRace);
    }
  };

  useEffect(() => {
    if (phase === 'RACING') {
      lastTimeRef.current = undefined;
      requestRef.current = requestAnimationFrame(updateRace);
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [phase]);

  const triggerConfetti = () => {
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#bef264', '#7c3aed', '#0ea5e9']
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#bef264', '#7c3aed', '#0ea5e9']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  };

  const handleReplay = () => {
    setPhase('INPUT');
  };

  return (
    <div className="w-full max-w-5xl mx-auto bg-ink/90 border border-white/10 rounded-xl overflow-hidden shadow-2xl flex flex-col h-[80vh]">
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-white/10 bg-black/50 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Zap className="w-6 h-6 text-brand-lime" />
          <h2 className="text-2xl font-black text-white italic tracking-tighter uppercase">PYTH RACE</h2>
          <span className={`text-[9px] font-mono px-2 py-0.5 rounded border flex items-center gap-1 ${connectionStatus === 'connected' ? 'bg-brand-lime/10 border-brand-lime/30 text-brand-lime' :
            connectionStatus === 'simulated' ? 'bg-orange-400/10 border-orange-400/30 text-orange-400' :
              'bg-yellow-400/10 border-yellow-400/30 text-yellow-400 animate-pulse'
            }`}>
            <span className={`w-1 h-1 rounded-full ${connectionStatus === 'connected' ? 'bg-brand-lime' :
              connectionStatus === 'simulated' ? 'bg-orange-400' : 'bg-yellow-400'
              }`} />
            {connectionStatus === 'connected' ? 'LIVE' : connectionStatus === 'simulated' ? 'SIM' : '...'}
          </span>
        </div>
        <div className="flex items-center gap-4">
          {(phase === 'RACING' || phase === 'FINISHED') && (
            <div className={`px-4 py-1.5 rounded-lg border font-mono font-black text-lg ${timeLeft <= 10 ? 'bg-red-500/20 border-red-500 text-red-500 animate-pulse' : 'bg-white/5 border-white/20 text-white'
              }`}>
              {timeLeft}s
            </div>
          )}
          {globalEvent && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="px-4 py-1 rounded-full bg-white/10 border border-white/20 text-sm font-mono font-bold text-white animate-pulse"
            >
              {globalEvent}
            </motion.div>
          )}
          <button
            onClick={() => setView('HOME')}
            className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-mono text-white transition-colors uppercase tracking-widest"
          >
            <Home className="w-3 h-3" />
            <span className="hidden sm:inline">Exit to Home</span>
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden relative flex flex-col">
        {phase === 'INPUT' && (
          <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 overflow-y-auto">
            <div className="w-full max-w-xl mx-auto bg-black/40 border border-white/10 rounded-xl backdrop-blur-sm p-6 md:p-8 lg:p-10 pb-6 md:pb-8 flex flex-col gap-6 overflow-hidden">
              <div className="flex flex-col gap-2">
                <h3 className="text-xl font-bold text-white uppercase tracking-wider">Enter Racers</h3>
                <p className="text-xs text-zinc-400 font-mono">One name per line (2-50 racers). Each will be assigned a random crypto asset.</p>
              </div>

              <textarea
                value={namesInput}
                onChange={(e) => setNamesInput(e.target.value)}
                className="w-full h-48 bg-ink border border-white/20 rounded-lg p-4 text-white font-mono text-sm focus:outline-none focus:border-brand-lime transition-colors resize-none"
                placeholder="Alice&#10;Bob&#10;Charlie"
              />

              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Race Duration</label>
                <div className="grid grid-cols-2 gap-4">
                  {(['30', '60'] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setSelectedDuration(parseInt(t) as 30 | 60)}
                      className={`px-6 py-3 min-h-[44px] rounded border font-mono font-bold transition-all ${selectedDuration === parseInt(t)
                        ? 'bg-brand-lime border-brand-lime text-black'
                        : 'bg-white/5 border-white/10 text-white/40 hover:border-white/30'
                        }`}
                    >
                      {t} Seconds
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap md:flex-nowrap gap-4 mt-4">
                <button
                  onClick={() => {
                    const names = namesInput.split('\n').filter(n => n.trim().length > 0);
                    setNamesInput(names.sort(() => Math.random() - 0.5).join('\n'));
                  }}
                  className="w-full md:w-1/3 px-6 py-3 min-h-[44px] bg-white/10 text-white font-black uppercase tracking-widest rounded-lg hover:bg-white hover:text-black transition-all flex items-center justify-center gap-2"
                >
                  <RefreshCw className={`w-5 h-5 ${entropyLoading ? 'animate-spin' : ''}`} />
                  Shuffle
                </button>
                <button
                  onClick={handleStartRace}
                  disabled={entropyLoading}
                  className="w-full md:flex-1 px-6 py-3 min-h-[44px] bg-brand-lime text-black font-black uppercase tracking-widest rounded-lg hover:bg-white transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Play className="w-5 h-5 fill-current" />
                  {entropyLoading ? 'Fetching Entropy...' : 'Start Race'}
                </button>
              </div>
            </div>
          </div>
        )}

        {(phase === 'RACING' || phase === 'FINISHED') && (
          <div className="flex-1 relative flex flex-col p-4 sm:p-8 overflow-y-auto custom-scrollbar">
            {/* Track Background */}
            <div className="absolute inset-0 pointer-events-none opacity-20 bg-[linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:10%_100%]" />

            {/* Finish Line */}
            <div className="absolute top-0 bottom-0 right-[10%] w-2 bg-gradient-to-b from-transparent via-white/50 to-transparent z-0 flex flex-col justify-center items-center">
              <div className="h-full w-full border-l-2 border-dashed border-white/30" />
            </div>

            <div className="relative z-10 flex flex-col gap-2 min-h-full pb-8">
              {racers.map((racer) => (
                <div key={racer.id} className="relative h-12 sm:h-16 w-full bg-black/20 rounded-r-full border-y border-r border-white/5 flex items-center">

                  {/* Trail */}
                  <div
                    className="absolute left-0 top-1/2 -translate-y-1/2 h-1 rounded-r-full opacity-50 transition-all duration-100"
                    style={{
                      width: `${racer.progress * 0.9}%`,
                      backgroundColor: racer.color,
                      boxShadow: `0 0 10px ${racer.color}`
                    }}
                  />

                  {/* Racer Element */}
                  <motion.div
                    className="absolute top-0 bottom-0 flex items-center"
                    style={{ left: `${Math.min(95, racer.progress * 0.9)}%` }} // Scale to 90% so it stops at finish line, max 95%
                    animate={phase === 'RACING' ? {
                      y: [0, -2, 2, 0],
                    } : {}}
                    transition={{
                      duration: 0.3 + Math.random() * 0.2,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                  >
                    {/* Avatar / Vehicle */}
                    <div className="relative flex items-center">
                      <AssetIcon 
                        symbol={racer.asset}
                        className="w-8 h-8 sm:w-10 sm:h-10 rounded-full shadow-[0_0_15px_rgba(255,255,255,0.2)] z-10"
                        fallbackColor={racer.color}
                      />

                      {/* Name Tag & Price */}
                      <div className="absolute left-full ml-2 whitespace-nowrap bg-black/80 px-2 py-1 rounded text-[10px] sm:text-xs font-mono text-white border border-white/10 flex flex-col">
                        <span className="font-bold">{racer.name}</span>
                        <span className={racer.priceDelta >= 0 ? 'text-brand-lime' : 'text-red-500'}>
                          ${racer.simulatedPrice < 10 ? racer.simulatedPrice.toFixed(4) : racer.simulatedPrice.toFixed(2)}
                        </span>
                      </div>

                      {/* Event Indicator */}
                      {racer.event && (
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap">
                          {racer.event === 'PUMP' ? (
                            <TrendingUp className="w-5 h-5 text-brand-lime animate-bounce" />
                          ) : (
                            <TrendingDown className="w-5 h-5 text-red-500 animate-bounce" />
                          )}
                        </div>
                      )}
                    </div>
                  </motion.div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Winner Overlay */}
        <AnimatePresence>
          {phase === 'FINISHED' && winner && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.8, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="bg-ink border border-white/20 p-8 rounded-2xl max-w-md w-full text-center shadow-[0_0_50px_rgba(0,0,0,0.5)]"
                style={{ boxShadow: `0 0 50px ${winner.color}40` }}
              >
                <Trophy className="w-16 h-16 mx-auto mb-4" style={{ color: winner.color }} />
                <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-2">
                  {winner.name} WINS!
                </h2>
                <p className="text-zinc-400 font-mono text-sm mb-8">
                  Riding the <span style={{ color: winner.color }} className="font-bold">{winner.asset}</span> wave to victory.
                </p>

                <button
                  onClick={handleReplay}
                  className="w-full py-4 bg-white/10 text-white font-black uppercase tracking-widest rounded-lg hover:bg-white hover:text-black transition-all flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-5 h-5" />
                  Play Again
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <GameInstructions
        isOpen={showInstructions && phase === 'INPUT'}
        onClose={() => setShowInstructions(false)}
        title="Pyth Race"
        description="Enter participant names and watch them race across the screen, fueled by real-time financial data."
        instructions={[
          "Enter one racer name per line.",
          "Select a race duration (30 or 60 seconds).",
          "Each racer gets randomly paired with a live Pyth Network crypto asset.",
          "Racers accelerate when their assigned asset pumps in real-time."
        ]}
        accentColor="#f43f5e"
      />
    </div>
  );
};

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TrendingUp, TrendingDown, RotateCcw, Play, CheckCircle2, XCircle, Brain, Timer, Activity, Zap, Shield, ArrowLeft, Loader2 } from 'lucide-react';
import { GameInstructions } from '../GameInstructions';
import { AssetIcon } from '../AssetIcon';
import { useGameStore } from '../../store';
import { useEntropyRandomness } from '../../hooks/useEntropyRandomness';
import { hexToSeeds, mulberry32 } from '../../utils/prng';

interface Asset {
  id: string;
  name: string;
  symbol: string;
  color: string;
}

const ASSETS: Asset[] = [
  { id: 'btc', name: 'Bitcoin', symbol: 'BTC', color: '#F7931A' },
  { id: 'eth', name: 'Ethereum', symbol: 'ETH', color: '#627EEA' },
  { id: 'sol', name: 'Solana', symbol: 'SOL', color: '#14F195' },
  { id: 'ada', name: 'Cardano', symbol: 'ADA', color: '#0033AD' },
  { id: 'dot', name: 'Polkadot', symbol: 'DOT', color: '#E6007A' },
  { id: 'avax', name: 'Avalanche', symbol: 'AVAX', color: '#E84142' },
  { id: 'matic', name: 'Polygon', symbol: 'MATIC', color: '#8247E5' },
  { id: 'link', name: 'Chainlink', symbol: 'LINK', color: '#2A5ADA' },
];

type Direction = 'UP' | 'DOWN';
type GameState = 'START' | 'PREVIEW' | 'GUESS' | 'RESULT';

interface GameAsset extends Asset {
  direction: Direction;
  userGuess?: Direction;
}

export const MemoryGame: React.FC = () => {
  const { setView, addXP, setScore: setGlobalScore } = useGameStore();
  const [gameState, setGameState] = useState<GameState>('START');
  const [gameAssets, setGameAssets] = useState<GameAsset[]>([]);
  const [timeLeft, setTimeLeft] = useState(2);
  const [score, setScore] = useState(0);
  
  const { requestEntropy, loading } = useEntropyRandomness();

  useEffect(() => {
    if (gameState === 'RESULT') {
      const xpEarned = score * 50;
      addXP(xpEarned);
      setGlobalScore(score * 100);
    }
  }, [gameState, score, addXP, setGlobalScore]);

  const startGame = useCallback(async () => {
    const entropyHex = await requestEntropy();
    const seeds = hexToSeeds(entropyHex || '0x42');
    const getRand = mulberry32(seeds[0]);

    // Pick 6 random assets
    const shuffled = [...ASSETS].sort(() => getRand() - 0.5);
    const selected = shuffled.slice(0, 6).map(asset => ({
      ...asset,
      direction: getRand() > 0.5 ? 'UP' as const : 'DOWN' as const,
    }));
    setGameAssets(selected);
    setGameState('PREVIEW');
    setTimeLeft(2);
  }, [requestEntropy]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (gameState === 'PREVIEW' && timeLeft > 0) {
      timer = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (gameState === 'PREVIEW' && timeLeft === 0) {
      setGameState('GUESS');
    }
    return () => clearTimeout(timer);
  }, [gameState, timeLeft]);

  const handleGuess = (id: string) => {
    if (gameState !== 'GUESS') return;
    setGameAssets(prev => prev.map(asset => {
      if (asset.id === id) {
        const nextGuess: Direction = asset.userGuess === 'UP' ? 'DOWN' : 'UP';
        return { ...asset, userGuess: nextGuess };
      }
      return asset;
    }));
  };

  const checkResults = () => {
    let correct = 0;
    gameAssets.forEach(asset => {
      if (asset.userGuess === asset.direction) {
        correct++;
      }
    });
    setScore(correct);
    setGameState('RESULT');
  };

  const resetGame = () => {
    setGameState('START');
    setGameAssets([]);
    setScore(0);
    setView('HOME');
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-8">
      {/* Game Card */}
      <div className="bg-background/60 backdrop-blur-2xl border border-border rounded-[32px] overflow-hidden shadow-2xl relative">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-purple/10 blur-[100px] -mr-32 -mt-32 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-lime/10 blur-[100px] -ml-32 -mb-32 pointer-events-none" />

        {/* Header */}
        <div className="px-8 py-6 border-b border-border flex justify-between items-center bg-white/5">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-brand-purple/20 flex items-center justify-center text-brand-purple border border-brand-purple/30">
              <Brain size={20} />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-mono text-foreground/40 uppercase tracking-[0.3em]">Mission Type</span>
              <h2 className="text-xl font-black text-foreground italic uppercase tracking-tighter">Memory Game</h2>
            </div>
          </div>

          <div className="flex items-center gap-6">
            {gameState === 'PREVIEW' && (
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-mono text-foreground/40 uppercase tracking-widest mb-1">Memorize</span>
                <div className="flex items-center gap-2 text-brand-lime">
                  <Timer className="w-4 h-4 animate-pulse" />
                  <span className="font-mono font-bold text-2xl tracking-tighter">{timeLeft}S</span>
                </div>
              </div>
            )}
            {gameState === 'RESULT' && (
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-mono text-foreground/40 uppercase tracking-widest mb-1">Extraction Success</span>
                <div className="flex items-center gap-2 text-brand-lime">
                  <span className="font-mono font-bold text-2xl tracking-tighter">{score} / {gameAssets.length}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main Game Area */}
        <div className="p-8 sm:p-12 min-h-[400px] flex flex-col items-center justify-center relative z-10">
          <AnimatePresence mode="wait">
            {gameState === 'START' && (
              <motion.div
                key="start"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                className="text-center flex flex-col items-center"
              >
                <div className="w-20 h-20 rounded-full bg-brand-lime/10 border border-brand-lime/20 flex items-center justify-center mb-8">
                  <Activity className="w-10 h-10 text-brand-lime animate-pulse" />
                </div>
                <h3 className="text-3xl font-black text-foreground uppercase italic tracking-tighter mb-4">Neural Link Ready</h3>
                <p className="text-foreground/60 text-sm leading-relaxed max-w-md mb-10 font-mono uppercase tracking-tight">
                  Memory game
                </p>
                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                  <button
                    onClick={startGame}
                    disabled={loading}
                    className="group relative px-10 py-4 bg-brand-lime text-black font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all rounded-xl flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5 fill-current" />}
                    {loading ? 'Decrypting Entropy...' : 'Initialize Dash'}
                  </button>
                  <button
                    onClick={() => setView('HOME')}
                    className="px-10 py-4 bg-white/5 border border-border text-foreground/60 font-black uppercase tracking-widest hover:bg-white/10 hover:text-foreground transition-all rounded-xl"
                  >
                    Abort Mission
                  </button>
                </div>
              </motion.div>
            )}

            {(gameState === 'PREVIEW' || gameState === 'GUESS' || gameState === 'RESULT') && (
              <motion.div
                key="game-grid"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-2 md:grid-cols-3 gap-6 w-full"
              >
                {gameAssets.map((asset, index) => (
                  <motion.div
                    key={asset.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleGuess(asset.id)}
                    className={`
                      relative p-6 rounded-2xl border transition-all duration-300 flex flex-col items-center gap-4 group
                      ${gameState === 'GUESS' ? 'cursor-pointer bg-white/5 border-border hover:border-brand-purple/50 hover:bg-brand-purple/5' : ''}
                      ${gameState === 'RESULT' 
                        ? (asset.userGuess === asset.direction 
                          ? 'bg-brand-lime/10 border-brand-lime/30' 
                          : 'bg-rose-500/10 border-rose-500/30') 
                        : 'bg-white/5 border-border'}
                    `}
                  >
                    <AssetIcon 
                      symbol={asset.symbol}
                      className="w-12 h-12 rounded-xl shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                      fallbackColor={asset.color}
                    />
                    <div className="text-center">
                      <div className="text-[10px] font-mono text-foreground/40 uppercase tracking-widest mb-0.5">{asset.name}</div>
                      <div className="text-lg font-black text-foreground tracking-tighter uppercase italic">{asset.symbol}</div>
                    </div>

                    <div className="h-16 flex items-center justify-center">
                      {gameState === 'PREVIEW' && (
                        <motion.div
                          initial={{ scale: 0, rotate: -45 }}
                          animate={{ scale: 1, rotate: 0 }}
                          className={asset.direction === 'UP' ? 'text-brand-lime' : 'text-rose-500'}
                        >
                          {asset.direction === 'UP' ? <TrendingUp size={40} /> : <TrendingDown size={40} />}
                        </motion.div>
                      )}

                      {gameState === 'GUESS' && (
                        <div className="flex flex-col items-center gap-2">
                          {asset.userGuess ? (
                            <motion.div 
                              initial={{ scale: 0.8 }}
                              animate={{ scale: 1 }}
                              className={asset.userGuess === 'UP' ? 'text-brand-lime' : 'text-rose-500'}
                            >
                              {asset.userGuess === 'UP' ? <TrendingUp size={40} /> : <TrendingDown size={40} />}
                            </motion.div>
                          ) : (
                            <div className="w-10 h-10 rounded-full border-2 border-dashed border-border flex items-center justify-center group-hover:border-white/30 transition-colors">
                              <span className="text-xs font-mono text-foreground/20">?</span>
                            </div>
                          )}
                          <span className="text-[8px] font-mono uppercase text-foreground/20 tracking-widest">Toggle Trend</span>
                        </div>
                      )}

                      {gameState === 'RESULT' && (
                        <div className="flex flex-col items-center gap-3">
                          <div className="flex items-center gap-6">
                            <div className="flex flex-col items-center">
                              <span className="text-[8px] font-mono text-foreground/30 uppercase tracking-widest mb-1">Target</span>
                              <div className={asset.direction === 'UP' ? 'text-brand-lime' : 'text-rose-500'}>
                                {asset.direction === 'UP' ? <TrendingUp size={24} /> : <TrendingDown size={24} />}
                              </div>
                            </div>
                            <div className="flex flex-col items-center">
                              <span className="text-[8px] font-mono text-foreground/30 uppercase tracking-widest mb-1">Guess</span>
                              <div className={asset.userGuess === asset.direction ? 'text-brand-lime' : 'text-rose-500'}>
                                {asset.userGuess === 'UP' ? <TrendingUp size={24} /> : <TrendingDown size={24} />}
                              </div>
                            </div>
                          </div>
                          {asset.userGuess === asset.direction ? (
                            <div className="flex items-center gap-1.5 text-brand-lime">
                              <CheckCircle2 size={14} />
                              <span className="text-[10px] font-mono font-bold uppercase">Synced</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 text-rose-500">
                              <XCircle size={14} />
                              <span className="text-[10px] font-mono font-bold uppercase">Slippage</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer Controls */}
        <div className="px-8 py-6 border-t border-border bg-white/5 flex justify-center gap-4">
          {gameState === 'GUESS' && (
            <button
              onClick={checkResults}
              className="px-12 py-3 bg-brand-lime text-black font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all rounded-xl shadow-[0_0_20px_rgba(190,242,100,0.2)]"
            >
              Verify Trends
            </button>
          )}
          {gameState === 'RESULT' && (
            <button
              onClick={startGame}
              className="px-12 py-3 bg-brand-purple text-foreground font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all rounded-xl flex items-center gap-2 shadow-[0_0_20px_rgba(124,58,237,0.2)]"
            >
              <RotateCcw size={18} />
              Re-Initialize
            </button>
          )}
          {(gameState === 'GUESS' || gameState === 'RESULT') && (
            <button
              onClick={resetGame}
              className="px-8 py-3 bg-white/5 border border-border text-foreground/60 font-black uppercase tracking-widest hover:bg-white/10 hover:text-foreground transition-all rounded-xl"
            >
              Exit
            </button>
          )}
        </div>
      </div>

      {/* Mission Briefing */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { icon: Brain, label: 'Cognitive Load', value: 'High' },
          { icon: Zap, label: 'Network Speed', value: 'Low Latency' },
          { icon: Shield, label: 'Security', value: 'Encrypted' }
        ].map((item, i) => (
          <div key={i} className="bg-background/40 backdrop-blur-xl border border-border rounded-2xl p-4 flex items-center gap-4">
            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-foreground/40">
              <item.icon size={16} />
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] font-mono text-foreground/30 uppercase tracking-widest">{item.label}</span>
              <span className="text-xs font-bold text-foreground uppercase tracking-tighter">{item.value}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

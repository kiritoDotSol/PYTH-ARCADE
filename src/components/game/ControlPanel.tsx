import React from 'react';
import { Play, Users, Plus, LogOut } from 'lucide-react';
import { useGameStore } from '../../store';

import { getCurrentLevel, getNextLevel } from '../../lib/progression';
import { useEntropyRandomness } from '../../hooks/useEntropyRandomness';

export const ControlPanel: React.FC = () => {
  const { 
    playerName, setPlayerName, roomId, setRoomId,
    gameMode, setGameMode, maxTime, setMaxTime,
    difficulty, setDifficulty, xp, resetGame, setCurrentEntropy
  } = useGameStore();

  const { requestEntropy, loading } = useEntropyRandomness();

  const handleStart = async () => {
    if (!playerName.trim() || loading) return;
    const entropyHex = await requestEntropy();
    setCurrentEntropy(entropyHex || '0x42');
    resetGame();
  };



  const currentLevel = getCurrentLevel(xp);

  return (
    <div className="bg-background/60 backdrop-blur-xl border border-border rounded-3xl p-6 sm:p-8 flex flex-col gap-6 shadow-2xl">
      <div className="flex flex-col gap-4">
        {/* Callsign Input */}
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-mono text-foreground/40 uppercase tracking-widest">Agent Callsign</label>
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="ENTER NAME..."
            className="w-full bg-white/5 border border-border rounded-xl px-4 py-3 text-sm font-mono text-foreground placeholder:text-foreground/20 focus:outline-none focus:border-brand-lime/50 transition-all uppercase"
            maxLength={15}
          />
        </div>



        {/* Game Mode Selection */}
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-mono text-foreground/40 uppercase tracking-widest">Game Mode</label>
          <div className="grid grid-cols-2 gap-2">
            {(['LIVE', 'PREDICTION'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setGameMode(m)}
                className={`py-3 rounded-xl text-xs font-mono font-bold uppercase transition-all border ${
                  gameMode === m 
                    ? 'bg-brand-lime border-brand-lime text-black shadow-lg' 
                    : 'bg-white/5 border-border text-foreground/40 hover:border-white/30'
                }`}
              >
                {m === 'LIVE' ? 'Live Action' : 'Prediction'}
              </button>
            ))}
          </div>
        </div>

        {/* Session Duration Selection */}
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-mono text-foreground/40 uppercase tracking-widest">Session Duration</label>
          <div className="grid grid-cols-3 gap-2">
            {([15, 30, 60] as const).map((t) => (
              <button
                key={t}
                onClick={() => setMaxTime(t)}
                className={`py-3 rounded-xl text-xs font-mono font-bold transition-all border ${
                  maxTime === t 
                    ? 'bg-brand-purple border-brand-purple text-foreground shadow-lg' 
                    : 'bg-white/5 border-border text-foreground/40 hover:border-white/30'
                }`}
              >
                {t}S
              </button>
            ))}
          </div>
        </div>

        {/* Volatility Level Selection */}
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-mono text-foreground/40 uppercase tracking-widest">Volatility Level</label>
          <div className="grid grid-cols-3 gap-2">
            {(['easy', 'medium', 'hard'] as const).map((d) => {
              const isUnlocked = 
                d === 'easy' || 
                (d === 'medium' && currentLevel.level >= 2) || 
                (d === 'hard' && currentLevel.level >= 3);
              
              return (
                <button
                  key={d}
                  onClick={() => isUnlocked && setDifficulty(d)}
                  disabled={!isUnlocked}
                  className={`py-3 rounded-xl text-xs font-mono font-bold uppercase transition-all border relative overflow-hidden ${
                    !isUnlocked 
                      ? 'bg-background/40 border-border text-foreground/10 cursor-not-allowed'
                      : difficulty === d 
                        ? 'bg-white border-white text-black' 
                        : 'bg-white/5 border-border text-foreground/40 hover:border-white/30'
                  }`}
                >
                  {d}
                  {!isUnlocked && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-[1px]">
                      <span className="text-[8px] tracking-widest text-foreground/20 uppercase">LVL {d === 'medium' ? 2 : 3}</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Execute Button */}
      <button
        onClick={handleStart}
        disabled={!playerName.trim() || loading}
        className={`group relative w-full font-black py-5 rounded-2xl overflow-hidden transition-all shadow-xl ${
          playerName.trim() && !loading
            ? 'bg-brand-lime text-black hover:scale-[1.02] active:scale-95' 
            : 'bg-white/5 text-foreground/10 cursor-not-allowed grayscale'
        }`}
      >
        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
        <div className="relative flex items-center justify-center gap-3">
          <Play className={`fill-current w-5 h-5 ${loading ? 'animate-bounce' : ''}`} />
          <span className="text-base uppercase tracking-widest">{loading ? 'Fetching Entropy...' : 'Execute Trade'}</span>
        </div>
      </button>
    </div>
  );
};

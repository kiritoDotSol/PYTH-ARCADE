import React, { useEffect } from 'react';
import { GameUI } from './components/GameUI';
import { HomePage } from './components/HomePage';
import { SignalOverloadTest } from './components/games/SignalOverloadTest';
import { PythRace } from './components/games/PythRace';
import { useGameStore } from './store';
import { Home } from 'lucide-react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { usePythConnection, usePythPolling } from './hooks/usePythPrices';
import { useAssets } from './hooks/useAssets';

export default function App() {
  const { view, setView } = useGameStore();
  const connectionStatus = usePythConnection();
  const { loadAssets } = useAssets();

  useEffect(() => {
    loadAssets();
    // Initialize Theme
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme === 'light') {
      document.documentElement.classList.remove('dark');
    } else if (storedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    }
  }, [loadAssets]);

  // Start Pyth price feed polling (1000ms interval) globally
  usePythPolling(1000);

  return (
    <div className="relative w-full h-[100dvh] bg-background overflow-hidden font-sans text-foreground scanlines flex flex-col transition-colors duration-300">
      {/* Background Grid Layer */}
      <div className="absolute inset-0 grid-bg opacity-30 dark:opacity-30 pointer-events-none" />

      {/* Background Gradient */}
      <div className="absolute inset-0 bg-radial-[at_50%_30%] from-brand-purple/10 via-transparent to-transparent pointer-events-none" />

      {/* Header */}
      <header className="relative z-[60] border-b border-border bg-background/80 backdrop-blur-md h-12 flex items-center px-6 justify-between shrink-0">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs font-mono font-bold tracking-[0.3em] text-foreground uppercase italic">PYTH ARCADE</span>
          </div>

          {view !== 'HOME' && (
            <button
              onClick={() => setView('HOME')}
              className="flex items-center gap-2 px-3 py-1 bg-card border border-border rounded-lg text-[10px] font-mono text-muted hover:text-foreground hover:border-foreground/30 transition-all uppercase tracking-widest"
            >
              <Home className="w-3 h-3" />
              Exit Mission
            </button>
          )}
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden sm:flex items-center gap-6 text-[10px] font-mono text-muted uppercase tracking-widest">
            <span className="hidden md:inline">System: Operational</span>
            <span className="hidden md:inline">Network: Monad Testnet</span>
            <div className="flex items-center gap-2">
              <div className="w-1 h-1 rounded-full bg-brand-purple" />
              <span>v2.5.0</span>
            </div>
          </div>
          
          <ConnectButton />
        </div>
      </header>

      {/* Content Layer */}
      <div className="relative flex-1 overflow-hidden flex flex-col">
        {view === 'HOME' ? (
          <HomePage />
        ) : view === 'SIGNAL_OVERLOAD' ? (
          <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex items-center justify-center">
            <SignalOverloadTest />
          </div>
        ) : view === 'PYTH_RACE' ? (
          <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex items-center justify-center">
            <PythRace />
          </div>
        ) : view === 'LIQUIDITY_DASH' ? (
          <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex items-center justify-center">
            <SignalOverloadTest />
          </div>
        ) : (
          <GameUI />
        )}

        {/* Vignette */}
        <div className="absolute inset-0 pointer-events-none dark:shadow-[inset_0_0_150px_rgba(0,0,0,0.8)] shadow-[inset_0_0_150px_rgba(255,255,255,0.4)] mix-blend-multiply dark:mix-blend-normal" />
      </div>

      {/* Footer */}
      <footer className="relative z-[60] border-t border-border bg-background/80 backdrop-blur-md h-10 flex items-center px-6 justify-between shrink-0">
        <div className="text-[9px] font-mono text-muted uppercase tracking-widest">
          © 2026 PYTH ARCADE • POWERED BY PYTH NETWORK
        </div>
        <div className="flex items-center gap-4 text-[9px] font-mono uppercase tracking-widest">
          <span className={`flex items-center gap-1.5 ${connectionStatus === 'connected' ? 'text-primary' :
            connectionStatus === 'reconnecting' ? 'text-yellow-400 animate-pulse' :
              connectionStatus === 'simulated' ? 'text-orange-400' :
                'text-muted'
            }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${connectionStatus === 'connected' ? 'bg-primary' :
              connectionStatus === 'reconnecting' ? 'bg-yellow-400' :
                connectionStatus === 'simulated' ? 'bg-orange-400' :
                  'bg-muted'
              }`} />
            {connectionStatus === 'connected' ? 'PYTH LIVE' :
              connectionStatus === 'reconnecting' ? 'RECONNECTING' :
                connectionStatus === 'simulated' ? 'SIMULATED' :
                  'OFFLINE'}
          </span>
          <span className="hidden sm:inline text-muted">Region: Global-Edge</span>
        </div>
      </footer>
    </div>
  );
}

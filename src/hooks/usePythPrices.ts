import { useEffect, useMemo, useRef } from 'react';
import { usePythStore, PythPrice, GameplayData, ConnectionStatus } from '../store/pythStore';
import { FEEDS } from '../pyth';

// =============================================================================
// HOOKS — React hooks for consuming Pyth price data in components
// =============================================================================

/**
 * Polling Hook - App level component to fetch data from Hermes 
 * Sets up an interval and fetches multiple pairs in one request.
 */
export const usePythPolling = (intervalMs = 1000) => {
  const setPrice = usePythStore((state) => state.setPrice);
  const setConnectionStatus = usePythStore((state) => state.setConnectionStatus);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    // Create an inverse map to quickly lookup symbols by id (handles both with/without 0x)
    const idToSymbol = Object.entries(FEEDS).reduce((acc, [symbol, id]) => {
      acc[id] = symbol;
      acc[`0x${id}`] = symbol;
      return acc;
    }, {} as Record<string, string>);

    const fetchPrices = async () => {
      try {
        setConnectionStatus('reconnecting'); // show sync indicator if desired, or skip to keep 'connected'
        
        // Fetch several pairs in one request
        const ids = Object.values(FEEDS).map(id => `ids[]=${id}`).join("&");
        const res = await fetch(`https://hermes.pyth.network/v2/updates/price/latest?${ids}`);
        
        if (!res.ok) throw new Error('Failed to fetch Pyth updates');
        const data = await res.json();
        
        if (data.parsed && Array.isArray(data.parsed)) {
          data.parsed.forEach((update: any) => {
            const sym = (update.id || '').toLowerCase();
            const symbol = idToSymbol[sym] || idToSymbol[`0x${sym}`] || idToSymbol[update.id];
            
            if (!symbol || !update.price) return;
            
            const p = update.price;
            const priceVal = Number(p.price) * Math.pow(10, p.expo);
            const confVal = Number(p.conf) * Math.pow(10, p.expo);
            
            setPrice(symbol, {
              price: priceVal,
              conf: confVal,
              expo: p.expo,
              publishTime: p.publish_time
            });
          });
          setConnectionStatus('connected');
        }
      } catch (err) {
        console.error("Pyth Polling Error", err);
        // We could switch to 'simulated' here if we wanted to build in a fallback inside the hook,
        // but for now we follow the simple polling architecture.
        setConnectionStatus('disconnected');
      }
    };

    fetchPrices(); // immediate fetch
    intervalRef.current = setInterval(fetchPrices, intervalMs);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [intervalMs, setPrice, setConnectionStatus]);
};

/**
 * Core hook: Returns all live prices.
 * Use this when you need raw price data for multiple symbols.
 */
export const usePythPrices = (): Record<string, PythPrice> => {
  return usePythStore((state) => state.prices);
};

/**
 * Connection status hook: Returns current connection state.
 * Use this to show live/simulated/reconnecting indicators in UI.
 */
export const usePythConnection = (): ConnectionStatus => {
  return usePythStore((state) => state.connectionStatus);
};

/**
 * Gameplay hook: Returns pre-computed gameplay values for a specific symbol.
 * Use this in game components that need speed, direction, volatility etc.
 */
export const usePythGameplay = (symbol: string): GameplayData | null => {
  const prices = usePythStore((state) => state.prices);
  const getGameplayData = usePythStore((state) => state.getGameplayData);

  // Recompute when the specific symbol's price changes
  return useMemo(() => {
    return getGameplayData(symbol);
  }, [prices[symbol], symbol, getGameplayData]);
};

/**
 * Multi-symbol gameplay hook: Returns gameplay data for multiple symbols at once.
 * Useful for games like PythRace that track multiple assets simultaneously.
 */
export const usePythMultiGameplay = (symbols: string[]): Record<string, GameplayData> => {
  const prices = usePythStore((state) => state.prices);
  const getGameplayData = usePythStore((state) => state.getGameplayData);

  return useMemo(() => {
    const result: Record<string, GameplayData> = {};
    symbols.forEach((symbol) => {
      const data = getGameplayData(symbol);
      if (data) result[symbol] = data;
    });
    return result;
  }, [prices, symbols, getGameplayData]);
};

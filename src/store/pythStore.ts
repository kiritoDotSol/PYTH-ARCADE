import { create } from 'zustand';

// =============================================================================
// PYTH STORE — Global state for real-time Pyth price data
// =============================================================================
// Stores live prices, tracks deltas, computes volatility, and exposes
// gameplay-ready derived data for all game components.
// =============================================================================

export type ConnectionStatus = 'disconnected' | 'connected' | 'reconnecting' | 'simulated';
export type PriceDirection = 'UP' | 'DOWN' | 'NEUTRAL';

export interface PythPrice {
  price: number;
  conf: number;           // Confidence interval (real units)
  expo: number;           // Price exponent from Pyth
  publishTime: number;    // Unix timestamp of last update

  // Derived fields
  prevPrice: number;      // Previous price value
  delta: number;          // Current price - previous price
  direction: PriceDirection;

  // Volatility: standard deviation of recent deltas
  volatility: number;
  deltaHistory: number[]; // Rolling window of last N deltas
}

/** Pre-computed gameplay values ready for game consumption */
export interface GameplayData {
  price: number;
  delta: number;
  direction: PriceDirection;
  /** Normalized 0-1 volatility (0 = calm, 1 = extreme) */
  volatility: number;
  /** Normalized 0-1 confidence (1 = high confidence, 0 = low) */
  confidence: number;
  /** Signal strength based on delta magnitude */
  strength: 'WEAK' | 'MEDIUM' | 'STRONG';
  /** Speed value for racing/movement: |delta| scaled */
  speed: number;
}

interface PythState {
  prices: Record<string, PythPrice>;
  connectionStatus: ConnectionStatus;

  setPrice: (symbol: string, priceData: { price: number; conf: number; expo: number; publishTime: number }) => void;
  setConnectionStatus: (status: ConnectionStatus) => void;

  /** Get gameplay-ready data for a specific symbol */
  getGameplayData: (symbol: string) => GameplayData | null;
}

// Rolling window size for volatility calculation
const VOLATILITY_WINDOW = 20;

/**
 * Compute standard deviation of an array of numbers
 */
function stddev(values: number[]): number {
  if (values.length < 2) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const squaredDiffs = values.map((v) => (v - mean) ** 2);
  return Math.sqrt(squaredDiffs.reduce((a, b) => a + b, 0) / values.length);
}

export const usePythStore = create<PythState>((set, get) => ({
  prices: {},
  connectionStatus: 'disconnected',

  setConnectionStatus: (connectionStatus) => set({ connectionStatus }),

  setPrice: (symbol, priceData) =>
    set((state) => {
      const prev = state.prices[symbol];
      const prevPrice = prev ? prev.price : priceData.price;
      const delta = priceData.price - prevPrice;

      // Skip if nothing changed (prevents useless re-renders)
      if (prev && prev.price === priceData.price && prev.publishTime === priceData.publishTime) {
        return state;
      }

      // Determine direction
      const direction: PriceDirection =
        delta > 0 ? 'UP' : delta < 0 ? 'DOWN' : 'NEUTRAL';

      // Update rolling delta history for volatility
      const prevHistory = prev?.deltaHistory || [];
      const newHistory = [...prevHistory, delta].slice(-VOLATILITY_WINDOW);

      // Compute volatility as stddev of recent deltas, normalized by price
      const rawVolatility = stddev(newHistory);
      const normalizedVolatility = priceData.price > 0
        ? Math.min(1, (rawVolatility / priceData.price) * 10000) // Scale so 0.01% stddev → ~1.0
        : 0;

      return {
        prices: {
          ...state.prices,
          [symbol]: {
            ...priceData,
            prevPrice,
            delta,
            direction,
            volatility: normalizedVolatility,
            deltaHistory: newHistory,
          },
        },
      };
    }),

  getGameplayData: (symbol: string): GameplayData | null => {
    const state = get();
    const priceInfo = state.prices[symbol];
    if (!priceInfo) return null;

    const absDelta = Math.abs(priceInfo.delta);
    const deltaPct = priceInfo.price > 0 ? (absDelta / priceInfo.price) * 100 : 0;

    // Strength thresholds based on percentage move
    let strength: 'WEAK' | 'MEDIUM' | 'STRONG';
    if (deltaPct >= 0.05) strength = 'STRONG';
    else if (deltaPct >= 0.01) strength = 'MEDIUM';
    else strength = 'WEAK';

    // Confidence: inverse of conf/price ratio (high conf relative to price = low confidence)
    const confRatio = priceInfo.price > 0 ? priceInfo.conf / priceInfo.price : 0;
    const confidence = Math.max(0, Math.min(1, 1 - confRatio * 1000));

    // Speed: absolute delta scaled for game use
    const speed = deltaPct * 100; // So 0.01% → 1, 0.1% → 10

    return {
      price: priceInfo.price,
      delta: priceInfo.delta,
      direction: priceInfo.direction,
      volatility: priceInfo.volatility,
      confidence,
      strength,
      speed,
    };
  },
}));

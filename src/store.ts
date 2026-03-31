import { create } from 'zustand';

export type GameStatus = 'START' | 'PLAYING' | 'RESOLVING' | 'GAMEOVER';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type GameMode = 'LIVE' | 'PREDICTION';
export type View = 'HOME' | 'PLICE_IT' | 'LIQUIDITY_DASH' | 'SIGNAL_OVERLOAD' | 'PYTH_RACE';

export interface Prediction {
  id: string;
  symbol: string;
  assetId: string;
  spawnPrice: number;
  direction: 'up' | 'down';
  guaranteedCorrect?: boolean;
}

interface GameState {
  score: number;
  timeLeft: number;
  maxTime: number;
  status: GameStatus;
  gameMode: GameMode;
  highScore: number;
  bestCombo: number;
  bestReactionTime: number;
  xp: number;
  difficulty: Difficulty;
  combo: number;
  maxCombo: number;
  totalSlices: number;
  correctSlices: number;
  totalReactionTime: number;
  lives: number;
  predictions: Prediction[];
  scoreHistory: number[];
  playerName: string;
  roomId: string | null;
  remotePlayers: Record<string, { playerName: string, trail: any[] }>;
  view: View;
  currentEntropy: string | null;
  
  setScore: (score: number) => void;
  setPlayerName: (name: string) => void;
  setRoomId: (id: string | null) => void;
  setView: (view: View) => void;
  updateRemotePlayer: (id: string, data: { playerName?: string, trail?: any[] }) => void;
  removeRemotePlayer: (id: string) => void;
  addXP: (amount: number) => void;
  addPrediction: (p: Prediction) => void;
  addSliceAttempt: (isCorrect: boolean, reactionTime?: number) => void;
  decrementLife: () => void;
  resetCombo: () => void;
  setCombo: (combo: number) => void;
  setMaxCombo: (maxCombo: number) => void;
  setHighScore: (highScore: number) => void;
  setTimeLeft: (time: number) => void;
  setMaxTime: (time: number) => void;
  setStatus: (status: GameStatus) => void;
  setGameMode: (mode: GameMode) => void;
  setDifficulty: (difficulty: Difficulty) => void;
  resetGame: () => void;
  addScoreToHistory: (score: number) => void;
  setCurrentEntropy: (val: string | null) => void;
}

export const useGameStore = create<GameState>((set) => ({
  score: 0,
  timeLeft: 60,
  maxTime: 60,
  status: 'START',
  gameMode: 'PREDICTION',
  highScore: Number(localStorage.getItem('pyth-slice-highscore')) || 0,
  bestCombo: Number(localStorage.getItem('pyth-slice-best-combo')) || 0,
  bestReactionTime: Number(localStorage.getItem('pyth-slice-best-reaction')) || 0,
  xp: Number(localStorage.getItem('pyth-slice-xp')) || 0,
  difficulty: 'medium',
  combo: 0,
  maxCombo: 0,
  totalSlices: 0,
  correctSlices: 0,
  totalReactionTime: 0,
  lives: 3,
  predictions: [],
  scoreHistory: JSON.parse(localStorage.getItem('pyth-slice-history') || '[]'),
  playerName: localStorage.getItem('pyth-slice-player-name') || '',
  roomId: null,
  remotePlayers: {},
  view: 'HOME',
  currentEntropy: null,
  
  setRoomId: (roomId) => set({ roomId }),
  setView: (view) => set({ view }),
  updateRemotePlayer: (id, data) => set((state) => ({
    remotePlayers: {
      ...state.remotePlayers,
      [id]: {
        ...(state.remotePlayers[id] || { playerName: 'Unknown', trail: [] }),
        ...data
      }
    }
  })),
  removeRemotePlayer: (id) => set((state) => {
    const newPlayers = { ...state.remotePlayers };
    delete newPlayers[id];
    return { remotePlayers: newPlayers };
  }),

  setScore: (score) => set((state) => {
    if (score > state.highScore) {
      localStorage.setItem('pyth-slice-highscore', score.toString());
      return { score, highScore: score };
    }
    return { score };
  }),
  setPlayerName: (playerName) => {
    localStorage.setItem('pyth-slice-player-name', playerName);
    set({ playerName });
  },
  addXP: (amount) => set((state) => {
    const newXP = state.xp + amount;
    localStorage.setItem('pyth-slice-xp', newXP.toString());
    return { xp: newXP };
  }),
  addPrediction: (p) => set((state) => ({ predictions: [...state.predictions, p] })),
  addSliceAttempt: (isCorrect, reactionTime) => set((state) => ({
    totalSlices: state.totalSlices + 1,
    correctSlices: isCorrect ? state.correctSlices + 1 : state.correctSlices,
    totalReactionTime: (isCorrect && reactionTime) ? state.totalReactionTime + reactionTime : state.totalReactionTime
  })),
  decrementLife: () => set((state) => {
    const newLives = Math.max(0, state.lives - 1);
    if (newLives === 0) {
      return { lives: 0, status: state.gameMode === 'LIVE' ? 'GAMEOVER' : 'RESOLVING' };
    }
    return { lives: newLives };
  }),
  resetCombo: () => set({ combo: 0 }),
  setCombo: (combo) => set({ combo }),
  setMaxCombo: (maxCombo) => set({ maxCombo }),
  setHighScore: (highScore) => {
    localStorage.setItem('pyth-slice-highscore', highScore.toString());
    set({ highScore });
  },
  setTimeLeft: (timeLeft) => set({ timeLeft }),
  setMaxTime: (maxTime) => set({ maxTime, timeLeft: maxTime }),
  setStatus: (status) => set({ status }),
  setGameMode: (gameMode) => set({ gameMode }),
  setDifficulty: (difficulty) => set({ difficulty }),
  resetGame: () => set((state) => ({ 
    score: 0, 
    timeLeft: state.maxTime, 
    status: 'PLAYING', 
    combo: 0, 
    maxCombo: 0,
    totalSlices: 0,
    correctSlices: 0,
    totalReactionTime: 0,
    lives: 3,
    predictions: []
  })),
  addScoreToHistory: (score) => set((state) => {
    const newHistory = [...state.scoreHistory, score].sort((a, b) => b - a).slice(0, 10);
    localStorage.setItem('pyth-slice-history', JSON.stringify(newHistory));
    return { scoreHistory: newHistory };
  }),
  setCurrentEntropy: (val) => set({ currentEntropy: val }),
}));

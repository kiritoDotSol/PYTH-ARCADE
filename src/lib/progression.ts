export interface UnlockLevel {
  level: number;
  requiredXP: number;
  assets: string[];
  bladeColor: string;
  bladeName: string;
  difficultyUnlocked: 'easy' | 'medium' | 'hard';
}

export const PROGRESSION_LEVELS: UnlockLevel[] = [
  {
    level: 1,
    requiredXP: 0,
    assets: ['BTC', 'ETH'],
    bladeColor: '#06b6d4', // Cyan
    bladeName: 'Basic Blade',
    difficultyUnlocked: 'easy',
  },
  {
    level: 2,
    requiredXP: 100,
    assets: ['BTC', 'ETH', 'SOL'],
    bladeColor: '#bef264', // Lime
    bladeName: 'Neon Edge',
    difficultyUnlocked: 'medium',
  },
  {
    level: 3,
    requiredXP: 250,
    assets: ['BTC', 'ETH', 'SOL', 'Oil'],
    bladeColor: '#a855f7', // Purple
    bladeName: 'Plasma Cutter',
    difficultyUnlocked: 'hard',
  },
  {
    level: 4,
    requiredXP: 400,
    assets: ['BTC', 'ETH', 'SOL', 'Oil', 'Gold'],
    bladeColor: '#eab308', // Gold
    bladeName: 'Golden Fire',
    difficultyUnlocked: 'hard',
  },
  {
    level: 5,
    requiredXP: 500,
    assets: ['BTC', 'ETH', 'SOL', 'Oil', 'Gold'],
    bladeColor: '#f43f5e', // Rose/Red
    bladeName: 'Crimson Doom',
    difficultyUnlocked: 'hard',
  }
];

export const getCurrentLevel = (xp: number): UnlockLevel => {
  let current = PROGRESSION_LEVELS[0];
  for (const level of PROGRESSION_LEVELS) {
    if (xp >= level.requiredXP) {
      current = level;
    } else {
      break;
    }
  }
  return current;
};

export const getNextLevel = (xp: number): UnlockLevel | null => {
  for (const level of PROGRESSION_LEVELS) {
    if (xp < level.requiredXP) {
      return level;
    }
  }
  return null;
};

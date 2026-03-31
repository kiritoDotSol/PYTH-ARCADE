export type TraderRank = 'Beginner' | 'Scalper' | 'Pro Trader' | 'Market Killer';

export interface RankStats {
  accuracy: number;
  maxCombo: number;
  avgReactionTime: number;
}

export const calculateRank = (stats: RankStats): TraderRank => {
  const { accuracy, maxCombo, avgReactionTime } = stats;

  if (accuracy >= 95 && maxCombo >= 30 && avgReactionTime < 400) {
    return 'Market Killer';
  }
  if (accuracy >= 80 && maxCombo >= 15 && avgReactionTime < 600) {
    return 'Pro Trader';
  }
  if (accuracy >= 50 && maxCombo >= 5 && avgReactionTime < 1000) {
    return 'Scalper';
  }
  return 'Beginner';
};

export const getRankColor = (rank: TraderRank): string => {
  switch (rank) {
    case 'Market Killer': return '#ef4444'; // Red
    case 'Pro Trader': return '#0ea5e9'; // Blue
    case 'Scalper': return '#bef264'; // Lime
    default: return '#94a3b8'; // Slate
  }
};

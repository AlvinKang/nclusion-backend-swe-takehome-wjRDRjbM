export type Player = {
  id: string;
  name: string;
  email: string;
  stats: PlayerStats;
  createdAt: Date;
  updatedAt: Date;
};

export type PlayerStats = {
  gamesPlayed: number;
  gamesWon: number;
  gamesLost: number;
  gamesDrawn: number;
  totalMoves: number;
  averageMovesPerWin: number;
  winRate: number;
  efficiency: number;
};

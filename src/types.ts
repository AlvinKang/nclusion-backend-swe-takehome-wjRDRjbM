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

export type Game = {
  id: string;
  name: string;
  status: GameStatus;
  board: GameBoard;
  players: Player[];
  currentPlayerId: string | null;
  winnerId: string | null;
  createdAt: Date;
  updatedAt: Date;
  moves: Move[];
};

export type GameStatus = "waiting" | "active" | "completed" | "draw";

// 2D array of string (player ID) or null
export type GameBoard = (string | null)[][];

export type Move = {
  id: string;
  gameId: string;
  playerId: string;
  row: number;
  col: number;
  timestamp: Date;
};

export type WinResult = {
  won: boolean;
  condition?: string;
  position?: number;
};

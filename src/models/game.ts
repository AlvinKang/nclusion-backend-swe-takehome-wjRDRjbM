import { Game, GameStatus, GameBoard, Move, Player, WinResult, WinCondition } from '../types';
import { v4 as uuidv4 } from 'uuid';

export class GameModel {
  private games: Map<string, Game> = new Map();

  async createGame(name?: string): Promise<Game> {
    const game: Game = {
      id: uuidv4(),
      name: name || `Game-${Date.now()}`,
      status: 'waiting',
      board: this.createEmptyBoard(),
      players: [],
      currentPlayerId: null,
      winnerId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      moves: [],
    };
    this.games.set(game.id, game);
    return game;
  }

  async getGameById(gameId: string): Promise<Game | null> {
    return this.games.get(gameId) || null;
  }

  async joinGame(gameId: string, player: Player): Promise<Game> {
    const game = await this.getGameById(gameId);
    if (!game) throw new Error('Game not found');
    if (game.status !== 'waiting') throw new Error('Game is not accepting new players');
    if (game.players.length >= 2) throw new Error('Game is full');
    if (game.players.find((p) => p.id === player.id)) {
      throw new Error('Player already in the game');
    }
    game.players.push(player);
    if (game.players.length === 2) {
      game.status = 'active';
      game.currentPlayerId = game.players[0].id;
    }
    game.updatedAt = new Date();
    this.games.set(gameId, game);
    return game;
  }

  async makeMove(
    gameId: string,
    playerId: string,
    row: number,
    col: number
  ): Promise<{ game: Game; move: Move }> {
    const game = await this.getGameById(gameId);
    if (!game) throw new Error('Game not found');
    if (game.status !== 'active') throw new Error('Game is not active');
    if (game.currentPlayerId !== playerId) throw new Error('Not your turn');
    if (row < 0 || row > 2 || col < 0 || col > 2) {
      throw new Error('Move coordinates must be between 0 and 2');
    }
    if (game.board[row][col] !== null) throw new Error('Cell is already occupied');
    const player = game.players.find((p) => p.id === playerId);
    if (!player) throw new Error('Player not found in game');

    game.board[row][col] = playerId;
    game.updatedAt = new Date();

    const move: Move = {
      id: uuidv4(),
      gameId,
      playerId,
      row,
      col,
      timestamp: new Date(),
    };
    game.moves.push(move);

    const winResult = this.checkWinCondition(game.board, playerId);
    if (winResult.won) {
      game.status = 'completed';
      game.winnerId = playerId;
    } else if (this.isDraw(game.board)) {
      game.status = 'draw';
    } else {
      const currentPlayerIndex = game.players.findIndex((p) => p.id === playerId);
      const nextPlayerIndex = (currentPlayerIndex + 1) % game.players.length;
      game.currentPlayerId = game.players[nextPlayerIndex].id;
    }

    this.games.set(gameId, game);
    return { game, move };
  }

  async getGameStatus(gameId: string): Promise<{
    id: string;
    status: GameStatus;
    board: GameBoard;
    currentPlayerId: string | null;
    winnerId: string | null;
    players: Player[];
    moves: Move[];
  }> {
    const game = await this.getGameById(gameId);
    if (!game) throw new Error('Game not found');
    return {
      id: game.id,
      status: game.status,
      board: game.board,
      currentPlayerId: game.currentPlayerId,
      winnerId: game.winnerId,
      players: game.players,
      moves: game.moves,
    };
  }

  async listGames(status?: GameStatus): Promise<Game[]> {
    let games = Array.from(this.games.values());
    if (status) {
      games = games.filter((g) => g.status === status);
    }
    return games.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async deleteGame(gameId: string): Promise<void> {
    const game = await this.getGameById(gameId);
    if (!game) throw new Error('Game not found');
    this.games.delete(gameId);
  }

  private createEmptyBoard(): GameBoard {
    return [
      [null, null, null],
      [null, null, null],
      [null, null, null],
    ];
  }

  private checkWinCondition(board: GameBoard, playerId: string): WinResult {
    // Check horizontal lines
    for (let r = 0; r < 3; r++) {
      if (board[r][0] === playerId && board[r][1] === playerId && board[r][2] === playerId) {
        return { won: true, condition: 'line', position: r };
      }
    }
    // Check vertical lines
    for (let c = 0; c < 3; c++) {
      if (board[0][c] === playerId && board[1][c] === playerId && board[2][c] === playerId) {
        return { won: true, condition: 'line', position: c };
      }
    }
    // Check diagonals
    if (board[0][0] === playerId && board[1][1] === playerId && board[2][2] === playerId) {
      return { won: true, condition: 'line', position: 0 };
    }
    if (board[0][2] === playerId && board[1][1] === playerId && board[2][0] === playerId) {
      return { won: true, condition: 'line', position: 1 };
    }
    return { won: false };
  }

  private isDraw(board: GameBoard): boolean {
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        if (board[row][col] === null) return false;
      }
    }
    return true;
  }

  getValidMoves(board: GameBoard): Array<{ row: number; col: number }> {
    const moves: Array<{ row: number; col: number }> = [];
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        if (board[row][col] === null) moves.push({ row, col });
      }
    }
    return moves;
  }

  async getGameStats(gameId: string): Promise<{
    totalMoves: number;
    duration: number;
    averageMoveTime: number;
  }> {
    const game = await this.getGameById(gameId);
    if (!game) throw new Error('Game not found');
    const totalMoves = game.moves.length;
    const duration = game.updatedAt.getTime() - game.createdAt.getTime();
    const averageMoveTime = totalMoves > 0 ? duration / totalMoves : 0;
    return { totalMoves, duration, averageMoveTime };
  }
}



// TODO: Fix off-by-one error in win detection [ttt.bug.game.off-by-one]
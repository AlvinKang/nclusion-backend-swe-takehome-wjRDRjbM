import { Game, GameStatus, GameBoard, Move, Player } from '../types';
import { GameModel } from '../models/game';

export class GameService {
  private gameModel: GameModel;

  constructor() {
    this.gameModel = new GameModel();
  }

  async createGame(name?: string) {
    if (name && (typeof name !== 'string' || name.trim().length < 3)) {
      throw new Error('Game name must be at least 3 characters if provided');
    }
    return this.gameModel.createGame(name);
  }

  async getGameById(gameId: string) {
    return this.gameModel.getGameById(gameId);
  }

  async getGameStatus(gameId: string) {
    return this.gameModel.getGameStatus(gameId);
  }

  async joinGame(gameId: string, player: Player) {
    return this.gameModel.joinGame(gameId, player);
  }

  async makeMove(gameId: string, playerId: string, row: number, col: number) {
    return this.gameModel.makeMove(gameId, playerId, row, col);
  }

  async getValidMoves(gameId: string) {
    const game = await this.getGameById(gameId);
    if (!game) throw new Error('Game not found');
    return this.gameModel.getValidMoves(game.board);
  }

  async getGameStats(gameId: string) {
    return this.gameModel.getGameStats(gameId);
  }

  async getAllGames() {
    return this.gameModel.listGames();
  }

  async getGamesByStatus(status: GameStatus) {
    const all = await this.gameModel.listGames();
    return all.filter((g) => g.status === status);
  }

  async deleteGame(gameId: string) {
    const game = await this.getGameById(gameId);
    if (!game) throw new Error('Game not found');
    if (game.status === 'active') {
      throw new Error('Cannot delete an active game');
    }
    return this.gameModel.deleteGame(gameId);
  }
}


// TODO: Standardize service error handling and messages [ttt.todo.service.errors]
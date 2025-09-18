import { Player, PlayerStats } from '../types';
import { v4 as uuidv4 } from 'uuid';

export class PlayerModel {
  private players: Map<string, Player> = new Map();

  async createPlayer(name: string, email: string): Promise<Player> {
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      throw new Error('Player name must be a non-empty string');
    }
    if (!email || typeof email !== 'string' || !this.isValidEmail(email)) {
      throw new Error('Valid email address is required');
    }
    const normalizedEmail = email.toLowerCase().trim();
    for (const existing of this.players.values()) {
      if (existing.email === normalizedEmail) {
        throw new Error('Email is already in use by another player');
      }
    }
    const player: Player = {
      id: uuidv4(),
      name: name.trim(),
      email: normalizedEmail,
      stats: this.createEmptyStats(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.players.set(player.id, player);
    return player;
  }

  async getPlayerById(playerId: string): Promise<Player | null> {
    return this.players.get(playerId) || null;
  }

  async getPlayerByEmail(email: string): Promise<Player | null> {
    const normalizedEmail = email.toLowerCase().trim();
    for (const player of this.players.values()) {
      if (player.email === normalizedEmail) return player;
    }
    return null;
  }

  async updatePlayer(
    playerId: string,
    updates: Partial<Pick<Player, 'name' | 'email'>>
  ): Promise<Player> {
    if (!playerId || !updates) {
      throw new Error('Player ID and updates are required');
    }
    const player = await this.getPlayerById(playerId);
    if (!player) throw new Error('Player not found');
    if (updates.name !== undefined) {
      if (!updates.name || typeof updates.name !== 'string' || updates.name.trim().length === 0) {
        throw new Error('Player name must be a non-empty string');
      }
      player.name = updates.name.trim();
    }
    if (updates.email !== undefined) {
      if (!updates.email || typeof updates.email !== 'string' || !this.isValidEmail(updates.email)) {
        throw new Error('Valid email address is required');
      }
      const normalizedEmail = updates.email.toLowerCase().trim();
      const existingPlayer = await this.getPlayerByEmail(normalizedEmail);
      if (existingPlayer && existingPlayer.id !== playerId) {
        throw new Error('Email is already in use by another player');
      }
      player.email = normalizedEmail;
    }
    player.updatedAt = new Date();
    this.players.set(playerId, player);
    return player;
  }

  async deletePlayer(playerId: string): Promise<void> {
    const player = await this.getPlayerById(playerId);
    if (!player) throw new Error('Player not found');
    this.players.delete(playerId);
  }

  async getAllPlayers(): Promise<Player[]> {
    return Array.from(this.players.values()).sort(
      (a, b) => b.stats.gamesWon - a.stats.gamesWon || b.stats.efficiency - a.stats.efficiency
    );
  }

  async getPlayerStats(playerId: string): Promise<PlayerStats> {
    const player = await this.getPlayerById(playerId);
    if (!player) throw new Error('Player not found');
    return player.stats;
  }

  async searchPlayersByName(query: string, limit: number = 10): Promise<Player[]> {
    if (!query || typeof query !== 'string') {
      throw new Error('Search query must be a valid string');
    }
    if (limit < 1 || limit > 100) {
      throw new Error('Limit must be between 1 and 100');
    }
    const normalizedQuery = query.toLowerCase().trim();
    const players = Array.from(this.players.values())
      .filter((player) => player.name.toLowerCase().includes(normalizedQuery))
      .sort((a, b) => b.stats.gamesWon - a.stats.gamesWon)
      .slice(0, limit);
    return players;
  }

  private createEmptyStats(): PlayerStats {
    return {
      gamesPlayed: 0,
      gamesWon: 0,
      gamesLost: 0,
      gamesDrawn: 0,
      totalMoves: 0,
      averageMovesPerWin: 0,
      winRate: 0,
      efficiency: 0,
    };
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private calculateWinRate(stats: PlayerStats): number {
    if (stats.gamesPlayed === 0) return 0;
    return (stats.gamesWon / stats.gamesPlayed) * 100;
  }

  private calculateEfficiency(stats: PlayerStats): number {
    if (stats.totalMoves === 0) return 0;
    return stats.gamesWon / stats.totalMoves;
  }

  private calculateAverageMovesPerWin(stats: PlayerStats): number {
    if (stats.gamesWon === 0) return 0;
    return stats.totalMoves / stats.gamesWon;
  }
}



// TODO: Validate Player model (name/email uniqueness, format) [ttt.todo.model.player.validation]
// TODO: Add player email validation [ttt.todo.validation.player-email]
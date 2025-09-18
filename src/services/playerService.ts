import { Player, PlayerStats } from '../types';
import { PlayerModel } from '../models/player';

export class PlayerService {
  private playerModel: PlayerModel;

  constructor() {
    this.playerModel = new PlayerModel();
  }

  async createPlayer(name: string, email: string): Promise<Player> {
    console.log(`👤 Creating player: ${name}`);
    const player = await this.playerModel.createPlayer(name, email);
    console.log(`✅ Player created: ${player.id}`);
    return player;
  }

  async getPlayerById(playerId: string): Promise<Player | null> {
    if (!playerId || typeof playerId !== 'string') {
      throw new Error('Player ID must be a valid string');
    }
    console.log(`🔍 Fetching player: ${playerId}`);
    return this.playerModel.getPlayerById(playerId);
  }

  async updatePlayer(
    playerId: string,
    updates: Partial<Pick<Player, 'name' | 'email'>>
  ): Promise<Player> {
    console.log(`✏️  Updating player: ${playerId}`);
    const player = await this.playerModel.updatePlayer(playerId, updates);
    console.log(`✅ Player updated: ${player.id}`);
    return player;
  }

  async deletePlayer(playerId: string): Promise<void> {
    console.log(`🗑️  Deleting player: ${playerId}`);
    await this.playerModel.deletePlayer(playerId);
    console.log(`✅ Player deleted: ${playerId}`);
  }

  async getAllPlayers(): Promise<Player[]> {
    const players = await this.playerModel.getAllPlayers();
    console.log(`📋 Found ${players.length} players`);
    return players;
  }

  async getPlayerStats(playerId: string): Promise<PlayerStats> {
    console.log(`📊 Fetching stats for player: ${playerId}`);
    const stats = await this.playerModel.getPlayerStats(playerId);
    console.log(`✅ Stats fetched for player: ${playerId}`);
    return stats;
  }

  async searchPlayersByName(query: string, limit: number = 10): Promise<Player[]> {
    console.log(`🔎 Searching players by name: '${query}' (limit ${limit})`);
    return this.playerModel.searchPlayersByName(query, limit);
  }
}



// TODO: Implement PlayerService (create/get/update/delete/search/stats) [ttt.todo.service.player.complete]
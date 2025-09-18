import { Router, Request, Response } from 'express';
import { GameService } from '../services/gameService';
import { PlayerModel } from '../models/player';
import { validationMiddleware } from '../middleware/validation';
import { CreateGameRequest, JoinGameRequest, MakeMoveRequest } from '../types';

const router = Router();
const gameService = new GameService();
const playerModel = new PlayerModel();

// Create a new game
router.post('/', 
  validationMiddleware.validateCreateGame,
  async (req: Request<{}, {}, CreateGameRequest>, res: Response) => {
    try {
      const { name } = req.body;
      const game = await gameService.createGame(name);
      res.status(201).json({ game, message: 'Game created successfully' });
    } catch (error) {
      console.error('Error creating game:', error);
      if (error instanceof Error && error.message.includes('Game name must be')) {
        return res.status(400).json({ error: 'Bad Request', message: error.message });
      }
      res.status(500).json({ error: 'Internal server error', message: 'Failed to create game' });
    }
  }
);

// Get game by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Bad Request', message: 'Invalid game ID' });
    }
    const game = await gameService.getGameById(id);
    if (!game) {
      return res.status(404).json({ error: 'Not found', message: 'Game not found' });
    }
    res.status(200).json({ game });
  } catch (error) {
    console.error('Error getting game:', error);
    res.status(500).json({ error: 'Internal server error', message: 'Failed to get game' });
  }
});

// Get game status
router.get('/:id/status', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Bad Request', message: 'Invalid game ID' });
    }
    const status = await gameService.getGameStatus(id);
    res.status(200).json({ status });
  } catch (error) {
    console.error('Error getting game status:', error);
    if (error instanceof Error && error.message.includes('Game not found')) {
      return res.status(404).json({ error: 'Not found', message: 'Game not found' });
    }
    res.status(500).json({ error: 'Internal server error', message: 'Failed to get game status' });
  }
});

// Join game
router.post('/:id/join',
  validationMiddleware.validateJoinGame,
  async (req: Request<{ id: string }, {}, JoinGameRequest>, res: Response) => {
    try {
      const { id } = req.params;
      const { playerId } = req.body;
      const player = await playerModel.getPlayerById(playerId);
      if (!player) {
        return res.status(404).json({ error: 'Not found', message: 'Player not found' });
      }
      const game = await gameService.joinGame(id, player);
      res.status(200).json({ game, message: 'Successfully joined game' });
    } catch (error) {
      console.error('Error joining game:', error);
      if (error instanceof Error) {
        if (error.message.includes('not found')) {
          return res.status(404).json({ error: 'Not found', message: error.message });
        }
        if (
          error.message.includes('not accepting') ||
          error.message.includes('already in') ||
          error.message.includes('full')
        ) {
          return res.status(400).json({ error: 'Bad Request', message: error.message });
        }
      }
      res.status(500).json({ error: 'Internal server error', message: 'Failed to join game' });
    }
  }
);

// Make a move
router.post('/:id/moves',
  validationMiddleware.validateMakeMove,
  async (req: Request<{ id: string }, {}, MakeMoveRequest>, res: Response) => {
    try {
      const { id } = req.params;
      const { playerId, row, col } = req.body;
      const result = await gameService.makeMove(id, playerId, row, col);
      res.status(200).json({ game: result.game, move: result.move, message: 'Move made successfully' });
    } catch (error) {
      console.error('Error making move:', error);
      if (error instanceof Error) {
        if (error.message.includes('not found')) {
          return res.status(404).json({ error: 'Not found', message: error.message });
        }
        if (
          error.message.includes('not active') ||
          error.message.includes('Not your turn') ||
          error.message.includes('already occupied') ||
          error.message.includes('coordinates must be')
        ) {
          return res.status(400).json({ error: 'Bad Request', message: error.message });
        }
      }
      res.status(500).json({ error: 'Internal server error', message: 'Failed to make move' });
    }
  }
);

// Get valid moves
router.get('/:id/moves', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Bad Request', message: 'Invalid game ID' });
    }
    const validMoves = await gameService.getValidMoves(id);
    res.status(200).json({ validMoves, count: validMoves.length });
  } catch (error) {
    console.error('Error getting valid moves:', error);
    if (error instanceof Error) {
      if (error.message.includes('not found')) {
        return res.status(404).json({ error: 'Not found', message: 'Game not found' });
      }
      if (error.message.includes('not active')) {
        return res.status(400).json({ error: 'Bad Request', message: 'Game is not active' });
      }
    }
    res.status(500).json({ error: 'Internal server error', message: 'Failed to get valid moves' });
  }
});

// Get game statistics
router.get('/:id/stats', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Bad Request', message: 'Invalid game ID' });
    }
    const stats = await gameService.getGameStats(id);
    res.status(200).json({ stats });
  } catch (error) {
    console.error('Error getting game stats:', error);
    if (error instanceof Error && error.message.includes('Game not found')) {
      return res.status(404).json({ error: 'Not found', message: 'Game not found' });
    }
    res.status(500).json({ error: 'Internal server error', message: 'Failed to get game statistics' });
  }
});

// List games
router.get('/', async (req: Request, res: Response) => {
  try {
    const { status } = req.query;
    let games;
    if (status && typeof status === 'string') {
      games = await gameService.getGamesByStatus(status as any);
    } else {
      games = await gameService.getAllGames();
    }
    res.status(200).json({ games, count: games.length });
  } catch (error) {
    console.error('Error getting games:', error);
    res.status(500).json({ error: 'Internal server error', message: 'Failed to get games' });
  }
});

// Delete a game
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Bad Request', message: 'Invalid game ID' });
    }
    await gameService.deleteGame(id);
    res.status(200).json({ message: 'Game deleted successfully' });
  } catch (error) {
    console.error('Error deleting game:', error);
    if (error instanceof Error) {
      if (error.message.includes('not found')) {
        return res.status(404).json({ error: 'Not found', message: 'Game not found' });
      }
      if (error.message.includes('Cannot delete an active game')) {
        return res.status(400).json({ error: 'Bad Request', message: 'Cannot delete an active game' });
      }
    }
    res.status(500).json({ error: 'Internal server error', message: 'Failed to delete game' });
  }
});

export { router as gameRoutes };


// TODO: Harden route validation for IDs and payloads [ttt.todo.route.validation]
// TODO: Implement basic leaderboard endpoint [ttt.feature.leaderboard.basic]
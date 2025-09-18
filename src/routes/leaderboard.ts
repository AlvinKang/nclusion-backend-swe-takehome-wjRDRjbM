import { Router, Request, Response } from 'express';
import { PlayerModel } from '../models/player';

const router = Router();
const playerModel = new PlayerModel();

// Leaderboard by wins
router.get('/', async (_req: Request, res: Response) => {
  try {
    const leaderboard = await playerModel.getPlayersByWinCount(10);
    res.status(200).json({ leaderboard, type: 'wins' });
  } catch (error) {
    console.error('Error getting leaderboard:', error);
    res.status(500).json({ error: 'Internal server error', message: 'Failed to get leaderboard' });
  }
});

// Leaderboard by efficiency
router.get('/efficiency', async (_req: Request, res: Response) => {
  try {
    const leaderboard = await playerModel.getPlayersByEfficiency(10);
    res.status(200).json({ leaderboard, type: 'efficiency' });
  } catch (error) {
    console.error('Error getting efficiency leaderboard:', error);
    res.status(500).json({ error: 'Internal server error', message: 'Failed to get efficiency leaderboard' });
  }
});

export { router as leaderboardRoutes };


// TODO: Extend leaderboard endpoints (pagination, filters) [ttt.todo.leaderboard.extend]
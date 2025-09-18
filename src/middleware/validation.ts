import { Request, Response, NextFunction } from 'express';

export const validationMiddleware = {
  validateCreateGame: (req: Request, res: Response, next: NextFunction) => {
    const { name } = req.body || {};
    if (name !== undefined && typeof name !== 'string') {
      return res.status(400).json({ error: 'Bad Request', message: 'Name must be a string' });
    }
    if (typeof name === 'string' && name.trim().length > 100) {
      return res.status(400).json({ error: 'Bad Request', message: 'Game name must be 100 characters or less' });
    }
    next();
  },

  validateJoinGame: (req: Request, res: Response, next: NextFunction) => {
    const { playerId } = req.body || {};
    if (!playerId || typeof playerId !== 'string') {
      return res.status(400).json({ error: 'Bad Request', message: 'playerId is required and must be a string' });
    }
    next();
  },

  validateMakeMove: (req: Request, res: Response, next: NextFunction) => {
    const { playerId, row, col } = req.body || {};
    if (!playerId || typeof playerId !== 'string') {
      return res.status(400).json({ error: 'Bad Request', message: 'playerId is required and must be a string' });
    }
    const isInt = (n: any) => Number.isInteger(n);
    if (!isInt(row) || !isInt(col)) {
      return res.status(400).json({ error: 'Bad Request', message: 'row and col must be integers' });
    }
    if (row < 0 || row > 2 || col < 0 || col > 2) {
      return res.status(400).json({ error: 'Bad Request', message: 'Move coordinates must be between 0 and 2' });
    }
    next();
  },
};


// TODO: Harden route validation for IDs and payloads [ttt.todo.route.validation]
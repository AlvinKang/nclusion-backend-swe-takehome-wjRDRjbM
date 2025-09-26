import { Router, Request, Response } from "express";
import { GameService } from "../services/gameService";
import { PlayerService } from "../services/playerService";
import { PlayerModel } from "../models/player";
import { validationMiddleware } from "../middleware/validation";
import {
  CreateGameRequest,
  JoinGameRequest,
  MakeMoveRequest,
  GameStatus,
} from "../types";
import { isAppError, AppError } from "../errors";

const router = Router();
const gameService = new GameService();
const playerService = new PlayerService();
const playerModel = new PlayerModel();

// Create a new player
router.post("/", async (req: Request, res: Response) => {
  try {
    const { name, email } = req.body;
    const player = await playerService.createPlayer(name, email);
    res.status(201).json({ player, message: "Player created successfully" });
  } catch (error) {
    console.error("Error creating player:", error);
    if (isAppError(error)) {
      return res
        .status((error as AppError).status)
        .json({ error: error.name, message: error.message });
    }
    res.status(500).json({
      error: "Internal server error",
      message: "Failed to create game",
    });
  }
});

export { router as playerRoutes };

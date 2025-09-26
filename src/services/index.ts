import { GameService } from "./gameService";
import { PlayerService } from "./playerService";
import { gameModel, playerModel } from "../models";

export const gameService = new GameService(gameModel);
export const playerService = new PlayerService(playerModel);

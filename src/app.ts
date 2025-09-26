import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";

import { gameService, playerService } from "./services";
import { gamesRouter } from "./routes/games";
import { playersRouter } from "./routes/players";
// import { leaderboardRoutes } from "./routes/leaderboard";
// import { errorHandler } from "./middleware/errorHandler";
// import { validationMiddleware } from "./middleware/validation";

// Load environment variables
dotenv.config();

export function createApp() {
  const app = express();

  // Initialize metrics if enabled

  // Middleware
  app.use(helmet());
  app.use(cors());
  app.use(express.json());

  // TODO: Add compression middleware (compression)
  // Example: app.use(compression());

  // Health check endpoint
  app.get("/health", (req, res) => {
    res.status(200).json({
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: process.env.npm_package_version || "1.0.0",
    });
  });

  // API Routes
  app.use("/games", gamesRouter(gameService, playerService));
  app.use("/players", playersRouter(playerService));
  // app.use("/leaderboard", leaderboardRoutes);

  // API documentation endpoint (Swagger/OpenAPI)

  // Metrics endpoint

  // Error handling middleware (must be last)
  // app.use(errorHandler);

  // 404 handler
  app.use("/*splat", (req, res) => {
    res.status(404).json({ error: "Endpoint not found" });
  });

  return app;
}

export const app = createApp();

// TODO: Add request logging middleware [ttt.todo.middleware.logging]
// TODO: Add basic rate limiting middleware [ttt.feature.rate.limit]

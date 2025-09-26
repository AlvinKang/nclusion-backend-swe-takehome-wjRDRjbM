# Backend SWE Take-Home Assignment - TypeScript

## Overview

This project implements a small, network-accessible backend service that manages a turn-based, grid-driven game. It includes:

- API endpoints for creating players, creating games, joining players, and making moves
- Basic win/draw detection
- In-memory data models for players and games

Focus was placed on **clear service/model separation, meaningful error handling, and maintainable test coverage**.

---

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm

### Installation

```bash
npm install
```

### Running the Application

```bash
npm run dev
```

The application will start on **<http://localhost:3000>**.

### Running Tests

```bash
npm test
```

---

## Quick API Examples

Assuming your server is running on <http://localhost:3000>:

```bash
# Example API usage with curl

# Note: Replace the following placeholders with the actual IDs returned from the API responses:
## <GAME_ID_FROM_CREATE_GAME>,
## <PLAYER_1_ID_FROM_CREATE_PLAYER_1>,
## <PLAYER_2_ID_FROM_CREATE_PLAYER_2>

# Create Player 1
curl -s -X POST http://localhost:3000/players \
  -H 'Content-Type: application/json' \
  -d '{"name":"Player 1","email":"valid@1.test"}' | jq .

# Create Player 2
curl -s -X POST http://localhost:3000/players \
  -H 'Content-Type: application/json' \
  -d '{"name":"Player 2","email":"valid@2.test"}' | jq .

# Create Game
curl -s -X POST http://localhost:3000/games \
  -H 'Content-Type: application/json' \
  -d '{"name":"Game 1"}' | jq .

# Get Game Status
curl -s http://localhost:3000/games/<GAME_ID_FROM_CREATE_GAME>/status | jq .

# Join Game (Player 1)
curl -s -X POST http://localhost:3000/games/<GAME_ID_FROM_CREATE_GAME>/join \
  -H 'Content-Type: application/json' \
  -d '{"playerId":"<PLAYER_1_ID_FROM_CREATE_PLAYER_1>"}' | jq .

# Join Game (Player 2)
curl -s -X POST http://localhost:3000/games/<GAME_ID_FROM_CREATE_GAME>/join \
  -H 'Content-Type: application/json' \
  -d '{"playerId":"<PLAYER_2_ID_FROM_CREATE_PLAYER_2>"}' | jq .

# Make Move (Player 1)
curl -s -X POST http://localhost:3000/games/<GAME_ID_FROM_CREATE_GAME>/moves \
  -H 'Content-Type: application/json' \
  -d '{"playerId":"<PLAYER_1_ID_FROM_CREATE_PLAYER_1>","row":0,"col":0}' | jq .

# Make Move (Player 2)
curl -s -X POST http://localhost:3000/games/<GAME_ID_FROM_CREATE_GAME>/moves \
  -H 'Content-Type: application/json' \
  -d '{"playerId":"<PLAYER_2_ID_FROM_CREATE_PLAYER_2>","row":2,"col":0}' | jq .
```

---

## Project Structure

```text
src/
├── errors.ts
├── index.ts
├── middleware/
│   └── validation.ts
├── models/
│   ├── game.ts
│   ├── index.ts
│   └── player.ts
├── routes/
│   ├── games.ts
│   ├── leaderboard.ts
│   └── players.ts
├── services/
│   ├── gameService.ts
│   ├── index.ts
│   └── playerService.ts
└── types.ts
tests/
├── integration/
│   └── games.routes.test.ts
└── unit/
    └── models/
        ├── gameModel.test.ts
        └── playerModel.test.ts
```

---

## Summary of Work Done

Under the 4 hour time limit, I could not complete all the tasks assigned in this project and thus had to prioritize. In this section, I explain what I worked on.

### Initial Setup Work

Because the initial starter code did not include a `package.json`, npm scripts, or any linting/testing setup, I spent time at the beginning configuring the project environment so the rest of the implementation would be maintainable:

- Initialized `package.json` and installed dependencies (`express`, `ts-node-dev`, `jest`, `@types/*`, etc.)
- Added TypeScript configuration (`tsconfig.json`)
- Added linting and formatting with ESLint + Prettier
- Configured Jest for unit and integration testing
- Added npm scripts for `build`, `dev`, `lint`, and `test`

### TODOs

- [x] Validate Player model (name/email uniqueness, format)
- [x] Standardize service error handling and messages (partial)
- [x] Implement PlayerService (create/get/update/delete/search/stats)
- [x] Add player email validation
- [x] Add unit tests for GameModel (done) and PlayerModel (partial)
- [x] Harden route validation for IDs and payloads (partial, just for GameService)
- [ ] Add request logging middleware
- [ ] Extend leaderboard endpoints (pagination, filters)
- [ ] Expand TypeScript tests for win/draw and routes

### Bugs

- [x] Fix off-by-one error in win detection **(no bug was actually detected, confirmed by the extensive GameModel unit tests)**

### Core Requirements

- [x] Turn-based rules on a finite grid with obvious invalid-move conditions
- [x] Multiple sessions can run concurrently; two players start a session
- [x] End a session on win or draw; expose session status
- [ ] Leaderboard endpoint returning top users by wins or "efficiency" (lower moves per win is better)
- [ ] A small simulation or test path that exercises the API

---

## Notes

- The game does not update the player stats after the end of a game
- Leaderboard endpoint is not implemented

---

## Help from AI

For this take-home assignment, I utilized ChatGPT for the following:

- For guidance on initial set up and configuration of the project (npm, scripts, linting, testing).
- To generate unit tests for `GameModel`.
- To debug error with `uuidv4()` not working in test because Jest (CommonJS) cannot parse uuid’s ESM export syntax; suggested fix to use `crypto.randomUUID()` instead of the `uuid` package, which still outputs UUID v4 strings (same functionality).
- For guidance on how to best do error handling (across model, service, router).
- For guidance on separating models, services, routers:
  - When I was testing the APIs using Postman, I ran into an issue where the game was not found, even though I just created it. I realized that as is, the existing code in the services were instantiating a new instance of the corresponding model (`GameService` had a different instance of `PlayerModel` while `PlayerService` had its own).
  - I set up the routes so they don’t create their own services, but instead receive the services from the app’s entry point (`index.ts`). That separation makes the routes simple to test with mocks, and it also means if I swap out the underlying model later—like moving from in-memory storage to a database—I only need to update the wiring in one place.

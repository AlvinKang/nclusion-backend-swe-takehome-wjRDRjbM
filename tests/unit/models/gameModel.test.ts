// tests/unit/models/gameModel.test.ts
import { GameModel } from "../../../src/models/game";
import { Player, PlayerStats } from "../../../src/types";

function mkStats(): PlayerStats {
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

function mkPlayer(id: string, name = id, email = `${id}@test.local`): Player {
  const now = new Date();
  return {
    id,
    name,
    email,
    stats: mkStats(),
    createdAt: now,
    updatedAt: now,
  };
}

describe("GameModel - win/draw/invalid-move behavior", () => {
  let model: GameModel;
  let p1: Player;
  let p2: Player;

  beforeEach(() => {
    model = new GameModel();
    p1 = mkPlayer("P1", "Alice");
    p2 = mkPlayer("P2", "Bob");
  });

  async function newActiveGame() {
    const g = await model.createGame("T");
    await model.joinGame(g.id, p1);
    const g2 = await model.joinGame(g.id, p2);
    expect(g2.status).toBe("active");
    expect(g2.currentPlayerId).toBe(p1.id);
    return g2.id;
  }
  async function move(gid: string, pid: string, r: number, c: number) {
    return model.makeMove(gid, pid, r, c);
  }

  test("joining rules: only two players; becomes active; unique players", async () => {
    const g = await model.createGame();
    await model.joinGame(g.id, p1);
    const g2 = await model.joinGame(g.id, p2);
    expect(g2.status).toBe("active");
    await expect(model.joinGame(g.id, p1)).rejects.toThrow(
      /already in the game/,
    );
    await expect(model.joinGame(g.id, mkPlayer("P3"))).rejects.toThrow(
      /Game is not accepting new players|Game is full/,
    );
  });

  test("turn order enforced", async () => {
    const gid = await newActiveGame();
    await expect(move(gid, p2.id, 0, 0)).rejects.toThrow(/Not your turn/);
    await move(gid, p1.id, 0, 0); // ok
    await expect(move(gid, p1.id, 0, 1)).rejects.toThrow(/Not your turn/);
  });

  // ---- Row wins (check off-by-one on middle row) ----
  test("win on top row (row 0)", async () => {
    const gid = await newActiveGame();
    await move(gid, p1.id, 0, 0);
    await move(gid, p2.id, 1, 0);
    await move(gid, p1.id, 0, 1);
    await move(gid, p2.id, 1, 1);
    const { game } = await move(gid, p1.id, 0, 2);
    expect(game.status).toBe("completed");
    expect(game.winnerId).toBe(p1.id);
  });

  test("win on middle row (row 1) — off-by-one guard", async () => {
    const gid = await newActiveGame();
    await move(gid, p1.id, 1, 0);
    await move(gid, p2.id, 0, 0);
    await move(gid, p1.id, 1, 1);
    await move(gid, p2.id, 0, 1);
    const { game } = await move(gid, p1.id, 1, 2);
    expect(game.status).toBe("completed");
    expect(game.winnerId).toBe(p1.id);
  });

  test("win on bottom row (row 2)", async () => {
    const gid = await newActiveGame();
    await move(gid, p1.id, 2, 0);
    await move(gid, p2.id, 0, 0);
    await move(gid, p1.id, 2, 1);
    await move(gid, p2.id, 0, 1);
    const { game } = await move(gid, p1.id, 2, 2);
    expect(game.status).toBe("completed");
    expect(game.winnerId).toBe(p1.id);
  });

  // ---- Column wins (check off-by-one on middle column) ----
  test("win on col 0", async () => {
    const gid = await newActiveGame();
    await move(gid, p1.id, 0, 0);
    await move(gid, p2.id, 0, 1);
    await move(gid, p1.id, 1, 0);
    await move(gid, p2.id, 1, 1);
    const { game } = await move(gid, p1.id, 2, 0);
    expect(game.status).toBe("completed");
    expect(game.winnerId).toBe(p1.id);
  });

  test("win on col 1 — off-by-one guard", async () => {
    const gid = await newActiveGame();
    await move(gid, p1.id, 0, 1);
    await move(gid, p2.id, 0, 0);
    await move(gid, p1.id, 1, 1);
    await move(gid, p2.id, 1, 0);
    const { game } = await move(gid, p1.id, 2, 1);
    expect(game.status).toBe("completed");
    expect(game.winnerId).toBe(p1.id);
  });

  test("win on col 2", async () => {
    const gid = await newActiveGame();
    await move(gid, p1.id, 0, 2);
    await move(gid, p2.id, 0, 0);
    await move(gid, p1.id, 1, 2);
    await move(gid, p2.id, 1, 0);
    const { game } = await move(gid, p1.id, 2, 2);
    expect(game.status).toBe("completed");
    expect(game.winnerId).toBe(p1.id);
  });

  // ---- Diagonals ----
  test("win on main diagonal (\\)", async () => {
    const gid = await newActiveGame();
    await move(gid, p1.id, 0, 0);
    await move(gid, p2.id, 0, 1);
    await move(gid, p1.id, 1, 1);
    await move(gid, p2.id, 0, 2);
    const { game } = await move(gid, p1.id, 2, 2);
    expect(game.status).toBe("completed");
    expect(game.winnerId).toBe(p1.id);
  });

  test("win on anti-diagonal (/)", async () => {
    const gid = await newActiveGame();
    await move(gid, p1.id, 0, 2);
    await move(gid, p2.id, 0, 1);
    await move(gid, p1.id, 1, 1);
    await move(gid, p2.id, 1, 0);
    const { game } = await move(gid, p1.id, 2, 0);
    expect(game.status).toBe("completed");
    expect(game.winnerId).toBe(p1.id);
  });

  // ---- Draw (full board, no winner) ----
  test("draw when board is full without a winner", async () => {
    const gid = await newActiveGame();
    // classic draw pattern
    await move(gid, p1.id, 0, 0); // X
    await move(gid, p2.id, 0, 1); // O
    await move(gid, p1.id, 0, 2); // X
    await move(gid, p2.id, 1, 1); // O
    await move(gid, p1.id, 1, 0); // X
    await move(gid, p2.id, 1, 2); // O
    await move(gid, p1.id, 2, 1); // X
    await move(gid, p2.id, 2, 0); // O
    const { game } = await move(gid, p1.id, 2, 2); // X
    expect(game.status).toBe("draw");
    expect(game.winnerId).toBeNull();
  });

  // ---- Invalids & immutability ----
  test("rejects out-of-bounds and occupied cells", async () => {
    const gid = await newActiveGame();
    await expect(move(gid, p1.id, -1, 0)).rejects.toThrow(/coordinates/);
    await expect(move(gid, p1.id, 3, 0)).rejects.toThrow(/coordinates/);

    await move(gid, p1.id, 0, 0);
    await expect(move(gid, p2.id, 0, 0)).rejects.toThrow(/occupied/);
  });

  test("rejects moves by players not in the game", async () => {
    const gid = await newActiveGame();
    const stranger = mkPlayer("P3", "Carol");
    await expect(move(gid, stranger.id, 0, 0)).rejects.toThrow(
      /not found in game/i,
    );
  });

  test("game is immutable after completion", async () => {
    const gid = await newActiveGame();
    await move(gid, p1.id, 0, 0);
    await move(gid, p2.id, 1, 0);
    await move(gid, p1.id, 0, 1);
    await move(gid, p2.id, 1, 1);
    const { game } = await move(gid, p1.id, 0, 2); // p1 wins
    expect(game.status).toBe("completed");

    // Further moves should be rejected
    await expect(move(gid, p2.id, 2, 2)).rejects.toThrow(
      /not active|has ended/i,
    );
  });
});

import { GameModel } from '../../../../src/models/game';
import { Player } from '../../../../src/types';

describe('GameModel win/draw logic', () => {
  it('detects a horizontal alignment win', async () => {
    const model = new GameModel();
    const game = await model.createGame('WinTest');
    const p1: Player = { id: 'p1', name: 'P1', email: 'p1@test.com', stats: {} as any, createdAt: new Date(), updatedAt: new Date() };
    const p2: Player = { id: 'p2', name: 'P2', email: 'p2@test.com', stats: {} as any, createdAt: new Date(), updatedAt: new Date() };
    await model.joinGame(game.id, p1);
    await model.joinGame(game.id, p2);
    await model.makeMove(game.id, 'p1', 0, 0);
    await model.makeMove(game.id, 'p2', 1, 0);
    await model.makeMove(game.id, 'p1', 0, 1);
    await model.makeMove(game.id, 'p2', 1, 1);
    const result = await model.makeMove(game.id, 'p1', 0, 2);
    expect(result.game.status).toBe('completed');
    expect(result.game.winnerId).toBe('p1');
  });

  it('detects a draw on a filled grid', async () => {
    const model = new GameModel();
    const game = await model.createGame('DrawTest');
    const p1: Player = { id: 'p1', name: 'P1', email: 'p1@test.com', stats: {} as any, createdAt: new Date(), updatedAt: new Date() };
    const p2: Player = { id: 'p2', name: 'P2', email: 'p2@test.com', stats: {} as any, createdAt: new Date(), updatedAt: new Date() };
    await model.joinGame(game.id, p1);
    await model.joinGame(game.id, p2);
    await model.makeMove(game.id, 'p1', 0, 0);
    await model.makeMove(game.id, 'p2', 0, 1);
    await model.makeMove(game.id, 'p1', 0, 2);
    await model.makeMove(game.id, 'p2', 1, 1);
    await model.makeMove(game.id, 'p1', 1, 0);
    await model.makeMove(game.id, 'p2', 1, 2);
    await model.makeMove(game.id, 'p1', 2, 1);
    await model.makeMove(game.id, 'p2', 2, 0);
    const result = await model.makeMove(game.id, 'p1', 2, 2);
    expect(result.game.status === 'draw' || result.game.status === 'completed').toBeTruthy();
  });
});


// TODO: Expand TypeScript tests for win/draw and routes [ttt.todo.tests.ts.expand]
import request from 'supertest';
import app from '../../../src/index';

describe('Games routes', () => {
  it('creates a game', async () => {
    const res = await request(app).post('/games').send({ name: 'RouteTest' });
    expect(res.status).toBe(201);
    expect(res.body.game?.id).toBeDefined();
  });
});


// TODO: Expand TypeScript tests for win/draw and routes [ttt.todo.tests.ts.expand]
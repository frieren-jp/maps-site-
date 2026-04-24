import request from 'supertest';
import app from '../src/index';

describe('Маршруты API', () => {
  it('GET /api/routes должен возвращать массив', async () => {
    const res = await request(app).get('/api/routes');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

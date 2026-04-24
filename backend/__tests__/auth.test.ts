import request from 'supertest';
import app from '../src/index';

describe('Аутентификация', () => {
  it('login admin/admin возвращает токен', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'admin', password: 'admin' });
    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
  });
});

import request from 'supertest';
import app from '../src/app';

describe('Auth API', () => {
  it('returns token for local admin account', async () => {
    const response = await request(app).post('/api/auth/login').send({
      username: 'admin',
      password: 'admin',
    });

    expect(response.status).toBe(200);
    expect(response.body.token).toBeTruthy();
    expect(response.body.user.username).toBe('admin');
  });
});

import request from 'supertest';

jest.mock('../src/utils/db', () => ({
  __esModule: true,
  default: {
    query: jest.fn(),
  },
  initializeDatabase: jest.fn(),
}));

import app from '../src/app';
import pool from '../src/utils/db';

const mockedQuery = pool.query as jest.Mock;

describe('Routes API', () => {
  beforeEach(() => {
    mockedQuery.mockReset();
  });

  it('returns normalized routes list', async () => {
    mockedQuery.mockResolvedValueOnce({
      rows: [
        {
          id: 1,
          user_id: 1,
          title: 'Morning Walk',
          description: 'Park route',
          points: [
            { lat: 55.751244, lng: 37.618423, name: 'A' },
            { lat: 55.758, lng: 37.62, name: 'B' },
          ],
          photos: ['/uploads/photo-1.jpg'],
          created_at: '2026-04-24T08:00:00.000Z',
          rating_avg: '4.50',
          rating_count: '2',
          comment_count: '1',
        },
      ],
    });

    const response = await request(app).get('/api/routes');

    expect(response.status).toBe(200);
    expect(response.body[0].title).toBe('Morning Walk');
    expect(response.body[0].stats.ratingAverage).toBe(4.5);
  });

  it('requires auth for route creation', async () => {
    const response = await request(app).post('/api/routes').send({
      title: 'No Auth Route',
      points: [
        { lat: 55.7, lng: 37.6 },
        { lat: 55.8, lng: 37.7 },
      ],
    });

    expect(response.status).toBe(401);
  });
});

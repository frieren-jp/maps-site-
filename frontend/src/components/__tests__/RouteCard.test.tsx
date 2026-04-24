import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { RouteCard } from '../RouteCard';

describe('RouteCard', () => {
  it('renders title and route stats', () => {
    render(
      <MemoryRouter>
        <RouteCard
          route={{
            id: 1,
            title: 'Test route',
            description: 'Description',
            points: [
              { lat: 55.7, lng: 37.6 },
              { lat: 55.8, lng: 37.7 },
            ],
            photos: [],
            createdAt: new Date('2026-04-24T00:00:00.000Z').toISOString(),
            stats: {
              ratingAverage: 4.8,
              ratingCount: 2,
              commentsCount: 3,
            },
          }}
        />
      </MemoryRouter>
    );

    expect(screen.getByText('Test route')).toBeInTheDocument();
    expect(screen.getByText(/4.8/)).toBeInTheDocument();
    expect(screen.getByText(/3/)).toBeInTheDocument();
  });
});

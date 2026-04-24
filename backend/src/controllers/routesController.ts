import { Request, Response } from 'express';
import pool from '../utils/db';
import { RoutePoint } from '../models/Route';

interface RouteRow {
  id: number;
  user_id: number | null;
  title: string;
  description: string | null;
  points: RoutePoint[] | string;
  photos: string[] | string | null;
  created_at: string;
  rating_avg?: string;
  rating_count?: string;
  comment_count?: string;
}

interface MemoryComment {
  id: number;
  username: string;
  comment: string;
  createdAt: string;
}

interface MemoryRoute {
  id: number;
  userId: number | null;
  title: string;
  description: string;
  points: RoutePoint[];
  photos: string[];
  createdAt: string;
  comments: MemoryComment[];
  ratings: Record<string, number>;
}

const parsePoints = (points: unknown): RoutePoint[] => {
  const parsed = typeof points === 'string' ? JSON.parse(points) : points;
  if (!Array.isArray(parsed) || parsed.length < 2) {
    throw new Error('Route must contain at least two points');
  }

  return parsed.map((point) => {
    if (
      typeof point !== 'object' ||
      point === null ||
      typeof (point as RoutePoint).lat !== 'number' ||
      typeof (point as RoutePoint).lng !== 'number'
    ) {
      throw new Error('Each point must include numeric lat/lng');
    }
    return {
      lat: (point as RoutePoint).lat,
      lng: (point as RoutePoint).lng,
      name: (point as RoutePoint).name,
    };
  });
};

const parsePhotos = (photos: unknown): string[] => {
  if (!photos) {
    return [];
  }
  const parsed = typeof photos === 'string' ? JSON.parse(photos) : photos;
  return Array.isArray(parsed) ? parsed.filter((item) => typeof item === 'string') : [];
};

const normalizeRoute = (row: RouteRow) => ({
  id: row.id,
  userId: row.user_id,
  title: row.title,
  description: row.description ?? '',
  points: parsePoints(row.points),
  photos: parsePhotos(row.photos),
  createdAt: row.created_at,
  stats: {
    ratingAverage: Number(row.rating_avg || 0),
    ratingCount: Number(row.rating_count || 0),
    commentsCount: Number(row.comment_count || 0),
  },
});

const memoryRoutes: MemoryRoute[] = [
  {
    id: 1,
    userId: null,
    title: 'Local demo route',
    description: 'Fallback route when database is unavailable',
    points: [
      { lat: 55.751244, lng: 37.618423, name: 'Point A' },
      { lat: 55.758, lng: 37.62, name: 'Point B' },
      { lat: 55.764, lng: 37.605, name: 'Point C' },
    ],
    photos: [],
    createdAt: new Date().toISOString(),
    comments: [
      {
        id: 1,
        username: 'admin',
        comment: 'Demo comment in local fallback mode',
        createdAt: new Date().toISOString(),
      },
    ],
    ratings: { admin: 5 },
  },
];

let memoryRouteId = 2;
let memoryCommentId = 2;

const getMemoryStats = (route: MemoryRoute) => {
  const values = Object.values(route.ratings);
  const ratingCount = values.length;
  const ratingAverage = ratingCount > 0 ? values.reduce((sum, value) => sum + value, 0) / ratingCount : 0;
  return {
    ratingAverage: Number(ratingAverage.toFixed(2)),
    ratingCount,
    commentsCount: route.comments.length,
  };
};

const memoryRouteToItem = (route: MemoryRoute) => ({
  id: route.id,
  userId: route.userId,
  title: route.title,
  description: route.description,
  points: route.points,
  photos: route.photos,
  createdAt: route.createdAt,
  stats: getMemoryStats(route),
});

const getMemoryRoutes = (search?: string, sort: 'newest' | 'oldest' = 'newest') => {
  const filtered = memoryRoutes.filter((route) => {
    if (!search) {
      return true;
    }
    const value = search.toLowerCase();
    return route.title.toLowerCase().includes(value) || route.description.toLowerCase().includes(value);
  });

  filtered.sort((a, b) => {
    const delta = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    return sort === 'newest' ? -delta : delta;
  });

  return filtered.map(memoryRouteToItem);
};

const getMemoryRouteById = (id: number) => memoryRoutes.find((route) => route.id === id);

export const getRoutes = async (req: Request, res: Response) => {
  const search = (req.query.search as string | undefined)?.trim();
  const sort = (req.query.sort as string | undefined) === 'oldest' ? 'ASC' : 'DESC';

  const where: string[] = [];
  const values: string[] = [];

  if (search) {
    values.push(`%${search}%`);
    where.push(`(r.title ILIKE $${values.length} OR r.description ILIKE $${values.length})`);
  }

  const whereClause = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';

  try {
    const result = await pool.query<RouteRow>(
      `
      SELECT
        r.*,
        COALESCE(AVG(rr.rating), 0)::numeric(10,2) AS rating_avg,
        COUNT(DISTINCT rr.id)::int AS rating_count,
        COUNT(DISTINCT rc.id)::int AS comment_count
      FROM routes r
      LEFT JOIN route_ratings rr ON rr.route_id = r.id
      LEFT JOIN route_comments rc ON rc.route_id = r.id
      ${whereClause}
      GROUP BY r.id
      ORDER BY r.created_at ${sort}
      `,
      values
    );

    res.json(result.rows.map(normalizeRoute));
  } catch {
    const normalizedSort = (req.query.sort as string | undefined) === 'oldest' ? 'oldest' : 'newest';
    res.json(getMemoryRoutes(search, normalizedSort));
  }
};

export const getRouteById = async (req: Request, res: Response) => {
  const routeId = Number(req.params.id);
  if (!Number.isInteger(routeId)) {
    return res.status(400).json({ message: 'Invalid route id' });
  }

  try {
    const routeResult = await pool.query<RouteRow>(
      `
      SELECT
        r.*,
        COALESCE(AVG(rr.rating), 0)::numeric(10,2) AS rating_avg,
        COUNT(DISTINCT rr.id)::int AS rating_count,
        COUNT(DISTINCT rc.id)::int AS comment_count
      FROM routes r
      LEFT JOIN route_ratings rr ON rr.route_id = r.id
      LEFT JOIN route_comments rc ON rc.route_id = r.id
      WHERE r.id = $1
      GROUP BY r.id
      `,
      [routeId]
    );

    const routeRow = routeResult.rows[0];
    if (!routeRow) {
      return res.status(404).json({ message: 'Route not found' });
    }

    const commentsResult = await pool.query<{
      id: number;
      username: string;
      comment: string;
      created_at: string;
    }>(
      `SELECT id, username, comment, created_at
       FROM route_comments
       WHERE route_id = $1
       ORDER BY created_at DESC`,
      [routeId]
    );

    return res.json({
      ...normalizeRoute(routeRow),
      comments: commentsResult.rows.map((comment) => ({
        id: comment.id,
        username: comment.username,
        comment: comment.comment,
        createdAt: comment.created_at,
      })),
    });
  } catch {
    const route = getMemoryRouteById(routeId);
    if (!route) {
      return res.status(404).json({ message: 'Route not found' });
    }
    return res.json({
      ...memoryRouteToItem(route),
      comments: route.comments,
    });
  }
};

export const addRoute = async (req: Request, res: Response) => {
  const { title, description, points, photos } = req.body as {
    title?: string;
    description?: string;
    points?: unknown;
    photos?: unknown;
  };

  if (!title || title.trim().length < 3) {
    return res.status(400).json({ message: 'Title must contain at least 3 characters' });
  }

  let parsedPoints: RoutePoint[];
  let parsedPhotos: string[];

  try {
    parsedPoints = parsePoints(points);
    parsedPhotos = parsePhotos(photos);
  } catch (error) {
    return res.status(400).json({ message: (error as Error).message });
  }

  const userId = req.user?.userId ?? null;

  try {
    const result = await pool.query<RouteRow>(
      `
      INSERT INTO routes (user_id, title, description, points, photos, created_at)
      VALUES ($1, $2, $3, $4, $5, NOW())
      RETURNING *
      `,
      [userId, title.trim(), description?.trim() ?? '', JSON.stringify(parsedPoints), JSON.stringify(parsedPhotos)]
    );

    return res.status(201).json(normalizeRoute(result.rows[0]));
  } catch {
    const memoryRoute: MemoryRoute = {
      id: memoryRouteId++,
      userId: userId ?? null,
      title: title.trim(),
      description: description?.trim() ?? '',
      points: parsedPoints,
      photos: parsedPhotos,
      createdAt: new Date().toISOString(),
      comments: [],
      ratings: {},
    };
    memoryRoutes.unshift(memoryRoute);
    return res.status(201).json(memoryRouteToItem(memoryRoute));
  }
};

export const addComment = async (req: Request, res: Response) => {
  const routeId = Number(req.params.id);
  const { comment } = req.body as { comment?: string };
  const username = req.user?.username ?? 'guest';

  if (!Number.isInteger(routeId)) {
    return res.status(400).json({ message: 'Invalid route id' });
  }

  if (!comment || comment.trim().length < 2) {
    return res.status(400).json({ message: 'Comment is too short' });
  }

  try {
    const routeExists = await pool.query('SELECT id FROM routes WHERE id = $1', [routeId]);
    if (routeExists.rowCount === 0) {
      return res.status(404).json({ message: 'Route not found' });
    }

    const result = await pool.query<{ id: number; username: string; comment: string; created_at: string }>(
      `
      INSERT INTO route_comments (route_id, username, comment, created_at)
      VALUES ($1, $2, $3, NOW())
      RETURNING id, username, comment, created_at
      `,
      [routeId, username, comment.trim()]
    );

    const savedComment = result.rows[0];
    return res.status(201).json({
      id: savedComment.id,
      username: savedComment.username,
      comment: savedComment.comment,
      createdAt: savedComment.created_at,
    });
  } catch {
    const route = getMemoryRouteById(routeId);
    if (!route) {
      return res.status(404).json({ message: 'Route not found' });
    }
    const savedComment: MemoryComment = {
      id: memoryCommentId++,
      username,
      comment: comment.trim(),
      createdAt: new Date().toISOString(),
    };
    route.comments.unshift(savedComment);
    return res.status(201).json(savedComment);
  }
};

export const rateRoute = async (req: Request, res: Response) => {
  const routeId = Number(req.params.id);
  const { rating } = req.body as { rating?: number };
  const username = req.user?.username ?? 'guest';
  const numericRating = Number(rating);

  if (!Number.isInteger(routeId)) {
    return res.status(400).json({ message: 'Invalid route id' });
  }

  if (!Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5) {
    return res.status(400).json({ message: 'Rating must be an integer from 1 to 5' });
  }

  try {
    const routeExists = await pool.query('SELECT id FROM routes WHERE id = $1', [routeId]);
    if (routeExists.rowCount === 0) {
      return res.status(404).json({ message: 'Route not found' });
    }

    await pool.query(
      `
      INSERT INTO route_ratings (route_id, username, rating, created_at)
      VALUES ($1, $2, $3, NOW())
      ON CONFLICT (route_id, username)
      DO UPDATE SET rating = EXCLUDED.rating, created_at = NOW()
      `,
      [routeId, username, numericRating]
    );

    const summary = await pool.query<{ avg: string; count: string }>(
      'SELECT COALESCE(AVG(rating), 0)::numeric(10,2) AS avg, COUNT(*)::int AS count FROM route_ratings WHERE route_id = $1',
      [routeId]
    );

    return res.json({
      ratingAverage: Number(summary.rows[0].avg),
      ratingCount: Number(summary.rows[0].count),
    });
  } catch {
    const route = getMemoryRouteById(routeId);
    if (!route) {
      return res.status(404).json({ message: 'Route not found' });
    }
    route.ratings[username] = numericRating;
    const stats = getMemoryStats(route);
    return res.json({
      ratingAverage: stats.ratingAverage,
      ratingCount: stats.ratingCount,
    });
  }
};

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rateRoute = exports.addComment = exports.addRoute = exports.getRouteById = exports.getRoutes = void 0;
const db_1 = __importDefault(require("../utils/db"));
const parsePoints = (points) => {
    const parsed = typeof points === 'string' ? JSON.parse(points) : points;
    if (!Array.isArray(parsed) || parsed.length < 2) {
        throw new Error('Route must contain at least two points');
    }
    return parsed.map((point) => {
        if (typeof point !== 'object' ||
            point === null ||
            typeof point.lat !== 'number' ||
            typeof point.lng !== 'number') {
            throw new Error('Each point must include numeric lat/lng');
        }
        return {
            lat: point.lat,
            lng: point.lng,
            name: point.name,
        };
    });
};
const parsePhotos = (photos) => {
    if (!photos) {
        return [];
    }
    const parsed = typeof photos === 'string' ? JSON.parse(photos) : photos;
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === 'string') : [];
};
const normalizeRoute = (row) => ({
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
const memoryRoutes = [
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
const getMemoryStats = (route) => {
    const values = Object.values(route.ratings);
    const ratingCount = values.length;
    const ratingAverage = ratingCount > 0 ? values.reduce((sum, value) => sum + value, 0) / ratingCount : 0;
    return {
        ratingAverage: Number(ratingAverage.toFixed(2)),
        ratingCount,
        commentsCount: route.comments.length,
    };
};
const memoryRouteToItem = (route) => ({
    id: route.id,
    userId: route.userId,
    title: route.title,
    description: route.description,
    points: route.points,
    photos: route.photos,
    createdAt: route.createdAt,
    stats: getMemoryStats(route),
});
const getMemoryRoutes = (search, sort = 'newest') => {
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
const getMemoryRouteById = (id) => memoryRoutes.find((route) => route.id === id);
const getRoutes = async (req, res) => {
    const search = req.query.search?.trim();
    const sort = req.query.sort === 'oldest' ? 'ASC' : 'DESC';
    const where = [];
    const values = [];
    if (search) {
        values.push(`%${search}%`);
        where.push(`(r.title ILIKE $${values.length} OR r.description ILIKE $${values.length})`);
    }
    const whereClause = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';
    try {
        const result = await db_1.default.query(`
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
      `, values);
        res.json(result.rows.map(normalizeRoute));
    }
    catch {
        const normalizedSort = req.query.sort === 'oldest' ? 'oldest' : 'newest';
        res.json(getMemoryRoutes(search, normalizedSort));
    }
};
exports.getRoutes = getRoutes;
const getRouteById = async (req, res) => {
    const routeId = Number(req.params.id);
    if (!Number.isInteger(routeId)) {
        return res.status(400).json({ message: 'Invalid route id' });
    }
    try {
        const routeResult = await db_1.default.query(`
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
      `, [routeId]);
        const routeRow = routeResult.rows[0];
        if (!routeRow) {
            return res.status(404).json({ message: 'Route not found' });
        }
        const commentsResult = await db_1.default.query(`SELECT id, username, comment, created_at
       FROM route_comments
       WHERE route_id = $1
       ORDER BY created_at DESC`, [routeId]);
        return res.json({
            ...normalizeRoute(routeRow),
            comments: commentsResult.rows.map((comment) => ({
                id: comment.id,
                username: comment.username,
                comment: comment.comment,
                createdAt: comment.created_at,
            })),
        });
    }
    catch {
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
exports.getRouteById = getRouteById;
const addRoute = async (req, res) => {
    const { title, description, points, photos } = req.body;
    if (!title || title.trim().length < 3) {
        return res.status(400).json({ message: 'Title must contain at least 3 characters' });
    }
    let parsedPoints;
    let parsedPhotos;
    try {
        parsedPoints = parsePoints(points);
        parsedPhotos = parsePhotos(photos);
    }
    catch (error) {
        return res.status(400).json({ message: error.message });
    }
    const userId = req.user?.userId ?? null;
    try {
        const result = await db_1.default.query(`
      INSERT INTO routes (user_id, title, description, points, photos, created_at)
      VALUES ($1, $2, $3, $4, $5, NOW())
      RETURNING *
      `, [userId, title.trim(), description?.trim() ?? '', JSON.stringify(parsedPoints), JSON.stringify(parsedPhotos)]);
        return res.status(201).json(normalizeRoute(result.rows[0]));
    }
    catch {
        const memoryRoute = {
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
exports.addRoute = addRoute;
const addComment = async (req, res) => {
    const routeId = Number(req.params.id);
    const { comment } = req.body;
    const username = req.user?.username ?? 'guest';
    if (!Number.isInteger(routeId)) {
        return res.status(400).json({ message: 'Invalid route id' });
    }
    if (!comment || comment.trim().length < 2) {
        return res.status(400).json({ message: 'Comment is too short' });
    }
    try {
        const routeExists = await db_1.default.query('SELECT id FROM routes WHERE id = $1', [routeId]);
        if (routeExists.rowCount === 0) {
            return res.status(404).json({ message: 'Route not found' });
        }
        const result = await db_1.default.query(`
      INSERT INTO route_comments (route_id, username, comment, created_at)
      VALUES ($1, $2, $3, NOW())
      RETURNING id, username, comment, created_at
      `, [routeId, username, comment.trim()]);
        const savedComment = result.rows[0];
        return res.status(201).json({
            id: savedComment.id,
            username: savedComment.username,
            comment: savedComment.comment,
            createdAt: savedComment.created_at,
        });
    }
    catch {
        const route = getMemoryRouteById(routeId);
        if (!route) {
            return res.status(404).json({ message: 'Route not found' });
        }
        const savedComment = {
            id: memoryCommentId++,
            username,
            comment: comment.trim(),
            createdAt: new Date().toISOString(),
        };
        route.comments.unshift(savedComment);
        return res.status(201).json(savedComment);
    }
};
exports.addComment = addComment;
const rateRoute = async (req, res) => {
    const routeId = Number(req.params.id);
    const { rating } = req.body;
    const username = req.user?.username ?? 'guest';
    const numericRating = Number(rating);
    if (!Number.isInteger(routeId)) {
        return res.status(400).json({ message: 'Invalid route id' });
    }
    if (!Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5) {
        return res.status(400).json({ message: 'Rating must be an integer from 1 to 5' });
    }
    try {
        const routeExists = await db_1.default.query('SELECT id FROM routes WHERE id = $1', [routeId]);
        if (routeExists.rowCount === 0) {
            return res.status(404).json({ message: 'Route not found' });
        }
        await db_1.default.query(`
      INSERT INTO route_ratings (route_id, username, rating, created_at)
      VALUES ($1, $2, $3, NOW())
      ON CONFLICT (route_id, username)
      DO UPDATE SET rating = EXCLUDED.rating, created_at = NOW()
      `, [routeId, username, numericRating]);
        const summary = await db_1.default.query('SELECT COALESCE(AVG(rating), 0)::numeric(10,2) AS avg, COUNT(*)::int AS count FROM route_ratings WHERE route_id = $1', [routeId]);
        return res.json({
            ratingAverage: Number(summary.rows[0].avg),
            ratingCount: Number(summary.rows[0].count),
        });
    }
    catch {
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
exports.rateRoute = rateRoute;

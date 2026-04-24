import { Request, Response } from 'express';
import pool from '../utils/db';

export const getRoutes = async (req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM routes ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (e) {
    res.status(500).json({ message: 'Ошибка при получении маршрутов' });
  }
};

export const getRouteById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM routes WHERE id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ message: 'Маршрут не найден' });
    res.json(result.rows[0]);
  } catch (e) {
    res.status(500).json({ message: 'Ошибка при получении маршрута' });
  }
};

export const addRoute = async (req: Request, res: Response) => {
  try {
    const { title, description, points, photos } = req.body;
    // userId должен быть получен из токена (заглушка: userId = 1)
    const userId = 1;
    const result = await pool.query(
      'INSERT INTO routes (user_id, title, description, points, photos, created_at) VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING *',
      [userId, title, description, JSON.stringify(points), JSON.stringify(photos || [])]
    );
    res.status(201).json(result.rows[0]);
  } catch (e) {
    res.status(500).json({ message: 'Ошибка при добавлении маршрута' });
  }
};

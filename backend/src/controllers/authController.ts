import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import pool from '../utils/db';
import { JwtUserPayload } from '../types/auth';

const createToken = (payload: JwtUserPayload): string => {
  return jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });
};

export const login = async (req: Request, res: Response) => {
  const { username, password } = req.body as { username?: string; password?: string };

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  // Local test account for quick demo/testing even without a registered user.
  if (username === 'admin' && password === 'admin') {
    const token = createToken({ username: 'admin', isLocalAdmin: true });
    return res.json({ token, user: { username: 'admin', isLocalAdmin: true } });
  }

  try {
    const result = await pool.query('SELECT id, username, password FROM users WHERE username = $1', [username]);
    const user = result.rows[0] as { id: number; username: string; password: string } | undefined;

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = createToken({ userId: user.id, username: user.username });
    return res.json({ token, user: { id: user.id, username: user.username } });
  } catch {
    return res.status(500).json({ message: 'Failed to log in' });
  }
};

export const register = async (req: Request, res: Response) => {
  const { username, password } = req.body as { username?: string; password?: string };

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  if (username.length < 3 || password.length < 4) {
    return res.status(400).json({ message: 'Username or password is too short' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id, username',
      [username, hashedPassword]
    );

    const user = result.rows[0] as { id: number; username: string };
    const token = createToken({ userId: user.id, username: user.username });

    return res.status(201).json({
      token,
      user,
    });
  } catch (error) {
    const pgError = error as { code?: string };
    if (pgError.code === '23505') {
      return res.status(409).json({ message: 'Username is already taken' });
    }
    return res.status(500).json({ message: 'Failed to register user' });
  }
};

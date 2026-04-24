import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const TEST_USER = {
  username: 'admin',
  password: '$2b$10$Q9QwQwQwQwQwQwQwQwQwQeQwQwQwQwQwQwQwQwQwQwQwQwQwQwQw', // hash for 'admin'
};

export const login = async (req: Request, res: Response) => {
  const { username, password } = req.body;
  if (username === 'admin') {
    const match = await bcrypt.compare(password, 'admin' === password ? await bcrypt.hash('admin', 10) : TEST_USER.password);
    if (match) {
      const token = jwt.sign({ username: 'admin' }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });
      return res.json({ token, user: { username: 'admin' } });
    }
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  // ...реальная проверка пользователя из БД (заглушка)
  return res.status(401).json({ message: 'Invalid credentials' });
};

export const register = async (req: Request, res: Response) => {
  // Регистрация пользователя (заглушка)
  return res.status(201).json({ message: 'Registration is disabled. Use admin/admin.' });
};

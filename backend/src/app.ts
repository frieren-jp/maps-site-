import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import fs from 'fs';
import path from 'path';
import authRoutes from './routes/auth';
import routeRoutes from './routes/routes';

dotenv.config();

const app = express();
const uploadsPath = path.join(__dirname, '../uploads');

if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}

app.use(
  cors({
    origin: process.env.FRONTEND_ORIGIN || '*',
  })
);
app.use(express.json({ limit: '3mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(uploadsPath));

app.use('/api/auth', authRoutes);
app.use('/api/routes', routeRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.get('/', (_req, res) => {
  res.send('Route Finder API is running');
});

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (err.message === 'Only image files are allowed') {
    return res.status(400).json({ message: err.message });
  }
  return res.status(500).json({ message: 'Unexpected server error' });
});

export default app;

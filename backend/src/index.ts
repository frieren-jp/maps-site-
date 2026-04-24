import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import routeRoutes from './routes/routes';

dotenv.config();

const app = express();
app.use(cors());

import path from 'path';
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/routes', routeRoutes);

app.get('/', (req, res) => {
  res.send('Route Finder API is running');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});

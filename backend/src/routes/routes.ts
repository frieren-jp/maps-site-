import { Router } from 'express';


import { getRoutes, getRouteById, addRoute } from '../controllers/routesController';
import { upload } from '../middleware/upload';

const router = Router();

// Загрузка фото для маршрута
router.post('/upload-photo', upload.single('photo'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'Нет файла' });
  res.json({ filename: req.file.filename, url: `/uploads/${req.file.filename}` });
});


router.get('/', getRoutes);
router.get('/:id', getRouteById);
router.post('/', addRoute);

export default router;

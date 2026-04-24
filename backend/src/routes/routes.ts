import { Router } from 'express';
import {
  addComment,
  addRoute,
  getRouteById,
  getRoutes,
  rateRoute,
} from '../controllers/routesController';
import { upload } from '../middleware/upload';
import { authenticateJWT } from '../middleware/auth';

const router = Router();

router.get('/', getRoutes);
router.post('/upload-photo', authenticateJWT, upload.single('photo'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Photo is required' });
  }

  return res.json({
    filename: req.file.filename,
    url: `/uploads/${req.file.filename}`,
  });
});
router.get('/:id', getRouteById);
router.post('/', authenticateJWT, addRoute);
router.post('/:id/comments', authenticateJWT, addComment);
router.post('/:id/rate', authenticateJWT, rateRoute);

export default router;

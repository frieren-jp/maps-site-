"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const routesController_1 = require("../controllers/routesController");
const upload_1 = require("../middleware/upload");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get('/', routesController_1.getRoutes);
router.post('/upload-photo', auth_1.authenticateJWT, upload_1.upload.single('photo'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'Photo is required' });
    }
    return res.json({
        filename: req.file.filename,
        url: `/uploads/${req.file.filename}`,
    });
});
router.get('/:id', routesController_1.getRouteById);
router.post('/', auth_1.authenticateJWT, routesController_1.addRoute);
router.post('/:id/comments', auth_1.authenticateJWT, routesController_1.addComment);
router.post('/:id/rate', auth_1.authenticateJWT, routesController_1.rateRoute);
exports.default = router;

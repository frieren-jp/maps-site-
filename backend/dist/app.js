"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const auth_1 = __importDefault(require("./routes/auth"));
const routes_1 = __importDefault(require("./routes/routes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const uploadsPath = path_1.default.join(__dirname, '../uploads');
if (!fs_1.default.existsSync(uploadsPath)) {
    fs_1.default.mkdirSync(uploadsPath, { recursive: true });
}
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_ORIGIN || '*',
}));
app.use(express_1.default.json({ limit: '3mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
app.use('/uploads', express_1.default.static(uploadsPath));
app.use('/api/auth', auth_1.default);
app.use('/api/routes', routes_1.default);
app.get('/api/health', (_req, res) => {
    res.json({ ok: true });
});
app.get('/', (_req, res) => {
    res.send('Route Finder API is running');
});
app.use((err, _req, res, _next) => {
    if (err.message === 'Only image files are allowed') {
        return res.status(400).json({ message: err.message });
    }
    return res.status(500).json({ message: 'Unexpected server error' });
});
exports.default = app;

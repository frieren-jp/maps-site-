"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = exports.login = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const db_1 = __importDefault(require("../utils/db"));
const createToken = (payload) => {
    return jsonwebtoken_1.default.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });
};
const login = async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }
    // Local test account for quick demo/testing even without a registered user.
    if (username === 'admin' && password === 'admin') {
        const token = createToken({ username: 'admin', isLocalAdmin: true });
        return res.json({ token, user: { username: 'admin', isLocalAdmin: true } });
    }
    try {
        const result = await db_1.default.query('SELECT id, username, password FROM users WHERE username = $1', [username]);
        const user = result.rows[0];
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const isValid = await bcrypt_1.default.compare(password, user.password);
        if (!isValid) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const token = createToken({ userId: user.id, username: user.username });
        return res.json({ token, user: { id: user.id, username: user.username } });
    }
    catch {
        return res.status(500).json({ message: 'Failed to log in' });
    }
};
exports.login = login;
const register = async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }
    if (username.length < 3 || password.length < 4) {
        return res.status(400).json({ message: 'Username or password is too short' });
    }
    try {
        const hashedPassword = await bcrypt_1.default.hash(password, 10);
        const result = await db_1.default.query('INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id, username', [username, hashedPassword]);
        const user = result.rows[0];
        const token = createToken({ userId: user.id, username: user.username });
        return res.status(201).json({
            token,
            user,
        });
    }
    catch (error) {
        const pgError = error;
        if (pgError.code === '23505') {
            return res.status(409).json({ message: 'Username is already taken' });
        }
        return res.status(500).json({ message: 'Failed to register user' });
    }
};
exports.register = register;

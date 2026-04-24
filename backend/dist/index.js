"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const db_1 = require("./utils/db");
const PORT = Number(process.env.PORT || 5000);
const start = async () => {
    try {
        await (0, db_1.initializeDatabase)();
        console.log('Database schema initialized');
    }
    catch (error) {
        console.error('Database initialization failed. API will still start.', error);
    }
    app_1.default.listen(PORT, () => {
        console.log(`Server started on port ${PORT}`);
    });
};
void start();

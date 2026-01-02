"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
const app_1 = require("./app");
const database_1 = require("./config/database");
const envDevPath = path_1.default.join(__dirname, '..', '.env.dev');
if (fs_1.default.existsSync(envDevPath)) {
    dotenv_1.default.config({ path: envDevPath });
}
else {
    dotenv_1.default.config();
}
const PORT = process.env.PORT || 3000;
const startServer = async () => {
    try {
        await (0, database_1.connectDB)();
        app_1.app.listen(PORT, () => {
            console.log(`API listening on port ${PORT}`);
        });
    }
    catch (error) {
        console.error('Failed to start server:', error.message);
        process.exit(1);
    }
};
startServer();

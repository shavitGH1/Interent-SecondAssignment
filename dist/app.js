"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetStore = exports.app = void 0;
const path_1 = __importDefault(require("path"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const healthRoutes_1 = __importDefault(require("./routes/healthRoutes"));
const itemRoutes_1 = __importDefault(require("./routes/itemRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const postRoutes_1 = __importDefault(require("./routes/postRoutes"));
const commentRoutes_1 = __importDefault(require("./routes/commentRoutes"));
const store_1 = require("./models/store");
Object.defineProperty(exports, "resetStore", { enumerable: true, get: function () { return store_1.resetStore; } });
const app = (0, express_1.default)();
exports.app = app;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
const swaggerDefinition = {
    openapi: '3.0.0',
    info: {
        title: 'Sample REST API',
        version: '2.0.0',
        description: 'Express REST API with Swagger docs and Jest tests'
    },
    servers: [{ url: 'http://localhost:3000', description: 'Local dev server' }]
};
const swaggerOptions = {
    swaggerDefinition,
    apis: [
        path_1.default.join(__dirname, 'routes', '*.ts'),
        __filename
    ]
};
const swaggerSpec = (0, swagger_jsdoc_1.default)(swaggerOptions);
app.use('/api/docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerSpec));
/**
 * @openapi
 * components:
 *   schemas:
 *     Item:
 *       type: object
 *       required:
 *         - name
 *         - price
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         name:
 *           type: string
 *           example: Sample item
 *         price:
 *           type: number
 *           format: float
 *           example: 9.99
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: 64b0c0f2f2f0f2f0f2f0f2f0
 *         sender_id:
 *           type: integer
 *           example: 1
 *         content:
 *           type: string
 *           example: Short bio
 *         date:
 *           type: string
 *           format: date-time
 *         email:
 *           type: string
 *           format: email
 *     Post:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         content:
 *           type: string
 *         date:
 *           type: string
 *           format: date-time
 *         sender_id:
 *           type: integer
 *     Comment:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         content:
 *           type: string
 *         date:
 *           type: string
 *           format: date-time
 *         sender_id:
 *           type: integer
 *         post_id:
 *           type: string
 */
app.use('/api', healthRoutes_1.default);
app.use('/api', itemRoutes_1.default);
app.use('/api', userRoutes_1.default);
app.use('/api', postRoutes_1.default);
app.use('/api', commentRoutes_1.default);
// Fallback handler
app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

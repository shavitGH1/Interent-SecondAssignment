"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const postsController_1 = require("../controllers/postsController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.post('/post', auth_1.authRequired, postsController_1.createPost);
router.get('/post', postsController_1.listPosts);
router.get('/post/:post_id', postsController_1.getPost);
router.put('/post/:post_id', auth_1.authRequired, postsController_1.updatePost);
exports.default = router;

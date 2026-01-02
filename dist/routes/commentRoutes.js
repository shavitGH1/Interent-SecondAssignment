"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const commentsController_1 = require("../controllers/commentsController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.post('/comment', auth_1.authRequired, commentsController_1.createComment);
router.get('/comment/:comment_id', commentsController_1.getComment);
router.put('/comment/:comment_id', auth_1.authRequired, commentsController_1.updateComment);
router.delete('/comment/:comment_id', auth_1.authRequired, commentsController_1.deleteComment);
router.get('/comment', commentsController_1.listCommentsByPost);
exports.default = router;

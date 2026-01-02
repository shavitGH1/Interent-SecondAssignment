"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const usersController_1 = require("../controllers/usersController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.post('/user/register', usersController_1.register);
router.post('/user/login', usersController_1.login);
router.post('/user/logout', auth_1.authRequired, usersController_1.logout);
router.post('/user/refresh', usersController_1.refresh);
router.get('/user/profile', auth_1.authRequired, usersController_1.profile);
router.put('/user/profile', auth_1.authRequired, usersController_1.updateProfile);
router.delete('/user/profile', auth_1.authRequired, usersController_1.deleteProfile);
router.get('/user/:sender_id', usersController_1.getBySenderId);
exports.default = router;

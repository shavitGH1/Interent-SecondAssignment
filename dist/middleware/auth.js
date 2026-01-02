"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRequired = void 0;
const Session_1 = __importDefault(require("../models/Session"));
const authRequired = async (req, res, next) => {
    const header = req.headers.authorization || '';
    const [, token] = header.split(' ');
    if (!token) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }
    const session = await Session_1.default.findOne({
        accessToken: token,
        expiresAt: { $gt: new Date() }
    }).populate('userId');
    if (!session) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }
    req.user = session.userId;
    req.session = session;
    next();
};
exports.authRequired = authRequired;

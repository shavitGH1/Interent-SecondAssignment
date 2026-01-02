"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBySenderId = exports.deleteProfile = exports.updateProfile = exports.profile = exports.refresh = exports.logout = exports.login = exports.register = exports.sanitizeUser = void 0;
const bcrypt = __importStar(require("bcryptjs"));
const crypto_1 = __importDefault(require("crypto"));
const User_1 = __importDefault(require("../models/User"));
const Session_1 = __importDefault(require("../models/Session"));
const sanitizeUser = (user) => ({
    id: user._id.toString(),
    sender_id: user.sender_id,
    content: user.content,
    date: user.createdAt,
    email: user.email
});
exports.sanitizeUser = sanitizeUser;
const register = async (req, res) => {
    const { email, password, content = '' } = req.body;
    if (!email || !password) {
        res.status(400).json({ message: 'email and password are required' });
        return;
    }
    const existingUser = await User_1.default.findOne({ email });
    if (existingUser) {
        res.status(409).json({ message: 'email already registered' });
        return;
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const senderIdCounter = await User_1.default.countDocuments() + 1;
    const user = new User_1.default({
        sender_id: senderIdCounter,
        content,
        email,
        passwordHash
    });
    await user.save();
    res.status(201).json((0, exports.sanitizeUser)(user));
};
exports.register = register;
const login = async (req, res) => {
    const { email, password } = req.body;
    const user = await User_1.default.findOne({ email });
    if (!user) {
        res.status(401).json({ message: 'Invalid credentials' });
        return;
    }
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
        res.status(401).json({ message: 'Invalid credentials' });
        return;
    }
    const accessToken = crypto_1.default.randomUUID();
    const refreshToken = crypto_1.default.randomUUID();
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60);
    const session = new Session_1.default({
        userId: user._id,
        accessToken,
        refreshToken,
        expiresAt
    });
    await session.save();
    res.json({ accessToken, refreshToken, user: (0, exports.sanitizeUser)(user) });
};
exports.login = login;
const logout = async (req, res) => {
    if (req.session) {
        await Session_1.default.deleteOne({ accessToken: req.session.accessToken });
    }
    res.status(204).send();
};
exports.logout = logout;
const refresh = async (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) {
        res.status(400).json({ message: 'refreshToken is required' });
        return;
    }
    const session = await Session_1.default.findOne({ refreshToken });
    if (!session) {
        res.status(401).json({ message: 'Invalid refresh token' });
        return;
    }
    session.accessToken = crypto_1.default.randomUUID();
    session.expiresAt = new Date(Date.now() + 1000 * 60 * 60);
    await session.save();
    res.json({ accessToken: session.accessToken });
};
exports.refresh = refresh;
const profile = (req, res) => {
    if (req.user) {
        res.json((0, exports.sanitizeUser)(req.user));
    }
    else {
        res.status(401).json({ message: 'Unauthorized' });
    }
};
exports.profile = profile;
const updateProfile = async (req, res) => {
    if (!req.user) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }
    const { email, password, content } = req.body;
    if (email && req.user.email !== email) {
        const existing = await User_1.default.findOne({ email });
        if (existing) {
            res.status(409).json({ message: 'email already registered' });
            return;
        }
    }
    if (email)
        req.user.email = email;
    if (typeof content === 'string')
        req.user.content = content;
    if (password)
        req.user.passwordHash = await bcrypt.hash(password, 10);
    await req.user.save();
    res.json((0, exports.sanitizeUser)(req.user));
};
exports.updateProfile = updateProfile;
const deleteProfile = async (req, res) => {
    if (!req.user) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }
    await User_1.default.deleteOne({ _id: req.user._id });
    await Session_1.default.deleteMany({ userId: req.user._id });
    res.status(204).send();
};
exports.deleteProfile = deleteProfile;
const getBySenderId = async (req, res) => {
    const senderId = Number(req.params.sender_id);
    const user = await User_1.default.findOne({ sender_id: senderId });
    if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
    }
    res.json((0, exports.sanitizeUser)(user));
};
exports.getBySenderId = getBySenderId;

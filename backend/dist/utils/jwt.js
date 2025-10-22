"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decodeToken = exports.verifyRefreshToken = exports.verifyAccessToken = exports.generateRefreshToken = exports.generateAccessToken = void 0;
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '30d';
const generateAccessToken = (payload) => {
    return jwt.sign(payload, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN,
    });
};
exports.generateAccessToken = generateAccessToken;
const generateRefreshToken = (payload) => {
    return jwt.sign(payload, JWT_REFRESH_SECRET, {
        expiresIn: JWT_REFRESH_EXPIRES_IN,
    });
};
exports.generateRefreshToken = generateRefreshToken;
const verifyAccessToken = (token) => {
    try {
        return jwt.verify(token, JWT_SECRET);
    }
    catch (error) {
        throw new Error('Invalid or expired token');
    }
};
exports.verifyAccessToken = verifyAccessToken;
const verifyRefreshToken = (token) => {
    try {
        return jwt.verify(token, JWT_REFRESH_SECRET);
    }
    catch (error) {
        throw new Error('Invalid or expired refresh token');
    }
};
exports.verifyRefreshToken = verifyRefreshToken;
const decodeToken = (token) => {
    try {
        return jwt.decode(token);
    }
    catch (error) {
        return null;
    }
};
exports.decodeToken = decodeToken;
//# sourceMappingURL=jwt.js.map
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.messageLimiter = exports.tweetLimiter = exports.authLimiter = exports.apiLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
// General API rate limiter
exports.apiLimiter = (0, express_rate_limit_1.default)({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
    message: {
        success: false,
        message: 'Too many requests from this IP, please try again later',
    },
    standardHeaders: true,
    legacyHeaders: false,
});
// Strict rate limiter for authentication routes
exports.authLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 requests per window
    message: {
        success: false,
        message: 'Too many authentication attempts, please try again later',
    },
    skipSuccessfulRequests: true,
});
// Tweet creation rate limiter
exports.tweetLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 1000, // 1 minute
    max: 10, // 10 tweets per minute
    message: {
        success: false,
        message: 'You are tweeting too fast, please slow down',
    },
});
// Message rate limiter
exports.messageLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 1000, // 1 minute
    max: 20, // 20 messages per minute
    message: {
        success: false,
        message: 'You are sending messages too fast, please slow down',
    },
});
//# sourceMappingURL=rateLimit.middleware.js.map
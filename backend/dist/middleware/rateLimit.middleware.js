"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.messageLimiter = void 0;
const messageLimiter = (req, res, next) => {
    next();
};
exports.messageLimiter = messageLimiter;
//# sourceMappingURL=rateLimit.middleware.js.map
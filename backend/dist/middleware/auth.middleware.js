"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const jwt_1 = require("../utils/jwt");
const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({
                success: false,
                message: 'No token provided',
            });
            return;
        }
        const token = authHeader.substring(7);
        try {
            const decoded = (0, jwt_1.verifyAccessToken)(token);
            req.user = {
                userId: decoded.userId,
                username: decoded.username,
                email: decoded.email,
            };
            next();
        }
        catch (error) {
            res.status(401).json({
                success: false,
                message: 'Invalid or expired token',
            });
            return;
        }
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Authentication error',
        });
        return;
    }
};
exports.authMiddleware = authMiddleware;
//# sourceMappingURL=auth.middleware.js.map
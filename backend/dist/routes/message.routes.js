"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const messageController_1 = require("../controllers/messageController");
const auth_middleware_1 = require("../middleware/auth.middleware");
const rateLimit_middleware_1 = require("../middleware/rateLimit.middleware");
const router = (0, express_1.Router)();
router.get('/conversations', auth_middleware_1.authMiddleware, messageController_1.getConversations);
router.get('/:userId', auth_middleware_1.authMiddleware, messageController_1.getMessages);
router.post('/:userId', auth_middleware_1.authMiddleware, rateLimit_middleware_1.messageLimiter, messageController_1.sendMessage);
router.put('/:id/read', auth_middleware_1.authMiddleware, messageController_1.markMessageAsRead);
exports.default = router;
//# sourceMappingURL=message.routes.js.map
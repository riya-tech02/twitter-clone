"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const notificationController_1 = require("../controllers/notificationController");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.get('/', auth_middleware_1.authMiddleware, notificationController_1.getNotifications);
router.put('/:id/read', auth_middleware_1.authMiddleware, notificationController_1.markAsRead);
router.put('/read-all', auth_middleware_1.authMiddleware, notificationController_1.markAllAsRead);
exports.default = router;
//# sourceMappingURL=notification.routes.js.map
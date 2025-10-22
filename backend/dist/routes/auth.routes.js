"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const router = (0, express_1.Router)();
// Auth routes
router.post('/signup', authController_1.signup);
router.post('/login', authController_1.login);
router.post('/logout', authController_1.logout);
router.get('/me', authController_1.getMe);
router.post('/refresh-token', authController_1.refreshToken);
exports.default = router;
//# sourceMappingURL=auth.routes.js.map
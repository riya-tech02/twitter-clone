"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userController_1 = require("../controllers/userController");
const auth_middleware_1 = require("../middleware/auth.middleware");
const validation_middleware_1 = require("../middleware/validation.middleware");
const router = (0, express_1.Router)();
router.get('/:username', auth_middleware_1.authMiddleware, userController_1.getUserProfile);
router.put('/profile', auth_middleware_1.authMiddleware, (0, validation_middleware_1.validateRequest)(validation_middleware_1.updateProfileSchema), userController_1.updateProfile);
router.post('/:id/follow', auth_middleware_1.authMiddleware, userController_1.followUser);
router.get('/:id/followers', auth_middleware_1.authMiddleware, userController_1.getFollowers);
router.get('/:id/following', auth_middleware_1.authMiddleware, userController_1.getFollowing);
router.get('/:username/tweets', auth_middleware_1.authMiddleware, userController_1.getUserTweets);
exports.default = router;
//# sourceMappingURL=user.routes.js.map
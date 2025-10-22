"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const tweetController_1 = require("../controllers/tweetController");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.post('/', auth_middleware_1.authMiddleware, tweetController_1.createTweet);
router.get('/', tweetController_1.getTweets);
router.get('/:id', tweetController_1.getTweetById);
router.put('/:id', auth_middleware_1.authMiddleware, tweetController_1.updateTweet);
router.delete('/:id', auth_middleware_1.authMiddleware, tweetController_1.deleteTweet);
router.post('/:id/like', auth_middleware_1.authMiddleware, tweetController_1.likeTweet);
router.post('/:id/retweet', auth_middleware_1.authMiddleware, tweetController_1.retweetTweet);
exports.default = router;
//# sourceMappingURL=tweet.routes.js.map
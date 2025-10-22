"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.unlikeTweet = exports.retweetTweet = exports.likeTweet = exports.deleteTweet = exports.updateTweet = exports.getTweetById = exports.getTweets = exports.createTweet = void 0;
const Tweet_1 = __importDefault(require("../models/Tweet"));
const Comment_1 = __importDefault(require("../models/Comment"));
const redis_1 = require("../config/redis");
const notificationController_1 = require("./notificationController");
const createTweet = async (req, res) => {
    try {
        const { content, media } = req.body;
        const userId = req.user?.userId;
        const tweet = await Tweet_1.default.create({
            author: userId,
            content,
            media: media || [],
        });
        const populatedTweet = await Tweet_1.default.findById(tweet._id)
            .populate('author', 'username displayName profilePicture isVerified');
        // Invalidate feed cache
        await redis_1.cacheService.delPattern('feed:*');
        res.status(201).json({
            success: true,
            message: 'Tweet created successfully',
            data: populatedTweet,
        });
    }
    catch (error) {
        console.error('Create tweet error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating tweet',
            error: error.message,
        });
    }
};
exports.createTweet = createTweet;
const getTweets = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        // Try to get from cache
        const cacheKey = `feed:${page}:${limit}`;
        const cachedData = await redis_1.cacheService.get(cacheKey);
        if (cachedData) {
            res.status(200).json(cachedData);
            return;
        }
        const tweets = await Tweet_1.default.find({ isRetweet: false })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('author', 'username displayName profilePicture isVerified')
            .populate('originalTweet');
        const total = await Tweet_1.default.countDocuments({ isRetweet: false });
        const totalPages = Math.ceil(total / limit);
        const response = {
            success: true,
            data: tweets,
            pagination: {
                page,
                limit,
                total,
                totalPages,
                hasNext: page < totalPages,
                hasPrev: page > 1,
            },
        };
        // Cache for 5 minutes
        await redis_1.cacheService.set(cacheKey, response, 300);
        res.status(200).json(response);
    }
    catch (error) {
        console.error('Get tweets error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching tweets',
            error: error.message,
        });
    }
};
exports.getTweets = getTweets;
const getTweetById = async (req, res) => {
    try {
        const { id } = req.params;
        const tweet = await Tweet_1.default.findById(id)
            .populate('author', 'username displayName profilePicture isVerified')
            .populate('originalTweet');
        if (!tweet) {
            res.status(404).json({
                success: false,
                message: 'Tweet not found',
            });
            return;
        }
        res.status(200).json({
            success: true,
            data: tweet,
        });
    }
    catch (error) {
        console.error('Get tweet error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching tweet',
            error: error.message,
        });
    }
};
exports.getTweetById = getTweetById;
const updateTweet = async (req, res) => {
    try {
        const { id } = req.params;
        const { content } = req.body;
        const userId = req.user?.userId;
        const tweet = await Tweet_1.default.findById(id);
        if (!tweet) {
            res.status(404).json({
                success: false,
                message: 'Tweet not found',
            });
            return;
        }
        if (tweet.author.toString() !== userId) {
            res.status(403).json({
                success: false,
                message: 'Not authorized to update this tweet',
            });
            return;
        }
        tweet.content = content;
        await tweet.save();
        await redis_1.cacheService.delPattern('feed:*');
        res.status(200).json({
            success: true,
            message: 'Tweet updated successfully',
            data: tweet,
        });
    }
    catch (error) {
        console.error('Update tweet error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating tweet',
            error: error.message,
        });
    }
};
exports.updateTweet = updateTweet;
const deleteTweet = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.userId;
        const tweet = await Tweet_1.default.findById(id);
        if (!tweet) {
            res.status(404).json({
                success: false,
                message: 'Tweet not found',
            });
            return;
        }
        if (tweet.author.toString() !== userId) {
            res.status(403).json({
                success: false,
                message: 'Not authorized to delete this tweet',
            });
            return;
        }
        await Tweet_1.default.findByIdAndDelete(id);
        await Comment_1.default.deleteMany({ tweet: id });
        await redis_1.cacheService.delPattern('feed:*');
        res.status(200).json({
            success: true,
            message: 'Tweet deleted successfully',
        });
    }
    catch (error) {
        console.error('Delete tweet error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting tweet',
            error: error.message,
        });
    }
};
exports.deleteTweet = deleteTweet;
const likeTweet = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.userId;
        const tweet = await Tweet_1.default.findById(id);
        if (!tweet) {
            res.status(404).json({
                success: false,
                message: 'Tweet not found',
            });
            return;
        }
        const hasLiked = tweet.likes.some((like) => like.toString() === userId);
        if (hasLiked) {
            tweet.likes = tweet.likes.filter((like) => like.toString() !== userId);
            tweet.likeCount = Math.max(0, tweet.likeCount - 1);
        }
        else {
            tweet.likes.push(userId);
            tweet.likeCount += 1;
            // Create notification
            if (tweet.author.toString() !== userId) {
                await (0, notificationController_1.createNotification)({
                    recipient: tweet.author.toString(),
                    sender: userId,
                    type: 'like',
                    tweet: tweet._id.toString(),
                });
            }
        }
        await tweet.save();
        await redis_1.cacheService.delPattern('feed:*');
        res.status(200).json({
            success: true,
            message: hasLiked ? 'Tweet unliked' : 'Tweet liked',
            data: { liked: !hasLiked, likeCount: tweet.likeCount },
        });
    }
    catch (error) {
        console.error('Like tweet error:', error);
        res.status(500).json({
            success: false,
            message: 'Error liking tweet',
            error: error.message,
        });
    }
};
exports.likeTweet = likeTweet;
const retweetTweet = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.userId;
        const originalTweet = await Tweet_1.default.findById(id);
        if (!originalTweet) {
            res.status(404).json({
                success: false,
                message: 'Tweet not found',
            });
            return;
        }
        // Check if already retweeted
        const existingRetweet = await Tweet_1.default.findOne({
            author: userId,
            originalTweet: id,
            isRetweet: true,
        });
        if (existingRetweet) {
            await Tweet_1.default.findByIdAndDelete(existingRetweet._id);
            originalTweet.retweetCount = Math.max(0, originalTweet.retweetCount - 1);
            await originalTweet.save();
            res.status(200).json({
                success: true,
                message: 'Retweet removed',
                data: { retweeted: false },
            });
            return;
        }
        const retweet = await Tweet_1.default.create({
            author: userId,
            content: originalTweet.content,
            originalTweet: id,
            isRetweet: true,
        });
        originalTweet.retweetCount += 1;
        await originalTweet.save();
        // Create notification
        if (originalTweet.author.toString() !== userId) {
            await (0, notificationController_1.createNotification)({
                recipient: originalTweet.author.toString(),
                sender: userId,
                type: 'retweet',
                tweet: originalTweet._id.toString(),
            });
        }
        await redis_1.cacheService.delPattern('feed:*');
        res.status(201).json({
            success: true,
            message: 'Tweet retweeted',
            data: { retweeted: true, retweet },
        });
    }
    catch (error) {
        console.error('Retweet error:', error);
        res.status(500).json({
            success: false,
            message: 'Error retweeting',
            error: error.message,
        });
    }
};
exports.retweetTweet = retweetTweet;
const unlikeTweet = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.userId;
        const tweet = await Tweet_1.default.findById(id);
        if (!tweet) {
            res.status(404).json({
                success: false,
                message: 'Tweet not found',
            });
            return;
        }
        tweet.likes = tweet.likes.filter((like) => like.toString() !== userId);
        tweet.likeCount = Math.max(0, tweet.likeCount - 1);
        await tweet.save();
        await redis_1.cacheService.delPattern('feed:*');
        res.status(200).json({
            success: true,
            message: 'Tweet unliked',
            data: { likeCount: tweet.likeCount },
        });
    }
    catch (error) {
        console.error('Unlike tweet error:', error);
        res.status(500).json({
            success: false,
            message: 'Error unliking tweet',
            error: error.message,
        });
    }
};
exports.unlikeTweet = unlikeTweet;
exports.default = {
    createTweet: exports.createTweet,
    getTweets: exports.getTweets,
    getTweetById: exports.getTweetById,
    updateTweet: exports.updateTweet,
    deleteTweet: exports.deleteTweet,
    likeTweet: exports.likeTweet,
    retweetTweet: exports.retweetTweet,
};
//# sourceMappingURL=tweetController.js.map
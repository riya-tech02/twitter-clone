"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserTweets = exports.getFollowing = exports.getFollowers = exports.followUser = exports.updateProfile = exports.getUserProfile = void 0;
const User_1 = __importDefault(require("../models/User"));
const Tweet_1 = __importDefault(require("../models/Tweet"));
const redis_1 = require("../config/redis");
const notificationController_1 = require("./notificationController");
const getUserProfile = async (req, res) => {
    try {
        const { username } = req.params;
        const cacheKey = `user:${username}`;
        const cachedUser = await redis_1.cacheService.get(cacheKey);
        if (cachedUser) {
            res.status(200).json({ success: true, data: cachedUser });
            return;
        }
        const user = await User_1.default.findOne({ username });
        if (!user) {
            res.status(404).json({
                success: false,
                message: 'User not found',
            });
            return;
        }
        await redis_1.cacheService.set(cacheKey, user, 600); // Cache for 10 minutes
        res.status(200).json({
            success: true,
            data: user,
        });
    }
    catch (error) {
        console.error('Get user profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching user profile',
            error: error.message,
        });
    }
};
exports.getUserProfile = getUserProfile;
const updateProfile = async (req, res) => {
    try {
        const userId = req.user?.userId;
        const { displayName, bio } = req.body;
        const user = await User_1.default.findById(userId);
        if (!user) {
            res.status(404).json({
                success: false,
                message: 'User not found',
            });
            return;
        }
        if (displayName)
            user.displayName = displayName;
        if (bio !== undefined)
            user.bio = bio;
        await user.save();
        await redis_1.cacheService.del(`user:${user.username}`);
        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            data: user,
        });
    }
    catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating profile',
            error: error.message,
        });
    }
};
exports.updateProfile = updateProfile;
const followUser = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.userId;
        if (id === userId) {
            res.status(400).json({
                success: false,
                message: 'Cannot follow yourself',
            });
            return;
        }
        const userToFollow = await User_1.default.findById(id);
        const currentUser = await User_1.default.findById(userId);
        if (!userToFollow || !currentUser) {
            res.status(404).json({
                success: false,
                message: 'User not found',
            });
            return;
        }
        const isFollowing = currentUser.following.some((followId) => followId.toString() === id);
        if (isFollowing) {
            // Unfollow
            currentUser.following = currentUser.following.filter((followId) => followId.toString() !== id);
            userToFollow.followers = userToFollow.followers.filter((followerId) => followerId.toString() !== userId);
            currentUser.followingCount = Math.max(0, currentUser.followingCount - 1);
            userToFollow.followerCount = Math.max(0, userToFollow.followerCount - 1);
        }
        else {
            // Follow
            currentUser.following.push(id);
            userToFollow.followers.push(userId);
            currentUser.followingCount += 1;
            userToFollow.followerCount += 1;
            // Create notification
            await (0, notificationController_1.createNotification)({
                recipient: id,
                sender: userId,
                type: 'follow',
            });
        }
        await currentUser.save();
        await userToFollow.save();
        await redis_1.cacheService.del(`user:${userToFollow.username}`);
        await redis_1.cacheService.del(`user:${currentUser.username}`);
        res.status(200).json({
            success: true,
            message: isFollowing ? 'Unfollowed user' : 'Followed user',
            data: { following: !isFollowing },
        });
    }
    catch (error) {
        console.error('Follow user error:', error);
        res.status(500).json({
            success: false,
            message: 'Error following user',
            error: error.message,
        });
    }
};
exports.followUser = followUser;
const getFollowers = async (req, res) => {
    try {
        const { id } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        const user = await User_1.default.findById(id)
            .populate({
            path: 'followers',
            select: 'username displayName profilePicture isVerified',
            options: { skip, limit },
        });
        if (!user) {
            res.status(404).json({
                success: false,
                message: 'User not found',
            });
            return;
        }
        const total = user.followerCount;
        const totalPages = Math.ceil(total / limit);
        res.status(200).json({
            success: true,
            data: user.followers,
            pagination: {
                page,
                limit,
                total,
                totalPages,
                hasNext: page < totalPages,
                hasPrev: page > 1,
            },
        });
    }
    catch (error) {
        console.error('Get followers error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching followers',
            error: error.message,
        });
    }
};
exports.getFollowers = getFollowers;
const getFollowing = async (req, res) => {
    try {
        const { id } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        const user = await User_1.default.findById(id)
            .populate({
            path: 'following',
            select: 'username displayName profilePicture isVerified',
            options: { skip, limit },
        });
        if (!user) {
            res.status(404).json({
                success: false,
                message: 'User not found',
            });
            return;
        }
        const total = user.followingCount;
        const totalPages = Math.ceil(total / limit);
        res.status(200).json({
            success: true,
            data: user.following,
            pagination: {
                page,
                limit,
                total,
                totalPages,
                hasNext: page < totalPages,
                hasPrev: page > 1,
            },
        });
    }
    catch (error) {
        console.error('Get following error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching following',
            error: error.message,
        });
    }
};
exports.getFollowing = getFollowing;
const getUserTweets = async (req, res) => {
    try {
        const { username } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        const user = await User_1.default.findOne({ username });
        if (!user) {
            res.status(404).json({
                success: false,
                message: 'User not found',
            });
            return;
        }
        const tweets = await Tweet_1.default.find({ author: user._id })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('author', 'username displayName profilePicture isVerified')
            .populate('originalTweet');
        const total = await Tweet_1.default.countDocuments({ author: user._id });
        const totalPages = Math.ceil(total / limit);
        res.status(200).json({
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
        });
    }
    catch (error) {
        console.error('Get user tweets error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching user tweets',
            error: error.message,
        });
    }
};
exports.getUserTweets = getUserTweets;
//# sourceMappingURL=userController.js.map
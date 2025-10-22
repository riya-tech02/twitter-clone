"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.markMessageAsRead = exports.getConversations = exports.getMessages = exports.sendMessage = void 0;
const Message_1 = __importDefault(require("../models/Message"));
const User_1 = __importDefault(require("../models/User"));
const sendMessage = async (req, res) => {
    try {
        const { userId } = req.params;
        const { content } = req.body;
        const senderId = req.user?.userId;
        const receiver = await User_1.default.findById(userId);
        if (!receiver) {
            res.status(404).json({
                success: false,
                message: 'User not found',
            });
            return;
        }
        const message = await Message_1.default.create({
            sender: senderId,
            receiver: userId,
            content,
        });
        const populatedMessage = await Message_1.default.findById(message._id)
            .populate('sender', 'username displayName profilePicture')
            .populate('receiver', 'username displayName profilePicture');
        res.status(201).json({
            success: true,
            message: 'Message sent successfully',
            data: populatedMessage,
        });
    }
    catch (error) {
        console.error('Send message error:', error);
        res.status(500).json({
            success: false,
            message: 'Error sending message',
            error: error.message,
        });
    }
};
exports.sendMessage = sendMessage;
const getMessages = async (req, res) => {
    try {
        const { userId } = req.params;
        const currentUserId = req.user?.userId;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const skip = (page - 1) * limit;
        const messages = await Message_1.default.find({
            $or: [
                { sender: currentUserId, receiver: userId },
                { sender: userId, receiver: currentUserId },
            ],
        })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('sender', 'username displayName profilePicture')
            .populate('receiver', 'username displayName profilePicture');
        const total = await Message_1.default.countDocuments({
            $or: [
                { sender: currentUserId, receiver: userId },
                { sender: userId, receiver: currentUserId },
            ],
        });
        const totalPages = Math.ceil(total / limit);
        res.status(200).json({
            success: true,
            data: messages.reverse(),
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
        console.error('Get messages error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching messages',
            error: error.message,
        });
    }
};
exports.getMessages = getMessages;
const getConversations = async (req, res) => {
    try {
        const userId = req.user?.userId;
        const messages = await Message_1.default.aggregate([
            {
                $match: {
                    $or: [{ sender: userId }, { receiver: userId }],
                },
            },
            {
                $sort: { createdAt: -1 },
            },
            {
                $group: {
                    _id: {
                        $cond: [
                            { $eq: ['$sender', userId] },
                            '$receiver',
                            '$sender',
                        ],
                    },
                    lastMessage: { $first: '$$ROOT' },
                },
            },
            {
                $replaceRoot: { newRoot: '$lastMessage' },
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'sender',
                    foreignField: '_id',
                    as: 'sender',
                },
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'receiver',
                    foreignField: '_id',
                    as: 'receiver',
                },
            },
            {
                $unwind: '$sender',
            },
            {
                $unwind: '$receiver',
            },
            {
                $project: {
                    sender: {
                        _id: 1,
                        username: 1,
                        displayName: 1,
                        profilePicture: 1,
                    },
                    receiver: {
                        _id: 1,
                        username: 1,
                        displayName: 1,
                        profilePicture: 1,
                    },
                    content: 1,
                    read: 1,
                    createdAt: 1,
                },
            },
        ]);
        res.status(200).json({
            success: true,
            data: messages,
        });
    }
    catch (error) {
        console.error('Get conversations error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching conversations',
            error: error.message,
        });
    }
};
exports.getConversations = getConversations;
const markMessageAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.userId;
        const message = await Message_1.default.findOne({ _id: id, receiver: userId });
        if (!message) {
            res.status(404).json({
                success: false,
                message: 'Message not found',
            });
            return;
        }
        message.read = true;
        await message.save();
        res.status(200).json({
            success: true,
            message: 'Message marked as read',
        });
    }
    catch (error) {
        console.error('Mark message as read error:', error);
        res.status(500).json({
            success: false,
            message: 'Error marking message as read',
            error: error.message,
        });
    }
};
exports.markMessageAsRead = markMessageAsRead;
//# sourceMappingURL=messageController.js.map
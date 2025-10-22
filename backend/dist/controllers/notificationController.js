"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.markAllAsRead = exports.markAsRead = exports.getNotifications = exports.createNotification = void 0;
const Notification_1 = __importDefault(require("../models/Notification"));
const createNotification = async (data) => {
    try {
        await Notification_1.default.create(data);
    }
    catch (error) {
        console.error('Create notification error:', error);
    }
};
exports.createNotification = createNotification;
const getNotifications = async (req, res) => {
    try {
        const userId = req.user?.userId;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        const notifications = await Notification_1.default.find({ recipient: userId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('sender', 'username displayName profilePicture isVerified')
            .populate('tweet', 'content')
            .populate('comment', 'content');
        const total = await Notification_1.default.countDocuments({ recipient: userId });
        const totalPages = Math.ceil(total / limit);
        const unreadCount = await Notification_1.default.countDocuments({
            recipient: userId,
            read: false
        });
        res.status(200).json({
            success: true,
            data: notifications,
            pagination: {
                page,
                limit,
                total,
                totalPages,
                hasNext: page < totalPages,
                hasPrev: page > 1,
            },
            unreadCount,
        });
    }
    catch (error) {
        console.error('Get notifications error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching notifications',
            error: error.message,
        });
    }
};
exports.getNotifications = getNotifications;
const markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.userId;
        const notification = await Notification_1.default.findOne({ _id: id, recipient: userId });
        if (!notification) {
            res.status(404).json({
                success: false,
                message: 'Notification not found',
            });
            return;
        }
        notification.read = true;
        await notification.save();
        res.status(200).json({
            success: true,
            message: 'Notification marked as read',
        });
    }
    catch (error) {
        console.error('Mark as read error:', error);
        res.status(500).json({
            success: false,
            message: 'Error marking notification as read',
            error: error.message,
        });
    }
};
exports.markAsRead = markAsRead;
const markAllAsRead = async (req, res) => {
    try {
        const userId = req.user?.userId;
        await Notification_1.default.updateMany({ recipient: userId, read: false }, { read: true });
        res.status(200).json({
            success: true,
            message: 'All notifications marked as read',
        });
    }
    catch (error) {
        console.error('Mark all as read error:', error);
        res.status(500).json({
            success: false,
            message: 'Error marking all notifications as read',
            error: error.message,
        });
    }
};
exports.markAllAsRead = markAllAsRead;
//# sourceMappingURL=notificationController.js.map
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isUserOnline = exports.getOnlineUsers = exports.setupSocketHandlers = void 0;
const Message_1 = __importDefault(require("../models/Message"));
const jwt_1 = require("../utils/jwt");
const onlineUsers = {};
const setupSocketHandlers = (io) => {
    io.use((socket, next) => {
        const token = socket.handshake.auth.token;
        if (!token) {
            return next(new Error('Authentication error'));
        }
        try {
            const decoded = (0, jwt_1.verifyAccessToken)(token);
            socket.data.userId = decoded.userId;
            socket.data.username = decoded.username;
            next();
        }
        catch (error) {
            next(new Error('Authentication error'));
        }
    });
    io.on('connection', (socket) => {
        const userId = socket.data.userId;
        console.log(`✅ User connected: ${userId}`);
        // Store online user
        onlineUsers[userId] = socket.id;
        socket.join(userId);
        // Emit online status
        io.emit('user:online', { userId });
        // Send message
        socket.on('message:send', async (data) => {
            try {
                const message = await Message_1.default.create({
                    sender: userId,
                    receiver: data.receiverId,
                    content: data.content,
                });
                const populatedMessage = await Message_1.default.findById(message._id)
                    .populate('sender', 'username displayName profilePicture')
                    .populate('receiver', 'username displayName profilePicture');
                // Emit to receiver
                io.to(data.receiverId).emit('message:receive', populatedMessage);
                // Emit to sender (confirmation)
                socket.emit('message:sent', populatedMessage);
            }
            catch (error) {
                console.error('Send message error:', error);
                socket.emit('message:error', { message: 'Failed to send message' });
            }
        });
        // Typing indicator
        socket.on('typing:start', (data) => {
            io.to(data.receiverId).emit('typing:start', {
                senderId: userId,
                username: socket.data.username,
            });
        });
        socket.on('typing:stop', (data) => {
            io.to(data.receiverId).emit('typing:stop', {
                senderId: userId,
            });
        });
        // Mark message as read
        socket.on('message:read', async (data) => {
            try {
                const message = await Message_1.default.findById(data.messageId);
                if (message && message.receiver.toString() === userId) {
                    message.read = true;
                    await message.save();
                    io.to(message.sender.toString()).emit('message:read', {
                        messageId: data.messageId,
                    });
                }
            }
            catch (error) {
                console.error('Mark as read error:', error);
            }
        });
        // Disconnect
        socket.on('disconnect', () => {
            console.log(`❌ User disconnected: ${userId}`);
            delete onlineUsers[userId];
            io.emit('user:offline', { userId });
        });
    });
    return io;
};
exports.setupSocketHandlers = setupSocketHandlers;
const getOnlineUsers = () => {
    return onlineUsers;
};
exports.getOnlineUsers = getOnlineUsers;
const isUserOnline = (userId) => {
    return userId in onlineUsers;
};
exports.isUserOnline = isUserOnline;
//# sourceMappingURL=socketHandlers.js.map
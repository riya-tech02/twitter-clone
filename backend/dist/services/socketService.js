"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeSocket = void 0;
const socket_io_1 = require("socket.io");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const initializeSocket = (httpServer) => {
    const io = new socket_io_1.Server(httpServer, {
        cors: {
            origin: 'http://localhost:3000',
            methods: ['GET', 'POST'],
            credentials: true,
        },
    });
    io.use((socket, next) => {
        const token = socket.handshake.auth.token;
        if (!token) {
            return next(new Error('Authentication error'));
        }
        try {
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'my-twitter-app-secret-key-12345');
            socket.userId = decoded.userId;
            socket.username = decoded.username;
            next();
        }
        catch (error) {
            next(new Error('Authentication error'));
        }
    });
    io.on('connection', (socket) => {
        console.log(`User connected: ${socket.userId}`);
        socket.join(`user:${socket.userId}`);
        socket.on('new_tweet', (data) => {
            io.emit('tweet_created', data);
        });
        socket.on('tweet_liked', (data) => {
            io.emit('tweet_liked', data);
        });
        socket.on('disconnect', () => {
            console.log(`User disconnected: ${socket.userId}`);
        });
    });
    return io;
};
exports.initializeSocket = initializeSocket;
exports.default = exports.initializeSocket;
//# sourceMappingURL=socketService.js.map
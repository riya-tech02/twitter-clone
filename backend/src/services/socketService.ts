import { Server as SocketServer, Socket } from 'socket.io';
import { Server } from 'http';
import jwt from 'jsonwebtoken';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  username?: string;
}

export const initializeSocket = (httpServer: Server) => {
  const io = new SocketServer(httpServer, {
    cors: {
      origin: 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.use((socket: AuthenticatedSocket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error'));
    }

    try {
      const decoded: any = jwt.verify(
        token,
        process.env.JWT_SECRET || 'my-twitter-app-secret-key-12345'
      );
      socket.userId = decoded.userId;
      socket.username = decoded.username;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
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

export default initializeSocket;

import { Server, Socket } from 'socket.io';
import Message from '../models/Message';
import { verifyAccessToken } from '../utils/jwt';

interface ISocketUser {
  [userId: string]: string;
}

const onlineUsers: ISocketUser = {};

export const setupSocketHandlers = (io: Server) => {
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error('Authentication error'));
    }

    try {
      const decoded = verifyAccessToken(token);
      socket.data.userId = decoded.userId;
      socket.data.username = decoded.username;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const userId = socket.data.userId;
    console.log(`✅ User connected: ${userId}`);

    // Store online user
    onlineUsers[userId] = socket.id;
    socket.join(userId);

    // Emit online status
    io.emit('user:online', { userId });

    // Send message
    socket.on('message:send', async (data: { receiverId: string; content: string }) => {
      try {
        const message = await Message.create({
          sender: userId,
          receiver: data.receiverId,
          content: data.content,
        });

        const populatedMessage = await Message.findById(message._id)
          .populate('sender', 'username displayName profilePicture')
          .populate('receiver', 'username displayName profilePicture');

        // Emit to receiver
        io.to(data.receiverId).emit('message:receive', populatedMessage);

        // Emit to sender (confirmation)
        socket.emit('message:sent', populatedMessage);
      } catch (error) {
        console.error('Send message error:', error);
        socket.emit('message:error', { message: 'Failed to send message' });
      }
    });

    // Typing indicator
    socket.on('typing:start', (data: { receiverId: string }) => {
      io.to(data.receiverId).emit('typing:start', {
        senderId: userId,
        username: socket.data.username,
      });
    });

    socket.on('typing:stop', (data: { receiverId: string }) => {
      io.to(data.receiverId).emit('typing:stop', {
        senderId: userId,
      });
    });

    // Mark message as read
    socket.on('message:read', async (data: { messageId: string }) => {
      try {
        const message = await Message.findById(data.messageId);
        if (message && message.receiver.toString() === userId) {
          message.read = true;
          await message.save();

          io.to(message.sender.toString()).emit('message:read', {
            messageId: data.messageId,
          });
        }
      } catch (error) {
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

export const getOnlineUsers = (): ISocketUser => {
  return onlineUsers;
};

export const isUserOnline = (userId: string): boolean => {
  return userId in onlineUsers;
};
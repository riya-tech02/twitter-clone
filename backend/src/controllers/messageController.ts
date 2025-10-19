import { Response } from 'express';
import Message from '../models/Message';
import User from '../models/User';
import { IAuthRequest, IAPIResponse } from '../types';

export const sendMessage = async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const { content } = req.body;
    const senderId = req.user?.userId;

    const receiver = await User.findById(userId);

    if (!receiver) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      } as IAPIResponse);
      return;
    }

    const message = await Message.create({
      sender: senderId,
      receiver: userId,
      content,
    });

    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'username displayName profilePicture')
      .populate('receiver', 'username displayName profilePicture');

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: populatedMessage,
    } as IAPIResponse);
  } catch (error: any) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending message',
      error: error.message,
    } as IAPIResponse);
  }
};

export const getMessages = async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user?.userId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;

    const messages = await Message.find({
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

    const total = await Message.countDocuments({
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
    } as IAPIResponse);
  } catch (error: any) {
    console.error('Get messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching messages',
      error: error.message,
    } as IAPIResponse);
  }
};

export const getConversations = async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;

    const messages = await Message.aggregate([
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
    } as IAPIResponse);
  } catch (error: any) {
    console.error('Get conversations error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching conversations',
      error: error.message,
    } as IAPIResponse);
  }
};

export const markMessageAsRead = async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    const message = await Message.findOne({ _id: id, receiver: userId });

    if (!message) {
      res.status(404).json({
        success: false,
        message: 'Message not found',
      } as IAPIResponse);
      return;
    }

    message.read = true;
    await message.save();

    res.status(200).json({
      success: true,
      message: 'Message marked as read',
    } as IAPIResponse);
  } catch (error: any) {
    console.error('Mark message as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking message as read',
      error: error.message,
    } as IAPIResponse);
  }
};
import { Response } from 'express';
import Notification from '../models/Notification';
import { IAuthRequest, IAPIResponse } from '../types';

interface ICreateNotification {
  recipient: string;
  sender: string;
  type: 'like' | 'comment' | 'follow' | 'retweet' | 'mention';
  tweet?: string;
  comment?: string;
}

export const createNotification = async (data: ICreateNotification): Promise<void> => {
  try {
    await Notification.create(data);
  } catch (error) {
    console.error('Create notification error:', error);
  }
};

export const getNotifications = async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const notifications = await Notification.find({ recipient: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('sender', 'username displayName profilePicture isVerified')
      .populate('tweet', 'content')
      .populate('comment', 'content');

    const total = await Notification.countDocuments({ recipient: userId });
    const totalPages = Math.ceil(total / limit);
    const unreadCount = await Notification.countDocuments({ 
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
    } as IAPIResponse);
  } catch (error: any) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching notifications',
      error: error.message,
    } as IAPIResponse);
  }
};

export const markAsRead = async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    const notification = await Notification.findOne({ _id: id, recipient: userId });

    if (!notification) {
      res.status(404).json({
        success: false,
        message: 'Notification not found',
      } as IAPIResponse);
      return;
    }

    notification.read = true;
    await notification.save();

    res.status(200).json({
      success: true,
      message: 'Notification marked as read',
    } as IAPIResponse);
  } catch (error: any) {
    console.error('Mark as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking notification as read',
      error: error.message,
    } as IAPIResponse);
  }
};

export const markAllAsRead = async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;

    await Notification.updateMany(
      { recipient: userId, read: false },
      { read: true }
    );

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read',
    } as IAPIResponse);
  } catch (error: any) {
    console.error('Mark all as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking all notifications as read',
      error: error.message,
    } as IAPIResponse);
  }
};
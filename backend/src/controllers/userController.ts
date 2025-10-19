import { Response } from 'express';
import User from '../models/User';
import Tweet from '../models/Tweet';
import { IAuthRequest, IAPIResponse } from '../types';
import { cacheService } from '../config/redis';
import { createNotification } from './notificationController';

export const getUserProfile = async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    const { username } = req.params;

    const cacheKey = `user:${username}`;
    const cachedUser = await cacheService.get(cacheKey);

    if (cachedUser) {
      res.status(200).json({ success: true, data: cachedUser } as IAPIResponse);
      return;
    }

    const user = await User.findOne({ username });

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      } as IAPIResponse);
      return;
    }

    await cacheService.set(cacheKey, user, 600); // Cache for 10 minutes

    res.status(200).json({
      success: true,
      data: user,
    } as IAPIResponse);
  } catch (error: any) {
    console.error('Get user profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user profile',
      error: error.message,
    } as IAPIResponse);
  }
};

export const updateProfile = async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { displayName, bio } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      } as IAPIResponse);
      return;
    }

    if (displayName) user.displayName = displayName;
    if (bio !== undefined) user.bio = bio;

    await user.save();

    await cacheService.del(`user:${user.username}`);

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: user,
    } as IAPIResponse);
  } catch (error: any) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating profile',
      error: error.message,
    } as IAPIResponse);
  }
};

export const followUser = async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    if (id === userId) {
      res.status(400).json({
        success: false,
        message: 'Cannot follow yourself',
      } as IAPIResponse);
      return;
    }

    const userToFollow = await User.findById(id);
    const currentUser = await User.findById(userId);

    if (!userToFollow || !currentUser) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      } as IAPIResponse);
      return;
    }

    const isFollowing = currentUser.following.some(
      (followId: any) => followId.toString() === id
    );

    if (isFollowing) {
      // Unfollow
      currentUser.following = currentUser.following.filter(
        (followId: any) => followId.toString() !== id
      );
      userToFollow.followers = userToFollow.followers.filter(
        (followerId: any) => followerId.toString() !== userId
      );
      currentUser.followingCount = Math.max(0, currentUser.followingCount - 1);
      userToFollow.followerCount = Math.max(0, userToFollow.followerCount - 1);
    } else {
      // Follow
      currentUser.following.push(id as any);
      userToFollow.followers.push(userId as any);
      currentUser.followingCount += 1;
      userToFollow.followerCount += 1;

      // Create notification
      await createNotification({
        recipient: id,
        sender: userId!,
        type: 'follow',
      });
    }

    await currentUser.save();
    await userToFollow.save();

    await cacheService.del(`user:${userToFollow.username}`);
    await cacheService.del(`user:${currentUser.username}`);

    res.status(200).json({
      success: true,
      message: isFollowing ? 'Unfollowed user' : 'Followed user',
      data: { following: !isFollowing },
    } as IAPIResponse);
  } catch (error: any) {
    console.error('Follow user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error following user',
      error: error.message,
    } as IAPIResponse);
  }
};

export const getFollowers = async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const user = await User.findById(id)
      .populate({
        path: 'followers',
        select: 'username displayName profilePicture isVerified',
        options: { skip, limit },
      });

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      } as IAPIResponse);
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
    } as IAPIResponse);
  } catch (error: any) {
    console.error('Get followers error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching followers',
      error: error.message,
    } as IAPIResponse);
  }
};

export const getFollowing = async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const user = await User.findById(id)
      .populate({
        path: 'following',
        select: 'username displayName profilePicture isVerified',
        options: { skip, limit },
      });

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      } as IAPIResponse);
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
    } as IAPIResponse);
  } catch (error: any) {
    console.error('Get following error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching following',
      error: error.message,
    } as IAPIResponse);
  }
};

export const getUserTweets = async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    const { username } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const user = await User.findOne({ username });

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      } as IAPIResponse);
      return;
    }

    const tweets = await Tweet.find({ author: user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('author', 'username displayName profilePicture isVerified')
      .populate('originalTweet');

    const total = await Tweet.countDocuments({ author: user._id });
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
    } as IAPIResponse);
  } catch (error: any) {
    console.error('Get user tweets error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user tweets',
      error: error.message,
    } as IAPIResponse);
  }
};
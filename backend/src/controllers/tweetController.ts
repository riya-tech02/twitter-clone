import { Response } from 'express';
import Tweet from '../models/Tweet';
import Comment from '../models/Comment';
import User from '../models/User';
import { IAuthRequest, IAPIResponse } from '../types';
import { cacheService } from '../config/redis';
import { createNotification } from './notificationController';

export const createTweet = async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    const { content, media } = req.body;
    const userId = req.user?.userId;

    const tweet = await Tweet.create({
      author: userId,
      content,
      media: media || [],
    });

    const populatedTweet = await Tweet.findById(tweet._id)
      .populate('author', 'username displayName profilePicture isVerified');

    // Invalidate feed cache
    await cacheService.delPattern('feed:*');

    res.status(201).json({
      success: true,
      message: 'Tweet created successfully',
      data: populatedTweet,
    } as IAPIResponse);
  } catch (error: any) {
    console.error('Create tweet error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating tweet',
      error: error.message,
    } as IAPIResponse);
  }
};

export const getTweets = async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    // Try to get from cache
    const cacheKey = `feed:${page}:${limit}`;
    const cachedData = await cacheService.get(cacheKey);

    if (cachedData) {
      res.status(200).json(cachedData);
      return;
    }

    const tweets = await Tweet.find({ isRetweet: false })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('author', 'username displayName profilePicture isVerified')
      .populate('originalTweet');

    const total = await Tweet.countDocuments({ isRetweet: false });
    const totalPages = Math.ceil(total / limit);

    const response: IAPIResponse = {
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
    };

    // Cache for 5 minutes
    await cacheService.set(cacheKey, response, 300);

    res.status(200).json(response);
  } catch (error: any) {
    console.error('Get tweets error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching tweets',
      error: error.message,
    } as IAPIResponse);
  }
};

export const getTweetById = async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const tweet = await Tweet.findById(id)
      .populate('author', 'username displayName profilePicture isVerified')
      .populate('originalTweet');

    if (!tweet) {
      res.status(404).json({
        success: false,
        message: 'Tweet not found',
      } as IAPIResponse);
      return;
    }

    res.status(200).json({
      success: true,
      data: tweet,
    } as IAPIResponse);
  } catch (error: any) {
    console.error('Get tweet error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching tweet',
      error: error.message,
    } as IAPIResponse);
  }
};

export const updateTweet = async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user?.userId;

    const tweet = await Tweet.findById(id);

    if (!tweet) {
      res.status(404).json({
        success: false,
        message: 'Tweet not found',
      } as IAPIResponse);
      return;
    }

    if (tweet.author.toString() !== userId) {
      res.status(403).json({
        success: false,
        message: 'Not authorized to update this tweet',
      } as IAPIResponse);
      return;
    }

    tweet.content = content;
    await tweet.save();

    await cacheService.delPattern('feed:*');

    res.status(200).json({
      success: true,
      message: 'Tweet updated successfully',
      data: tweet,
    } as IAPIResponse);
  } catch (error: any) {
    console.error('Update tweet error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating tweet',
      error: error.message,
    } as IAPIResponse);
  }
};

export const deleteTweet = async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    const tweet = await Tweet.findById(id);

    if (!tweet) {
      res.status(404).json({
        success: false,
        message: 'Tweet not found',
      } as IAPIResponse);
      return;
    }

    if (tweet.author.toString() !== userId) {
      res.status(403).json({
        success: false,
        message: 'Not authorized to delete this tweet',
      } as IAPIResponse);
      return;
    }

    await Tweet.findByIdAndDelete(id);
    await Comment.deleteMany({ tweet: id });

    await cacheService.delPattern('feed:*');

    res.status(200).json({
      success: true,
      message: 'Tweet deleted successfully',
    } as IAPIResponse);
  } catch (error: any) {
    console.error('Delete tweet error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting tweet',
      error: error.message,
    } as IAPIResponse);
  }
};

export const likeTweet = async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    const tweet = await Tweet.findById(id);

    if (!tweet) {
      res.status(404).json({
        success: false,
        message: 'Tweet not found',
      } as IAPIResponse);
      return;
    }

    const hasLiked = tweet.likes.some((like: any) => like.toString() === userId);

    if (hasLiked) {
      tweet.likes = tweet.likes.filter((like: any) => like.toString() !== userId);
      tweet.likeCount = Math.max(0, tweet.likeCount - 1);
    } else {
      tweet.likes.push(userId as any);
      tweet.likeCount += 1;

      // Create notification
      if (tweet.author.toString() !== userId) {
        await createNotification({
          recipient: tweet.author.toString(),
          sender: userId!,
          type: 'like',
          tweet: tweet._id.toString(),
        });
      }
    }

    await tweet.save();
    await cacheService.delPattern('feed:*');

    res.status(200).json({
      success: true,
      message: hasLiked ? 'Tweet unliked' : 'Tweet liked',
      data: { liked: !hasLiked, likeCount: tweet.likeCount },
    } as IAPIResponse);
  } catch (error: any) {
    console.error('Like tweet error:', error);
    res.status(500).json({
      success: false,
      message: 'Error liking tweet',
      error: error.message,
    } as IAPIResponse);
  }
};

export const retweetTweet = async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    const originalTweet = await Tweet.findById(id);

    if (!originalTweet) {
      res.status(404).json({
        success: false,
        message: 'Tweet not found',
      } as IAPIResponse);
      return;
    }

    // Check if already retweeted
    const existingRetweet = await Tweet.findOne({
      author: userId,
      originalTweet: id,
      isRetweet: true,
    });

    if (existingRetweet) {
      await Tweet.findByIdAndDelete(existingRetweet._id);
      originalTweet.retweetCount = Math.max(0, originalTweet.retweetCount - 1);
      await originalTweet.save();

      res.status(200).json({
        success: true,
        message: 'Retweet removed',
        data: { retweeted: false },
      } as IAPIResponse);
      return;
    }

    const retweet = await Tweet.create({
      author: userId,
      content: originalTweet.content,
      originalTweet: id,
      isRetweet: true,
    });

    originalTweet.retweetCount += 1;
    await originalTweet.save();

    // Create notification
    if (originalTweet.author.toString() !== userId) {
      await createNotification({
        recipient: originalTweet.author.toString(),
        sender: userId!,
        type: 'retweet',
        tweet: originalTweet._id.toString(),
      });
    }

    await cacheService.delPattern('feed:*');

    res.status(201).json({
      success: true,
      message: 'Tweet retweeted',
      data: { retweeted: true, retweet },
    } as IAPIResponse);
  } catch (error: any) {
    console.error('Retweet error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retweeting',
      error: error.message,
    } as IAPIResponse);
  }
}
export const unlikeTweet = async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    const tweet = await Tweet.findById(id);

    if (!tweet) {
      res.status(404).json({
        success: false,
        message: 'Tweet not found',
      } as IAPIResponse);
      return;
    }

    tweet.likes = tweet.likes.filter((like: any) => like.toString() !== userId);
    tweet.likeCount = Math.max(0, tweet.likeCount - 1);
    await tweet.save();
    await cacheService.delPattern('feed:*');

    res.status(200).json({
      success: true,
      message: 'Tweet unliked',
      data: { likeCount: tweet.likeCount },
    } as IAPIResponse);
  } catch (error: any) {
    console.error('Unlike tweet error:', error);
    res.status(500).json({
      success: false,
      message: 'Error unliking tweet',
      error: error.message,
    } as IAPIResponse);
  }
};


export default {
  createTweet,
  getTweets,
  getTweetById,
  updateTweet,
  deleteTweet,
  likeTweet,
  retweetTweet,
};

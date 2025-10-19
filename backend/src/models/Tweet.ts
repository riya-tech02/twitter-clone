import mongoose, { Schema } from 'mongoose';
import { ITweet } from '../types';

const MediaSchema = new Schema({
  type: {
    type: String,
    enum: ['image', 'video'],
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  thumbnailUrl: {
    type: String,
  },
}, { _id: false });

const TweetSchema = new Schema<ITweet>(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    content: {
      type: String,
      required: true,
      maxlength: 280,
      trim: true,
    },
    media: [MediaSchema],
    likes: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    likeCount: {
      type: Number,
      default: 0,
    },
    commentCount: {
      type: Number,
      default: 0,
    },
    retweetCount: {
      type: Number,
      default: 0,
    },
    originalTweet: {
      type: Schema.Types.ObjectId,
      ref: 'Tweet',
    },
    isRetweet: {
      type: Boolean,
      default: false,
    },
    mentions: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    hashtags: [
      {
        type: String,
        lowercase: true,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Compound indexes for efficient queries
TweetSchema.index({ author: 1, createdAt: -1 });
TweetSchema.index({ createdAt: -1 });
TweetSchema.index({ likes: 1 });
TweetSchema.index({ hashtags: 1 });
TweetSchema.index({ mentions: 1 });

// Text index for search functionality
TweetSchema.index({ content: 'text' });

// Middleware to extract hashtags and mentions
TweetSchema.pre('save', function (next) {
  // Extract hashtags
  const hashtagRegex = /#(\w+)/g;
  const hashtags = this.content.match(hashtagRegex);
  if (hashtags) {
    this.hashtags = hashtags.map(tag => tag.substring(1).toLowerCase());
  }

  // Note: Mentions would need to be handled in the controller
  // as we need to verify user existence
  
  next();
});

const Tweet = mongoose.models.Tweet || mongoose.model<ITweet>('Tweet', TweetSchema);

export default Tweet;
import mongoose, { Schema } from 'mongoose';
import { IComment } from '../types';

const CommentSchema = new Schema<IComment>(
  {
    tweet: {
      type: Schema.Types.ObjectId,
      ref: 'Tweet',
      required: true,
      index: true,
    },
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
  },
  {
    timestamps: true,
  }
);

// Indexes
CommentSchema.index({ tweet: 1, createdAt: -1 });
CommentSchema.index({ author: 1 });
CommentSchema.index({ createdAt: -1 });

const Comment = mongoose.models.Comment || mongoose.model<IComment>('Comment', CommentSchema);

export default Comment;
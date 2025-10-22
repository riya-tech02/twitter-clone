import { Request } from 'express';
import { Document, Types } from 'mongoose';
export interface IUser extends Document {
    _id: Types.ObjectId;
    username: string;
    email: string;
    password: string;
    displayName: string;
    bio?: string;
    profilePicture?: string;
    coverPhoto?: string;
    followers: Types.ObjectId[];
    following: Types.ObjectId[];
    followerCount: number;
    followingCount: number;
    isVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
    comparePassword(candidatePassword: string): Promise<boolean>;
}
export interface ITweet extends Document {
    _id: Types.ObjectId;
    author: Types.ObjectId;
    content: string;
    media?: IMedia[];
    likes: Types.ObjectId[];
    likeCount: number;
    commentCount: number;
    retweetCount: number;
    originalTweet?: Types.ObjectId;
    isRetweet: boolean;
    mentions: Types.ObjectId[];
    hashtags: string[];
    createdAt: Date;
    updatedAt: Date;
}
export interface IMedia {
    type: 'image' | 'video';
    url: string;
    thumbnailUrl?: string;
}
export interface IComment extends Document {
    _id: Types.ObjectId;
    tweet: Types.ObjectId;
    author: Types.ObjectId;
    content: string;
    likes: Types.ObjectId[];
    likeCount: number;
    createdAt: Date;
    updatedAt: Date;
}
export interface IMessage extends Document {
    _id: Types.ObjectId;
    sender: Types.ObjectId;
    receiver: Types.ObjectId;
    content: string;
    read: boolean;
    createdAt: Date;
}
export interface INotification extends Document {
    _id: Types.ObjectId;
    recipient: Types.ObjectId;
    sender: Types.ObjectId;
    type: 'like' | 'comment' | 'follow' | 'retweet' | 'mention';
    tweet?: Types.ObjectId;
    comment?: Types.ObjectId;
    read: boolean;
    createdAt: Date;
}
export interface IJWTPayload {
    userId: string;
    username: string;
    email: string;
}
export interface IAuthRequest extends Request {
    user?: {
        userId: string;
        username: string;
        email: string;
    };
}
export interface IAPIResponse<T = any> {
    success: boolean;
    message?: string;
    data?: T;
    error?: string;
    pagination?: IPagination;
}
export interface IPagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
}
export interface ISocketUser {
    userId: string;
    socketId: string;
}
export interface ITypingEvent {
    senderId: string;
    receiverId: string;
    isTyping: boolean;
}
export interface IMessageEvent {
    senderId: string;
    receiverId: string;
    content: string;
    createdAt: Date;
}
//# sourceMappingURL=index.d.ts.map
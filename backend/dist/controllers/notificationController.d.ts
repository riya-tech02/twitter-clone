import { Response } from 'express';
import { IAuthRequest } from '../types';
interface ICreateNotification {
    recipient: string;
    sender: string;
    type: 'like' | 'comment' | 'follow' | 'retweet' | 'mention';
    tweet?: string;
    comment?: string;
}
export declare const createNotification: (data: ICreateNotification) => Promise<void>;
export declare const getNotifications: (req: IAuthRequest, res: Response) => Promise<void>;
export declare const markAsRead: (req: IAuthRequest, res: Response) => Promise<void>;
export declare const markAllAsRead: (req: IAuthRequest, res: Response) => Promise<void>;
export {};
//# sourceMappingURL=notificationController.d.ts.map
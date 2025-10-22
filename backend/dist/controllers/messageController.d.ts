import { Response } from 'express';
import { IAuthRequest } from '../types';
export declare const sendMessage: (req: IAuthRequest, res: Response) => Promise<void>;
export declare const getMessages: (req: IAuthRequest, res: Response) => Promise<void>;
export declare const getConversations: (req: IAuthRequest, res: Response) => Promise<void>;
export declare const markMessageAsRead: (req: IAuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=messageController.d.ts.map
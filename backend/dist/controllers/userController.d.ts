import { Response } from 'express';
import { IAuthRequest } from '../types';
export declare const getUserProfile: (req: IAuthRequest, res: Response) => Promise<void>;
export declare const updateProfile: (req: IAuthRequest, res: Response) => Promise<void>;
export declare const followUser: (req: IAuthRequest, res: Response) => Promise<void>;
export declare const getFollowers: (req: IAuthRequest, res: Response) => Promise<void>;
export declare const getFollowing: (req: IAuthRequest, res: Response) => Promise<void>;
export declare const getUserTweets: (req: IAuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=userController.d.ts.map
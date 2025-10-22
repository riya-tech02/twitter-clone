import { Response } from 'express';
import { IAuthRequest } from '../types';
export declare const createTweet: (req: IAuthRequest, res: Response) => Promise<void>;
export declare const getTweets: (req: IAuthRequest, res: Response) => Promise<void>;
export declare const getTweetById: (req: IAuthRequest, res: Response) => Promise<void>;
export declare const updateTweet: (req: IAuthRequest, res: Response) => Promise<void>;
export declare const deleteTweet: (req: IAuthRequest, res: Response) => Promise<void>;
export declare const likeTweet: (req: IAuthRequest, res: Response) => Promise<void>;
export declare const retweetTweet: (req: IAuthRequest, res: Response) => Promise<void>;
export declare const unlikeTweet: (req: IAuthRequest, res: Response) => Promise<void>;
declare const _default: {
    createTweet: (req: IAuthRequest, res: Response) => Promise<void>;
    getTweets: (req: IAuthRequest, res: Response) => Promise<void>;
    getTweetById: (req: IAuthRequest, res: Response) => Promise<void>;
    updateTweet: (req: IAuthRequest, res: Response) => Promise<void>;
    deleteTweet: (req: IAuthRequest, res: Response) => Promise<void>;
    likeTweet: (req: IAuthRequest, res: Response) => Promise<void>;
    retweetTweet: (req: IAuthRequest, res: Response) => Promise<void>;
};
export default _default;
//# sourceMappingURL=tweetController.d.ts.map
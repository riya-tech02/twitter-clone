import { Request, Response } from 'express';
import { IAuthRequest } from '../types';
export declare const signup: (req: Request, res: Response) => Promise<void>;
export declare const login: (req: Request, res: Response) => Promise<void>;
export declare const getMe: (req: IAuthRequest, res: Response) => Promise<void>;
export declare const refreshToken: (req: Request, res: Response) => Promise<void>;
export declare const logout: (req: IAuthRequest, res: Response) => Promise<void>;
declare const _default: {
    signup: (req: Request, res: Response) => Promise<void>;
    login: (req: Request, res: Response) => Promise<void>;
    getMe: (req: IAuthRequest, res: Response) => Promise<void>;
    refreshToken: (req: Request, res: Response) => Promise<void>;
    logout: (req: IAuthRequest, res: Response) => Promise<void>;
};
export default _default;
//# sourceMappingURL=authController.d.ts.map
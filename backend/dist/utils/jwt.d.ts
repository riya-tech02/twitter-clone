import { IJWTPayload } from '../types';
export declare const generateAccessToken: (payload: IJWTPayload) => string;
export declare const generateRefreshToken: (payload: IJWTPayload) => string;
export declare const verifyAccessToken: (token: string) => IJWTPayload;
export declare const verifyRefreshToken: (token: string) => IJWTPayload;
export declare const decodeToken: (token: string) => IJWTPayload | null;
//# sourceMappingURL=jwt.d.ts.map
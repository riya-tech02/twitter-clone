declare const redisClient: any;
export declare const cacheService: {
    set(key: string, value: any, ttl?: number): Promise<void>;
    get<T>(key: string): Promise<T | null>;
    del(key: string): Promise<void>;
    delPattern(pattern: string): Promise<void>;
    exists(key: string): Promise<boolean>;
    expire(key: string, ttl: number): Promise<void>;
};
export default redisClient;
//# sourceMappingURL=redis.d.ts.map
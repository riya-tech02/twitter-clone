export declare const cacheService: {
    get: (key: string) => Promise<null>;
    set: (key: string, value: any, ttl?: number) => Promise<void>;
    del: (key: string) => Promise<void>;
    delPattern: (pattern: string) => Promise<void>;
};
//# sourceMappingURL=redis.d.ts.map
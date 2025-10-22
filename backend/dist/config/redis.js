"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cacheService = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
const redisClient = new ioredis_1.default(process.env.REDIS_URL || 'redis://localhost:6379', {
    password: process.env.REDIS_PASSWORD || undefined,
    retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
    },
    maxRetriesPerRequest: 3,
});
redisClient.on('connect', () => {
    console.log('✅ Redis Connected Successfully');
});
redisClient.on('error', (err) => {
    console.error('❌ Redis Connection Error:', err);
});
redisClient.on('reconnecting', () => {
    console.log('⚠️ Redis Reconnecting...');
});
// Helper functions for caching
exports.cacheService = {
    // Set cache with TTL (Time To Live in seconds)
    async set(key, value, ttl = 300) {
        try {
            await redisClient.setex(key, ttl, JSON.stringify(value));
        }
        catch (error) {
            console.error('Redis SET error:', error);
        }
    },
    // Get cached data
    async get(key) {
        try {
            const data = await redisClient.get(key);
            return data ? JSON.parse(data) : null;
        }
        catch (error) {
            console.error('Redis GET error:', error);
            return null;
        }
    },
    // Delete cache
    async del(key) {
        try {
            await redisClient.del(key);
        }
        catch (error) {
            console.error('Redis DEL error:', error);
        }
    },
    // Delete multiple keys with pattern
    async delPattern(pattern) {
        try {
            const keys = await redisClient.keys(pattern);
            if (keys.length > 0) {
                await redisClient.del(...keys);
            }
        }
        catch (error) {
            console.error('Redis DEL PATTERN error:', error);
        }
    },
    // Check if key exists
    async exists(key) {
        try {
            const result = await redisClient.exists(key);
            return result === 1;
        }
        catch (error) {
            console.error('Redis EXISTS error:', error);
            return false;
        }
    },
    // Set expiry on existing key
    async expire(key, ttl) {
        try {
            await redisClient.expire(key, ttl);
        }
        catch (error) {
            console.error('Redis EXPIRE error:', error);
        }
    }
};
exports.default = redisClient;
//# sourceMappingURL=redis.js.map
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGO_URI || '';
        const dbName = process.env.MONGO_DB_NAME || 'twitter_clone';
        await mongoose_1.default.connect(mongoURI, {
            dbName,
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });
        console.log('✅ MongoDB Connected Successfully');
        // Enable sharding for tweets collection
        const db = mongoose_1.default.connection.db;
        if (db) {
            try {
                await db.admin().command({ enableSharding: dbName });
                await db.admin().command({
                    shardCollection: `${dbName}.tweets`,
                    key: { author: 1, createdAt: 1 }
                });
                console.log('✅ MongoDB Sharding Enabled for Tweets');
            }
            catch (err) {
                console.log('ℹ️ Sharding already configured or not available');
            }
        }
        mongoose_1.default.connection.on('error', (err) => {
            console.error('❌ MongoDB connection error:', err);
        });
        mongoose_1.default.connection.on('disconnected', () => {
            console.log('⚠️ MongoDB disconnected');
        });
    }
    catch (error) {
        console.error('❌ MongoDB Connection Failed:', error);
        process.exit(1);
    }
};
exports.default = connectDB;
//# sourceMappingURL=database.js.map
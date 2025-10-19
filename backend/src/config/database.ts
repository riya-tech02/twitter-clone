import mongoose from 'mongoose';

const connectDB = async (): Promise<void> => {
  try {
    const mongoURI = process.env.MONGO_URI || '';
    const dbName = process.env.MONGO_DB_NAME || 'twitter_clone';

    await mongoose.connect(mongoURI, {
      dbName,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log('✅ MongoDB Connected Successfully');

    // Enable sharding for tweets collection
    const db = mongoose.connection.db;
    if (db) {
      try {
        await db.admin().command({ enableSharding: dbName });
        await db.admin().command({
          shardCollection: `${dbName}.tweets`,
          key: { author: 1, createdAt: 1 }
        });
        console.log('✅ MongoDB Sharding Enabled for Tweets');
      } catch (err) {
        console.log('ℹ️ Sharding already configured or not available');
      }
    }

    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ MongoDB disconnected');
    });

  } catch (error) {
    console.error('❌ MongoDB Connection Failed:', error);
    process.exit(1);
  }
};

export default connectDB;
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import http from 'http';
import authRoutes from './routes/auth.routes';
import tweetRoutes from './routes/tweet.routes';
import { initializeSocket } from './services/socketService';

dotenv.config();

const app = express();
const httpServer = http.createServer(app);

const io = initializeSocket(httpServer);
app.set('io', io);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const corsOptions = {
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use('/api/auth', authRoutes);
app.use('/api/tweets', tweetRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

const PORT = process.env.PORT || 5001;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/twitter-clone';

console.log('Attempting to connect to MongoDB...');

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✓ Connected to MongoDB');
    httpServer.listen(PORT, () => {
      console.log(`✓ Server running on port ${PORT}`);
      console.log(`✓ Socket.io ready`);
    });
  })
  .catch(err => {
    console.error('✗ MongoDB error:', err.message);
    httpServer.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  });

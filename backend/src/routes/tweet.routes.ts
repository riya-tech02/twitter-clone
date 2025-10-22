import { Router } from 'express';
import { 
  createTweet, 
  getTweets, 
  getTweetById, 
  updateTweet, 
  deleteTweet, 
  likeTweet,
  retweetTweet
} from '../controllers/tweetController';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.post('/', authMiddleware, createTweet);
router.get('/', getTweets);
router.get('/:id', getTweetById);
router.put('/:id', authMiddleware, updateTweet);
router.delete('/:id', authMiddleware, deleteTweet);
router.post('/:id/like', authMiddleware, likeTweet);
router.post('/:id/retweet', authMiddleware, retweetTweet);

export default router;

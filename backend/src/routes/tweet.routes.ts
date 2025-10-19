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

// Bookmark a tweet
router.post('/:id/bookmark', authMiddleware, async (req: IAuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;
    const User = require('../models/User').default;
    
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    if (!user.bookmarks) user.bookmarks = [];
    
    if (user.bookmarks.includes(id)) {
      res.status(400).json({ success: false, message: 'Already bookmarked' });
      return;
    }

    user.bookmarks.push(id);
    await user.save();

    res.json({ success: true, message: 'Tweet bookmarked' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Error bookmarking tweet', error: error.message });
  }
});

// Remove bookmark
router.post('/:id/unbookmark', authMiddleware, async (req: IAuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;
    const User = require('../models/User').default;
    
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    user.bookmarks = user.bookmarks?.filter((bookmarkId: string) => bookmarkId !== id) || [];
    await user.save();

    res.json({ success: true, message: 'Bookmark removed' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Error removing bookmark', error: error.message });
  }
});

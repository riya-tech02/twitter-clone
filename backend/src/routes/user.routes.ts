import { Router } from 'express';
import {
  getUserProfile,
  updateProfile,
  followUser,
  getFollowers,
  getFollowing,
  getUserTweets,
} from '../controllers/userController';
import { authMiddleware } from '../middleware/auth.middleware';
import { validateRequest, updateProfileSchema } from '../middleware/validation.middleware';

const router = Router();

router.get('/:username', authMiddleware, getUserProfile);
router.put('/profile', authMiddleware, validateRequest(updateProfileSchema), updateProfile);
router.post('/:id/follow', authMiddleware, followUser);
router.get('/:id/followers', authMiddleware, getFollowers);
router.get('/:id/following', authMiddleware, getFollowing);
router.get('/:username/tweets', authMiddleware, getUserTweets);

export default router;
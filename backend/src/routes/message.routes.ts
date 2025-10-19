import { Router } from 'express';
import {
  sendMessage,
  getMessages,
  getConversations,
  markMessageAsRead,
} from '../controllers/messageController';
import { authMiddleware } from '../middleware/auth.middleware';
import { messageLimiter } from '../middleware/rateLimit.middleware';

const router = Router();

router.get('/conversations', authMiddleware, getConversations);
router.get('/:userId', authMiddleware, getMessages);
router.post('/:userId', authMiddleware, messageLimiter, sendMessage);
router.put('/:id/read', authMiddleware, markMessageAsRead);

export default router;
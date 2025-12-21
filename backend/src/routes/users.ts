import express from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = express.Router();

router.use(authenticate);

// Get current user profile
router.get('/me', async (req: AuthRequest, res) => {
  res.json({ user: req.user });
});

export default router;


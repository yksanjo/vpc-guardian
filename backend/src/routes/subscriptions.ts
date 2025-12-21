import express from 'express';
import { pool } from '../db';
import { authenticate, requireOrganization, AuthRequest } from '../middleware/auth';

const router = express.Router();

router.use(authenticate);
router.use(requireOrganization);

// Get organization subscriptions
router.get('/', async (req: AuthRequest, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM subscriptions WHERE organization_id = $1 ORDER BY created_at DESC',
      [req.organizationId]
    );

    res.json({ subscriptions: result.rows });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create subscription (would integrate with Stripe in production)
router.post('/', async (req: AuthRequest, res) => {
  try {
    const { product, plan } = req.body;

    if (!product || !plan) {
      return res.status(400).json({ error: 'Product and plan required' });
    }

    const result = await pool.query(
      `INSERT INTO subscriptions (organization_id, product, plan, status)
       VALUES ($1, $2, $3, 'active')
       RETURNING *`,
      [req.organizationId, product, plan]
    );

    res.json({ subscription: result.rows[0] });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;


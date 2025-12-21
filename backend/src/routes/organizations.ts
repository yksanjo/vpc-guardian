import express from 'express';
import { pool } from '../db';
import { authenticate, requireOrganization, AuthRequest } from '../middleware/auth';

const router = express.Router();

router.use(authenticate);

// Create organization
router.post('/', async (req: AuthRequest, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Organization name required' });
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    // Create organization
    const orgResult = await pool.query(
      'INSERT INTO organizations (name, slug) VALUES ($1, $2) RETURNING *',
      [name, slug]
    );

    const org = orgResult.rows[0];

    // Add creator as admin
    await pool.query(
      'INSERT INTO organization_members (organization_id, user_id, role) VALUES ($1, $2, $3)',
      [org.id, req.user!.id, 'admin']
    );

    res.json({ organization: org });
  } catch (error: any) {
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Organization slug already exists' });
    }
    res.status(500).json({ error: error.message });
  }
});

// Get user's organizations
router.get('/', async (req: AuthRequest, res) => {
  try {
    const result = await pool.query(
      `SELECT o.*, om.role as member_role
       FROM organizations o
       JOIN organization_members om ON o.id = om.organization_id
       WHERE om.user_id = $1
       ORDER BY o.created_at DESC`,
      [req.user!.id]
    );

    res.json({ organizations: result.rows });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get organization details
router.get('/:id', requireOrganization, async (req: AuthRequest, res) => {
  try {
    const result = await pool.query('SELECT * FROM organizations WHERE id = $1', [
      req.organizationId,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    res.json({ organization: result.rows[0] });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;


import express from 'express';
import { pool } from '../db';
import { authenticate, requireOrganization, AuthRequest } from '../middleware/auth';
import { GitHubScanner } from '../services/attackSurface/githubScanner';

const router = express.Router();

router.use(authenticate);
router.use(requireOrganization);

// List GitHub repositories
router.get('/repos', async (req: AuthRequest, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM github_repos WHERE organization_id = $1 ORDER BY created_at DESC',
      [req.organizationId]
    );

    res.json({ repos: result.rows });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Add GitHub repository
router.post('/repos', async (req: AuthRequest, res) => {
  try {
    const { repo_name, repo_url, github_token } = req.body;

    if (!repo_name || !repo_url) {
      return res.status(400).json({ error: 'Repository name and URL required' });
    }

    const result = await pool.query(
      `INSERT INTO github_repos (organization_id, repo_name, repo_url, is_active)
       VALUES ($1, $2, $3, true)
       RETURNING *`,
      [req.organizationId, repo_name, repo_url]
    );

    const repo = result.rows[0];

    // Trigger initial scan if token provided
    if (github_token) {
      const scanner = new GitHubScanner(github_token);
      scanner.scanRepository(req.organizationId!, repo.id, repo_name).catch(console.error);
    }

    res.json({ repo });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Scan repository
router.post('/repos/:repoId/scan', async (req: AuthRequest, res) => {
  try {
    const { repoId } = req.params;
    const { github_token } = req.body;

    if (!github_token) {
      return res.status(400).json({ error: 'GitHub token required' });
    }

    const repoResult = await pool.query(
      'SELECT * FROM github_repos WHERE id = $1 AND organization_id = $2',
      [repoId, req.organizationId]
    );

    if (repoResult.rows.length === 0) {
      return res.status(404).json({ error: 'Repository not found' });
    }

    const repo = repoResult.rows[0];
    const scanner = new GitHubScanner(github_token);
    const scanResult = await scanner.scanRepository(
      req.organizationId!,
      repo.id,
      repo.repo_name
    );

    res.json(scanResult);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get findings
router.get('/findings', async (req: AuthRequest, res) => {
  try {
    const { status, severity, limit = 50, offset = 0 } = req.query;

    let query = 'SELECT * FROM attack_surface_findings WHERE organization_id = $1';
    const params: any[] = [req.organizationId];
    let paramIndex = 2;

    if (status) {
      query += ` AND status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (severity) {
      query += ` AND severity = $${paramIndex}`;
      params.push(severity);
      paramIndex++;
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(parseInt(limit as string), parseInt(offset as string));

    const result = await pool.query(query, params);

    res.json({ findings: result.rows });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get finding details
router.get('/findings/:findingId', async (req: AuthRequest, res) => {
  try {
    const { findingId } = req.params;

    const result = await pool.query(
      `SELECT f.*, r.repo_name, r.repo_url
       FROM attack_surface_findings f
       LEFT JOIN github_repos r ON f.github_repo_id = r.id
       WHERE f.id = $1 AND f.organization_id = $2`,
      [findingId, req.organizationId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Finding not found' });
    }

    res.json({ finding: result.rows[0] });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update finding status
router.patch('/findings/:findingId', async (req: AuthRequest, res) => {
  try {
    const { findingId } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status required' });
    }

    const result = await pool.query(
      `UPDATE attack_surface_findings
       SET status = $1, updated_at = NOW()
       WHERE id = $2 AND organization_id = $3
       RETURNING *`,
      [status, findingId, req.organizationId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Finding not found' });
    }

    res.json({ finding: result.rows[0] });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Generate remediation PR
router.post('/findings/:findingId/remediation', async (req: AuthRequest, res) => {
  try {
    const { findingId } = req.params;
    const { github_token } = req.body;

    if (!github_token) {
      return res.status(400).json({ error: 'GitHub token required' });
    }

    const findingResult = await pool.query(
      `SELECT f.*, r.repo_name
       FROM attack_surface_findings f
       LEFT JOIN github_repos r ON f.github_repo_id = r.id
       WHERE f.id = $1 AND f.organization_id = $2`,
      [findingId, req.organizationId]
    );

    if (findingResult.rows.length === 0) {
      return res.status(404).json({ error: 'Finding not found' });
    }

    const finding = findingResult.rows[0];
    const [owner, repo] = finding.repo_name.split('/');

    const scanner = new GitHubScanner(github_token);
    const prResult = await scanner.generateRemediationPR(
      req.organizationId!,
      finding.github_repo_id,
      findingId,
      owner,
      repo
    );

    // Update finding with PR URL
    await pool.query(
      `UPDATE attack_surface_findings
       SET remediation_pr_url = $1, updated_at = NOW()
       WHERE id = $2`,
      [prResult.prUrl, findingId]
    );

    res.json(prResult);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;


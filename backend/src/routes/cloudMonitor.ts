import express from 'express';
import { pool } from '../db';
import { authenticate, requireOrganization, AuthRequest } from '../middleware/auth';
import { generatePlainEnglishExplanation } from '../services/ai/openai';

const router = express.Router();

router.use(authenticate);
router.use(requireOrganization);

// List cloud accounts
router.get('/accounts', async (req: AuthRequest, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM cloud_accounts WHERE organization_id = $1 ORDER BY created_at DESC',
      [req.organizationId]
    );

    res.json({ accounts: result.rows });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Add cloud account
router.post('/accounts', async (req: AuthRequest, res) => {
  try {
    const { cloud_provider, account_id, account_name, credentials_config } = req.body;

    if (!cloud_provider || !account_id) {
      return res.status(400).json({ error: 'Cloud provider and account ID required' });
    }

    const result = await pool.query(
      `INSERT INTO cloud_accounts 
       (organization_id, cloud_provider, account_id, account_name, credentials_config, is_active)
       VALUES ($1, $2, $3, $4, $5, true)
       RETURNING *`,
      [
        req.organizationId,
        cloud_provider,
        account_id,
        account_name || null,
        JSON.stringify(credentials_config || {}),
      ]
    );

    res.json({ account: result.rows[0] });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Sync cloud account (analyze VPC logs, IAM events)
router.post('/accounts/:accountId/sync', async (req: AuthRequest, res) => {
  try {
    const { accountId } = req.params;

    const accountResult = await pool.query(
      'SELECT * FROM cloud_accounts WHERE id = $1 AND organization_id = $2',
      [accountId, req.organizationId]
    );

    if (accountResult.rows.length === 0) {
      return res.status(404).json({ error: 'Cloud account not found' });
    }

    const account = accountResult.rows[0];

    // In production, this would:
    // 1. Fetch VPC flow logs from AWS/GCP/Azure
    // 2. Analyze IAM events
    // 3. Detect lateral movement patterns
    // 4. Detect data exfiltration patterns
    // 5. Create findings

    // Placeholder: create a sample finding
    const aiExplanation = await generatePlainEnglishExplanation({
      findingType: 'suspicious_network_activity',
      severity: 'high',
      technicalDetails: {
        sourceIP: '10.0.1.100',
        destinationIP: '203.0.113.50',
        bytesTransferred: 5000000,
        protocol: 'TCP',
      },
    });

    await pool.query(
      `INSERT INTO cloud_network_findings
       (organization_id, cloud_account_id, finding_type, severity, title, description,
        ai_explanation, source_ip, destination_ip, protocol, raw_data, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'open')`,
      [
        req.organizationId,
        accountId,
        'suspicious_network_activity',
        'high',
        'Unusual outbound network traffic detected',
        'Large volume of data transferred to external IP',
        aiExplanation,
        '10.0.1.100',
        '203.0.113.50',
        'TCP',
        JSON.stringify({ bytes: 5000000 }),
      ]
    );

    // Update last sync time
    await pool.query(
      'UPDATE cloud_accounts SET last_sync_at = NOW() WHERE id = $1',
      [accountId]
    );

    res.json({ synced: true, findingsCreated: 1 });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get findings
router.get('/findings', async (req: AuthRequest, res) => {
  try {
    const { status, severity, limit = 50, offset = 0 } = req.query;

    let query = `SELECT f.*, a.account_name, a.cloud_provider
                 FROM cloud_network_findings f
                 LEFT JOIN cloud_accounts a ON f.cloud_account_id = a.id
                 WHERE f.organization_id = $1`;
    const params: any[] = [req.organizationId];
    let paramIndex = 2;

    if (status) {
      query += ` AND f.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (severity) {
      query += ` AND f.severity = $${paramIndex}`;
      params.push(severity);
      paramIndex++;
    }

    query += ` ORDER BY f.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(parseInt(limit as string), parseInt(offset as string));

    const result = await pool.query(query, params);

    res.json({ findings: result.rows });
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
      `UPDATE cloud_network_findings
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

export default router;


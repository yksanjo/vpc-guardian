import express from 'express';
import { pool } from '../db';
import { authenticate, requireOrganization, AuthRequest } from '../middleware/auth';
import { analyzeLogAnomaly } from '../services/ai/openai';

const router = express.Router();

router.use(authenticate);
router.use(requireOrganization);

// List log sources
router.get('/sources', async (req: AuthRequest, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM log_sources WHERE organization_id = $1 ORDER BY created_at DESC',
      [req.organizationId]
    );

    res.json({ sources: result.rows });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Add log source
router.post('/sources', async (req: AuthRequest, res) => {
  try {
    const { name, source_type, config } = req.body;

    if (!name || !source_type || !config) {
      return res.status(400).json({ error: 'Name, source type, and config required' });
    }

    const result = await pool.query(
      `INSERT INTO log_sources (organization_id, name, source_type, config, is_active)
       VALUES ($1, $2, $3, $4, true)
       RETURNING *`,
      [req.organizationId, name, source_type, JSON.stringify(config)]
    );

    res.json({ source: result.rows[0] });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Ingest logs (webhook endpoint)
router.post('/ingest', async (req: AuthRequest, res) => {
  try {
    const { source_id, logs } = req.body;

    if (!source_id || !logs || !Array.isArray(logs)) {
      return res.status(400).json({ error: 'Source ID and logs array required' });
    }

    // Verify source belongs to organization
    const sourceResult = await pool.query(
      'SELECT * FROM log_sources WHERE id = $1 AND organization_id = $2',
      [source_id, req.organizationId]
    );

    if (sourceResult.rows.length === 0) {
      return res.status(404).json({ error: 'Log source not found' });
    }

    // Analyze logs for anomalies (simplified - in production, use proper baseline)
    const baseline = {}; // Would load from database
    const analysis = await analyzeLogAnomaly(logs, baseline);

    if (analysis.anomalyType !== 'Unknown') {
      // Create anomaly record
      await pool.query(
        `INSERT INTO log_anomalies 
         (organization_id, log_source_id, anomaly_type, severity, title, description, 
          ai_explanation, log_data, playbook_suggestions, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'open')`,
        [
          req.organizationId,
          source_id,
          analysis.anomalyType,
          analysis.severity,
          `Anomaly detected: ${analysis.anomalyType}`,
          analysis.explanation,
          analysis.explanation,
          JSON.stringify(logs.slice(-10)),
          JSON.stringify(analysis.playbookSuggestions),
        ]
      );
    }

    res.json({ ingested: logs.length, anomaliesDetected: analysis.anomalyType !== 'Unknown' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get anomalies
router.get('/anomalies', async (req: AuthRequest, res) => {
  try {
    const { status, severity, limit = 50, offset = 0 } = req.query;

    let query = `SELECT a.*, s.name as source_name
                 FROM log_anomalies a
                 LEFT JOIN log_sources s ON a.log_source_id = s.id
                 WHERE a.organization_id = $1`;
    const params: any[] = [req.organizationId];
    let paramIndex = 2;

    if (status) {
      query += ` AND a.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (severity) {
      query += ` AND a.severity = $${paramIndex}`;
      params.push(severity);
      paramIndex++;
    }

    query += ` ORDER BY a.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(parseInt(limit as string), parseInt(offset as string));

    const result = await pool.query(query, params);

    res.json({ anomalies: result.rows });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update anomaly status
router.patch('/anomalies/:anomalyId', async (req: AuthRequest, res) => {
  try {
    const { anomalyId } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status required' });
    }

    const result = await pool.query(
      `UPDATE log_anomalies
       SET status = $1, updated_at = NOW()
       WHERE id = $2 AND organization_id = $3
       RETURNING *`,
      [status, anomalyId, req.organizationId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Anomaly not found' });
    }

    res.json({ anomaly: result.rows[0] });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;


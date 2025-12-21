import express from 'express';
import { pool } from '../db';
import { authenticate, requireOrganization, AuthRequest } from '../middleware/auth';

const router = express.Router();

router.use(authenticate);
router.use(requireOrganization);

// Get unified dashboard data
router.get('/', async (req: AuthRequest, res) => {
  try {
    const orgId = req.organizationId!;

    // Get summary statistics
    const [
      attackSurfaceFindings,
      logAnomalies,
      cloudFindings,
      pentestFindings,
      subscriptions,
    ] = await Promise.all([
      // Attack Surface findings
      pool.query(
        `SELECT 
          COUNT(*) as total,
          COUNT(*) FILTER (WHERE status = 'open') as open,
          COUNT(*) FILTER (WHERE severity = 'critical') as critical,
          COUNT(*) FILTER (WHERE severity = 'high') as high
         FROM attack_surface_findings
         WHERE organization_id = $1`,
        [orgId]
      ),
      // Log anomalies
      pool.query(
        `SELECT 
          COUNT(*) as total,
          COUNT(*) FILTER (WHERE status = 'open') as open,
          COUNT(*) FILTER (WHERE severity = 'critical') as critical,
          COUNT(*) FILTER (WHERE severity = 'high') as high
         FROM log_anomalies
         WHERE organization_id = $1`,
        [orgId]
      ),
      // Cloud findings
      pool.query(
        `SELECT 
          COUNT(*) as total,
          COUNT(*) FILTER (WHERE status = 'open') as open,
          COUNT(*) FILTER (WHERE severity = 'critical') as critical,
          COUNT(*) FILTER (WHERE severity = 'high') as high
         FROM cloud_network_findings
         WHERE organization_id = $1`,
        [orgId]
      ),
      // Pentest findings
      pool.query(
        `SELECT 
          COUNT(*) as total,
          COUNT(*) FILTER (WHERE status = 'open') as open,
          COUNT(*) FILTER (WHERE severity = 'critical') as critical,
          COUNT(*) FILTER (WHERE severity = 'high') as high
         FROM pentest_findings pf
         JOIN pentest_sessions ps ON pf.pentest_session_id = ps.id
         WHERE ps.organization_id = $1`,
        [orgId]
      ),
      // Active subscriptions
      pool.query(
        `SELECT product, plan, status
         FROM subscriptions
         WHERE organization_id = $1 AND status = 'active'`,
        [orgId]
      ),
    ]);

    // Get recent critical findings
    const recentCritical = await pool.query(
      `(
        SELECT 'attack_surface' as source, id, title, severity, created_at, 'finding' as type
        FROM attack_surface_findings
        WHERE organization_id = $1 AND severity IN ('critical', 'high')
        ORDER BY created_at DESC
        LIMIT 5
      )
      UNION ALL
      (
        SELECT 'log_intelligence' as source, id, title, severity, created_at, 'anomaly' as type
        FROM log_anomalies
        WHERE organization_id = $1 AND severity IN ('critical', 'high')
        ORDER BY created_at DESC
        LIMIT 5
      )
      UNION ALL
      (
        SELECT 'cloud_monitor' as source, id, title, severity, created_at, 'finding' as type
        FROM cloud_network_findings
        WHERE organization_id = $1 AND severity IN ('critical', 'high')
        ORDER BY created_at DESC
        LIMIT 5
      )
      UNION ALL
      (
        SELECT 'pentest' as source, pf.id, pf.title, pf.severity, pf.created_at, 'finding' as type
        FROM pentest_findings pf
        JOIN pentest_sessions ps ON pf.pentest_session_id = ps.id
        WHERE ps.organization_id = $1 AND pf.severity IN ('critical', 'high')
        ORDER BY pf.created_at DESC
        LIMIT 5
      )
      ORDER BY created_at DESC
      LIMIT 10`,
      [orgId]
    );

    res.json({
      summary: {
        attackSurface: attackSurfaceFindings.rows[0],
        logIntelligence: logAnomalies.rows[0],
        cloudMonitor: cloudFindings.rows[0],
        pentest: pentestFindings.rows[0],
      },
      subscriptions: subscriptions.rows,
      recentCritical: recentCritical.rows,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;


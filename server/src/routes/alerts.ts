import { Router, Request, Response } from 'express';
import { protect } from '../middleware/auth';

const router = Router();

// Mock alerts data - in production, query from MongoDB
const mockAlerts = [
    {
        id: 'ALERT-001',
        node_id: 'node-1',
        alert_type: 'suspicious_access',
        severity: 'critical',
        message: 'Suspicious SSH login attempt detected',
        created_at: new Date(Date.now() - 5 * 60000).toISOString(),
        status: 'open'
    },
    {
        id: 'ALERT-002',
        node_id: 'node-2',
        alert_type: 'port_scan',
        severity: 'high',
        message: 'Port scanning activity detected on decoy port 8080',
        created_at: new Date(Date.now() - 15 * 60000).toISOString(),
        status: 'open'
    },
    {
        id: 'ALERT-003',
        node_id: 'node-1',
        alert_type: 'honeytoken_access',
        severity: 'critical',
        message: 'AWS credentials honeytoken accessed',
        created_at: new Date(Date.now() - 30 * 60000).toISOString(),
        status: 'investigating'
    },
    {
        id: 'ALERT-004',
        node_id: 'node-3',
        alert_type: 'file_access',
        severity: 'medium',
        message: 'Unauthorized file access attempt on Finance_Report.pdf',
        created_at: new Date(Date.now() - 2 * 3600000).toISOString(),
        status: 'resolved'
    },
    {
        id: 'ALERT-005',
        node_id: 'node-2',
        alert_type: 'rdp_connection',
        severity: 'high',
        message: 'RDP connection attempt from external IP',
        created_at: new Date(Date.now() - 4 * 3600000).toISOString(),
        status: 'acknowledged'
    }
];

// GET /api/alerts - List all alerts
router.get('/', protect, (req: Request, res: Response) => {
    try {
        const limit = parseInt(req.query.limit as string) || 10;
        const offset = parseInt(req.query.offset as string) || 0;

        const alerts = mockAlerts.slice(offset, offset + limit);
        res.json(alerts);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// PATCH /api/alerts/:id - Update alert status
router.patch('/:id', protect, (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const alert = mockAlerts.find(a => a.id === id);
        if (!alert) {
            return res.status(404).json({ error: 'Alert not found' });
        }

        alert.status = status;
        res.json(alert);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;

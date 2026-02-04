import { Router, Request, Response } from 'express';
import { protect } from '../middleware/auth';

const router = Router();

// Mock attack/event log data
const mockAttacks = [
    {
        id: 'EVENT-9382',
        node_id: 'node-1',
        timestamp: new Date(Date.now() - 2 * 60000).toISOString(),
        event_type: 'SSH Login Attempt',
        source_ip: '192.168.1.45',
        severity: 'high',
        decoy_name: 'Fake-SSH-Service',
        risk_score: 85
    },
    {
        id: 'EVENT-9381',
        node_id: 'node-2',
        timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
        event_type: 'File Access',
        source_ip: '10.0.0.12',
        severity: 'medium',
        decoy_name: 'Admin-Credentials.txt',
        risk_score: 65
    },
    {
        id: 'EVENT-9380',
        node_id: 'node-3',
        timestamp: new Date(Date.now() - 10 * 60000).toISOString(),
        event_type: 'Port Scan',
        source_ip: '172.16.0.5',
        severity: 'low',
        decoy_name: 'Backup-Port-8080',
        risk_score: 45
    },
    {
        id: 'EVENT-9379',
        node_id: 'node-1',
        timestamp: new Date(Date.now() - 30 * 60000).toISOString(),
        event_type: 'Honeytoken Trigger',
        source_ip: 'Unknown',
        severity: 'critical',
        decoy_name: 'AWS-Keys.csv',
        risk_score: 95
    },
    {
        id: 'EVENT-9378',
        node_id: 'node-2',
        timestamp: new Date(Date.now() - 1 * 3600000).toISOString(),
        event_type: 'RDP Connection',
        source_ip: '192.168.1.100',
        severity: 'high',
        decoy_name: 'RDP-Honeypot',
        risk_score: 88
    },
    {
        id: 'EVENT-9377',
        node_id: 'node-1',
        timestamp: new Date(Date.now() - 2 * 3600000).toISOString(),
        event_type: 'SSH Login Attempt',
        source_ip: '192.168.1.45',
        severity: 'high',
        decoy_name: 'Fake-SSH-Service',
        risk_score: 82
    },
    {
        id: 'EVENT-9376',
        node_id: 'node-3',
        timestamp: new Date(Date.now() - 3 * 3600000).toISOString(),
        event_type: 'Port Scan',
        source_ip: '203.0.113.42',
        severity: 'medium',
        decoy_name: 'Web-Service',
        risk_score: 60
    },
    {
        id: 'EVENT-9375',
        node_id: 'node-2',
        timestamp: new Date(Date.now() - 4 * 3600000).toISOString(),
        event_type: 'Database Probe',
        source_ip: '198.51.100.89',
        severity: 'high',
        decoy_name: 'Fake-Database',
        risk_score: 90
    }
];

// GET /api/recent-attacks - Get recent events/attacks
router.get('/', protect, (req: Request, res: Response) => {
    try {
        const limit = parseInt(req.query.limit as string) || 20;
        const node_id = req.query.node_id as string;

        let events = mockAttacks;
        if (node_id) {
            events = events.filter(e => e.node_id === node_id);
        }

        const result = events.slice(0, limit);
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;

import { Router, Request, Response } from 'express';
import { protect } from '../middleware/auth';

const router = Router();

// Mock attacker profile analysis
const mockProfiles: Record<string, any> = {
    '192.168.1.45': {
        ip: '192.168.1.45',
        threat_name: 'Lazarus Group Simulation',
        confidence: 0.92,
        ttps: ['T1021.002', 'T1036.005', 'T1090.002'],
        description: 'APT-level behavior detected: lateral movement via SMB exploits',
        activity_count: 23,
        last_seen: new Date(Date.now() - 1 * 3600000).toISOString()
    },
    '172.16.0.5': {
        ip: '172.16.0.5',
        threat_name: 'Automated Scanner Bot',
        confidence: 0.78,
        ttps: ['T1046', 'T1595'],
        description: 'High volume scanning activity from automated vulnerability scanner',
        activity_count: 156,
        last_seen: new Date(Date.now() - 30 * 60000).toISOString()
    },
    '10.0.0.12': {
        ip: '10.0.0.12',
        threat_name: 'Insider Threat - Credential Testing',
        confidence: 0.65,
        ttps: ['T1110.001', 'T1586.003'],
        description: 'Multiple failed authentication attempts indicate credential stuffing or insider behavior',
        activity_count: 45,
        last_seen: new Date(Date.now() - 5 * 60000).toISOString()
    }
};

// GET /api/attacker-profile/:ip - Get threat analysis for an IP
router.get('/:ip', protect, (req: Request, res: Response) => {
    try {
        const { ip } = req.params;
        const profile = mockProfiles[ip];

        if (!profile) {
            return res.json({
                ip,
                threat_name: 'Unknown Actor',
                confidence: 0.15,
                ttps: [],
                description: 'No significant threat profile detected',
                activity_count: 0,
                last_seen: null
            });
        }

        res.json(profile);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;

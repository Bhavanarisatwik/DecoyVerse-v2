import { Router, Request, Response } from 'express';
import { protect } from '../middleware/auth';

const router = Router();

// GET /api/stats - Dashboard statistics
router.get('/', protect, (req: Request, res: Response) => {
    try {
        const stats = {
            total_nodes: 5,
            online_nodes: 3,
            total_alerts: 12,
            critical_alerts: 3,
            total_attacks_detected: 47,
            avg_risk_score: 72.5
        };
        res.json(stats);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;

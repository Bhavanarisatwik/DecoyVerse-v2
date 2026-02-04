import { Router, Request, Response } from 'express';
import { protect } from '../middleware/auth';

const router = Router();

// Mock decoys data
const mockDecoys = [
    {
        id: 'DECOY-001',
        node_id: 'node-1',
        name: 'Fake-SSH-Service',
        type: 'service',
        port: 22,
        status: 'active',
        triggers: 12,
        last_triggered: new Date(Date.now() - 2 * 3600000).toISOString()
    },
    {
        id: 'DECOY-002',
        node_id: 'node-1',
        name: 'AWS_Root_Keys.csv',
        type: 'honeytoken',
        format: 'CSV',
        status: 'active',
        triggers: 5,
        last_triggered: new Date(Date.now() - 1 * 3600000).toISOString()
    },
    {
        id: 'DECOY-003',
        node_id: 'node-2',
        name: 'Production_DB_Config.xml',
        type: 'configuration',
        format: 'XML',
        status: 'active',
        triggers: 3,
        last_triggered: new Date(Date.now() - 5 * 3600000).toISOString()
    },
    {
        id: 'DECOY-004',
        node_id: 'node-2',
        name: 'Employee_Salaries.xlsx',
        type: 'file',
        format: 'XLSX',
        status: 'inactive',
        triggers: 0,
        last_triggered: null
    },
    {
        id: 'DECOY-005',
        node_id: 'node-3',
        name: 'Backup-Port-8080',
        type: 'port',
        port: 8080,
        status: 'active',
        triggers: 8,
        last_triggered: new Date(Date.now() - 30 * 60000).toISOString()
    }
];

// GET /nodes/:node_id/decoys - List decoys for a specific node
router.get('/:node_id/decoys', protect, (req: Request, res: Response) => {
    try {
        const { node_id } = req.params;
        const decoys = mockDecoys.filter(d => d.node_id === node_id);
        res.json(decoys);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/decoys - List all decoys
router.get('/', protect, (req: Request, res: Response) => {
    try {
        res.json(mockDecoys);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// PATCH /api/decoys/:id - Update decoy status
router.patch('/:id', protect, (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const decoy = mockDecoys.find(d => d.id === id);
        if (!decoy) {
            return res.status(404).json({ error: 'Decoy not found' });
        }

        decoy.status = status;
        res.json(decoy);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;

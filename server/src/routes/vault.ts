import { Router, Response } from 'express';
import { body, validationResult } from 'express-validator';
import VaultItem from '../models/VaultItem';
import { protect, AuthRequest } from '../middleware/auth';

const router = Router();

// Apply JWT protection to all vault routes
router.use(protect);

// GET /api/vault — list all vault items for authenticated user
router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const items = await VaultItem.find({ userId: req.user!._id })
            .sort({ createdAt: -1 })
            .lean();
        res.json({ success: true, data: items });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// POST /api/vault — create a new vault item
router.post('/', [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('encryptedPassword').notEmpty().withMessage('Encrypted password is required'),
], async (req: AuthRequest, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ success: false, errors: errors.array() });
        return;
    }
    try {
        const { title, username, encryptedPassword, url, notes } = req.body;
        const item = await VaultItem.create({
            userId: req.user!._id,
            title,
            username: username || '',
            encryptedPassword,
            url: url || '',
            notes: notes || '',
        });
        res.status(201).json({ success: true, data: item });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// PUT /api/vault/:id — update a vault item
router.put('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const item = await VaultItem.findOne({
            _id: req.params.id,
            userId: req.user!._id,
        });
        if (!item) {
            res.status(404).json({ success: false, message: 'Item not found' });
            return;
        }
        const { title, username, encryptedPassword, url, notes } = req.body;
        if (title !== undefined) item.title = title;
        if (username !== undefined) item.username = username;
        if (encryptedPassword !== undefined) item.encryptedPassword = encryptedPassword;
        if (url !== undefined) item.url = url;
        if (notes !== undefined) item.notes = notes;
        await item.save();
        res.json({ success: true, data: item });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// DELETE /api/vault/:id — delete a vault item
router.delete('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const result = await VaultItem.deleteOne({
            _id: req.params.id,
            userId: req.user!._id,
        });
        if (result.deletedCount === 0) {
            res.status(404).json({ success: false, message: 'Item not found' });
            return;
        }
        res.json({ success: true, message: 'Item deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

export default router;

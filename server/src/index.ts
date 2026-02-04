import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/database';
import authRoutes from './routes/auth';
import alertsRoutes from './routes/alerts';
import decoysRoutes from './routes/decoys';
import attacksRoutes from './routes/attacks';
import statsRoutes from './routes/stats';
import attackerProfilesRoutes from './routes/attacker-profiles';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    'https://decoy-verse-v2.vercel.app',
    'https://decoyverse.vercel.app',
    process.env.FRONTEND_URL || ''
].filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, Postman, etc.)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
}));
app.use(express.json());

// Connect to MongoDB
connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/alerts', alertsRoutes);
app.use('/api/decoys', decoysRoutes);
app.use('/api/recent-attacks', attacksRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/attacker-profile', attackerProfilesRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'DecoyVerse API is running' });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});

// Export for Vercel serverless
export default app;

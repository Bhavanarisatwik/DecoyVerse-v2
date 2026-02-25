import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import User from '../models/User';
import { generateToken, protect, AuthRequest } from '../middleware/auth';
import { sendEmail, welcomeEmailHtml, testAlertEmailHtml } from '../utils/mailer';

const router = Router();

// Validation rules
const signupValidation = [
    body('name')
        .trim()
        .notEmpty().withMessage('Name is required')
        .isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 characters'),
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Please enter a valid email')
        .normalizeEmail(),
    body('password')
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
        .matches(/\d/).withMessage('Password must contain at least one number'),
];

const loginValidation = [
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Please enter a valid email')
        .normalizeEmail(),
    body('password')
        .notEmpty().withMessage('Password is required'),
];

// @route   POST /api/auth/signup
// @desc    Register a new user
// @access  Public
router.post('/signup', signupValidation, async (req: Request, res: Response): Promise<void> => {
    try {
        // Check validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array(),
            });
            return;
        }

        const { name, email, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            res.status(400).json({
                success: false,
                message: 'User with this email already exists',
            });
            return;
        }

        // Create new user
        const user = await User.create({
            name,
            email,
            password,
        });

        // Generate token
        const token = generateToken(user);

        // Fire-and-forget welcome email (never blocks signup)
        sendEmail(
            email,
            'Welcome to DecoyVerse — your security platform is ready',
            welcomeEmailHtml(name, email)
        ).catch(() => {});

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    isOnboarded: user.isOnboarded,
                    createdAt: user.createdAt,
                },
                token,
            },
        });
    } catch (error: any) {
        console.error('Signup error:', error);

        // Handle duplicate key error
        if (error.code === 11000) {
            res.status(400).json({
                success: false,
                message: 'Email already registered',
            });
            return;
        }

        res.status(500).json({
            success: false,
            message: 'Server error during registration',
        });
    }
});

// @route   POST /api/auth/login
// @desc    Login user & get token
// @access  Public
router.post('/login', loginValidation, async (req: Request, res: Response): Promise<void> => {
    try {
        // Check validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array(),
            });
            return;
        }

        const { email, password } = req.body;

        // Find user by email (include password for comparison)
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            res.status(401).json({
                success: false,
                message: 'Invalid email or password',
            });
            return;
        }

        // Check if account is active
        if (!user.isActive) {
            res.status(401).json({
                success: false,
                message: 'Account is deactivated. Please contact support.',
            });
            return;
        }

        // Compare password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            res.status(401).json({
                success: false,
                message: 'Invalid email or password',
            });
            return;
        }

        // Update last login
        user.lastLogin = new Date();
        await user.save();

        // Generate token
        const token = generateToken(user);

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    avatar: user.avatar,
                    isOnboarded: user.isOnboarded,
                    lastLogin: user.lastLogin,
                },
                token,
            },
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during login',
        });
    }
});

// @route   GET /api/auth/me
// @desc    Get current logged-in user
// @access  Private
router.get('/me', protect, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const user = await User.findById(req.user?._id);

        if (!user) {
            res.status(404).json({
                success: false,
                message: 'User not found',
            });
            return;
        }

        res.json({
            success: true,
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    avatar: user.avatar,
                    isOnboarded: user.isOnboarded,
                    notifications: user.notifications,
                    createdAt: user.createdAt,
                    lastLogin: user.lastLogin,
                },
            },
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
        });
    }
});

// @route   POST /api/auth/logout
// @desc    Logout user (client-side token removal)
// @access  Private
router.post('/logout', protect, (req: AuthRequest, res: Response): void => {
    // JWT is stateless, so logout is handled client-side
    // This endpoint can be used to log the logout event
    res.json({
        success: true,
        message: 'Logged out successfully',
    });
});

// @route   PUT /api/auth/update-password
// @desc    Update user password
// @access  Private
router.put('/update-password', protect, [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword')
        .notEmpty().withMessage('New password is required')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
        .matches(/\d/).withMessage('Password must contain at least one number'),
], async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array(),
            });
            return;
        }

        const { currentPassword, newPassword } = req.body;

        // Get user with password
        const user = await User.findById(req.user?._id).select('+password');

        if (!user) {
            res.status(404).json({
                success: false,
                message: 'User not found',
            });
            return;
        }

        // Verify current password
        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            res.status(401).json({
                success: false,
                message: 'Current password is incorrect',
            });
            return;
        }

        // Update password
        user.password = newPassword;
        await user.save();

        // Generate new token
        const token = generateToken(user);

        res.json({
            success: true,
            message: 'Password updated successfully',
            data: { token },
        });
    } catch (error) {
        console.error('Update password error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
        });
    }
});

// @route   PUT /api/auth/complete-onboarding
// @desc    Mark user as onboarded after agent setup
// @access  Private
router.put('/complete-onboarding', protect, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const user = await User.findById(req.user?._id);

        if (!user) {
            res.status(404).json({
                success: false,
                message: 'User not found',
            });
            return;
        }

        // Mark user as onboarded
        user.isOnboarded = true;
        await user.save();

        res.json({
            success: true,
            message: 'Onboarding completed successfully',
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    isOnboarded: user.isOnboarded,
                    avatar: user.avatar,
                    createdAt: user.createdAt,
                    lastLogin: user.lastLogin,
                },
            },
        });
    } catch (error) {
        console.error('Complete onboarding error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
        });
    }
});

// @route   PUT /api/auth/profile
// @desc    Update user profile (name, email, avatar)
// @access  Private
router.put('/profile', protect, [
    body('name')
        .optional()
        .trim()
        .isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 characters'),
    body('email')
        .optional()
        .trim()
        .isEmail().withMessage('Please enter a valid email')
        .normalizeEmail(),
], async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array(),
            });
            return;
        }

        const user = await User.findById(req.user?._id);

        if (!user) {
            res.status(404).json({
                success: false,
                message: 'User not found',
            });
            return;
        }

        // Update fields if provided
        const { name, email, avatar, notifications } = req.body;
        if (name) user.name = name;
        if (email) user.email = email;
        if (avatar !== undefined) user.avatar = avatar;
        if (notifications) {
            user.notifications = {
                ...(user.notifications || {}),
                ...notifications,
            };
            user.markModified('notifications');
        }

        await user.save();

        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    avatar: user.avatar,
                    isOnboarded: user.isOnboarded,
                    notifications: user.notifications,
                    createdAt: user.createdAt,
                    lastLogin: user.lastLogin,
                },
            },
        });
    } catch (error: any) {
        console.error('Update profile error:', error);

        // Handle duplicate email
        if (error.code === 11000) {
            res.status(400).json({
                success: false,
                message: 'Email already in use',
            });
            return;
        }

        res.status(500).json({
            success: false,
            message: 'Server error',
        });
    }
});

// @route   POST /api/auth/test-alert-email
// @desc    Send a dummy alert email so the user can preview the template
// @access  Private
router.post('/test-alert-email', protect, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const user = await User.findById(req.user?._id);

        if (!user) {
            res.status(404).json({ success: false, message: 'User not found' });
            return;
        }

        const recipientEmail = user.notifications?.emailAlertTo;

        if (!recipientEmail) {
            res.status(400).json({
                success: false,
                message: 'No alert email address configured. Save an email in Alert Channels first.',
            });
            return;
        }

        if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
            res.status(503).json({
                success: false,
                message: 'Email service is not configured on the server (SMTP_USER / SMTP_PASS missing).',
            });
            return;
        }

        await sendEmail(
            recipientEmail,
            '🚨 [TEST] DecoyVerse Alert — Critical Threat Detected',
            testAlertEmailHtml(recipientEmail)
        );

        res.json({
            success: true,
            message: `Test alert sent to ${recipientEmail}`,
        });
    } catch (error) {
        console.error('Test alert email error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send test alert. Check SMTP credentials.',
        });
    }
});

export default router;

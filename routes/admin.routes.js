const express = require('express');
const router = express.Router();
const User = require('../models/user.model');
const { verifyToken, isAdmin } = require('../middleware/auth.middleware');

// All routes in this file require authentication and admin privileges
router.use(verifyToken, isAdmin);

// Get all users with filtering and search
router.get('/users', async (req, res) => {
    try {
        const { filter = 'all', search = '' } = req.query;
        let query = {};

        // Apply filters
        switch (filter) {
            case 'active':
                query.lastLoginAt = { $gt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) };
                break;
            case 'inactive':
                query.lastLoginAt = { $lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) };
                break;
            case 'admin':
                query.isAdmin = true;
                break;
            case 'verified':
                query.isVerified = true;
                break;
            case 'unverified':
                query.isVerified = false;
                break;
        }

        // Apply search
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        const users = await User.find(query).select('-password').sort('-createdAt');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching users', error: error.message });
    }
});

// Get single user
router.get('/users/:userId', async (req, res) => {
    try {
        const user = await User.findById(req.params.userId).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching user', error: error.message });
    }
});

// Create new user
router.post('/users', async (req, res) => {
    try {
        const { name, email, password, isAdmin } = req.body;
        
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }

        const user = new User({
            name,
            email,
            password,
            isAdmin: isAdmin || false,
            isVerified: true // Admin-created users are automatically verified
        });

        await user.save();
        const userResponse = await User.findById(user._id).select('-password');
        res.status(201).json(userResponse);
    } catch (error) {
        res.status(500).json({ message: 'Error creating user', error: error.message });
    }
});

// Update user
router.put('/users/:userId', async (req, res) => {
    try {
        const { name, email, password, isAdmin } = req.body;
        const updateData = { name, email, isAdmin };
        
        // Only update password if provided
        if (password) {
            updateData.password = password;
        }

        const user = await User.findByIdAndUpdate(
            req.params.userId,
            updateData,
            { new: true }
        ).select('-password');
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error updating user', error: error.message });
    }
});

// Delete user
router.delete('/users/:userId', async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting user', error: error.message });
    }
});

// Get system stats
router.get('/stats', async (req, res) => {
    try {
        const now = new Date();
        const startOfDay = new Date(now.setHours(0, 0, 0, 0));

        const [totalUsers, activeUsers, newUsers, verifiedUsers] = await Promise.all([
            User.countDocuments(),
            User.countDocuments({ lastLoginAt: { $gt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } }),
            User.countDocuments({ createdAt: { $gte: startOfDay } }),
            User.countDocuments({ isVerified: true })
        ]);
        
        res.json({
            totalUsers,
            activeUsers,
            newUsers,
            verifiedUsers
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching stats', error: error.message });
    }
});

module.exports = router;

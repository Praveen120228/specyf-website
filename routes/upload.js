const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const auth = require('../middleware/auth');
const User = require('../models/User');

// Configure multer for file upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = 'uploads/profile-photos';
        // Create directory if it doesn't exist
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Generate unique filename with timestamp
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// File filter to only allow image files
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Not an image! Please upload an image file.'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

// Upload profile photo
router.post('/profile-photo', auth, upload.single('photo'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ msg: 'Please upload an image file.' });
        }

        // Get the file path relative to the server
        const photoUrl = `/uploads/profile-photos/${req.file.filename}`;

        // Update user's profile photo in database
        const user = await User.findById(req.user.id);
        
        // Delete old profile photo if it exists
        if (user.profilePhoto) {
            const oldPhotoPath = path.join(__dirname, '..', user.profilePhoto);
            if (fs.existsSync(oldPhotoPath)) {
                fs.unlinkSync(oldPhotoPath);
            }
        }

        user.profilePhoto = photoUrl;
        await user.save();

        res.json({
            msg: 'Profile photo uploaded successfully',
            photoUrl: photoUrl
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Delete profile photo
router.delete('/profile-photo', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        
        if (user.profilePhoto) {
            const photoPath = path.join(__dirname, '..', user.profilePhoto);
            if (fs.existsSync(photoPath)) {
                fs.unlinkSync(photoPath);
            }
            
            user.profilePhoto = null;
            await user.save();
        }

        res.json({ msg: 'Profile photo removed successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;

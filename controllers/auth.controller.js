const User = require('../models/user.model');
const jwt = require('jsonwebtoken');
const config = require('../config/auth.config');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

// Email transporter configuration
const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const generateToken = (user) => {
    return jwt.sign(
        { id: user._id, email: user.email, role: user.role },
        config.secret,
        { expiresIn: config.jwtExpiration }
    );
};

exports.register = async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                message: "Email is already registered"
            });
        }

        // Create new user
        const user = new User({
            name,
            email,
            password,
            phone
        });

        // Generate verification token
        const verificationToken = user.generateVerificationToken();

        // Save user
        await user.save();

        // Send verification email
        const verificationUrl = `${process.env.BASE_URL}/verify-email?token=${verificationToken}`;
        await transporter.sendMail({
            to: user.email,
            subject: "Verify your email",
            html: `Please click <a href="${verificationUrl}">here</a> to verify your email.`
        });

        res.status(201).json({
            message: "Registration successful. Please check your email to verify your account.",
            userId: user._id
        });
    } catch (error) {
        res.status(500).json({
            message: "Registration failed",
            error: error.message
        });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        // Verify password
        const isValidPassword = await user.comparePassword(password);
        if (!isValidPassword) {
            return res.status(401).json({
                message: "Invalid password"
            });
        }

        // Check if email is verified
        if (!user.isVerified) {
            return res.status(403).json({
                message: "Please verify your email first"
            });
        }

        // Generate token
        const token = generateToken(user);

        // Update last login
        user.lastLogin = Date.now();
        await user.save();

        res.status(200).json({
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            accessToken: token
        });
    } catch (error) {
        res.status(500).json({
            message: "Login failed",
            error: error.message
        });
    }
};

exports.verifyEmail = async (req, res) => {
    try {
        const { token } = req.query;

        const user = await User.findOne({
            verificationToken: token,
            verificationTokenExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({
                message: "Invalid or expired verification token"
            });
        }

        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpires = undefined;
        await user.save();

        res.status(200).json({
            message: "Email verified successfully"
        });
    } catch (error) {
        res.status(500).json({
            message: "Email verification failed",
            error: error.message
        });
    }
};

exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        // Generate reset token
        const resetToken = user.generatePasswordResetToken();
        await user.save();

        // Send reset email
        const resetUrl = `${process.env.BASE_URL}/reset-password?token=${resetToken}`;
        await transporter.sendMail({
            to: user.email,
            subject: "Reset your password",
            html: `Please click <a href="${resetUrl}">here</a> to reset your password.`
        });

        res.status(200).json({
            message: "Password reset email sent"
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to send password reset email",
            error: error.message
        });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({
                message: "Invalid or expired reset token"
            });
        }

        user.password = newPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.status(200).json({
            message: "Password reset successful"
        });
    } catch (error) {
        res.status(500).json({
            message: "Password reset failed",
            error: error.message
        });
    }
};

exports.logout = async (req, res) => {
    try {
        // In a token-based authentication system, the client should discard the token
        res.status(200).json({
            message: "Logout successful"
        });
    } catch (error) {
        res.status(500).json({
            message: "Logout failed",
            error: error.message
        });
    }
};

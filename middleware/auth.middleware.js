const jwt = require('jsonwebtoken');
const config = require('../config/auth.config');
const User = require('../models/user.model');

const verifyToken = (req, res, next) => {
    const token = req.headers['x-access-token'] || req.headers['authorization'];

    if (!token) {
        return res.status(403).json({
            message: "No token provided!"
        });
    }

    try {
        const decoded = jwt.verify(token.replace('Bearer ', ''), config.secret);
        req.userId = decoded.id;
        next();
    } catch (error) {
        return res.status(401).json({
            message: "Unauthorized!"
        });
    }
};

const isAdmin = async (req, res, next) => {
    try {
        const user = await User.findById(req.userId);
        if (user && user.role === "admin") {
            next();
            return;
        }
        res.status(403).json({
            message: "Require Admin Role!"
        });
    } catch (error) {
        res.status(500).json({
            message: "Unable to validate user role!"
        });
    }
};

const isVerified = async (req, res, next) => {
    try {
        const user = await User.findById(req.userId);
        if (user && user.isVerified) {
            next();
            return;
        }
        res.status(403).json({
            message: "Please verify your email first!"
        });
    } catch (error) {
        res.status(500).json({
            message: "Unable to validate user verification status!"
        });
    }
};

module.exports = {
    verifyToken,
    isAdmin,
    isVerified
};

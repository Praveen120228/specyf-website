const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

// Import routes and database
const authRoutes = require('./routes/auth.routes');
const adminRoutes = require('./routes/admin.routes');
const { initDatabase } = require('./models/user.model');

// Middleware
app.use(cors({
    origin: ['http://localhost:8000', 'http://localhost:3001'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Initialize database
initDatabase()
    .then(() => console.log('✅ Database initialized'))
    .catch(err => {
        console.error('❌ Database initialization error:', err);
        process.exit(1);
    });

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', require('./routes/upload'));

// Basic route for testing
app.get('/', (req, res) => {
    res.json({ 
        message: 'Specyf API is running',
        version: '1.0.0'
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('🔴 Server error:', err);
    res.status(err.status || 500).json({
        message: err.message || 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err : {}
    });
});

// Start server
app.listen(port, () => {
    console.log(`🚀 Server running on port ${port}`);
    console.log('🌍 Environment:', process.env.NODE_ENV || 'development');
    console.log(`📡 API URL: http://localhost:${port}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('🔴 Unhandled Promise Rejection:', err);
    // Close server & exit process
    app.close(() => process.exit(1));
});

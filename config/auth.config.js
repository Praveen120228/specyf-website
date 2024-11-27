module.exports = {
    secret: process.env.JWT_SECRET,
    jwtExpiration: parseInt(process.env.JWT_EXPIRATION) || 86400, // 24 hours
    saltRounds: 10, // For bcrypt password hashing
    
    // Email verification token expiry
    verificationTokenExpiry: 24 * 60 * 60 * 1000, // 24 hours
    
    // Password reset token expiry
    resetTokenExpiry: 60 * 60 * 1000, // 1 hour
    
    // OAuth configurations
    google: {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: `${process.env.BASE_URL}/auth/google/callback`
    },
    
    apple: {
        clientID: process.env.APPLE_CLIENT_ID,
        teamID: process.env.APPLE_TEAM_ID,
        keyID: process.env.APPLE_KEY_ID,
        privateKeyPath: process.env.APPLE_PRIVATE_KEY_PATH,
        callbackURL: `${process.env.BASE_URL}/auth/apple/callback`
    },
    
    // Email service configuration
    email: {
        service: process.env.EMAIL_SERVICE,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    }
};

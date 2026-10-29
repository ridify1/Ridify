const jwt = require('jsonwebtoken');

const REFRESH_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 days

const generateAccessToken = (user) =>
    jwt.sign(
        { id: user._id, email: user.email, role: user.role },
        process.env.JWT_ACCESS_SECRET,
        { expiresIn: '15m' }
    );

const generateRefreshToken = (user) =>
    jwt.sign(
        { id: user._id },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: REFRESH_TTL_SECONDS }
    );

module.exports = {
    REFRESH_TTL_SECONDS,
    generateAccessToken,
    generateRefreshToken
};
const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'admin'
    },
    fullName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true
    },
    phoneNumber: {
        type: Number,
        unique: true,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    otp: {
        type: String,
        default: null
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    otpExpiresAt: {
        type: Date,
        default: null
    },
    image: {
        type: String,
        allowNull: false
      },
      imagePublicId: {
        type: String,
        allowNull: false
      },
    isBlocked: {
        type: Boolean,
        default: false
    },
    loginAttempts: {
        type: Number,
        default: 0  
    },
    lockUntil: {
        type: Date
    }
}, {timeStamp: true})

const user = mongoose.model('users', userSchema);

module.exports = user;
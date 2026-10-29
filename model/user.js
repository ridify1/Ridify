const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
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
    roleForHome: {
        type: String,
        enum: ['user', 'admin', 'landlord', 'agent', 'realtor'],
        default: 'user'
    },
    categoryForArtisan: {
        type: String,
        enum: ['Electrician', 'Plumber', 'Painter', 'HVAC', 'Carpenter', 'Cleaning', 'Curlinary', 'Security', 'null'],
        default: null
    },
    roleForJob: {
        type: String,
        enum: ['jobSeeker', 'hr', 'artisan', 'artisanEmployer'],
        default: null
    },
    role: {
        type: String
    },
    searchingFor: {
        type: String,
        enum: ['findAHome', 'findWork' ],
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
    },
    isDeleted: {
  type: Boolean,
  default: false,
  index: true
},
deletedAt: {
  type: Date,
  default: null
},
deletedBy: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'User',
  default: null
},
deletionReason: {
  type: String,
  trim: true,
  maxlength: 500,
  default: null
}
}, {timeStamp: true})

const user = mongoose.model('users', userSchema);

module.exports = user;
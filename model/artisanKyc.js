const mongoose = require('mongoose')

const artisanKycSchema = new mongoose.Schema({
     artisanId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    fullLegalName: {
        type: String,
        required: true,
        trim: true
    },
    DateOfBirth: {
        type: String,
        required: true,
        trim: true
    },
    HomeAddress: {
        type: String,
        required: true,
        trim: true
    },
    city: {
        type: String,
        required: true,
        trim: true
    },
    identification: {
        type: String,
        required: true
      },
    identificationPublicId: {
        type: String,
        required: true
    },
    selfie: {
        type: String,
        required: true
      },
    selfiePublicId: {
        type: String,
        required: true
    },
    kycVerified: {
        type: Boolean,
        default: false
    },
    verifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    verifiedAt: {
        type: Date,
        default: null
    }
}, {timestamps: true})

const artisanKyc = mongoose.model('artisanKyc',artisanKycSchema);

module.exports = artisanKyc
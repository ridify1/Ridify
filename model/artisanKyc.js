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
    phoneNumber: {
        type: Number,
        required: true,
        trim: true
    },
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true
    },
    cityOrLocation: {
        type: String,
        required: true,
        trim: true
    },
    primaryTrade: {
        type: String,
        enum: ['Electrician', 'Plumber', 'Painter', 'HVAC', 'Carpenter', 'Cleaning', 'Curlinary', 'Security', 'welder', 'mechanic', 'cleaner', 'tailor/fashionDesigner', 'otherSkilledWork', 'null'],
        required: true
    },
    yearsOfExperience: {
        type: Number,
        required: true,
        trim: true
    },
    availability: {
        type: String,
        enum: ['availableImmediately', 'availableWithinAWeek', 'availableWithinAMonth', 'openToOffer' ],
        default: null
    },
    aboutYourWork: {
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
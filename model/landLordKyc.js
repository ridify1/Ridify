const mongoose = require('mongoose')

const landLordKycSchema = new mongoose.Schema({
     landLordId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
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
    propertyAddress: {
        type: String,
        required: true,
        trim: true
    },
    NumberOfProperties: {
        type: Number,
        required: true
    },
    ownershipType: {
        type: String,
        enum: ['soleOwner', 'family'],
        required: true
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
}, {timestamps: true})

const landLordKyc = mongoose.model('landLordKyc',landLordKycSchema);

module.exports = landLordKyc
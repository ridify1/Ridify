const mongoose = require('mongoose')

const jobAgencyKycSchema = new mongoose.Schema({
     jobAgencyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    fullLegalName: {
        type: String,
        required: true,
        trim: true
    },
    jobTitle: {
        type: String,
        required: true,
        trim: true
    },
    workEmail: {
        type: String,
        unique: true,
        required: true,
        trim: true
    },
    companyName: {
        type: String,
        required: true,
        trim: true
    },
    phoneNumber: {
        type: Number,
        required: true,
        trim: true
    },
    companyName: {
        type: String,
        required: true,
        trim: true
    },
    registrationNumber: {
        type: String,
        required: true,
        trim: true
    },
    registeredAddress: {
        type: String,
        required: true,
        trim: true
    },
    companyWebsite: {
        type: String,
        trim: true
    },
    organizationSize: {
        type: Number,
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
    businessDocument: {
        type: String,
        required: true
      },
    businessDocumentPublicId: {
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

const jobAgencyKyc = mongoose.model('jobAgencyKyc',jobAgencyKycSchema);

module.exports = jobAgencyKyc
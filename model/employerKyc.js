const mongoose = require('mongoose')

const employerKycSchema = new mongoose.Schema({
     employerId: {
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
    roleInCompany: {
        type: String,
        required: true,
        trim: true,
        enum: ["ownerFounder", "director","hrmanager","recruiter"]
    },
    phoneNumber: {
        type: Number,
        unique: true,
        required: true,
        trim: true
    },
    companyName: {
        type: String,
        required: true,
        trim: true
    },
    companyType: {
        type: String,
        required: true,
        trim: true,
        enum: ["limitedCompany", "publicLimitedCompany", "registeredBusinessName", "soleProprietor", "partnership", "ngoOrNonProfit", "governmentAgency", "recruitmentOrJobAgency"]
    },
    industry: {
        type: String,
        required: true,
        trim: true,
        enum: ["constructionAndCivilEngineering", "realEstateAndPropertyManagement", "homeAndRepairServices", "electricalPlumbingAndHvac", "manufacturing", "logisticsAndTransport","hospitalityHotelsAndRestaurants", "retailAndEcommerce", "technologyAndSoftware","telecommunications", "bankingFinanceAndInsurance", "oilGasEnergy","agricultureAndFoodProcessing", "healthcareAndPharmaceuticals", "educationAndTraining", "mediaAdvertisingAndEntertainment", "securityServices", "cleaningAndFacilitiesManagement", "legalAccountingAndConsulting", "staffAndRecruitment", "other"]
    },
    yearFounded: {
        type: Number,
        trim: true
    },
    organizationSize: {
        type: Number,
        required: true,
        trim: true
    },
    aboutTheCompany: {
        type: String,
        required: true,
        trim: true
    },
    registrationNumber: {
        type: String,
        required: true,
        trim: true
    },
    taxId: {
        type: String,
        trim: true
    },
    officeAddress: {
        type: String,
        required: true,
        trim: true
    },
    city: {
        type: String,
        required: true,
        trim: true
    },
    state: {
        type: String,
        required: true,
        trim: true
    },
    country: {
        type: String,
        required: true,
        trim: true
    },
    companyEmail: {
        type: String,
        required: true,
        trim: true
    },
    companyWebsite: {
        type: String,
        trim: true
    },
    linkedIn: {
        type: String,
        trim: true
    },
    instagram: {
        type: String,
        trim: true
    },
    xTwitter: {
        type: String,
        trim: true
    },
    whatDoYouHireFor: [{
        type: String
    }],
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
    companyLogo: {
        type: String
      },
    companyLogoPublicId: {
        type: String
    },
    proofOfAddress: {
        type: String
      },
    proofOfAddressPublicId: {
        type: String
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

const employerKyc = mongoose.model('employerKyc',employerKycSchema);

module.exports = employerKyc
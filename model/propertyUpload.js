const mongoose = require('mongoose')

const AMENITIES = [
    '24/7 power', 'water', 'pool', 'gym', 'parking', 'cctv', 'furnished',
    'bq', 'elevator', 'serviced', 'wifi', 'security', 'playground',
    'clubhouse', 'laundry', 'garden', 'balcony', 'fireplace', 'storage',
    'pet friendly'
]

const propertyUploadSchema = new mongoose.Schema({
    landLordId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    landLordKycId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'landLordKyc',
        required: true,
        index: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    propertyType: {
        type: String,
        required: true,
        trim: true
    },
    beds: {
        type: Number,
        required: true
    },
    baths: {
        type: Number,
        required: true
    },
    area: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    state: {
        type: String,
        required: true,
        trim: true
    },
    city: {
        type: String,
        required: true,
        trim: true
    },
    streetAddress: {
        type: String,
        required: true,
        trim: true
    },
    rent: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['available', 'unavailable', 'rented', 'sold'],
        default: 'available',
        required: true
    },
    category: {
        type: String,
        enum: ['apartment', 'studio', 'serviced', 'shop'],
        default: null
    },
    archive: {
        type: Boolean,
        default: false
    },
    isDeleted: {
        type: Boolean,
        default: false
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
    },
    gallery: {
    type: [String],
    required: true,
    default: []
    },

    galleryPublicId: {
    type: [String],
    required: true,
    default: []
    },
    amenities: {
        type: [String],
        enum: AMENITIES,
        default: []
    },
    video: {
        type: [String],
        default: []
      },
    videoPublicId: {
        type: [String],
        default: []
    },
    totalViews:  { type: Number, default: 0 },
    uniqueViews: { type: Number, default: 0 },
}, {timestamps: true})

const PropertyUpload = mongoose.model('propertyUpload', propertyUploadSchema)

module.exports = PropertyUpload
module.exports.AMENITIES = AMENITIES
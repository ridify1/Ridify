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
    availability: {
        type: String,
        enum: ['available', 'not available'],
        required: true
    },
    category: {
        type: String,
        enum: ['apartment', 'studio', 'serviced', 'shop'],
        default: null
    },
    gallery: [{
        type: [String],
        required: true,
        get () {
          const value = this.getDataValue('gallery');
          return value ? JSON.parse(value) : [];
        },
        set(val) {
          this.setDataValue('gallery', JSON.stringify(val));
        }
    }],
    galleryPublicId: [{
        type: [String],
        required: true,
        get () {
          const value = this.getDataValue('galleryPublicIds');
          return value ? JSON.parse(value) : [];
        },
        set(val) {
          this.setDataValue('galleryPublicIds', JSON.stringify(val));
        }
    }],
    amenities: {
        type: [String],
        enum: AMENITIES,
        default: []
    }
}, {timestamps: true})

const PropertyUpload = mongoose.model('PropertyUpload', propertyUploadSchema)

module.exports = PropertyUpload
module.exports.AMENITIES = AMENITIES
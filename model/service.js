const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
    artisanId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    service: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: String,
        enum: ['electrician', 'plumber', 'painter', 'HVAC', 'carpenter', 'curlinary', 'security', 'welder', 'mechanic', 'cleaner', 'tailor/fashionDesigner', 'otherSkilledWork', 'null'],
        required: true,
        trim: true
    },
    engagement: {
        type: String,
        enum: ['gig', 'contract','full-time', 'part-time'],
        required: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    area: {
        type: String,
        required: true,
        trim: true
    },
    cityState: {
        type: String,
        required: true,
        trim: true
    },
    rate: {
        type: Number,
        required: true
    },
    rateType: {
        type: String,
        enum: ['hourly', 'daily', 'weekly', 'monthly', 'perJob', 'fixed'],
        required: true,
        trim: true
    },
    whatsIncluded: {
        type: String,
        required: true,
        trim: true
    },
    availability: {
        type: String,
        enum: ['available', 'not available'],
        trim: true
    },
    photos: [{
        type: String,
        required: true,
        get () {
          const value = this.getDataValue('photos');
          return value ? JSON.parse(value) : [];
        },
        set(val) {
          this.setDataValue('photos', JSON.stringify(val));
        }
      }],
    photosPublicId: {
        type: String,
        required: true,
        get () {
          const value = this.getDataValue('photosPublicId');
          return value ? JSON.parse(value) : [];
        },
        set(val) {
          this.setDataValue('photosPublicId', JSON.stringify(val));
        }
    },
    video: {
        type: [String],
        default: []
      },
    videoPublicId: {
        type: [String],
        default: []
    }
}, { timestamps: true });

const service = mongoose.model('Services', serviceSchema);

module.exports = service;
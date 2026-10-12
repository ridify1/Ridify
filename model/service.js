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
        enum: ['hourly', 'daily', 'weekly', 'monthly', 'job'],
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
          // Parse the stored JSON string back into an array
          return value ? JSON.parse(value) : [];
        },
        set(val) {
          // Stringify the value into a JSON string before saving
          this.setDataValue('photos', JSON.stringify(val));
        }
      }],
    photosPublicId: {
        type: String,
        required: true,
        get () {
          const value = this.getDataValue('photosPublicId');
          // Parse the stored JSON string back into an array
          return value ? JSON.parse(value) : [];
        },
        set(val) {
          // Stringify the value into a JSON string before saving
          this.setDataValue('photosPublicId', JSON.stringify(val));
        }
    },
}, { timestamps: true });

const service = mongoose.model('Services', serviceSchema);

module.exports = service;
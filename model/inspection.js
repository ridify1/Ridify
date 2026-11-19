const mongoose = require('mongoose');

const inspectionSchema = new mongoose.Schema({
    propertyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'propertyUploads',
        required: true,
    },
    landLordId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true,
    },
    inspectorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true,
    },
    preferredDate: { 
        type: Date, 
        required: true 
    },
    preferredTime: { 
        type: String, 
        trim: true 
    },
    message: { 
        type: String, 
        trim: true, 
        maxlength: 500 
    },
    status: {
    type: String,
    enum: ['pending', 'accepted', 'declined', 'completed', 'cancelled'],
    default: 'pending'
    },
    declineReason: { 
        type: String, 
        trim: true 
    }
}, { timestamps: true });

inspectionSchema.index(
  { propertyId: 1, inspectorId: 1 },
  { unique: true, partialFilterExpression: { status: { $in: ['pending', 'accepted'] } } }
);

const inspectionKyc = mongoose.model('inspectionKyc', inspectionSchema);

module.exports = inspectionKyc;
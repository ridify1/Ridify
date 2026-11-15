const mongoose = require('mongoose');

const serviceApplySchema = new mongoose.Schema({
    artisanId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'artisanKyc',
        required: true,
    },
    userId: {
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

const serviceApply = mongoose.model('serviceApply', serviceApplySchema);

module.exports = serviceApply;
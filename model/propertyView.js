const mongoose = require('mongoose');

const propertyViewSchema = new mongoose.Schema({
    property: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'properties', 
        required: true 
    },
    agent:    { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'users', 
        required: true 
    },
    viewer:   { 
        type: String, 
        required: true 
    },   
    viewerType: { 
        type: String, 
        enum: ['user', 'guest'], 
        default: 'user' 
    },
    viewCount: { 
        type: Number, 
        default: 0 
    },
    lastViewedAt: { 
        type: Date, 
        default: Date.now 
    }
}, {timestamps: true})

propertyViewSchema.index({ property: 1, viewer: 1 }, { unique: true });
propertyViewSchema.index({ agent: 1, createdAt: -1 });

const propertyView = mongoose.model('propertyView', propertyViewSchema)

module.exports = propertyView
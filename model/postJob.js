const mongoose = require('mongoose')

const postJobSchema = new mongoose.Schema({
    posterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    jobTitle: {
        type: String,
        required: true,
        trim: true
    },
    aboutJob: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    qualification: {
        type: String,
        required: true,
        trim: true
    },
    experience: {
        type: String,
        required: true,
        trim: true
    },
    status: {
        type: String,
        enum: ['open', 'closed', 'paused'],
        default: 'open',
        required: true
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: null
    }
}, {timeStamps: true})

const postJob = mongoose.model('postJobs', postJobSchema);

module.exports = postJob
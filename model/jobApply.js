const mongoose = require('mongoose')

const applyJobSchema = new mongoose.Schema({
    applicantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    jobId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'postJob',
        required: true
    },
    fullname: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true
    },
    cv: {
        type: String,
        required: true
      },
    cvPublicId: {
        type: String,
        required: true
    },
    coverLetter: {
        type: String,
        required: true
      },
    coverLetterPublicId: {
        type: String,
        required: true
    },
    description: {
        type: String,
        trim: true
    }
}, {timeStamps: true})

const applyJob = mongoose.model('applyJobs', applyJobSchema);

module.exports = applyJob
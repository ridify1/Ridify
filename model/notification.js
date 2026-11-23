const mongoose = require('mongoose')

const notificationSchema = new mongoose.Schema({
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: [
            "inspection",
            "application",
            "service",
            "serviceApplication",
            "payment",
            "job",
            "system",
            "kyc",
            "property",
            "update",
            "user"
        ]
    },
    idType: {
        type: String,
        enum: ["propertyId", "jobId","userId", "serviceId", "paymentId", "systemId", "inspectionId", "applicationId", "serviceApplicationId", "kycId", "updateId"]
    },
    id: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: "idType"
    },
    isRead: {
        type: Boolean,
        default: false
    }
}, {timestamps: true})

const notification = mongoose.model('notifications', notificationSchema);

module.exports = notification
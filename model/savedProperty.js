const mongoose = require('mongoose');

const savedPropertySchema = new mongoose.Schema({
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: true,
    },
}, {timestamps: true})

savedPropertySchema.index({ user: 1, property: 1 }, { unique: true });

const savedProperty = mongoose.model('savedProperty', savedPropertySchema)

module.exports = savedProperty
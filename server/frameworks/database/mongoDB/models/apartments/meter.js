const mongoose = require('mongoose');

const meterConfigSchema = new mongoose.Schema({
    apartmentId: {
        type: mongoose.Schema.ObjectId,
        ref: 'Apartment',
        required: true,
    },
    meterType: {
        type: String,
        enum: ['water', 'electric'],
        required: true,
    },
    flatRate: {
        type: Number,
        default: 0,
    },
    rate: {
        type: Number,
        default: 0,
    },
    otherMethodName: String,
    otherMethodDetail: String,

    billingType: {
        type: String,
        enum: ['flatRate', 'perUnit', 'other'],
        required: true,
        default: 'perUnit',
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model('Meter', meterConfigSchema);

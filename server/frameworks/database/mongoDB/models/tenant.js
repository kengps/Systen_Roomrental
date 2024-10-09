const mongoose = require('mongoose');

const tenantSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    room: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Room',
        required: true,
    },
    startDate: {
        type: Date,
        required: true,
    },
    endDate: {
        type: Date,
    },
}, { timestamps: true });

const Tenant = mongoose.model('Tenant', tenantSchema);

module.exports = Tenant;

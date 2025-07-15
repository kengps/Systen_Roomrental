const mongoose = require('mongoose');

const tenantSchema = new mongoose.Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Account',
        // required: true,
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Account',
        // required: true,
    },
    accountId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Account',
        // required: true,
    },
    room: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Room',
        // required: true,
    },
    prefix: {
        type: String,
        required: true,
    },
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
    deposit: {
        type: Number,
        required: true,
    },
    contractDuration: {
        type: Number,
        required: true,
    },

    phone: {
        type: String,
        required: true,
    },
    tenancyStatus: {
        type: String, enum: ['renting', 'moved'],
        default: 'renting'
    },
    // แนวทางที่ 1: เก็บเป็น Object (แนะนำ)

    serviceUsage: {
        type: [String],
        default: []
    },

    // startInDate: {
    //     type: Date,
    //     required: true,
    // },
    moveInDate: {
        type: Date,
    },
    moveOutDate: {
        type: Date,
    },
}, { timestamps: true });

const Tenant = mongoose.model('Tenant', tenantSchema);

module.exports = Tenant;

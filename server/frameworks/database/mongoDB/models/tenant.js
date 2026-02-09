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
    signature: {
        type: String,
        required: true,

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

// Indexes for better query performance
tenantSchema.index({ owner: 1 }); // Index for owner queries
tenantSchema.index({ accountId: 1 }); // Index for accountId queries
tenantSchema.index({ room: 1 }); // Index for room queries
tenantSchema.index({ tenancyStatus: 1 }); // Index for status filtering
tenantSchema.index({ phone: 1 }); // Index for phone number searches
tenantSchema.index({ signature: 1 }); // Index for signature searches (unique lookup)
tenantSchema.index({ firstName: 1, lastName: 1 }); // Compound index for name searches
tenantSchema.index({ moveInDate: 1 }); // Index for date range queries
tenantSchema.index({ moveOutDate: 1 }); // Index for move out date queries

// Compound indexes for common query patterns
tenantSchema.index({ owner: 1, tenancyStatus: 1 }); // Owner + Status queries
tenantSchema.index({ room: 1, tenancyStatus: 1 }); // Room + Status queries
tenantSchema.index({ accountId: 1, tenancyStatus: 1 }); // Account + Status queries

// Text index for full-text search
tenantSchema.index({ 
    firstName: 'text', 
    lastName: 'text', 
    phone: 'text' 
});





// Virtual fields
tenantSchema.virtual('fullName').get(function () {
    return `${this.firstName} ${this.lastName}`;
});

const Tenant = mongoose.model('Tenant', tenantSchema);

module.exports = Tenant;

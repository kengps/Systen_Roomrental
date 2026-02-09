
const mongoose = require('mongoose')


const socialAccountSchema = new mongoose.Schema({
    accountId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Account',
        // required: true,
    },
    tenantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tenant',
        required: true,
    },
    socialName: {
        type: String,
        enum: ['line', 'telegram', 'email', 'facebook'],
        required: true,
    },
    socialId: {
        type: String,
        required: true,
    },
    socialUsername: {
        type: String,
        required: false,
    },
    socialDisplayName: {
        type: String,
        // required: false,
    },
    active: {
        type: Boolean,
        default: true,
    },
}, { timestamps: true });

const SocialAccounModel = mongoose.model('SocialAccount', socialAccountSchema);


module.exports = SocialAccounModel;
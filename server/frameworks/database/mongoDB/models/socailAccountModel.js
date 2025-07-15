
const mongoose = require('mongoose')


const socialAccountSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Account',
        required: true,
    },
    type: {
        type: String,
        enum: ['line', 'telegram', 'email', 'facebook'],
        required: true,
    },
    socialId: {
        type: String,
        required: true,
    },
    active: {
        type: Boolean,
        default: true,
    },
}, { timestamps: true });

const SocialAccount = mongoose.model('SocialAccount', socialAccountSchema);


module.exports = SocialAccount;
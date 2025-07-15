const mongoose = require('mongoose');

const tokenSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
    },
    token: {
        type: String,
        required: true,
    },
    expiresAt: {
        type: Date,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    accountId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Account',
        required: true,
    },
});

// ✅ TTL Index ที่นี่
tokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// 👇 export model
module.exports = mongoose.model('Token', tokenSchema);

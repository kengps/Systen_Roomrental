const mongoose = require('mongoose');

const zzzzzz_log_zzzzzSchema = new mongoose.Schema({
    ipAddress: {
        type: String,
    },
    action: {
        type: String,
        required: true,
    },
    actor: {
        type: String,
        required: true,
    },
    details: {
        type: Object
    },
}, { timestamps: true });

// // ✅ TTL Index ที่นี่
// zzzzzz_log_zzzzzSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// 👇 export model
;


const LogActionss =  mongoose.model('zzzzzz_log_zzzzz', zzzzzz_log_zzzzzSchema);


module.exports = LogActionss;
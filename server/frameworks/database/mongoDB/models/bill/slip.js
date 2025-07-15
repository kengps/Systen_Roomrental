const mongoose = require('mongoose');

const slipUploadSchema = new mongoose.Schema({
    tenantRef: { // อ้างอิงผู้เช่าหรือผู้จ่าย
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tenant', // สมมติมี collection Tenant
        required: true,
    },

    success: { type: Boolean, required: true },

    message: { type: String },

    transRef: { type: String, required: true, unique: true }, // รหัสอ้างอิงธุรกรรม

    sendingBank: { type: String },     // รหัสธนาคารผู้ส่ง
    receivingBank: { type: String },   // รหัสธนาคารผู้รับ

    transDate: { type: String },       // วันที่ทำรายการ (format yyyyMMdd)
    transTime: { type: String },       // เวลาทำรายการ (format HH:mm:ss)
    transTimestamp: { type: Date },    // timestamp ของรายการ (ISODate)

    sender: {
        displayName: { type: String },
        name: { type: String, default: null },
        proxy: {
            type: { type: String, default: null },
            value: { type: String, default: null },
        },
        account: {
            type: { type: String },
            value: { type: String },
        }
    },

    receiver: {
        displayName: { type: String },
        name: { type: String, default: null },
        proxy: {
            type: { type: String, default: null },
            value: { type: String, default: null },
        },
        account: {
            type: { type: String },
            value: { type: String },
        }
    },

    amount: { type: Number, required: true },   // จำนวนเงินที่จ่าย
    paidLocalAmount: { type: Number, default: null },
    paidLocalCurrency: { type: String, default: null },
    countryCode: { type: String, default: 'TH' },
    transFeeAmount: { type: Number, default: null },

    ref1: { type: String, default: null },
    ref2: { type: String, default: null },
    ref3: { type: String, default: null },

    toMerchantId: { type: String, default: null },
    qrcodeData: { type: String },

    createdAt: {
        type: Date,
        default: Date.now,
    }

}, {
    timestamps: true,
});

module.exports = mongoose.model('SlipUpload', slipUploadSchema);

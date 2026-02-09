const { Schema, default: mongoose } = require("mongoose");



const bankSchema = new Schema({

    apartmentId: {
        type: mongoose.Schema.ObjectId,
        ref: 'Apartment',
        required: true
    },
    bankKey: {
        type: String,
        required: true
    },
    // bankName: {
    //     type: String,
    //     required: true
    // },
    accountNumber: {
        type: Number,
        required: true,
        unique: true // ✅ บังคับไม่ให้ซ้ำ

    },
    accountName: {
        type: String,
        required: true

    },
    BRANCH_ID: {
        type: String,
    },
    API_KEY: {
        type: String,
    }

}, {
    timestamps: true,
})

module.exports = mongoose.model('bank', bankSchema);


bankSchema.index({ apartmentId: 1 });
bankSchema.index(
    { apartmentId: 1, accountNumber: 1 },
    { unique: true } // ✅ ห้ามซ้ำเฉพาะใน apartment เดียวกัน
);


//ถ้ามีข้อมูลซ้ำอยู่แล้ว ให้ลบซ้ำออกก่อน:
// db.banks.createIndex({ bankNumber: 1 }, { unique: true })
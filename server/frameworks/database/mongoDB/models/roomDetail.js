const mongoose = require('mongoose');
const Schema = mongoose.Schema;



// Schema สำหรับห้องเช่า
const roomSchema = new Schema({
    room: {
        floor: { type: Number },
        roomNumber: { type: Number }
    },
    status: { type: String, required: true },
    price: { type: Number },
    rentalDate: { type: Date },
    // tenant: { type: Schema.Types.ObjectId, ref: 'memberUser' }, // อ้างอิงไปยังผู้เช่า
    tenant: { type: String, required: true }, // อ้างอิงไปยังผู้เช่า
});


// Schema สำหรับรายละเอียดค่าเช่า
const rentDetailsSchema = new Schema({
    room: { type: Schema.Types.ObjectId, ref: 'Room', required: true },
    monthlyRent: { type: Number, required: true },
    water: {
        price: { type: Number, required: true },
        previousUnits: { type: Number, required: true },
        currentUnits: { type: Number, required: true },
        quality: { type: Number },
        total: { type: Number },
    },
    electricity: {
        price: { type: Number, required: true },
        previousUnits: { type: Number, required: true },
        currentUnits: { type: Number, required: true },
        quality: { type: Number},
        total: { type: Number},
    },
    internet: { type: Number, required: true },
    others: { type: Number, required: true },
    additionalCharges: [{ type: Schema.Types.ObjectId, ref: 'AdditionalCharge' }], // อ้างอิงไปยังค่าใช้จ่ายเพิ่มเติม
});

// Schema สำหรับค่าใช้จ่ายเพิ่มเติม
const additionalChargeSchema = new Schema({
    name: { type: String, required: true }, // ชื่อค่าใช้จ่าย เช่น ค่าจอดรถ
    amount: { type: Number, required: true },
    rentDetail: { type: Schema.Types.ObjectId, ref: 'RentDetails' }, // อ้างอิงไปยังรายละเอียดค่าเช่า
});


const Room = mongoose.model('Room', roomSchema);
const RentDetails = mongoose.model('RentDetails', rentDetailsSchema);
const AdditionalCharge = mongoose.model('AdditionalCharge', additionalChargeSchema);

module.exports = { Room, RentDetails, AdditionalCharge };

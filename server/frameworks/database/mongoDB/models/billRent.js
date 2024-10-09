const mongoose = require('mongoose');

const billSchema = new mongoose.Schema({
    tenant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tenant',
        required: true,
    },
    // month: {
    //     type: String,
    //     required: true,
    // },
    // year: {
    //     type: Number,
    //     required: true,
    // },
    rent: {
        type: Number,
        required: true,
    },
    waterCharge: {
        price: { type: Number, required: true },
        previousUnits: { type: Number, required: true },
        currentUnits: { type: Number, required: true },
        totalWater: { type: Number, required: true },
        totalPrice: { type: Number, required: true }

    },
    electricityCharge: {
        price: { type: Number, required: true },
        previousUnits: { type: Number, required: true },
        currentUnits: { type: Number, required: true },
        totalElectricity: { type: Number, required: true },
        totalPrice: { type: Number, required: true }
    },
    totalAmount: {
        type: Number,
        required: true,
    },
    isPaid: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true });

const Bill = mongoose.model('Bill', billSchema);
module.exports = Bill;

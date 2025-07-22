const { Schema } = require('mongoose');
const mongoose = require('mongoose');

const meterLogSchema = new mongoose.Schema({
    room: { type: Schema.Types.ObjectId, ref: 'Room', required: true },
    owner: { type: Schema.Types.ObjectId, ref: 'Account', required: true },

    billingPeriod: {
        month: { type: Number },
        year: { type: Number },
    },

    previousElectric: { type: Number },
    currentElectric: { type: Number },
    usageElectric: { type: Number },

    previousWater: { type: Number },
    currentWater: { type: Number },
    usageWater: { type: Number },

    createdAt: { type: Date, default: Date.now }
});


module.exports = mongoose.model('MeterHistory', meterLogSchema);

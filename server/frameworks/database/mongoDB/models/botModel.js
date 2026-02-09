const mongoose = require('mongoose')
const { apartmant } = require('../../../../adapters/controllers/roomController')


const botModel = mongoose.Schema({

    apartmantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Apartment',
        required: true
    },
    token: {
        type: String,
        required: true
    },
    botName: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true })


botModel.index({ apartmantId: 1 })
module.exports = mongoose.model('Bot', botModel)
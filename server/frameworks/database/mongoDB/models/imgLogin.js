const mongoose = require('mongoose')

const imageFormLogin = mongoose.Schema({
    image: Buffer,
    status: Boolean
}, { timestamps: true })

module.exports = mongoose.model('imageLogin', imageFormLogin)
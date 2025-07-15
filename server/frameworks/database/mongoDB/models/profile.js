const mongoose = require('mongoose')


const Profile = mongoose.Schema({

    username: {
        type: String,
        required: true, // ห้ามใส่ค่าว่าง ต้องกรอกข้อมูลเสมอ
        unique: true
    },
    password: {
        type: String,
    },
    role: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Role',
    },
    enabled: {
        type: Boolean,
        default: true,
    },
    ipAddress: String,
    picture: String,
    parent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Account',
    },
    lineage: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Account',
    }],
    lastLogin: {
        type: Date,
        default: Date.now,
    }


}, { timestamps: true })

module.exports = mongoose.model('Account', Profile)
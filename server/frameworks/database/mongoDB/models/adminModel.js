const mongoose = require('mongoose');


const adminUser = mongoose.Schema(
    {
        username: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        role: { type: String, enum: ['superAdmin', 'adminUserManager', 'adminFinanceManager'], default: 'superAdmin' },
        permissions: {
            manageUsers: { type: Boolean, default: true },  // จัดการผู้ใช้
            manageRentals: { type: Boolean, default: true }, // จัดการห้องเช่า
            manageFinance: { type: Boolean, default: true }  // จัดการการเงิน
        },
        enabled: {
            type: Boolean,
            default: true,
        },
        // picture: String,
        ipAddress: String,
        // lastPasswordChange: { type: Date, default: Date.now },
        // mustChangePassword: { type: Boolean, default: true },
        // tokenIfLoggedIn: {
        //     type: String,
        // }
    }, { timestamps: true }
)

module.exports = mongoose.model('adminUser', adminUser)
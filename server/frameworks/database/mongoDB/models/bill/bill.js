// const mongoose = require('mongoose');
// const BillSchema = new Schema({
//     contract: {
//         type: mongoose.Schema.ObjectId,
//         ref: 'Contract',
//         required: true
//     },
//     billingPeriod: {
//         month: {
//             type: Number,
//             required: true,
//             min: 1,
//             max: 12
//         },
//         year: {
//             type: Number,
//             required: true
//         }
//     },
//     cutoffDate: {
//         type: Date,
//         required: true
//     },
//     dueDate: {
//         type: Date,
//         required: true
//     },
//     charges: {
//         rent: {
//             type: Number,
//             required: true
//         },
//         utilities: {
//             water: { type: Number, default: 0 },
//             electricity: { type: Number, default: 0 },
//             other: { type: Number, default: 0 }
//         },
//         lateFee: {
//             type: Number,
//             default: 0
//         }
//     },
//     totalAmount: {
//         type: Number,
//         required: true
//     },
//     status: {
//         type: String,
//         enum: ['pending', 'paid', 'overdue', 'cancelled'],
//         default: 'pending'
//     }

// });


// const mongoose = require('mongoose')

// const billSchema = mongoose.Schema({
//     tenantId: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'Tenant',
//         required: true
//     },
//     billingMonth: {
//         type: String, // หรือจะเก็บเป็น Number ก็ได้ เช่น 7
//         required: true
//     },
//     billingYear: {
//         type: String, // หรือ Number เช่น 2568
//         required: true
//     },
//     billDate: {
//         type: Date,
//         required: true
//     },
//     dueDate: {
//         type: Date,
//         required: true
//     },
//     status: {
//         type: String,
//         enum: ['unpaid', 'paid'],
//         default: 'unpaid'
//     },
//     paidDate: {
//         type: Date
//     },
//     paymentInfo: {
//         channel: String,
//         slipUrl: String,
//         note: String
//     },
//     items: [
//         {
//             name: {
//                 type: String,
//                 required: true
//             },
//             quantity: {
//                 type: Number,
//                 default: 1
//             },
//             unitPrice: {
//                 type: Number,
//                 required: true
//             },
//             total: {
//                 type: Number,
//                 required: true
//             }
//         }
//     ],
//     totalAmount: {
//         type: Number,
//         required: true
//     }
// }, { timestamps: true })

// module.exports = mongoose.model('Bill', billSchema)


const mongoose = require('mongoose');
const { Schema } = mongoose;


// ========== BILL CATEGORY SCHEMA ==========
const BillCategorySchema = new Schema({

    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Profile',
        required: true,
    },
    tenantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tenant',
        required: true,
    },
    categoryName: {
        type: String,
        required: true,
        trim: true
    },
    categoryCode: {
        type: String,

        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    sortOrder: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// ========== BILL SCHEMA ==========
const BillSchema = new Schema({
    billId: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    billNumber: {
        type: String,
        trim: true
    },
    tenant: {
        type: mongoose.Schema.ObjectId,
        ref: 'Tenant',
        required: true
    },
    fiscalYear: {
        type: Number,
        // required: true,
        min: 2500,
        max: 3000
    },
    billingPeriod: {
        month: {
            type: Number,
            required: true,
            min: 1,
            max: 12
        },
        year: {
            type: Number,
            required: true
        }
    },
    billDate: {
        type: Date,
        required: true,
        default: Date.now
    },
    dueDate: {
        type: Date,
        required: true
    },

    // รายการค่าใช้จ่าย
    items: [{
        itemId: {
            type: String,
            required: true
        },
        category: {
            type: mongoose.Schema.ObjectId,
            ref: 'BillCategory',
            // required: true
        },
        categoryName: {
            type: String,
            // required: true
        },
        description: {
            type: String,
            trim: true
        },
        quantity: {
            type: Number,
            default: 1,
            // min: 0
        },
        unitPrice: {
            type: Number,
            required: true,
            // min: 0
        },
        amount: {
            type: Number,
            required: true,
            // min: 0
        },
        unit: {
            type: String,
            default: 'รายการ'
        },
        // สำหรับติดตามการชำระแต่ละรายการ
        paidAmount: {
            type: Number,
            default: 0,
            // min: 0
        },
        remainingAmount: {
            type: Number,
            default: function () {
                return this.amount - this.paidAmount;
            }
        }
    }],

    // จำนวนเงิน
    totalAmount: {
        type: Number,
        required: true,
        // min: 0
    },
    paidAmount: {
        type: Number,
        default: 0,
        // min: 0
    },
    remainingAmount: {
        type: Number,
        default: function () {
            return this.totalAmount - this.paidAmount;
        }
    },

    // สถานะ
    status: {
        type: String,
        enum: ['pending', 'partial', 'paid', 'overdue', 'cancelled', 'unpaid'],
        default: 'pending'
    },

    // ข้อมูลเพิ่มเติม
    notes: {
        type: String,
        trim: true
    },
    attachments: [{
        type: String // URLs ของไฟล์แนบ
    }],

    // Audit fields
    createdBy: {
        type: String,
        required: true
    },
    updatedBy: {
        type: String
    }
}, {
    timestamps: true
});

// ========== PAYMENT SCHEMA ==========
const PaymentSchema = new Schema({
    paymentId: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    receiptCode: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    bill: {
        type: mongoose.Schema.ObjectId,
        ref: 'Bill',
        required: true
    },
    tenant: {
        type: mongoose.Schema.ObjectId,
        ref: 'Tenant',
        required: true
    },

    // ข้อมูลการชำระ
    paymentDate: {
        type: Date,
        required: true,
        default: Date.now
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    paymentMethod: {
        type: String,
        enum: ['cash', 'transfer', 'card', 'cheque'],
        required: true
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'refunded'],
        default: 'completed'
    },

    // รายละเอียดการชำระ
    description: {
        type: String,
        trim: true
    },
    reference: {
        type: String,
        trim: true // เลขที่อ้างอิง สำหรับ transfer
    },

    // การชำระแต่ละรายการ
    paidItems: [{
        itemId: {
            type: String,
            required: true
        },
        categoryName: {
            type: String,
            required: true
        },
        paidAmount: {
            type: Number,
            required: true,
            min: 0
        }
    }],

    // ข้อมูลเพิ่มเติม
    notes: {
        type: String,
        trim: true
    },
    attachments: [{
        type: String // ใบเสร็จ, slip การโอน
    }],

    // Audit fields
    createdBy: {
        type: String,
        required: true
    },
    updatedBy: {
        type: String
    }
}, {
    timestamps: true
});

// ========== PAYMENT INSTALLMENT SCHEMA ==========
const PaymentInstallmentSchema = new Schema({
    installmentId: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    bill: {
        type: mongoose.Schema.ObjectId,
        ref: 'Bill',
        required: true
    },
    tenant: {
        type: mongoose.Schema.ObjectId,
        ref: 'Tenant',
        required: true
    },

    // ข้อมูลงวด
    installmentNumber: {
        type: Number,
        required: true,
        min: 1
    },
    totalInstallments: {
        type: Number,
        required: true,
        min: 1
    },
    dueDate: {
        type: Date,
        required: true
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },

    // สถานะและการชำระ
    status: {
        type: String,
        enum: ['pending', 'paid', 'overdue'],
        default: 'pending'
    },
    payment: {
        type: mongoose.Schema.ObjectId,
        ref: 'Payment'
    },
    paidDate: {
        type: Date
    }
}, {
    timestamps: true
});

// ========== SYSTEM SETTING SCHEMA ==========
const SystemSettingSchema = new Schema({
    settingKey: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    settingValue: {
        type: String,
        required: true
    },
    dataType: {
        type: String,
        enum: ['string', 'number', 'boolean', 'date'],
        default: 'string'
    },
    description: {
        type: String,
        trim: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    updatedBy: {
        type: String,
        required: true
    }
}, {
    timestamps: { createdAt: false, updatedAt: true }
});

// ========== SEQUENCE SCHEMA ==========
const SequenceSchema = new Schema({
    sequenceType: {
        type: String,
        required: true,
        enum: ['bill', 'payment', 'receipt', 'installment']
    },
    currentValue: {
        type: Number,
        required: true,
        default: 1
    },
    prefix: {
        type: String,
        default: ''
    },
    suffix: {
        type: String,
        default: ''
    },
    year: {
        type: Number,
        required: true
    }
}, {
    timestamps: { createdAt: false, updatedAt: true }
});

// ========== INDEXES ==========

// User indexes
// UserSchema.index({ userId: 1 });
// UserSchema.index({ phone: 1 });
// UserSchema.index({ email: 1 });
// UserSchema.index({ isActive: 1 });

// Bill Category indexes

BillCategorySchema.index({ isActive: 1, sortOrder: 1 });

// Bill indexes
BillSchema.index({ billId: 1 });
BillSchema.index({ user: 1, fiscalYear: 1 });
BillSchema.index({ billDate: 1 });
BillSchema.index({ dueDate: 1 });
BillSchema.index({ status: 1 });
BillSchema.index({ fiscalYear: 1, status: 1 });
BillSchema.index({ 'billingPeriod.year': 1, 'billingPeriod.month': 1 });

// Payment indexes
PaymentSchema.index({ paymentId: 1 });
PaymentSchema.index({ receiptCode: 1 });
PaymentSchema.index({ bill: 1 });
PaymentSchema.index({ user: 1, paymentDate: 1 });
PaymentSchema.index({ paymentDate: 1 });
PaymentSchema.index({ paymentStatus: 1 });

// Payment Installment indexes
PaymentInstallmentSchema.index({ installmentId: 1 });
PaymentInstallmentSchema.index({ bill: 1, installmentNumber: 1 });
PaymentInstallmentSchema.index({ user: 1, dueDate: 1 });
PaymentInstallmentSchema.index({ status: 1, dueDate: 1 });

// System Setting indexes
SystemSettingSchema.index({ settingKey: 1 });
SystemSettingSchema.index({ isActive: 1 });

// Sequence indexes
SequenceSchema.index({ sequenceType: 1, year: 1 });

// ========== MIDDLEWARE ==========

// Pre-save middleware สำหรับ Bill
BillSchema.pre('save', function (next) {
    // คำนวณ remainingAmount
    this.remainingAmount = this.totalAmount - this.paidAmount;

    // อัพเดท status ตามยอดเงิน
    if (this.paidAmount === 0) {
        this.status = 'pending';
    } else if (this.paidAmount < this.totalAmount) {
        this.status = 'partial';
    } else if (this.paidAmount >= this.totalAmount) {
        this.status = 'paid';
    }

    // ตรวจสอบ overdue
    if (this.status !== 'paid' && new Date() > this.dueDate) {
        this.status = 'overdue';
    }

    next();
});

// Pre-save middleware สำหรับ Payment
PaymentSchema.pre('save', function (next) {
    // สร้าง paymentId อัตโนมัติถ้าไม่มี
    if (!this.paymentId) {
        this.paymentId = `PAY - ${new Date().getFullYear()} -${Date.now()}`;
    }

    // สร้าง receiptCode อัตโนมัติถ้าไม่มี
    if (!this.receiptCode) {
        this.receiptCode = `REC - ${Date.now()}`;
    }

    next();
});

// ========== VIRTUAL FIELDS ==========

// Virtual สำหรับ Bill
BillSchema.virtual('isOverdue').get(function () {
    return this.status !== 'paid' && new Date() > this.dueDate;
});

BillSchema.virtual('paymentPercentage').get(function () {
    return this.totalAmount > 0 ? (this.paidAmount / this.totalAmount) * 100 : 0;
});

// Virtual สำหรับ Payment
PaymentSchema.virtual('isPending').get(function () {
    return this.paymentStatus === 'pending';
});

// ========== METHODS ==========

// Instance methods สำหรับ Bill
BillSchema.methods.addPayment = function (paymentData) {
    this.paidAmount += paymentData.amount;
    this.save();
};

BillSchema.methods.getUnpaidAmount = function () {
    return this.totalAmount - this.paidAmount;
};

// Static methods สำหรับ Bill
BillSchema.statics.findOverdue = function () {
    return this.find({
        status: { $in: ['pending', 'partial'] },
        dueDate: { $lt: new Date() }
    });
};

BillSchema.statics.findByFiscalYear = function (year) {
    return this.find({ fiscalYear: year });
};

// ========== MODELS ==========

const BillCategory = mongoose.model('BillCategory', BillCategorySchema);
const Bill = mongoose.model('Bill', BillSchema);
const Payment = mongoose.model('Payment', PaymentSchema);
const PaymentInstallment = mongoose.model('PaymentInstallment', PaymentInstallmentSchema);
const SystemSetting = mongoose.model('SystemSetting', SystemSettingSchema);
const Sequence = mongoose.model('Sequence', SequenceSchema);

module.exports = {
    // User,
    BillCategory,
    Bill,
    Payment,
    PaymentInstallment,
    SystemSetting,
    Sequence
};

// ========== HELPER FUNCTIONS ==========

// ฟังก์ชันสำหรับสร้าง sequence number
async function getNextSequence(sequenceType, year = new Date().getFullYear()) {
    const sequence = await Sequence.findOneAndUpdate(
        { sequenceType, year },
        { $inc: { currentValue: 1 } },
        { new: true, upsert: true }
    );

    return `${sequence.prefix}${year} -${sequence.currentValue.toString().padStart(3, '0')}${sequence.suffix}`;
}

// ฟังก์ชันสำหรับสร้าง billId
async function generateBillId(fiscalYear) {
    return await getNextSequence('bill', fiscalYear);
}

// ฟังก์ชันสำหรับสร้าง paymentId
async function generatePaymentId(year = new Date().getFullYear()) {
    return await getNextSequence('payment', year);
}

module.exports.helpers = {
    getNextSequence,
    generateBillId,
    generatePaymentId
};

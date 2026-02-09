import mongoose, { Schema, model } from 'mongoose';

const ApartmentSchema = new Schema(
    {
        owner: {
            type: mongoose.Schema.ObjectId,
            ref: 'Account',
            required: true
        },
        apartmentName: {
            type: String,
            required: true,
        },
        apartmentType: {
            type: String,
        },

        addressLine: {
            type: String,
            required: true,
        },
        province: {
            type: String,
            required: true,
        },
        amphure: {
            type: String,
            required: true,
        },
        tambon: {
            type: String,
            required: true,
        },
        zipCode: {
            type: Number,
            required: true,
        },

        phones: [
            {
                type: {
                    type: String,
                    enum: ['office', 'mobile', 'home', 'fax'],
                    default: 'office',
                },
                number: {
                    type: String,

                },
            }
        ],

        billingSettings: {
            cutoffDate: {
                type: Number,
                default: 27,
                min: 1,
                max: 31,
                comment: 'วันที่ตัดรอบเดือน'
            },
            paymentDueDate: {
                type: Number,
                default: 5,
                min: 1,
                max: 31,
                comment: 'วันที่กำหนดชำระ'
            },
            lateFeePerDay: {
                type: Number,
                default: 100,
                comment: 'ค่าปรับล่าช้าต่อวัน'
            },
        },
        meters: [
            {
                type: mongoose.Schema.ObjectId,
                ref: 'Meter',
            }
        ],
        services: [
            {
                name: {
                    type: String,
                    required: true,
                },
                enabled: {
                    type: Boolean,
                    default: true,
                },
                price: {
                    type: Number,
                    default: 0,
                },
                unit: {
                    type: String,
                    enum: ['monthly', 'daily', 'onetime'],
                    default: 'monthly',
                },
                description: {
                    type: String,
                }
            }
        ],
        isSlipCheckEnabled: {
            type: Boolean,
            default: false
        },
        img: {
            type: String,
            default: ""
        },
        domain: {
            type: String,
            default: ""
        },

        createdAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);


//ApartmentSchema.index({ owner: 1 });
ApartmentSchema.index({ _id: 1, owner: 1 });
ApartmentSchema.index({ apartmentName: 1, owner: 1 });
ApartmentSchema.index({ "addressLine": "text", "apartmentName": "text" });



// Virtual fields
ApartmentSchema.virtual('fullAddress').get(function () {
    return `${this.addressLine}, ${this.tambon}, ${this.amphure}, ${this.province} ${this.zipCode}`;
});
export const ApartmentSchemaModel = model('Apartment', ApartmentSchema);



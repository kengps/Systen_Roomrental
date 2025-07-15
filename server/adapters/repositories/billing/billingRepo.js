const { default: mongoose } = require("mongoose");
const { ApartmentSchemaModel } = require("../../../frameworks/database/mongoDB/models/apartments/apartment");
const { BillCategory, Bill } = require("../../../frameworks/database/mongoDB/models/bill/bill");
const profile = require("../../../frameworks/database/mongoDB/models/profile");
const Tenant = require("../../../frameworks/database/mongoDB/models/tenant");
const { sendError } = require("../../../frameworks/webserver/utils/responseMessage");
const { findOwner } = require("../register");
const { Room } = require("../../../frameworks/database/mongoDB/models/roomDetail");



exports.getDataBillingRepo = async (accountId) => {

    const apartment = await ApartmentSchemaModel.findOne({
        owner: accountId
    }).populate('meters')



    const tenants = await Tenant.find({ owner: accountId, tenancyStatus: 'renting' }).select('-owner -createdBy').populate('room').lean();


    // 2. Loop ใส่ข้อมูล service เข้าไปในแต่ละ tenant
    const tenantsWithServiceDetails = tenants.map((tenant) => {
        const detailedServices = tenant.serviceUsage.map((serviceId) => {
            // หา service ที่ id ตรงกันใน apartment.services
            const service = apartment.services.find((s) => s._id.equals(serviceId));
            return service ? {
                _id: service._id,
                name: service.name,
                price: service.price,
                unit: service.unit,
                description: service.description,
            } : null;
        }).filter(Boolean); // เอา null ออกกรณีไม่เจอ

        return {
            ...tenant,
            serviceUsage: detailedServices
        };
    });
    console.log(`⩇⩇:⩇⩇🚨 ~ tenantsWithServiceDetails ~ tenantsWithServiceDetails :`, tenantsWithServiceDetails);


    const values = {
        apartment: apartment,
        tenants: tenantsWithServiceDetails
    }


    return values
}


// Helper functions
function generateCategoryCode(description) {
    // แปลง description เป็น categoryCode
    const codeMapping = {
        'ค่าทำความสะอาด': 'CLEANING',
        'ค่าเคเบิล': 'CABLE_TV',
        'ค่าจอดรถ': 'PARKING',
        'ค่าอะไร': 'MISC',
        'ค่าตัว': 'PERSONAL'
    };

    // ลองหาใน mapping ก่อน
    const mappedCode = codeMapping[description.trim()];
    if (mappedCode) {
        return mappedCode;
    }

    // ถ้าไม่เจอ ให้สร้างจาก description
    return description
        .replace(/[^a-zA-Zก-๙\s]/g, '') // เอาเฉพาะตัวอักษร
        .trim()
        .toUpperCase()
        .replace(/\s+/g, '_') // เปลี่ยน space เป็น underscore
        .substring(0, 20); // จำกัดความยาว
}

function determineCategoryType(description) {
    const typeMapping = {
        'ค่าทำความสะอาด': 'SERVICE',
        'ค่าเคเบิล': 'SERVICE',
        'ค่าจอดรถ': 'SERVICE',
        'ค่าอะไร': 'OTHER',
        'ค่าตัว': 'OTHER'
    };

    return typeMapping[description.trim()] || 'OTHER';
}
exports.BillingCategory = async (ownerId, tenantId, roomCharge, otherCharges) => {
    try {
        const categoriesToCreate = [];

        // 1. บันทึกหมวด Room Charge (ค่าเช่าห้อง)
        if (roomCharge && roomCharge.monthlyRent > 0) {
            const roomCategoryExists = await BillCategory.findOne({
                owner: ownerId,
                categoryCode: 'ROOM_RENT'
            });

            if (!roomCategoryExists) {
                categoriesToCreate.push({
                    owner: ownerId,
                    tenantId: tenantId,
                    categoryCode: 'ROOM_RENT',
                    categoryName: 'ค่าเช่าห้อง',
                    categoryType: 'RENT',
                    description: 'ค่าเช่าห้องพักรายเดือน',
                    isActive: true,
                    sortOrder: 1
                });
            }
        }
        let sortOrder = 10;
        // 2. บันทึกหมวด Other Charges (ค่าใช้จ่ายอื่นๆ)
        if (otherCharges && Array.isArray(otherCharges)) {
            for (const charge of otherCharges) {
                // สร้าง categoryCode จาก description
                const categoryCode = generateCategoryCode(charge.description);

                // ตรวจสอบว่ามี category นี้แล้วหรือไม่
                const existingCategory = await BillCategory.findOne({
                    tenantId: tenantId,
                    categoryCode: categoryCode
                });

                if (!existingCategory) {
                    // กำหนดประเภทของหมวดหมู่
                    const categoryType = determineCategoryType(charge.description);

                    categoriesToCreate.push({
                        owner: ownerId,
                        tenantId: tenantId,
                        categoryCode: categoryCode,
                        categoryName: charge.description.trim(),
                        categoryType: categoryType,
                        description: `${charge.description.trim()} - จำนวน ${charge.amount} บาท`,
                        isActive: true,
                        sortOrder: sortOrder++
                    });
                }
            }
        }

        // 3. บันทึกข้อมูลลง Database
        let result = [];
        if (categoriesToCreate.length > 0) {
            result = await BillCategory.insertMany(categoriesToCreate);
            console.log(`✅ สร้าง BillCategory สำเร็จ ${result.length} รายการ`);
        } else {
            console.log(`ℹ️ ไม่มี BillCategory ใหม่ที่ต้องสร้าง`);
        }

        // 4. ส่งกลับรายการ categories ทั้งหมดของ tenant นี้
        const allCategories = await BillCategory.find({
            owner: ownerId,
            isActive: true
        }).sort({ sortOrder: 1, categoryName: 1 });

        console.log(`⩇⩇:⩇⩇🚨 ~ exports.BillingCategory= ~  allCategories: allCategories :`, allCategories);

        console.log(`⩇⩇:⩇⩇🚨 ~ exports.BillingCategory= ~    newCategories: result, :`, result,);

        return {
            success: true,
            message: `สร้าง BillCategory สำเร็จ ${result.length} รายการ`,
            newCategories: result,
            allCategories: allCategories
        };

    } catch (error) {
        console.error('❌ Error in BillingCategory:', error);
        return {
            success: false,
            message: 'เกิดข้อผิดพลาดในการสร้าง BillCategory',
            error: error.message
        };
    }
}


exports.BillSave = async (accountId, ownerId,
    tenantId,
    apartmentId,
    billingPeriod,
    issueDate,
    dueDate,
    roomCharge,
    utilityCharges,
    otherCharges,
    discounts,
    subTotal,
    totalDiscount,
    totalAmount,
    status,) => {

    try {
        // ตรวจสอบว่ามีบิลของผู้เช่าในเดือนนี้อยู่แล้วหรือไม่
        let queryCondition = {
            tenant: tenantId,
            status: { $ne: 'cancelled' } // ไม่นับบิลที่ถูกยกเลิก
        };

        // ตรวจสอบรูปแบบของ billingPeriod
        if (typeof billingPeriod === 'object' && billingPeriod.month && billingPeriod.year) {
            // กรณีที่ billingPeriod เป็น object
            queryCondition['billingPeriod.month'] = billingPeriod.month;
            queryCondition['billingPeriod.year'] = billingPeriod.year;
        } else {
            // กรณีที่ billingPeriod เป็น string หรือรูปแบบอื่น
            queryCondition.billingPeriod = billingPeriod;
        }

        const existingBill = await Bill.findOne(queryCondition);

        if (existingBill) {
            const periodDisplay = typeof billingPeriod === 'object'
                ? `${billingPeriod.month}/${billingPeriod.year}`
                : billingPeriod;
            return sendError('ซ้ำ', 'bill')
            //return sendError('ไม่สามารถสร้างบิลได้', `บิลสำหรับผู้เช่าในเดือน ${periodDisplay} มีอยู่แล้ว (เลขที่บิล: ${existingBill.billNumber})`);
        }

        // สร้างเลข billId (เช่น UUID หรือ random string)
        const billId = `BILL-${Date.now()}`;

        // สร้างเลขที่ใบแจ้งหนี้ (billNumber)
        const billNumber = `INV-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)}`;

        // คำนวณ totalAmount
        const items = [
            // Room
            {
                itemId: new mongoose.Types.ObjectId().toString(),
                categoryName: "ค่าเช่าห้อง",
                description: "ค่าเช่าห้องรายเดือน",
                quantity: 1,
                unitPrice: roomCharge.monthlyRent,
                amount: roomCharge.monthlyRent,
                unit: "เดือน",
                paidAmount: 0,
                remainingAmount: roomCharge.monthlyRent,
            },

            // Previous balance
            ...(roomCharge.previousBalance > 0
                ? [{
                    itemId: new mongoose.Types.ObjectId().toString(),
                    categoryName: "ยอดค้างก่อนหน้า",
                    description: "ยอดค้างชำระก่อนหน้านี้",
                    quantity: 1,
                    unitPrice: roomCharge.previousBalance,
                    amount: roomCharge.previousBalance,
                    unit: "รายการ",
                    paidAmount: 0,
                    remainingAmount: roomCharge.previousBalance,
                }]
                : []),

            // Utilities
            {
                itemId: new mongoose.Types.ObjectId().toString(),
                categoryName: "ค่าไฟฟ้า",
                description: `ใช้ไฟ ${utilityCharges.electricity.usage} หน่วย x ${utilityCharges.electricity.rate}`,
                quantity: utilityCharges.electricity.usage,
                unitPrice: utilityCharges.electricity.rate,
                amount: utilityCharges.electricity.cost,
                unit: "หน่วย",
                paidAmount: 0,
                remainingAmount: utilityCharges.electricity.cost,
            },
            {
                itemId: new mongoose.Types.ObjectId().toString(),
                categoryName: "ค่าน้ำ",
                description: `ใช้น้ำ ${utilityCharges.water.usage} หน่วย x ${utilityCharges.water.rate}`,
                quantity: utilityCharges.water.usage,
                unitPrice: utilityCharges.water.rate,
                amount: utilityCharges.water.cost,
                unit: "หน่วย",
                paidAmount: 0,
                remainingAmount: utilityCharges.water.cost,
            },

            // Other charges
            ...otherCharges.map((charge) => ({
                itemId: new mongoose.Types.ObjectId().toString(),
                categoryName: "ค่าอื่นๆ",
                description: charge.description,
                quantity: 1,
                unitPrice: charge.amount,
                amount: charge.amount,
                unit: "รายการ",
                paidAmount: 0,
                remainingAmount: charge.amount,
            })),

            // Discounts
            ...discounts.map((discount) => ({
                itemId: new mongoose.Types.ObjectId().toString(),
                categoryName: "ส่วนลด",
                description: discount.description,
                quantity: 1,
                unitPrice: -discount.amount,
                amount: -discount.amount,
                unit: "รายการ",
                paidAmount: 0,
                remainingAmount: -discount.amount,
            })),
        ];

        const totalPriceAll = items.reduce((a, b) => {
            return a + b.remainingAmount;
        }, 0);

        if (totalPriceAll !== totalAmount) {
            return sendError('ไม่ถูกต้อง', "total amount")
        }

        // let updatePrevMeterRoom = await Room.

        const bill = new Bill({
            tenant: tenantId,
            billId: billId,
            billNumber: billNumber,
            billingPeriod,
            billDate: issueDate,
            dueDate,
            items,
            subTotal,
            totalDiscount,
            totalAmount,
            status,
            createdBy: accountId,
        });

        return await bill.save();

    } catch (error) {
        console.error('Error in BillSave:', error);
        throw error
    }
}

exports.updateMeter = async (accountId, tenantId, utilityCharges) => {



    const roomId = await Tenant.findOne({ _id: tenantId }).select('room -_id').exec()

    const re = await Room.findOneAndUpdate(
        { _id: roomId.room },
        {
            $inc: {
                'meter.water': utilityCharges.electricity.currentReading,
                'meter.electric': utilityCharges.water.currentReading
            }
        },
        { new: true }
    )

    return re
}
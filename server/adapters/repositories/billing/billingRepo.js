const { default: mongoose } = require("mongoose");
const { ApartmentSchemaModel } = require("../../../frameworks/database/mongoDB/models/apartments/apartment");
const { BillCategory, Bill } = require("../../../frameworks/database/mongoDB/models/bill/bill");
const profile = require("../../../frameworks/database/mongoDB/models/profile");
const Tenant = require("../../../frameworks/database/mongoDB/models/tenant");
const { sendError } = require("../../../frameworks/webserver/utils/responseMessage");
const { findOwner } = require("../register");
const { Room } = require("../../../frameworks/database/mongoDB/models/roomDetail");
const meterHistory = require("../../../frameworks/database/mongoDB/models/apartments/meterHistory");



exports.getDataBillingRepo2 = async (accountId) => {


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

    const values = {
        apartment: apartment,
        tenants: tenantsWithServiceDetails
    }


    return values
}
exports.getDataBillingRepo = async (accountId) => {
    const result = await Tenant.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(accountId),
                tenancyStatus: 'renting',
            },
        },
        {
            $lookup: {
                from: 'rooms',
                localField: 'room',
                foreignField: '_id',
                as: 'room',
            },
        },
        {
            $unwind: { path: '$room', preserveNullAndEmptyArrays: true },
        },
        {
            $lookup: {
                from: 'apartments',
                localField: 'owner',
                foreignField: 'owner',
                as: 'apartment',
            },
        },
        {
            $unwind: { path: '$apartment', preserveNullAndEmptyArrays: true },
        },
        {
            $lookup: {
                from: 'meters',
                localField: 'apartment.meters',
                foreignField: '_id',
                as: 'apartment.meters',
            },
        },
        {
            $addFields: {
                serviceUsage: {
                    $map: {
                        input: '$serviceUsage',
                        as: 'serviceId',
                        in: {
                            $let: {
                                vars: {
                                    matchedService: {
                                        $arrayElemAt: [
                                            {
                                                $filter: {
                                                    input: '$apartment.services',
                                                    as: 'service',
                                                    cond: { $eq: ['$$service._id', '$$serviceId'] },
                                                },
                                            },
                                            0,
                                        ],
                                    },
                                },
                                in: {
                                    $cond: [
                                        { $ifNull: ['$$matchedService', false] },
                                        {
                                            _id: '$$matchedService._id',
                                            name: '$$matchedService.name',
                                            price: '$$matchedService.price',
                                            unit: '$$matchedService.unit',
                                            description: '$$matchedService.description',
                                        },
                                        '$$REMOVE',
                                    ],
                                },
                            },
                        },
                    },
                },
            },
        },
        // เก็บ apartment ไว้ชั่วคราว
        {
            $addFields: {
                apartmentRoot: '$apartment',
            },
        },
        {
            $unset: 'apartment',
        },
        // Group ตาม apartment._id และรวม tenants
        {
            $group: {
                _id: '$apartmentRoot._id',
                apartment: { $first: '$apartmentRoot' },
                tenants: { $push: '$$ROOT' },
            },
        },
        // ลบ field apartmentRoot ออกจาก tenants
        {
            $project: {
                _id: 0,
                apartment: 1,
                tenants: {
                    $map: {
                        input: '$tenants',
                        as: 'tenant',
                        in: {
                            _id: '$$tenant._id',
                            owner: '$$tenant.owner',
                            createdBy: '$$tenant.createdBy',
                            accountId: '$$tenant.accountId',
                            room: '$$tenant.room',
                            prefix: '$$tenant.prefix',
                            firstName: '$$tenant.firstName',
                            lastName: '$$tenant.lastName',
                            deposit: '$$tenant.deposit',
                            contractDuration: '$$tenant.contractDuration',
                            phone: '$$tenant.phone',
                            tenancyStatus: '$$tenant.tenancyStatus',
                            moveInDate: '$$tenant.moveInDate',
                            createdAt: '$$tenant.createdAt',
                            updatedAt: '$$tenant.updatedAt',
                            __v: '$$tenant.__v',
                            moveOutDate: '$$tenant.moveOutDate',
                            serviceUsage: '$$tenant.serviceUsage',
                            // ไม่เอา apartmentRoot
                        },
                    },
                },
            },
        },
    ]);

    return result[0] || { apartment: null, tenants: [] };
};

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

// สร้าง mapping table สำหรับ category ที่คล้ายกัน
const CategoryMapping = {
    // กลุ่มค่าจอดรถ
    parking: ['ค่าจอดรถ', 'ค่าที่จอดรถ', 'ค่าจอดรถมอเตอร์ไซค์', 'ค่าจอดรถยนต์'],

    // กลุ่มค่าแม่บ้าน
    cleaning: ['ค่าแม่บ้าน', 'ค่าทำความสะอาด', 'ค่าแม่บ้านทำความสะอาด'],

    // กลุ่มค่าขยะ
    garbage: ['ค่าขยะ', 'ค่าจัดการขยะ', 'ค่าถังขยะ'],

    // กลุ่มค่าอินเทอร์เน็ต
    internet: ['ค่าอินเทอร์เน็ต', 'ค่าไวไฟ', 'ค่า WiFi', 'ค่า Internet'],

    // กลุ่มค่าปรับ
    penalty: ['ค่าปรับ', 'ค่าปรับล่าช้า', 'ค่าปรับชำระล่าช้า']
};

// ฟังก์ชันจัดกลุ่ม category
function getCategoryGroup(categoryName) {
    const name = categoryName.toLowerCase();

    for (const [group, keywords] of Object.entries(CategoryMapping)) {
        if (keywords.some(keyword => name.includes(keyword.toLowerCase()))) {
            return group;
        }
    }

    return 'other';
}

exports.BillingCategory = async (ownerId, tenantId, roomCharge, otherCharges) => {
    try {
        // ดึง categories ที่มีอยู่แล้ว
        const existingCategories = await BillCategory.find({
            owner: ownerId,
            isActive: true
        });

        const existingCategoryNames = new Set(
            existingCategories.map(cat => cat.categoryName)
        );

        const categoriesToCreate = [];

        // สร้าง category ใหม่สำหรับ otherCharges
        if (otherCharges && Array.isArray(otherCharges)) {
            for (const charge of otherCharges) {
                const categoryName = charge.description.trim();

                // ถ้าไม่มี category นี้ ให้สร้างใหม่
                if (!existingCategoryNames.has(categoryName)) {
                    const categoryCode = generateCategoryCode(categoryName);

                    categoriesToCreate.push({
                        owner: ownerId,
                        tenantId: tenantId,
                        categoryCode: categoryCode,
                        categoryName: categoryName,
                        categoryType: determineCategoryType(categoryName),
                        description: `${categoryName} - สร้างอัตโนมัติ`,
                        isActive: true,
                        sortOrder: 50 // ใช้ order กลางๆ
                    });

                    existingCategoryNames.add(categoryName);
                }
            }
        }

        // บันทึก categories ใหม่
        if (categoriesToCreate.length > 0) {
            await BillCategory.insertMany(categoriesToCreate);
        }

        return { success: true };

    } catch (error) {
        console.error('Error in BillingCategory:', error);
        return { success: false, error: error.message };
    }
};

// เพิ่มการสร้างรายงานด้วย Aggregation
exports.getBillReport = async (ownerId, startDate, endDate) => {
    return await Bill.aggregate([
        {
            $match: {
                createdBy: new mongoose.Types.ObjectId(ownerId),
                billDate: {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate)
                },
                status: { $ne: 'cancelled' }
            }
        },
        {
            $lookup: {
                from: 'tenants',
                localField: 'tenant',
                foreignField: '_id',
                as: 'tenantInfo'
            }
        },
        {
            $lookup: {
                from: 'rooms',
                localField: 'tenantInfo.room',
                foreignField: '_id',
                as: 'roomInfo'
            }
        },
        {
            $group: {
                _id: {
                    month: { $month: '$billDate' },
                    year: { $year: '$billDate' }
                },
                totalBills: { $sum: 1 },
                totalAmount: { $sum: '$totalAmount' },
                totalDiscount: { $sum: '$totalDiscount' },
                paidBills: {
                    $sum: {
                        $cond: [{ $eq: ['$status', 'paid'] }, 1, 0]
                    }
                },
                unpaidBills: {
                    $sum: {
                        $cond: [{ $eq: ['$status', 'unpaid'] }, 1, 0]
                    }
                },
                bills: {
                    $push: {
                        billNumber: '$billNumber',
                        tenant: { $arrayElemAt: ['$tenantInfo.name', 0] },
                        room: { $arrayElemAt: ['$roomInfo.roomNumber', 0] },
                        amount: '$totalAmount',
                        status: '$status',
                        dueDate: '$dueDate'
                    }
                }
            }
        },
        {
            $sort: {
                '_id.year': -1,
                '_id.month': -1
            }
        }
    ]);
};
// exports.BillSave = async (
//     accountId,
//     ownerId,
//     tenantId,
//     apartmentId,
//     billingPeriod,
//     issueDate,
//     dueDate,
//     roomCharge,
//     utilityCharges,
//     otherCharges,
//     discounts,
//     subTotal,
//     totalDiscount,
//     totalAmount,
//     status
// ) => {
//     try {
//         // 1. ตรวจสอบบิลซ้ำ
//         let queryCondition = {
//             tenant: tenantId,
//             status: { $ne: 'cancelled' }
//         };

//         if (typeof billingPeriod === 'object' && billingPeriod.month && billingPeriod.year) {
//             queryCondition['billingPeriod.month'] = billingPeriod.month;
//             queryCondition['billingPeriod.year'] = billingPeriod.year;
//         } else {
//             queryCondition.billingPeriod = billingPeriod;
//         }

//         const existingBill = await Bill.findOne(queryCondition);
//         if (existingBill) {
//             return sendError('ซ้ำ', 'bill');
//         }

//         // 2. ดึง Categories ที่มีอยู่
//         const categories = await BillCategory.find({
//             owner: ownerId,
//             isActive: true
//         });

//         // สร้าง Map สำหรับค้นหา category ได้เร็วขึ้น
//         const categoryMap = new Map();
//         categories.forEach(cat => {
//             categoryMap.set(cat.categoryCode, cat);
//             categoryMap.set(cat.categoryName, cat);
//         });

//         // Helper function to create default categories if not exist
//         const createDefaultCategory = async (categoryCode, categoryName, categoryGroup = 'other') => {
//             let category = categoryMap.get(categoryCode) || categoryMap.get(categoryName);

//             if (!category) {
//                 category = new BillCategory({
//                     apartment: apartmentId,
//                     owner: ownerId,
//                     tenantId: tenantId,
//                     categoryCode: categoryCode,
//                     categoryName: categoryName,
//                     categoryGroup: categoryGroup,
//                     categoryType: 'charge',
//                     description: `${categoryName} - สร้างอัตโนมัติ`,
//                     isActive: true,
//                     sortOrder: 50
//                 });

//                 await category.save();
//                 categoryMap.set(categoryCode, category);
//                 categoryMap.set(categoryName, category);
//             }

//             return category;
//         };



//         // 3. สร้าง Bill ID และ Bill Number
//         const billId = `BILL-${Date.now()}`;
//         const billNumber = `INV-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)}`;

//         // 4. สร้าง Items พร้อม Category Reference
//         const items = [];

//         // Room Charge
//         if (roomCharge && roomCharge.monthlyRent > 0) {
//             const roomCategory = await createDefaultCategory('ROOM_RENT', 'ค่าเช่าห้อง', 'rent');
//             items.push({
//                 itemId: new mongoose.Types.ObjectId().toString(),
//                 category: roomCategory._id,
//                 categoryName: "ค่าเช่าห้อง",
//                 description: "ค่าเช่าห้องรายเดือน",
//                 quantity: 1,
//                 unitPrice: roomCharge.monthlyRent,
//                 amount: roomCharge.monthlyRent,
//                 unit: "เดือน",
//                 paidAmount: 0,
//                 remainingAmount: roomCharge.monthlyRent,
//             });
//         }

//         // Previous Balance
//         if (roomCharge && roomCharge.previousBalance > 0) {
//             const prevBalanceCategory = await createDefaultCategory('PREV_BALANCE', 'ยอดค้างก่อนหน้า', 'other');
//             items.push({
//                 itemId: new mongoose.Types.ObjectId().toString(),
//                 category: prevBalanceCategory._id,
//                 categoryName: "ยอดค้างก่อนหน้า",
//                 description: "ยอดค้างชำระก่อนหน้านี้",
//                 quantity: 1,
//                 unitPrice: roomCharge.previousBalance,
//                 amount: roomCharge.previousBalance,
//                 unit: "รายการ",
//                 paidAmount: 0,
//                 remainingAmount: roomCharge.previousBalance,
//             });
//         }

//         // Utilities - Electricity
//         if (utilityCharges && utilityCharges.electricity) {
//             const electricityCategory = await createDefaultCategory('ELECTRICITY', 'ค่าไฟฟ้า', 'utility');
//             items.push({
//                 itemId: new mongoose.Types.ObjectId().toString(),
//                 category: electricityCategory._id,
//                 categoryName: "ค่าไฟฟ้า",
//                 description: `ใช้ไฟ ${utilityCharges.electricity.usage} หน่วย x ${utilityCharges.electricity.rate}`,
//                 quantity: utilityCharges.electricity.usage,
//                 unitPrice: utilityCharges.electricity.rate,
//                 amount: utilityCharges.electricity.cost,
//                 unit: "หน่วย",
//                 previousUnit: utilityCharges.electric.previousReading,
//                 currentUnit: utilityCharges.electric.currentReading,
//                 paidAmount: 0,
//                 remainingAmount: utilityCharges.electricity.cost,
//             });
//         }

//         // Utilities - Water
//         if (utilityCharges && utilityCharges.water) {
//             const waterCategory = await createDefaultCategory('WATER', 'ค่าน้ำ', 'utility');
//             items.push({
//                 itemId: new mongoose.Types.ObjectId().toString(),
//                 category: waterCategory._id,
//                 categoryName: "ค่าน้ำ",
//                 description: `ใช้น้ำ ${utilityCharges.water.usage} หน่วย x ${utilityCharges.water.rate}`,
//                 quantity: utilityCharges.water.usage,
//                 unitPrice: utilityCharges.water.rate,
//                 amount: utilityCharges.water.cost,
//                 unit: "หน่วย",
//                 previousUnit: utilityCharges.water.previousReading,
//                 currentUnit: utilityCharges.water.currentReading,
//                 paidAmount: 0,
//                 remainingAmount: utilityCharges.water.cost,
//             });
//         }

//         // Other Charges
//         if (otherCharges && Array.isArray(otherCharges)) {
//             for (const charge of otherCharges) {
//                 const categoryName = charge.description.trim();

//                 // หา category ที่มีอยู่
//                 let category = await BillCategory.findOne({
//                     apartment: apartmentId,
//                     owner: ownerId,
//                     categoryName: categoryName
//                 });

//                 // ถ้าไม่มี ให้สร้างใหม่
//                 if (!category) {
//                     const categoryCode = generateCategoryCode(categoryName);
//                     const categoryGroup = getCategoryGroup(categoryName);

//                     category = new BillCategory({
//                         apartment: apartmentId,
//                         owner: ownerId,
//                         tenantId: tenantId,
//                         categoryCode: categoryCode,
//                         categoryName: categoryName,
//                         categoryGroup: categoryGroup,
//                         categoryType: determineCategoryType(categoryName),
//                         description: `${categoryName} - สร้างอัตโนมัติ`,
//                         isActive: true,
//                         sortOrder: 50
//                     });

//                     await category.save();
//                 }

//                 // สร้าง bill item
//                 items.push({
//                     itemId: new mongoose.Types.ObjectId().toString(),
//                     category: category._id,
//                     categoryName: categoryName,
//                     categoryGroup: category.categoryGroup,
//                     description: charge.description,
//                     quantity: 1,
//                     unitPrice: charge.amount,
//                     amount: charge.amount,
//                     unit: "รายการ",
//                     paidAmount: 0,
//                     remainingAmount: charge.amount,
//                 });
//             }
//         }

//         // Discounts
//         if (discounts && Array.isArray(discounts)) {
//             const discountCategory = await createDefaultCategory('DISCOUNT', 'ส่วนลด', 'discount');

//             discounts.forEach((discount) => {
//                 items.push({
//                     itemId: new mongoose.Types.ObjectId().toString(),
//                     category: discountCategory._id,
//                     categoryName: "ส่วนลด",
//                     description: discount.description,
//                     quantity: 1,
//                     unitPrice: -discount.amount,
//                     amount: -discount.amount,
//                     unit: "รายการ",
//                     paidAmount: 0,
//                     remainingAmount: -discount.amount,
//                 });
//             });
//         }

//         // 5. ตรวจสอบยอดรวม
//         const totalPriceAll = items.reduce((sum, item) => sum + item.remainingAmount, 0);
//         if (Math.abs(totalPriceAll - totalAmount) > 0.01) { // Use small tolerance for floating point comparison
//             return sendError('ไม่ถูกต้อง', "total amount");
//         }

//         // 6. สร้างและบันทึก Bill
//         const bill = new Bill({
//             apartment: apartmentId,
//             tenant: tenantId,
//             billId: billId,
//             billNumber: billNumber,
//             billingPeriod,
//             billDate: issueDate,
//             dueDate,
//             items,
//             subTotal,
//             totalDiscount,
//             totalAmount,
//             status,
//             createdBy: accountId,
//         });

//         return await bill.save();

//     } catch (error) {
//         console.error('Error in BillSave:', error);
//         throw error;
//     }
// };

exports.BillSave = async (
    accountId,
    ownerId,
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
    status
) => {
    try {
        // 1. ตรวจสอบบิลซ้ำ + ดึงข้อมูล tenant และ room ในครั้งเดียว
        const existingBillAndTenantInfo = await Bill.aggregate([
            {
                $match: {
                    tenant: new mongoose.Types.ObjectId(tenantId),
                    status: { $ne: 'cancelled' },
                    'billingPeriod.month': billingPeriod.month,
                    'billingPeriod.year': billingPeriod.year
                }
            },
            {
                $lookup: {
                    from: 'tenants',
                    localField: 'tenant',
                    foreignField: '_id',
                    as: 'tenantInfo'
                }
            },
            {
                $lookup: {
                    from: 'rooms',
                    localField: 'tenantInfo.room',
                    foreignField: '_id',
                    as: 'roomInfo'
                }
            },
            {
                $limit: 1
            }
        ]);

        if (existingBillAndTenantInfo.length > 0) {
            return sendError('ซ้ำ', 'bill');
        }

        // 2. ดึง Categories ที่มีอยู่พร้อมจัดกลุ่ม
        const categoriesData = await BillCategory.aggregate([
            {
                $match: {
                    owner: new mongoose.Types.ObjectId(ownerId),
                    isActive: true
                }
            },
            {
                $group: {
                    _id: null,
                    categories: {
                        $push: {
                            id: '$_id',
                            code: '$categoryCode',
                            name: '$categoryName',
                            group: '$categoryGroup',
                            type: '$categoryType'
                        }
                    },
                    categoryMap: {
                        $push: {
                            k: '$categoryCode',
                            v: {
                                id: '$_id',
                                code: '$categoryCode',
                                name: '$categoryName',
                                group: '$categoryGroup'
                            }
                        }
                    }
                }
            }
        ]);

        const categoryMap = new Map();
        if (categoriesData.length > 0) {
            categoriesData[0].categories.forEach(cat => {
                categoryMap.set(cat.code, cat);
                categoryMap.set(cat.name, cat);
            });
        }

        // 3. Helper function สำหรับสร้าง category ใหม่
        const createDefaultCategory = async (categoryCode, categoryName, categoryGroup = 'other') => {
            let category = categoryMap.get(categoryCode) || categoryMap.get(categoryName);

            if (!category) {
                const newCategory = new BillCategory({
                    apartment: apartmentId,
                    owner: ownerId,
                    tenantId: tenantId,
                    categoryCode: categoryCode,
                    categoryName: categoryName,
                    categoryGroup: categoryGroup,
                    categoryType: 'charge',
                    description: `${categoryName} - สร้างอัตโนมัติ`,
                    isActive: true,
                    sortOrder: 50
                });

                await newCategory.save();
                category = {
                    id: newCategory._id,
                    code: newCategory.categoryCode,
                    name: newCategory.categoryName,
                    group: newCategory.categoryGroup
                };
                categoryMap.set(categoryCode, category);
                categoryMap.set(categoryName, category);
            }

            return category;
        };

        // 4. สร้าง Bill ID และ Bill Number
        const billId = `BILL-${Date.now()}`;
        const billNumber = `INV-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)}`;

        // 5. สร้าง Items พร้อม Category Reference
        const items = [];

        // Room Charge
        if (roomCharge && roomCharge.monthlyRent > 0) {
            const roomCategory = await createDefaultCategory('ROOM_RENT', 'ค่าเช่าห้อง', 'rent');
            items.push({
                itemId: new mongoose.Types.ObjectId().toString(),
                category: roomCategory.id,
                categoryName: "ค่าเช่าห้อง",
                description: "ค่าเช่าห้องรายเดือน",
                quantity: 1,
                unitPrice: roomCharge.monthlyRent,
                amount: roomCharge.monthlyRent,
                unit: "เดือน",
                paidAmount: 0,
                remainingAmount: roomCharge.monthlyRent,
            });
        }

        // Previous Balance
        if (roomCharge && roomCharge.previousBalance > 0) {
            const prevBalanceCategory = await createDefaultCategory('PREV_BALANCE', 'ยอดค้างก่อนหน้า', 'other');
            items.push({
                itemId: new mongoose.Types.ObjectId().toString(),
                category: prevBalanceCategory.id,
                categoryName: "ยอดค้างก่อนหน้า",
                description: "ยอดค้างชำระก่อนหน้านี้",
                quantity: 1,
                unitPrice: roomCharge.previousBalance,
                amount: roomCharge.previousBalance,
                unit: "รายการ",
                paidAmount: 0,
                remainingAmount: roomCharge.previousBalance,
            });
        }

        // Utilities - Electricity
        if (utilityCharges && utilityCharges.electricity) {
            const electricityCategory = await createDefaultCategory('ELECTRICITY', 'ค่าไฟฟ้า', 'utility');
            items.push({
                itemId: new mongoose.Types.ObjectId().toString(),
                category: electricityCategory.id,
                categoryName: "ค่าไฟฟ้า",
                description: `ใช้ไฟ ${utilityCharges.electricity.usage} หน่วย x ${utilityCharges.electricity.rate}`,
                quantity: utilityCharges.electricity.usage,
                unitPrice: utilityCharges.electricity.rate,
                amount: utilityCharges.electricity.cost,
                unit: "หน่วย",
                previousUnit: utilityCharges.electricity.previousReading,
                currentUnit: utilityCharges.electricity.currentReading,
                paidAmount: 0,
                remainingAmount: utilityCharges.electricity.cost,
            });
        }

        // Utilities - Water
        if (utilityCharges && utilityCharges.water) {
            const waterCategory = await createDefaultCategory('WATER', 'ค่าน้ำ', 'utility');
            items.push({
                itemId: new mongoose.Types.ObjectId().toString(),
                category: waterCategory.id,
                categoryName: "ค่าน้ำ",
                description: `ใช้น้ำ ${utilityCharges.water.usage} หน่วย x ${utilityCharges.water.rate}`,
                quantity: utilityCharges.water.usage,
                unitPrice: utilityCharges.water.rate,
                amount: utilityCharges.water.cost,
                unit: "หน่วย",
                previousUnit: utilityCharges.water.previousReading,
                currentUnit: utilityCharges.water.currentReading,
                paidAmount: 0,
                remainingAmount: utilityCharges.water.cost,
            });
        }

        // Other Charges - ใช้ bulk operations
        if (otherCharges && Array.isArray(otherCharges)) {
            const newCategories = [];

            for (const charge of otherCharges) {
                const categoryName = charge.description.trim();
                let category = categoryMap.get(categoryName);

                if (!category) {
                    const categoryCode = generateCategoryCode(categoryName);
                    const categoryGroup = getCategoryGroup(categoryName);

                    const newCategory = {
                        apartment: apartmentId,
                        owner: ownerId,
                        tenantId: tenantId,
                        categoryCode: categoryCode,
                        categoryName: categoryName,
                        categoryGroup: categoryGroup,
                        categoryType: determineCategoryType(categoryName),
                        description: `${categoryName} - สร้างอัตโนมัติ`,
                        isActive: true,
                        sortOrder: 50
                    };

                    newCategories.push(newCategory);

                    // เพิ่มใน map ชั่วคราว
                    category = {
                        id: null, // จะได้ ID หลังจาก save
                        code: categoryCode,
                        name: categoryName,
                        group: categoryGroup
                    };
                    categoryMap.set(categoryName, category);
                }

                // สร้าง bill item
                items.push({
                    itemId: new mongoose.Types.ObjectId().toString(),
                    category: category.id,
                    categoryName: categoryName,
                    categoryGroup: category.group,
                    description: charge.description,
                    quantity: 1,
                    unitPrice: charge.amount,
                    amount: charge.amount,
                    unit: "รายการ",
                    paidAmount: 0,
                    remainingAmount: charge.amount,
                });
            }

            // Bulk insert categories ใหม่
            if (newCategories.length > 0) {
                const savedCategories = await BillCategory.insertMany(newCategories);

                // อัพเดท category IDs ใน items
                let categoryIndex = 0;
                items.forEach(item => {
                    if (!item.category) {
                        item.category = savedCategories[categoryIndex]._id;
                        categoryIndex++;
                    }
                });
            }
        }

        // Discounts
        if (discounts && Array.isArray(discounts)) {
            const discountCategory = await createDefaultCategory('DISCOUNT', 'ส่วนลด', 'discount');

            discounts.forEach((discount) => {
                items.push({
                    itemId: new mongoose.Types.ObjectId().toString(),
                    category: discountCategory.id,
                    categoryName: "ส่วนลด",
                    description: discount.description,
                    quantity: 1,
                    unitPrice: -discount.amount,
                    amount: -discount.amount,
                    unit: "รายการ",
                    paidAmount: 0,
                    remainingAmount: -discount.amount,
                });
            });
        }

        // 6. ตรวจสอบยอดรวม
        const totalPriceAll = items.reduce((sum, item) => sum + item.remainingAmount, 0);
        if (Math.abs(totalPriceAll - totalAmount) > 0.01) {
            return sendError('ไม่ถูกต้อง', "total amount");
        }

        // 7. สร้างและบันทึก Bill
        const bill = new Bill({
            apartment: apartmentId,
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
        console.error('Error in BillSaveOptimized:', error);
        throw error;
    }
};
exports.updateMeter = async (accountId, tenantId, billingPeriod, utilityCharges) => {
    const roomData = await Tenant.findOne({ _id: tenantId }).select('room -_id').exec();
    if (!roomData) throw new Error("ไม่พบ tenant");

    const room = await Room.findOne({ _id: roomData.room }).exec();
    if (!room) throw new Error("ไม่พบ room");

    // 💾 เก็บค่าก่อนอัปเดต
    const previousElectric = room.meter.electric || 0;
    const previousWater = room.meter.water || 0;

    // คำนวณค่ารวม
    const expectedElectric = utilityCharges.electricity.previousReading + utilityCharges.electricity.usage;
    const expectedWater = utilityCharges.water.previousReading + utilityCharges.water.usage;

    // Validation
    if (Math.abs(utilityCharges.electricity.currentReading - expectedElectric) > 0.01) {
        return sendError('ไม่ถูกต้อง', "electric meter usage");
    }

    if (Math.abs(utilityCharges.water.currentReading - expectedWater) > 0.01) {
        return sendError('ไม่ถูกต้อง', "water meter usage");
    }

    // 💾 บันทึก history ก่อน
    const history = new meterHistory({
        room: room._id,
        owner: accountId,
        billingPeriod: {
            month: billingPeriod.month,
            year: billingPeriod.year
        },
        previousElectric,
        currentElectric: utilityCharges.electricity.currentReading,
        usageElectric: utilityCharges.electricity.usage,

        previousWater,
        currentWater: utilityCharges.water.currentReading,
        usageWater: utilityCharges.water.usage,

        // ถ้าจะเก็บเหตุผลการแก้ไข, ผู้แก้ไข, เวลาแก้ไข => เพิ่ม field audit เพิ่มได้
    });
    await history.save();

    // ✅ update Room
    const updatedRoom = await Room.findOneAndUpdate(
        { _id: room._id },
        {
            $set: {
                'meter.electric': utilityCharges.electricity.currentReading,
                'meter.water': utilityCharges.water.currentReading,
            }
        },
        { new: true }
    );

    return updatedRoom;
};

exports.updateMeterHistory = async (ownerId, accountId, tenantId, billingPeriod, utilityCharges) => {

    if (!tenantId) {
        throw new Error('Tenant not found');
    }

    const roomId = await Tenant.findOne({ _id: tenantId }).select('room -_id').exec()




    const history = new meterHistory({
        room: roomId.room,
        owner: ownerId,
        billingPeriod: {
            month: billingPeriod.month,
            year: billingPeriod.year
        },
        previousElectric: utilityCharges.electricity.previousReading,
        currentElectric: utilityCharges.electricity.currentReading,
        usageElectric: utilityCharges.electricity.usage,
        totalElectric: utilityCharges.electricity.previousReading + utilityCharges.electricity.currentReading,

        previousWater: utilityCharges.water.previousReading,
        currentWater: utilityCharges.water.currentReading,
        usageWater: utilityCharges.water.usage,
        totalWater: utilityCharges.water.previousReading + utilityCharges.water.currentReading,

    })
    await history.save()


}
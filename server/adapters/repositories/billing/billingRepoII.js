const { default: mongoose } = require("mongoose");
const { ApartmentSchemaModel } = require("../../../frameworks/database/mongoDB/models/apartments/apartment");
const { Bill, Payment } = require("../../../frameworks/database/mongoDB/models/bill/bill");
const profile = require("../../../frameworks/database/mongoDB/models/profile");
const { sendError } = require("../../../frameworks/webserver/utils/responseMessage");


const englishMonthMap = {
    1: "January",
    2: "February",
    3: "March",
    4: "April",
    5: "May",
    6: "June",
    7: "July",
    8: "August",
    9: "September",
    10: "October",
    11: "November",
    12: "December",
};


// exports.ListBill = async (ownerId, month, year) => {
//     try {

//         const apartmantId = await ApartmentSchemaModel.findOne({ owner: ownerId }).select('_id').exec()



//         const billApartment = await Bill.find({
//             apartment: apartmantId._id,
//             'billingPeriod.month': Number(month),
//             'billingPeriod.year': Number(year),

//         })

//         if (!billApartment) {
//             return sendError('ไม่พบ', `bill ${englishMonthMap[month] + ' ' + year} `)
//         }

//         return billApartment
//     } catch (error) {
//         console.error('Error in BillingCategory:', error);
//         return { success: false, error: error.message };
//     }
// };


exports.ListBill = async (ownerId, month, year) => {
    try {
        const billApartment = await Bill.aggregate([
            {
                $lookup: {
                    from: 'apartments', // ชื่อ collection ของ ApartmentSchemaModel
                    localField: 'apartment',
                    foreignField: '_id',
                    as: 'apartmentData'
                }
            },
            {
                $match: {
                    'apartmentData.owner': new mongoose.Types.ObjectId(ownerId),
                    'billingPeriod.month': Number(month),
                    'billingPeriod.year': Number(year)
                }
            },
            {
                $project: {
                    apartmentData: 0 // ถ้าไม่ต้องการข้อมูล apartment ใน result
                }
            }
        ]);

        if (!billApartment || billApartment.length === 0) {
            return sendError('ไม่พบ', `bill ${englishMonthMap[month] + ' ' + year} `);
        }

        return billApartment;


    } catch (error) {
        console.error('Error in ListBill:', error);
        return { success: false, error: error.message };
    }
};

// exports.getListPayments = async (ownerId, page, limit, from) => {



//     try {
//         const skip = (page - 1) * limit;
//         const query = {};


//         const apartment = await ApartmentSchemaModel.findOne({ owner: ownerId })


//         // ใส่ apartment ลงใน query
//         query.apartment = apartment._id;

//         // ถ้ามีการกรองเดือน
//         if (from) {
//             const startDate = new Date(from); // เดือนที่ส่งเข้ามา

//             startDate.setDate(1); // set เป็นวันแรกของเดือน
//             startDate.setHours(0, 0, 0, 0);

//             const endDate = new Date(startDate);
//             endDate.setMonth(endDate.getMonth() + 1); // เดือนถัดไป
//             endDate.setDate(0); // วันสุดท้ายของเดือนนั้น
//             endDate.setHours(23, 59, 59, 999);

//             query['paymentDate'] = { $gte: startDate, $lte: endDate };
//         }

//         // Query ข้อมูล + paginate + populate
//         const listPayment = await Payment.find(query)
//             .skip(skip)
//             .limit(limit)
//             .populate({
//                 path: 'tenant',
//                 select: "firstName lastName",
//                 populate: {
//                     path: 'room',
//                     select: 'roomNumber'
//                 }
//             })
//             .select('-apartment -paidItems') // เอาฟิลด์ที่ไม่ต้องการออก



//         // นับจำนวนทั้งหมดสำหรับ pagination
//         const total = await Payment.countDocuments(query);

//         return {
//             total,             // จำนวนทั้งหมด
//             page,              // หน้า
//             limit,             // จำนวนต่อหน้า
//             data: listPayment  // ข้อมูลรายการ
//         };


//     } catch (error) {
//         throw error
//     }

// };


// exports.getListPayments = async (ownerId, page, limit, from) => {

//     try {
//         const skip = (page - 1) * limit;


//         // หา apartment ของ owner
//         const apartment = await ApartmentSchemaModel.findOne({ owner: ownerId });
//         if (!apartment) {
//             throw new Error('Apartment not found');
//         }

//         // สร้าง base pipeline
//         const pipeline = [
//             // Stage 1: Match apartment
//             {
//                 $match: {
//                     apartment: apartment._id
//                 }
//             }
//         ];

//         // Stage 2: Add date filtering if provided
//         if (from) {
//             const startDate = new Date(from);
//             startDate.setDate(1);
//             startDate.setHours(0, 0, 0, 0);

//             const endDate = new Date(startDate);
//             endDate.setMonth(endDate.getMonth() + 1);
//             endDate.setDate(0);
//             endDate.setHours(23, 59, 59, 999);

//             pipeline.push({
//                 $match: {
//                     paymentDate: { $gte: startDate, $lte: endDate }
//                 }
//             });
//         }

//         // Stage 3: Lookup tenant information
//         pipeline.push({
//             $lookup: {
//                 from: 'tenants', // collection name
//                 localField: 'tenant',
//                 foreignField: '_id',
//                 as: 'tenant',
//                 pipeline: [
//                     {
//                         $project: {
//                             firstName: 1,
//                             lastName: 1,
//                             room: 1
//                         }
//                     }
//                 ]
//             }
//         });


//         // Stage 4: Unwind tenant (since it's an array from lookup)
//         pipeline.push({
//             $unwind: {
//                 path: '$tenant',
//                 preserveNullAndEmptyArrays: false
//             }
//         });

//         // Stage 5: Lookup room information
//         pipeline.push({
//             $lookup: {
//                 from: 'rooms', // collection name
//                 localField: 'tenant.room',
//                 foreignField: '_id',
//                 as: 'tenant.room',
//                 pipeline: [
//                     {
//                         $project: {
//                             roomNumber: 1
//                         }
//                     }
//                 ]
//             }
//         });

//         // Stage 6: Unwind room
//         pipeline.push({
//             $unwind: {
//                 path: '$tenant.room',
//                 preserveNullAndEmptyArrays: false
//             }
//         });

//         // Stage 7: Lookup bill information
//         pipeline.push({
//             $lookup: {
//                 from: 'bills', // collection name ของบิล
//                 localField: 'bill',
//                 foreignField: '_id',
//                 as: 'bill',
//                 pipeline: [
//                     {
//                         $project: {
//                             billId: 1,
//                             billNumber: 1,
//                             billingPeriod: 1,
//                             totalAmount: 1,
//                             penaltyAmount: 1,
//                             paidAmount: 1,
//                             remainingAmount: 1,
//                             status: 1
//                         }
//                     }
//                 ]
//             }
//         });

//         // Stage 8: Unwind bill
//         pipeline.push({
//             $unwind: {
//                 path: '$bill',
//                 preserveNullAndEmptyArrays: false
//             }
//         });

//         // Stage 7: Project only needed fields
//         pipeline.push({
//             $project: {
//                 apartment: 0,
//                 paidItems: 0,
//                 __v: 0
//             }
//         });

//         // Stage 8: Sort by payment date (newest first)
//         pipeline.push({
//             $sort: {
//                 paymentDate: -1
//             }
//         });

//         // Create pipeline for counting total documents
//         const countPipeline = [...pipeline, { $count: "total" }];

//         // Add pagination to main pipeline
//         pipeline.push(
//             { $skip: Number(skip) },
//             { $limit: Number(limit) }
//         );




//         // Execute both queries in parallel
//         const [listPayment, countResult] = await Promise.all([
//             Payment.aggregate(pipeline),
//             Payment.aggregate(countPipeline)
//         ]);



//         const total = countResult.length > 0 ? countResult[0].total : 0;
//         const totalPages = Math.ceil(total / limit);
//         return {
//             listPayment,
//             pagination: {
//                 currentPage: page,
//                 totalPages,
//                 totalItems: total,
//                 limit,
//                 hasNextPage: page < totalPages,
//                 hasPrevPage: page > 1
//             }
//         };

//     } catch (error) {
//         console.error('Error in getListPayments:', error);
//         throw error;
//     }
// };

exports.getListPayments = async (ownerId, page = 1, limit = 10, from) => {
    try {
        const skip = (page - 1) * limit;

        const apartment = await ApartmentSchemaModel.findOne({ owner: ownerId });
        if (!apartment) {
            throw new Error('Apartment not found');
        }

        const pipeline = [
            {
                $match: {
                    apartment: apartment._id
                }
            }
        ];

        // Filter by date (เดือนนั้น ๆ)
        if (from) {
            const startDate = new Date(from);
            startDate.setDate(1);
            startDate.setHours(0, 0, 0, 0);

            const endDate = new Date(startDate);
            endDate.setMonth(endDate.getMonth() + 1);
            endDate.setDate(0);
            endDate.setHours(23, 59, 59, 999);

            pipeline.push({
                $match: {
                    paymentDate: { $gte: startDate, $lte: endDate }
                }
            });
        }

        // Join tenant
        pipeline.push({
            $lookup: {
                from: 'tenants',
                localField: 'tenant',
                foreignField: '_id',
                as: 'tenant',
                pipeline: [
                    {
                        $project: {
                            firstName: 1,
                            lastName: 1,
                            room: 1
                        }
                    }
                ]
            }
        });
        pipeline.push({ $unwind: { path: '$tenant', preserveNullAndEmptyArrays: false } });

        // Join room
        pipeline.push({
            $lookup: {
                from: 'rooms',
                localField: 'tenant.room',
                foreignField: '_id',
                as: 'tenant.room',
                pipeline: [{ $project: { roomNumber: 1 } }]
            }
        });
        pipeline.push({ $unwind: { path: '$tenant.room', preserveNullAndEmptyArrays: false } });

        // Join bill
        pipeline.push({
            $lookup: {
                from: 'bills',
                localField: 'bill',
                foreignField: '_id',
                as: 'bill',
                pipeline: [
                    {
                        $project: {
                            billId: 1,
                            billNumber: 1,
                            billingPeriod: 1,
                            totalAmount: 1,
                            penaltyAmount: 1,
                            paidAmount: 1,
                            remainingAmount: 1,
                            paymentHistory: 1,
                            status: 1
                        }
                    }
                ]
            }
        });
        pipeline.push({ $unwind: { path: '$bill', preserveNullAndEmptyArrays: false } });

        // Sort ก่อน Group เพื่อให้ $first คือ payment ล่าสุด
        pipeline.push({ $sort: { paymentDate: -1 } });

        // Group by bill
        pipeline.push({
            $group: {
                _id: '$bill._id',
                bill: { $first: '$bill' },
                latestPayment: { $first: '$$ROOT' },
                allPayments: {
                    $push: {
                        _id: '$_id',
                        paymentId: '$paymentId',
                        paymentDate: '$paymentDate',
                        paymentStatus: '$paymentStatus',
                        amount: '$amount',
                        totalAmount: '$totalAmount',
                        paidAmount: '$paidAmount',
                        penaltyAmount: '$penaltyAmount',
                        description: '$description',
                        attachments: '$attachments',
                        createdAt: '$createdAt',
                        tenant: '$tenant'
                    }
                }
            }
        });
        // หลัง group
        pipeline.push({
            $addFields: {
                allPayments: {
                    $filter: {
                        input: "$allPayments",
                        as: "p",
                        cond: { $ne: ["$$p.paymentId", "$latestPayment.paymentId"] }
                    }
                }
            }
        });
        // Sort bills by period
        pipeline.push({
            $sort: {
                'bill.billingPeriod.year': -1,
                'bill.billingPeriod.month': -1
            }
        });

        // Count pipeline
        const countPipeline = [...pipeline, { $count: 'total' }];

        // Paginate
        pipeline.push({ $skip: Number(skip) }, { $limit: Number(limit) });

        // Run both
        const [result, countResult] = await Promise.all([
            Payment.aggregate(pipeline),
            Payment.aggregate(countPipeline)
        ]);

        const total = countResult.length > 0 ? countResult[0].total : 0;
        const totalPages = Math.ceil(total / limit);

        return {
            listPayment: result.map(entry => ({
                bill: entry.bill,
                firstPayment: {
                    ...entry.latestPayment,
                    _id: entry.latestPayment._id,
                    paymentId: entry.latestPayment.paymentId,
                    paymentStatus: entry.latestPayment.paymentStatus,
                    paymentDate: entry.latestPayment.paymentDate,
                    totalAmount: entry.latestPayment.totalAmount,
                    tenant: entry.latestPayment.tenant,
                    attachments: entry.latestPayment.attachments
                },
                partialPayments: entry.allPayments
            })),
            pagination: {
                currentPage: page,
                totalPages,
                totalItems: total,
                limit,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1
            }
        };
    } catch (error) {
        console.error('Error in getListPayments:', error);
        throw error;
    }
};

exports.confirmBillAndPayment2 = async (billId, paymentId) => {
    const session = await Bill.startSession();
    session.startTransaction();
    try {
        const billRes = await Bill.findOneAndUpdate(
            { _id: billId },
            { $set: { status: "paid" } },
            { new: true, session }
        );

        if (!billRes) throw new Error("Bill not found");

        const paymentRes = await Payment.findOneAndUpdate(
            { paymentId },
            { $set: { paymentStatus: "completed" } },
            { new: true, session }
        );

        if (!paymentRes) throw new Error("Payment not found");

        await session.commitTransaction();
        session.endSession();

        return {
            success: true,
            message: "Bill and payment confirmed",
            updatedBill: billRes,
            updatedPayment: paymentRes
        };

    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error("Error in confirmBillAndPayment:", error);
        return { success: false, error: error.message };
    }
};

exports.confirmBillAndPayment = async (
    accountId,
    newRemainingAmount,
    newPaidAmount,
    isFullPayment,
    tenant,
    paymentId,
    billNumber,
    billId,
    description,
    reference,
    paymentMethod,
    paymentAmount
) => {
    const session = await Bill.startSession();
    session.startTransaction();

    try {
        if (isFullPayment === true) {
            const billRes = await Bill.findOneAndUpdate(
                { _id: billId },
                {
                    $push: {
                        paymentHistory: {
                            updatedAt: new Date(),
                            updatedBy: accountId,
                            amount: paymentAmount,
                            note: description,
                            reference: reference,
                            paymentMethod: paymentMethod,
                            confirmBy: accountId,
                            remainingAmount: 0,
                            excess: newRemainingAmount
                        }
                    },
                    $inc: {
                        paidAmount: paymentAmount
                    },
                    $set: { status: "paid", isCheckPayment: 'noting' }
                },
                { new: true, session }
            );

            if (!billRes) throw new Error("Bill not found");

            const paymentRes = await Payment.findOneAndUpdate(
                { paymentId },
                {
                    $set: {
                        paymentStatus: "completed",
                        isConfirm: true,
                        paidAmount: paymentAmount
                    }
                },
                { new: true, session }
            ).populate('tenant');

            if (!paymentRes) throw new Error("Payment not found");

            await session.commitTransaction();
            session.endSession();

            return {
                success: true,
                paymentStatus: 'completed',
                message: "Bill and payment confirmed",
                updatedBill: billRes,
                updatedPayment: paymentRes
            };
        } else {

            const billResult = await Bill.findByIdAndUpdate(
                billId,
                {
                    $push: {
                        paymentHistory: {
                            updatedAt: new Date(),
                            updatedBy: accountId,
                            amount: paymentAmount,
                            note: description,
                            reference: reference,
                            paymentMethod: paymentMethod,
                            // remainingAmount: newRemainingAmount
                        }
                    },
                    $inc: {
                        paidAmount: paymentAmount
                    },
                    $set: {
                        status: 'outstanding',
                        updatedAt: new Date(),
                        isCheckPayment: 'noting'
                    }
                },
                { session }
            ).populate('tenant');


            const paymentRes = await Payment.findOneAndUpdate(
                { paymentId },
                {
                    $inc: {
                        paidAmount: paymentAmount
                    },
                    $set: {
                        paymentStatus: "outstanding",
                        updatedAt: new Date()
                    }
                },
                { new: true, session }
            );

            if (!paymentRes) throw new Error("Payment not found");

            // ถ้าต้องการอัปเดต Bill ด้วยก็ใส่เพิ่มได้ตรงนี้

            await session.commitTransaction();
            session.endSession();

            return {
                success: true,
                paymentStatus: 'outstanding',
                message: "Partial payment recorded",
                billResult
            };
        }
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error("Error in confirmBillAndPayment:", error);
        return { success: false, error: error.message };
    }
};

exports.cancelPayment = async (
    accountId, tenant, billNumber, billId, description, reason, customNote, timestamp, paymentId
) => {
    const session = await Bill.startSession();
    session.startTransaction();

    try {
        const billRes = await Bill.findOneAndUpdate(
            { _id: billId },
            {
                $push: {
                    paymentHistory: {
                        updatedAt: timestamp,
                        updatedBy: accountId,
                        note: description,
                        reference: customNote,
                        paymentId: paymentId,
                        paymentMethod: "rejected",
                        confirmBy: accountId,
                        remainingAmount: 0
                    }
                },
                $set: { status: "rejected", isCheckPayment: 'noting' }
            },
            { new: true, session }
        );

        if (!billRes) throw new Error("Bill not found");

        const paymentRes = await Payment.findOneAndUpdate(
            { paymentId },
            {
                $set: {
                    paymentStatus: "rejected",
                }
            },
            { new: true, session }
        ).populate('tenant');

        if (!paymentRes) throw new Error("Payment not found");

        await session.commitTransaction();
        session.endSession();

        return {
            success: true,
            paymentStatus: 'rejected',
            message: "payment is confirmed successfully",
            updatedBill: billRes,
            updatedPayment: paymentRes
        };


    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error("Error in confirmBillAndPayment:", error);
        return { success: false, error: error.message };
    }
};


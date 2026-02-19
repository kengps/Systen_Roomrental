const {default: mongoose} = require("mongoose");
const Account = require("../../../frameworks/database/mongoDB/models/profile");
const Tenant = require("../../../frameworks/database/mongoDB/models/tenant");
const {Bill, Payment} = require("../../../frameworks/database/mongoDB/models/bill/bill");
const banks = require("../../../frameworks/database/mongoDB/models/apartments/banks");
const {sendError} = require("../../../frameworks/webserver/utils/responseMessage");
const {calculateFine} = require("../../../frameworks/webserver/utils/calculateFine");
const dayjs = require("dayjs");
const {checkSlipOK} = require("../../../frameworks/services/checkSlipOK");
const {saveSlip} = require("../../controllers/slipuploadController");
const {generateKey} = require("../../../frameworks/services/generateKey");
const {uploadPaymentSlip} = require("../../controllers/notificationController");


exports.createTenant = async (valuesTenant) => {
    const {
        profileId,
        ownerId,
        newProfile,
        prefix,
        roomIds,
        firstName,
        lastName,
        deposit,
        phoneNumber,
        contractDuration,
        moveInDate
    } = valuesTenant


    let owner;
    if (!ownerId || (Array.isArray(ownerId) && ownerId.length === 0)) {
        owner = profileId;
    } else {
        owner = Array.isArray(ownerId) ? ownerId[0] : ownerId;
    }
    const fullkey = generateKey()
    try {
        const tanant = new Tenant({
            owner: owner,
            createdBy: profileId,
            accountId: newProfile,
            room: roomIds,
            prefix, firstName, lastName, deposit, contractDuration,
            phone: phoneNumber,
            signature: fullkey,
            moveInDate
        })
        return await tanant.save()

    } catch (error) {
        throw error
    }

}
exports.editTenant = async (valuesTenant) => {
    const {
        id,
        prefix,
        firstName,
        lastName,
        roomId,
        phone,
        deposit,
        contractDuration
    } = valuesTenant

    try {
        const tanant = await Tenant.findOneAndUpdate(
            {_id: id},
            {
                $set: {
                    prefix, firstName, lastName,
                    room: new mongoose.Types.ObjectId(roomId),
                    phone, deposit, contractDuration
                }
            },
            {new: true}
        )
        return tanant

    } catch (error) {
        throw error
    }

}


exports.getTeanantInParent = async (owner) => {


    try {
        const result = await Tenant.find({owner}).populate({path: 'room'}).populate({path: 'accountId'})


        return {
            result
        }

    } catch (error) {
        throw error
    }

}

exports.updateTenancys = async (tenantId, tenancyStatus, moveOutDate) => {


    try {
        const tenant = await Tenant.findOneAndUpdate(
            {_id: tenantId},
            {$set: {tenancyStatus: tenancyStatus, moveOutDate: moveOutDate}},
            {new: true}
        )

        return tenant

    } catch (error) {
        throw error
    }

}


exports.assignServices = async (tenantId, newServiceIds) => {

    try {

        const tenant = await Tenant.findById(tenantId);

        if (!tenant) throw new Error("Tenant not found");

        const currentServiceIds = tenant.serviceUsage || [];

        // หาค่าใหม่ที่ยังไม่มี
        const idsToAdd = newServiceIds.filter(id => !currentServiceIds.includes(id));

        if (idsToAdd.length > 0) {
            await Tenant.updateOne(
                {_id: tenantId},
                {$push: {serviceUsage: {$each: idsToAdd}}}
            );
        }

        return 'assign Services tenant used successfully'
    } catch (error) {
        throw error
    }

}


exports.deleteServices = async (tenantId, serviceUsageId) => {


    try {

        // ถ้าเป็ฯ array ให้ใช้ $in ใน pull
        const tenant = await Tenant.updateOne(
            {_id: tenantId},
            {
                $pull: {serviceUsage: serviceUsageId}
            },
            {new: true}
        )

        //ใช้ pull ในการลย


        // if (!tenant) throw new Error("Tenant not found");

        // const currentServiceIds = tenant.serviceUsage || [];

        // // หาค่าใหม่ที่ยังไม่มี
        // const idsToAdd = newServiceIds.filter(id => !currentServiceIds.includes(id));

        // if (idsToAdd.length > 0) {
        //     await Tenant.updateOne(
        //         { _id: tenantId },
        //         { $push: { serviceUsage: { $each: idsToAdd } } }
        //     );
        // }

        return 'delete Services tenant used successfully'
    } catch (error) {
        throw error
    }

}


exports.informationApartmentForTenants = async (ownerId) => {
    try {
        const informationsApartment = await banks.aggregate([
            {
                $lookup: {
                    from: 'apartments', // ชื่อ collection ของ ApartmentSchemaModel
                    localField: 'apartmentId',
                    foreignField: '_id',
                    as: 'apartmentData'
                }
            }, {
                $unwind: '$apartmentData'
            },
            {
                $match: {
                    'apartmentData.owner': new mongoose.Types.ObjectId(ownerId),

                }
            },
            // 👉 เพิ่ม $lookup สำหรับ meters ถ้าต้องการ populate
            {
                $lookup: {
                    from: 'meters', // collection ชื่อ meters
                    localField: 'apartmentData.meters',
                    foreignField: '_id',
                    as: 'apartmentData.meterDetails'
                }
            },
            {
                $addFields: {
                    'apartmentData.meters': '$$REMOVE'
                }
            }
            , {
                $group: {
                    _id: '$apartmentData._id',
                    apartment: {$first: '$apartmentData'},
                    bank: {
                        $push: {
                            _id: '$_id',
                            apartmentId: '$apartmentId',
                            bankKey: '$bankKey',
                            accountNumber: '$accountNumber',
                            accountName: '$accountName',
                            createdAt: '$createdAt',
                            updatedAt: '$updatedAt',
                            __v: '$__v'
                        }
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    apartment: 1,
                    bank: 1
                }
            }
            // {
            //     $project: {
            //         _id: 0,
            //         bank: [{
            //             _id: '$_id',
            //             apartmentId: '$apartmentId',
            //             bankKey: '$bankKey',
            //             accountNumber: '$accountNumber',
            //             accountName: '$accountName',
            //             createdAt: '$createdAt',
            //             updatedAt: '$updatedAt',
            //             __v: '$__v'
            //         }],
            //         apartment: {
            //             $mergeObjects: [
            //                 '$apartmentData',
            //                 {
            //วิธ๊นี้คือเอาทั้งหมด 
            // { meters: '$apartmentData.meterDetails' } // แทนที่ field meters ด้วยข้อมูลจริง 
            // meters: {
            //     $map: {
            //         input: '$apartmentData.meterDetails',
            //         as: 'meter',
            //         in: {
            //             _id: '$$meter._id',
            //             type: '$$meter.meterType',
            //             rate: '$$meter.rate'
            //         }
            //     }
            // }
            //                 } // แทนที่ field meters ด้วยข้อมูลจริง
            //             ]
            //         }
            //     }
            // }

        ]);

        if (!informationsApartment || informationsApartment.length === 0) {
            return sendError('ไม่พบ', `bill ${englishMonthMap[month] + ' ' + year} `);
        }

        return informationsApartment[0]

    } catch (error) {
        return {success: false, error: error.message};
    }

}


exports.ListBillingTenant = async (accountId) => {


    const tenantId = await Tenant.findOne({accountId: new mongoose.Types.ObjectId(accountId)}).exec()


    if (!tenantId) {
        return sendError('ไม่พบ', 'tenant')
    }

    const bill = await Bill.find({tenant: tenantId._id})
        .populate([
            {path: 'apartment', select: 'billingSettings -_id'},
            {path: 'tenant', select: 'firstName lastName'}
        ]);


    return bill


}

exports.SavePayments = async (data) => {


    const session = await mongoose.startSession();
    session.startTransaction();

    try {

        const check = await Bill.aggregate([
            {$match: {_id: new mongoose.Types.ObjectId(data.bill)}},

            {
                $lookup: {
                    from: 'tenants',
                    localField: 'tenant',
                    foreignField: '_id',
                    as: 'tenantInfo'
                }
            },
            {$unwind: '$tenantInfo'},
            {$match: {'tenantInfo._id': new mongoose.Types.ObjectId(data.tenant._id)}},

            {
                $lookup: {
                    from: 'rooms',
                    localField: 'tenantInfo.room',
                    foreignField: '_id',
                    as: 'tenantInfo.roomInfo'
                }
            },
            {
                $unwind: {
                    path: '$tenantInfo.roomInfo',
                    preserveNullAndEmptyArrays: true
                }
            },

            {
                $lookup: {
                    from: 'apartments',
                    localField: 'apartment',
                    foreignField: '_id',
                    as: 'apartmentInfo'
                }
            },
            {$unwind: '$apartmentInfo'},

            {
                $project: {
                    _id: 1,
                    totalAmount: 1,
                    status: 1,
                    'apartmentInfo.billingSettings': 1,
                    'apartmentInfo._id': 1,
                    'apartmentInfo.owner': 1,

                    tenant: {
                        _id: '$tenantInfo._id',
                        owner: '$tenantInfo.owner',
                        createdBy: '$tenantInfo.createdBy',
                        room: '$tenantInfo.room',
                        firstName: '$tenantInfo.firstName',
                        roomInfo: {
                            roomNumber: '$tenantInfo.roomInfo.roomNumber'
                        }
                    }
                }
            }
        ]);


        // ✅ ตรวจสอบว่าพบ Bill หรือไม่
        if (!check[0]) {
            await session.abortTransaction();
            throw new Error('ไม่พบ Bill หรือ Tenant');
        }

        // ✅ คำนวณ fine
        const backendFineAmount = Math.max(
            0,
            calculateFine(
                dayjs(),
                data.paymentDate,
                check[0].apartmentInfo.billingSettings.lateFeePerDay,
                check[0].apartmentInfo.billingSettings.cutoffDate,
                check[0].apartmentInfo.billingSettings.paymentDueDate
            )
        );


        // ✅ ตรวจสอบยอด
        if (data.amount !== check[0].totalAmount) {

            throw new Error('ยอด amount ไม่ตรงกับบิล');
        }

        if (data.penaltyAmount !== backendFineAmount) {


            throw new Error('ค่าปรับไม่ตรงกับที่ระบบคำนวณ');
        }


        if (check[0].totalAmount + backendFineAmount !== data.totalAmount) {

            throw new Error('ยอดรวม totalAmount ไม่ถูกต้อง');
        }
        data.apartment = check[0].apartmentInfo._id;

        // ✅ บันทึก Payment
        const payment = new Payment(data);


        await payment.save({session});


        // ✅ อัปเดตสถานะ Bill
        await Bill.findByIdAndUpdate(
            data.bill,
            {
                $set: {
                    status: 'waiting',
                    attachments: data.attachments,
                    penaltyAmount: data.penaltyAmount || 0,
                    isWisCheckPayment: 'waiting'

                }
            },
            {session}
        );

        // เพิ่ม noti
        await uploadPaymentSlip(payment)

        await session.commitTransaction();
        session.endSession();
        return {success: true, payment, check};

    } catch (error) {
        try {
            if (session.inTransaction()) {
                await session.abortTransaction();
            }
        } catch (abortErr) {
            console.error('Failed to abort transaction:', abortErr);
        } finally {
            session.endSession();
        }
        throw error;
    }
};


const { default: mongoose } = require("mongoose");
const profile = require("../../../frameworks/database/mongoDB/models/profile");
const Tenant = require("../../../frameworks/database/mongoDB/models/tenant");
const { Bill } = require("../../../frameworks/database/mongoDB/models/bill/bill");
const banks = require("../../../frameworks/database/mongoDB/models/apartments/banks");
const { sendError } = require("../../../frameworks/webserver/utils/responseMessage");


exports.createTenant = async (valuesTenant) => {
    const { profileId, ownerId, newProfile, prefix, roomIds, firstName, lastName, deposit, phoneNumber, contractDuration, moveInDate } = valuesTenant


    let owner;
    if (!ownerId || (Array.isArray(ownerId) && ownerId.length === 0)) {
        owner = profileId;
    } else {
        owner = Array.isArray(ownerId) ? ownerId[0] : ownerId;
    }

    try {
        const tanant = new Tenant({
            owner: owner,
            createdBy: profileId,
            accountId: newProfile,
            room: roomIds,
            prefix, firstName, lastName, deposit, contractDuration,
            phone: phoneNumber,
            moveInDate
        })
        return await tanant.save()

    } catch (error) {
        throw error
    }

}


exports.getTeanantInParent = async (owner) => {


    try {
        const result = await Tenant.find({ owner }).populate('room')



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
            { _id: tenantId },
            { $set: { tenancyStatus: tenancyStatus, moveOutDate: moveOutDate } },
            { new: true }
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
                { _id: tenantId },
                { $push: { serviceUsage: { $each: idsToAdd } } }
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
            { _id: tenantId },
            {
                $pull: { serviceUsage: serviceUsageId }
            },
            { new: true }
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
                    apartment: { $first: '$apartmentData' },
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
        return { success: false, error: error.message };
    }

}




exports.ListBillingTenant = async (accountId) => {
    const bill = await Bill.find({ tenant: accountId }).populate({ path: 'apartment', select: 'billingSettings -_id' })

    return bill


}


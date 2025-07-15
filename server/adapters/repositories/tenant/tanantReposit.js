const { default: mongoose } = require("mongoose");
const profile = require("../../../frameworks/database/mongoDB/models/profile");
const Tenant = require("../../../frameworks/database/mongoDB/models/tenant");


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
        console.log(`⩇⩇:⩇⩇🚨 ~ exports.deleteServices ~ tenant :`, tenant);


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



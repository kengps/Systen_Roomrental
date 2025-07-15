


const { default: mongoose } = require("mongoose");
const { handleRequestError } = require("../../frameworks/webserver/utils/HOCHandelRequest");
const { sendResponse, sendResponseHono } = require("../../frameworks/webserver/utils/responseMessage");
const { findRoom, updateStatusRoom } = require("../repositories/apartment");
const { RegistersWithTenant } = require("./registerController");

const { createTenant, getTeanantInParent, updateTenancys } = require("../repositories/tenant/tanantReposit");

const { findOwner, diableAccountId } = require("../repositories/register");




// ฟังก์ชัน userRegister
const addTanets = handleRequestError(async (c) => {

    //tanant


    const { prefix, firstName, lastName, deposit, phoneNumber, contractDuration, moveInDate, profileId, username, password, roomId } = await c.req.json()


    const session = await mongoose.startSession();
    session.startTransaction();

    try {

        const roomExits = await findRoom(roomId, session)


        if (!roomExits) {
            const error = new Error("Room is not flound!");
            error.status = 401;
            throw error;
            //return sendResponse(res, 401, "Room is not flound");
        }
        if (roomExits.status === 'unavailable') {
            const error = new Error("This room is already rented!");
            error.status = 404;
            throw error;
            //return sendResponse(res, 404, "This room is already rented.");
        }
        // ✅ จองห้องก่อน
        roomExits.status = 'unavailable';
        await roomExits.save({ session });
        //ลำดับแรก ทำการสมัคร username ก่อน
        let value = {
            profileId,
            username,
            password,
            confirmPassword: password,
            role: 'User',

        }


        // // 3. หา tenant ที่ owner อยู่ในสาย
        // const tenants = await Tenant.find({
        //     owner: { $in: ownerIds }
        // }).populate('owner', 'username role')

        //     .populate('room')
        //     .populate('createdBy', 'username');

        // console.log(`⩇⩇:⩇⩇🚨 tenants :`, tenants);


        const ownerId = await findOwner(profileId)



        const newUser = await RegistersWithTenant(value)
        const newProfile = newUser._id
        const roomIds = roomExits._id


        const valuesTenant = {
            prefix, firstName, ownerId, lastName, roomIds, deposit, phoneNumber, contractDuration, moveInDate, newProfile, profileId
        }
        const tenant = await createTenant(valuesTenant);

        await session.commitTransaction();
        session.endSession();

        return c.json({
            message: 'Create new Tenant successfully',
            tenant: tenant,
            profile: newUser
        })
    } catch (error) {

        await session.abortTransaction();
        session.endSession();
        throw error
    }

});




const getTenantParent = handleRequestError(async (c) => {


    const { accountId } = await c.req.query()

    let ownerId = await findOwner(accountId)



    if (!ownerId || Array.isArray(ownerId) && ownerId.length === 0) {

        ownerId = accountId
    }


    const result = await getTeanantInParent(ownerId)

    return sendResponseHono(c, 201, "data Tenant", result);


})


const updateTenancy = handleRequestError(async (c) => {


    const { tenantId } = await c.req.param()
    const { moveOutDate, tenancyStatus, disableAccuont } = await c.req.json()

    const data = await updateTenancys(tenantId, tenancyStatus, moveOutDate)

    // ปิดการใช้งาน accountId
    if (disableAccuont) {
        let accId = data.accountId
        await diableAccountId(accId)

    }
    // update status ห้อง
    const update = await updateStatusRoom(data.room, tenancyStatus)



    return c.json({ message: "update data tenant successfully" })

})




module.exports = {
    addTanets, getTenantParent, updateTenancy
}
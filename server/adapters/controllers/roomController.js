
const { Room, RentDetails, AdditionalCharge } = require("../../frameworks/database/mongoDB/models/roomDetail");
const { handleRequestError } = require("../../frameworks/webserver/utils/HOCHandelRequest");
const { sendResponse, sendResponseHono } = require("../../frameworks/webserver/utils/responseMessage");

const { addressApartment, apartmentData, addServicesInApartment, getServicesInApartment } = require("../repositories/apartment");
const { findOwner } = require("../repositories/register");
const { assignServices, deleteServices } = require("../repositories/tenant/tanantReposit");

const createRoom = handleRequestError(async (c) => {
    const { value } = await c.req.json();
    const { rooms, profileId } = value;




    try {
        const profileOrConditions = [
            { owner: profileId },
            { owner: { $exists: false } },
            { owner: null }
        ];



        const conditions = rooms.map(room => ({
            floor: room.floor,
            roomNumber: room.roomNumber,
            $or: profileOrConditions
        }));

        const existingRooms = await Room.find({ $or: conditions });


        const existingSet = new Set(existingRooms.map(room => `${room.floor}-${room.roomNumber}`));

        const newRooms = rooms.filter(room => !existingSet.has(`${room.floor}-${room.roomNumber}`));

        if (newRooms.length === 0) {
            return c.json({
                success: false,
                message: 'ห้องทั้งหมดมีอยู่แล้วในระบบ',
            });
        }

        const roomResult = await Room.insertMany(newRooms.map(room => ({
            owner: profileId,
            floor: room.floor,
            roomNumber: room.roomNumber,
            status: 'available'
        })));

        return sendResponseHono(c, 200, 'Create room successfully', roomResult);

    } catch (error) {
        console.log(`⩇⩇:⩇⩇🚨 file: roomController.js error :`, error);

        return c.json({
            success: false,
            message: "เกิดข้อผิดพลาดในการสร้างห้องเช่า",
            error: error.message
        });
    }
});


const addTenetRoom = handleRequestError(async (c) => {
    const { price, status, tenet } = await c.req.json()


    try {

        // สร้างอ็อบเจ็กต์สำหรับการอัปเดต
        const updateFields = Object.keys(req.body).reduce((acc, key) => {
            // ตรวจสอบว่า key ไม่ใช่ 'id' 
            // เพราะเราไม่ต้องการอัปเดตค่า id
            if (key !== 'id') {
                // เพิ่ม key และค่าลงในอ็อบเจ็กต์ acc
                acc[key] = req.body[key];
            }
            // ส่งกลับ acc เพื่อใช้ในรอบถัดไป
            return acc;
        }, {}); // เริ่มต้นด้วยอ็อบเจ็กต์ว่าง

        // const updateFields2 = {...req.body}
        await Room.bulkWrite([{
            updateOne: {
                filter: { _id: req.body.id },
                update: { $set: updateFields },
                upsert: true
            }
        }]);

        return sendResponseHono(c, 200, 'Room updated successfully')

    } catch (error) {
        console.log(`⩇⩇:⩇⩇🚨  file: roomController.js:131  error :`, error);


    }
})

const collectRent = handleRequestError(async (c) => {
    // console.log(`⩇⩇:⩇⩇🚨  file: roomController.js:6  req :`, req.body);

    // try {

    // } catch (error) {
    //     console.log(`⩇⩇:⩇⩇🚨  file: roomController.js:11  error :`, error);


    // }
})




const addRentDetails = handleRequestError(async (c) => {
    try {
        const {
            roomId,
            monthlyRent,
            water,
            electricity,
            internet,
            others,
            additionalCharges // รับข้อมูลค่าใช้จ่ายเพิ่มเติมจาก req.body
        } = await c.req.json();

        // ตรวจสอบว่าห้องเช่านี้มีอยู่หรือไม่
        const room = await Room.findById(roomId);
        if (!room) {
            return c.json({ message: 'Room not found' });
        }

        // สร้างรายละเอียดค่าเช่าใหม่
        const rentDetails = new RentDetails({
            room: roomId,
            monthlyRent,
            water: {
                price: water.price,
                previousUnits: water.previousUnits,
                currentUnits: water.currentUnits,
                quality: water.quality,
                total: water.total,
            },
            electricity: {
                price: electricity.price,
                previousUnits: electricity.previousUnits,
                currentUnits: electricity.currentUnits,
                quality: electricity.quality,
                total: electricity.total,
            },
            // mobile,
            // tv,
            internet,
            others
        });

        // บันทึกค่าเช่า
        await rentDetails.save();

        // ถ้ามีค่าใช้จ่ายเพิ่มเติม ให้ทำการเพิ่ม
        if (additionalCharges && additionalCharges.length > 0) {
            for (let charge of additionalCharges) {
                const newCharge = new AdditionalCharge({
                    name: charge.name,
                    amount: charge.amount,
                    rentDetail: rentDetails._id
                });
                await newCharge.save();
                // เพิ่มค่าใช้จ่ายเพิ่มเติมลงใน RentDetails
                rentDetails.additionalCharges.push(newCharge._id);
            }
            await rentDetails.save(); // บันทึกการอัปเดตหลังเพิ่มค่าใช้จ่ายเพิ่มเติม
        }

        return c.json({ message: 'Rent details added successfully', rentDetails });
    } catch (error) {
        console.error(error);
        c.json({ message: 'Server error' });
    }
});


const listRoom = handleRequestError(async (c) => {

    const { profileId } = await c.req.query()


    try {

        let ownerId = await findOwner(profileId)


        if (!ownerId || Array.isArray(ownerId) && ownerId.length === 0) {
            ownerId = profileId
        }


        const listRoom = await Room.find({ owner: ownerId });


        return sendResponseHono(c, 200, 'Get room success', listRoom, listRoom.length)
        //return c.json({ message: 'get List Rooms successfully', total: listRoom.length, listRoom })
    } catch (error) {
        throw error
    }
})



const listRentDetails = handleRequestError(async (c) => {
    try {
        const getMsgContents = await RentDetails.find().populate({ path: 'room', select: { _id: 0, tenant: 1 } }).exec();


        const listRentDetails = await RentDetails.find();

        return sendResponseHono(c, 200, 'Get room success', getMsgContents)
    } catch (error) {
        console.log(`⩇⩇:⩇⩇🚨  file: roomController.js:234  error :`, error);


    }
})

const updatePrice = handleRequestError(async (c) => {

    const { value } = await c.req.json()
    const { roomNumber, price, accountId } = value


    try {
        // ที่ไม่ใช้ id ผู้อัปเดตเพราะให้ส่ง id ของ ห้องนั้นๆมา
        await Room.updateMany(
            { _id: { $in: roomNumber } },
            { $set: { price: price } }
        )

        return sendResponseHono(c, 200, 'update price success')
    } catch (error) {
        console.log(`⩇⩇:⩇⩇🚨  file: roomController.js:234  error :`, error);


    }
})

const apartmant = handleRequestError(async (c) => {

    const result = await addressApartment(req.body)

    return c.json({ message: 'save data apartment successfully', result })
})

const apartmantData = handleRequestError(async (c) => {


    const { profileId } = await c.req.query()


    let ownerId = await findOwner(profileId)


    if (!ownerId || Array.isArray(ownerId) && ownerId.length === 0) {
        ownerId = profileId
    }



    const result = await apartmentData(ownerId)

    return c.json({ message: 'data', result })
})


const addServices = handleRequestError(async (c) => {


    const { accountId, ...services } = await c.req.json()


    let ownerId = await findOwner(accountId)



    if (!ownerId || Array.isArray(ownerId) && ownerId.length === 0) {
        ownerId = accountId
    }


    const data = await addServicesInApartment(ownerId, services);


    return c.json({ message: 'Save The service fee has been successfully', data })
})
const getServices = handleRequestError(async (c) => {


    const { accountId } = await c.req.query()


    let ownerId = await findOwner(accountId)



    if (!ownerId || Array.isArray(ownerId) && ownerId.length === 0) {
        ownerId = accountId
    }


    const data = await getServicesInApartment(ownerId);




    return sendResponseHono(c, 201, 'get data successfully', data.services)
    //return c.json({ message: 'Save The service fee has been successfully', data })
})


const assignServicesTenant = handleRequestError(async (c) => {
    const { tenantId } = await c.req.param()
    const { newServiceIds } = await c.req.json()


    const a = await assignServices(tenantId, newServiceIds)

    return c.json({ message: a })
})


const deleteServicesTenant = handleRequestError(async (c) => {



    const { tenantId, serviceUsageId } = await c.req.param();


    const a = await deleteServices(tenantId, serviceUsageId)

    return c.json({ message: a })
})

module.exports = {
    createRoom,
    addRentDetails,
    listRentDetails,
    listRoom,
    collectRent,
    addTenetRoom,
    updatePrice,
    apartmant,
    apartmantData,
    addServices,
    getServices,
    assignServicesTenant,
    deleteServicesTenant
}
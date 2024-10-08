const { Room, RentDetails, AdditionalCharge } = require("../../frameworks/database/mongoDB/models/roomDetail");
const { sendResponse } = require("../../frameworks/webserver/utils/responseMessage");



// exports.createRoom = async (req, res) => {
//     const { room, tenant, status, price, } = req.body


//     console.log(`⩇⩇:⩇⩇🚨  file: roomController.js:7  room :`, room);

//     try {
//         const roomAlready = await Room.findOne({ "room.floor": room.floor, "room.roomNumber:": room.roomNumber }).exec()


//         if (roomAlready) return sendResponse(res, 201, 'Room Already exist');

//         const newData = new Room();

//         if (!roomAlready) {
//             const roomData = new Room({
//                 _id: newData._id,
//                 room: {
//                     floor: room.floor,
//                     roomNumber: room.roomNumber
//                 },
//                 price: price,
//                 status: status,
//                 tenant: tenant
//             })
//             const result = roomData.save()
//             console.log(`⩇⩇:⩇⩇🚨  file: roomController.js:32  result :`, result);

//             sendResponse(res, 200, 'Create Room successfully',result);
//         }


//     } catch (error) {
//         console.log(`⩇⩇:⩇⩇🚨  file: roomController.js:11  error :`, error);


//     }
// }
// สร้างห้องเช่าใหม่
exports.createRoom = async (req, res) => {
    const { floor, roomNumber, status, rentalDate, tenant } = req.body;

    try {
        const room = new Room({
            room: { floor, roomNumber },
            status,
            rentalDate,
            tenant
        });

        await room.save();

        res.status(201).json({
            success: true,
            message: "ห้องเช่าสร้างสำเร็จ",
            data: room
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "เกิดข้อผิดพลาดในการสร้างห้องเช่า",
            error: error.message
        });
    }
};



exports.collectRent = async (req, res) => {
    console.log(`⩇⩇:⩇⩇🚨  file: roomController.js:6  req :`, req.body);

    try {

    } catch (error) {
        console.log(`⩇⩇:⩇⩇🚨  file: roomController.js:11  error :`, error);


    }
}





// // สร้างรายละเอียดค่าเช่า
// exports.createRentDetails = async (req, res) => {
//     const { roomId, monthlyRent, water, electricity, mobile, tv, internet, others } = req.body;
//     console.log(`⩇⩇:⩇⩇🚨  file: roomController.js:94  water :`, water);


//     try {
//         const room = await Room.findById(roomId);
//         if (!room) {
//             return res.status(404).json({
//                 success: false,
//                 message: "ไม่พบห้องเช่า"
//             });
//         }

//         const rentDetails = new RentDetails({
//             room: roomId,
//             monthlyRent,
//             water: {
//                 price: water.price,
//                 previousUnits: water.previousUnits,
//                 currentUnits: water.currentUnits,
//                 quality: water.quality,
//                 total: water.total,
//             },
//             electricity: {
//                 price: electricity.price,
//                 previousUnits: electricity.previousUnits,
//                 currentUnits: electricity.currentUnits,
//                 quality: electricity.quality,
//                 total: electricity.total,
//             },
//             mobile,
//             tv,
//             internet,
//             others
//         });

//         await rentDetails.save();

//         res.status(201).json({
//             success: true,
//             message: "รายละเอียดค่าเช่าสร้างสำเร็จ",
//             data: rentDetails
//         });
//     } catch (error) {
//         res.status(500).json({
//             success: false,
//             message: "เกิดข้อผิดพลาดในการสร้างรายละเอียดค่าเช่า",
//             error: error.message
//         });
//     }
// };


exports.addRentDetails = async (req, res) => {
    try {
        const {
            roomId,
            monthlyRent,
            water,
            electricity,
            internet,
            others,
            additionalCharges // รับข้อมูลค่าใช้จ่ายเพิ่มเติมจาก req.body
        } = req.body;

        // ตรวจสอบว่าห้องเช่านี้มีอยู่หรือไม่
        const room = await Room.findById(roomId);
        if (!room) {
            return res.status(404).json({ message: 'Room not found' });
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

        res.status(200).json({ message: 'Rent details added successfully', rentDetails });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};



exports.listRoom = async (req, res) => {
    try {
        const listRoom = await Room.find();
        return sendResponse(res, 200, 'Get room success', listRoom)
    } catch (error) {

    }
}


exports.listRentDetails = async (req, res) => {
    try {
        const getMsgContents = await RentDetails.find().populate({ path: 'room', select: { _id: 0, tenant: 1 } }).exec();
        console.log(`⩇⩇:⩇⩇🚨  file: roomController.js:227  getMsgContents :`, getMsgContents);



        const listRentDetails = await RentDetails.find();

        return sendResponse(res, 200, 'Get room success', getMsgContents)
    } catch (error) {
        console.log(`⩇⩇:⩇⩇🚨  file: roomController.js:234  error :`, error);


    }
}
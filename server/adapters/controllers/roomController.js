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
// // สร้างห้องเช่าใหม่
exports.createRoom = async (req, res) => {
    const { rooms } = req.body;
    console.log(`⩇⩇:⩇⩇🚨  file: roomController.js:47   req.body; :`,  req.body);



    // try {
    //     // หาเฉพาะห้องที่มีอยู่แล้ว
    //     const existingRooms = await Room.find({
    //         $or: rooms.map(room => ({
    //             floor: room.floor,
    //             roomNumber: room.roomNumber,
    //         }))
    //     });

    //     // สร้าง set ของห้องที่มีอยู่แล้ว (floor + roomNumber)
    //     const existingSet = new Set(existingRooms.map(room => `${room.floor}-${room.roomNumber}`));

    //     // คัดกรองห้องที่ยังไม่มีในฐานข้อมูล
    //     const newRooms = rooms.filter(room => !existingSet.has(`${room.floor}-${room.roomNumber}`));

    //     if (newRooms.length === 0) {
    //         return res.status(400).json({
    //             success: false,
    //             message: 'ห้องทั้งหมดมีอยู่แล้วในระบบ',
    //         });
    //     }

    //     // เพิ่มเฉพาะห้องใหม่
    //     const roomResult = await Room.insertMany(newRooms.map(room => ({
    //         floor: room.floor,
    //         roomNumber: room.roomNumber,
    //         status: 'available' // ตั้งค่าสถานะห้องว่าง
    //     })));

    //     return sendResponse(res, 200, 'Create room successfully', roomResult);

    // } catch (error) {
    //     res.status(500).json({
    //         success: false,
    //         message: "เกิดข้อผิดพลาดในการสร้างห้องเช่า",
    //         error: error.message
    //     });
    // }
}

exports.addTenetRoom = async (req, res) => {
    const { price, status, tenet } = req.body



    try {
        // สร้างอ็อบเจ็กต์สำหรับการอัปเดต
        // const updateFields = {};
        // if (req.body.status) {
        //     updateFields.status = req.body.status;
        // }
        // if (req.body.price) {
        //     updateFields.price = req.body.price;
        // }
        // if (req.body.tenet) {
        //     updateFields.tenet = req.body.tenet;
        // }

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

        return sendResponse(res, 200, 'Room updated successfully')

    } catch (error) {
    console.log(`⩇⩇:⩇⩇🚨  file: roomController.js:131  error :`, error);


    }
}

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
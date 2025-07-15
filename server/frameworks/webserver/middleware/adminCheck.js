
const adminUser = require("../../database/mongoDB/models/adminModel");
const profile = require("../../database/mongoDB/models/profile");
const memberUser = require("../../database/mongoDB/models/userModel");
const { sendResponse, sendResponseHono } = require("../utils/responseMessage");




exports.adminCheck = async (c, next) => {

    const req = c.get('user')

    try {

        // ค้นหา profile และ populate role ด้วย
        const user = await profile
            .findOne({ username: req.username })
            .select("-password")
            .populate("role") // <-- เพิ่ม populate role
            .exec();

        console.log(1)

        // ตรวจสอบว่า user.role ถูก populate มาจริง ๆ
        if (!user || !user.role || !user.role.name) {
            return sendResponseHono(c, 404, "Role data not found");
        }

        // เช็คว่า role ใน req.user และ role ใน DB ตรงกันหรือไม่
        if (req.role !== user.role.name) {
            return sendResponseHono(c, 404, "Role mismatch");
        }

        // อนุญาตเฉพาะ master และ admin
        if (user.role.name !== "Owner" && user.role.name !== "Admin") {
            return sendResponseHono(c, 404, "Role access denied!!!!!");
        }

        return await next();

    } catch (error) {
        return c.json({ message: 'Server Error' }, 500);
    }
};

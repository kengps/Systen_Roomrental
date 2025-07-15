const adminUser = require("../../database/mongoDB/models/adminModel");
const profile = require("../../database/mongoDB/models/profile");
const memberUser = require("../../database/mongoDB/models/userModel");



//เช็คข้อมูลผู้ล็อกอิน 
exports.currentUser = async (c) => {

    const req = c.get('user')

    try {

        let user = await profile.findOne({ username: req.username })
            .select("-password")

            .exec();



        return c.json(user);
    } catch (error) {
        return c.json({ message: 'Server Error' }, 500);
    }
};


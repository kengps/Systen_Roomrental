const adminUser = require("../../database/mongoDB/models/adminModel");
const memberUser = require("../../database/mongoDB/models/userModel");



//เช็คข้อมูลผู้ล็อกอิน 
exports.currentUser = async (req, res) => {
    console.log("➡️  file: authController.js:127  req:", req.user)

    try {

        let user = await adminUser.findOne({ username: req.user.username })
            .select("-password")
            .exec();

        if (!user) {
            user = await memberUser.findOne({ username: req.user.username }).select('-password').exec();
        }
        console.log("🚀  file: authController.js:137  user:", user)

        res.send(user);
    } catch (error) {
        res.status(400).send("SerVer is Error!!");
    }
};


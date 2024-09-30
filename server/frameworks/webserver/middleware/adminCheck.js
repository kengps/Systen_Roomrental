
const adminUser = require("../../database/mongoDB/models/adminModel");
const memberUser = require("../../database/mongoDB/models/userModel");
const { sendResponse } = require("../utils/responseMessage");




exports.adminCheck = async (req, res, next) => {
    try {

        //console.log('log',req.user.username);
        const userAdmin = await adminUser.findOne({ username: req.user.username }).select("-password").exec();

        if (!userAdmin) {
            userAdmin = await memberUser.findOne({ username: req.user.username }).select("-password").exec();
        }

        if (userAdmin.role !== "superAdmin") return sendResponse(res, 404, 'Admin access denied!!!!!');

        next();
       
    } catch (error) {
        console.log(error);
        res.status(404).send('Admin access denied')

    }

}
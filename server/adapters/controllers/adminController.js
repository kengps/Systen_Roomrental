const adminUser = require('../../frameworks/database/mongoDB/models/adminModel');
const { sendResponse } = require('../../frameworks/webserver/utils/responseMessage');
const { generateHashPassword } = require('./hashPassword');


exports.adminRegister = async (req, res) => {
    try {
        const { username, password } = req.body

        if (!username || !password) return sendResponse(res, 400, 'Please fill in all fields!');

        const admins = await adminUser.findOne({ username })

        if (admins) return sendResponse(res, 400, 'Username is already exists!')

        const hashedPassword  = await generateHashPassword(password)


        const newAdminData = new adminUser({
            username,
            password: hashedPassword 
        })


        await newAdminData.save();

        sendResponse(res, 200, "Register successfully", newAdminData)

    } catch (error) {

    }

}

exports.getAdminUser = async (req, res) => {
    try {
        const admin = await adminUser.find();
        return sendResponse(res, 200, 'Gets Admins Successfully', admin)
    } catch (error) {
    console.log(`⩇⩇:⩇⩇🚨  file: adminController.js:40  error :`, error);


    }
}
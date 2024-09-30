const memberUser = require('../../frameworks/database/mongoDB/models/userModel');

const { sendResponse, sendResponseResult } = require('../../frameworks/webserver/utils/responseMessage');
const { generateHashPassword } = require('./hashPassword');



exports.userRegister = async (req, res) => {

    try {
        const { username, password } = req.body;


        if (!username || !password) return sendResponse(res, 400, 'Please fill in all fields!')

        const user = await memberUser.findOne({ username })

        if (user) return sendResponse(res, 400, 'Username is already exists!')

        const hashedPassword  = await generateHashPassword(password);


        const users = new memberUser({ username, password: hashedPassword  });

        await users.save();

        sendResponse(res, 200, "Register successfully", users)


    } catch (error) {

    }
}


//get user
exports.getUsers = async (req, res) => {
    try {
        const listUser = await memberUser.find();
       
        return sendResponse(res, 200, `Get Users Successfully`,listUser )
    } catch (error) {
        console.log(`⩇⩇:⩇⩇🚨  file: userController.js:43  error :`, error);


    }

}
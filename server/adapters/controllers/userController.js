const memberUser = require('../../frameworks/database/mongoDB/models/userModel');
const { handleRequestError } = require('../../frameworks/webserver/utils/HOCHandelRequest');

const { sendResponse, sendResponseResult } = require('../../frameworks/webserver/utils/responseMessage');
const { generateHashPassword } = require('./hashPassword');



// exports.userRegister = async (req, res) => {

//     try {
//         const { username, password } = req.body;


//         if (!username || !password) return sendResponse(res, 400, 'Please fill in all fields!')

//         const user = await memberUser.findOne({ username })

//         if (user) return sendResponse(res, 400, 'Username is already exists!')

//         const hashedPassword  = await generateHashPassword(password);


//         const users = new memberUser({ username, password: hashedPassword  });

//         await users.save();

//         sendResponse(res, 200, "Register successfully", users)


//     } catch (error) {

//     }
// }


// ฟังก์ชัน userRegister
const userRegister = handleRequestError(async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return sendResponse(res, 400, 'Please fill in all fields!')
    }

    const user = await memberUser.findOne({ username });

    if (user) {
        return sendResponse(res, 400, 'Username is already exists!')
    }

    const hashedPassword = await generateHashPassword(password);
    const newUser = new memberUser({ username, password: hashedPassword });

    await newUser.save();

   
    return sendResponse(res, 200, "Register successfully", newUser)
});


//get user
const getUsers = handleRequestError(async (req, res) => {
    try {
        const listUser = await memberUser.find();
        return sendResponse(res, 200, `Get Users Successfully`, listUser)
    } catch (error) {
       console.log(`⩇⩇:⩇⩇🚨  file: userController.js:67  error :`, error);  

    }

})

module.exports = {
    userRegister,
    getUsers
}
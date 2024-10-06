const jwt = require('jsonwebtoken');
const { sendResponse } = require('../utils/responseMessage');
const adminUser = require('../../database/mongoDB/models/adminModel');
const memberUser = require('../../database/mongoDB/models/userModel');



exports.auth = async (req, res, next) => {
    try {
        let token = req.headers['authtoken'];


        if (!token) return sendResponse(res, 401, 'Not confirm is Token')


        const decoded = jwt.verify(token, 'jwtSecret');

        req.user = decoded.user



        next();
    } catch (error) {

        console.log('User is not Found!!', error);
        return sendResponse(res, 401, 'User is not Found!!')
    }

}

// เช็คว่า user มี role เป็น admin หรือไม่
exports.adminRoute = async (req, res, next) => {

    //console.log('log',req.user.username);
    const userAdmin = await adminUser.findOne({ username: req.user.username }).select("-password").exec();
    console.log(`⩇⩇:⩇⩇🚨  file: auth.js:33  userAdmin :`, userAdmin);


    if (!userAdmin) {
        userAdmin = await memberUser.findOne({ username: req.user.username }).select("-password").exec();
    }

    if (userAdmin.role !== "admin") return sendResponse(res, 404, 'Admin access denied!!!!!');

    next();


};

// เช็คว่า user มี role เป็น member หรือไม่
exports.memberRoute = async (req, res, next) => {

    //console.log('log',req.user.username);
    const userMember = await adminUser.findOne({ username: req.user.username }).select("-password").exec();
    console.log(`⩇⩇:⩇⩇🚨  file: auth.js:52  userMember :`, userMember);


    if (!userMember) {
        userMember = await memberUser.findOne({ username: req.user.username }).select("-password").exec();
    }

    if (userMember.role !== "member") return sendResponse(res, 404, 'Admin access denied!!!!!');

    next();

};
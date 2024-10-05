const jwt = require('jsonwebtoken');
const { sendResponse } = require('../utils/responseMessage');


exports.auth = async (req, res, next) => {
    try {
        let token = req.headers['authtoken'];
        

        if (!token) return sendResponse(res, 401, 'Not confirm is Token')


        const decoded = jwt.verify(token, 'jwtSecret');

        req.user = decoded.user
       


        next();
    } catch (error) {

        console.log('User is not Found!!',error);
        return sendResponse(res, 401, 'User is not Found!!')
    }

}
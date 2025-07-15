const jwt = require('jsonwebtoken');
const { sendResponse, sendResponseHono } = require('../utils/responseMessage');
const { findeToken } = require('../../../adapters/repositories/login');


exports.auth = async (c, next) => {
    try {
        let bearer = await c.req.header('authorization');
        if (!bearer || !bearer.startsWith('Bearer ')) {
            return sendResponseHono(c, 401, 'Token not provided or invalid format');
        }

        const token = bearer.split(' ')[1];
        console.log(`⩇⩇:⩇⩇🚨 token :`, token);


        const savedToken = await findeToken(token);
        if (!savedToken) {
            return sendResponseHono(c, 401, 'Token is not recognized or expired');
        }

        const decoded = jwt.verify(savedToken.token, 'jwtSecret');
        c.set('user', decoded.user);

        return await next();
    } catch (error) {
        return sendResponseHono(c, 401, 'User is not Found!!');
    }
}

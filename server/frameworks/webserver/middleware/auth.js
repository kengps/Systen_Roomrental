const jwt = require('jsonwebtoken');
const { sendResponse, sendResponseHono } = require('../utils/responseMessage');
const { findeToken } = require('../../../adapters/repositories/login');
const { getCookie } = require('hono/cookie');


exports.auth = async (c, next) => {
    try {
        const refreshToken = getCookie(c, 'refreshToken'); // ✅ ใช้ getCookie
       
        let bearer = await c.req.header('authorization');
       


        if (!bearer || !bearer.startsWith('Bearer ')) {
            return sendResponseHono(c, 401, 'Token not provided or invalid format');
        }

        const token = bearer.split(' ')[1];


        const savedToken = await findeToken(refreshToken);


        if (!savedToken) {
            return sendResponseHono(c, 401, 'Token is not recognized or expired');
        }


        const decoded = jwt.verify(savedToken.token, process.env.JWT_REFRESH_SECRET);

        c.set('user', decoded.user);

        return await next();
    } catch (error) {
        console.log(`⩇⩇:⩇⩇🚨 ~ exports.auth= ~ error :`, error);




        return sendResponseHono(c, 401, error);
    }
}

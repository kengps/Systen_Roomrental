
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { query, check, matchedData, validationResult } = require('express-validator');
const { sendResponse, sendResponseHono } = require("../../frameworks/webserver/utils/responseMessage");
const Profile = require("../../frameworks/database/mongoDB/models/profile");
const { createTokenLogin, deleteTokenLogin, getExistingToken, findeToken } = require("../repositories/login");
const tokenModel = require("../../frameworks/database/mongoDB/models/tokenModel");

const { setCookie, getCookie } = require('hono/cookie');
const { SubmitLogs } = require("../repositories/logactions/logactionsRepository");
const { GetIpAddress, getClientIP } = require("../../frameworks/services/getIpAddress");
const { getConnInfo } = require("@hono/node-server/conninfo");

// exports.logged = [
//   check('username').trim().escape(),
//   check('password').trim().escape(),
//   check('role').trim().escape(),
//   async (req, res) => {
//     try {
//       const errors = validationResult(req);
//       if (!errors.isEmpty()) {
//         // return res.status(400).json({ errors: errors.array() });
//         return sendResponse(res, 400, errors.array());
//       }
//       const { username, password, role } = req.body;



//       // ตรวจสอบจากฐานข้อมูล admin ก่อน
//       let user = await Profile.findOne({ username: { $regex: new RegExp(`^${username}$`, 'i') } }).populate('role', 'name');



//       if (!user) {
//         // ถ้าไม่เจอในทั้งสอง ให้ส่ง response กลับว่าไม่พบ
//         return sendResponse(res, 400, "User not Found!!");
//       }


//       // ตรวจสอบสถานะ enabled
//       if (!user.enabled) {
//         return sendResponse(res, 403, "Account is disabled");
//       }

//       // ✅ ตรวจสอบว่ามี Token ที่ยังไม่หมดอายุใน DB หรือไม่
//       let existingToken = await getExistingToken(
//         user._id.toString(),
//       );

//       if (existingToken) {
//         await deleteTokenLogin(existingToken._id);
//       }




//       const passIsMatch = await bcrypt.compare(password, user.password);
//       if (!passIsMatch) {

//         return sendResponse(res, 401, "Password Invalid")
//       }
//       const roleName = user.role?.name;

//       const userPayLoad = {
//         user: {
//           username: user.username,
//           role: roleName,
//           id: user._id,
//         },
//       };
//       const expiresIn = 60 * 60 * 6; // อายุ 3 ชั่วโมงหน่อวย ms

//       const token = jwt.sign(userPayLoad, "jwtSecret", { expiresIn: expiresIn });



//       const fff = await createTokenLogin(user._id.toString(), token, new Date(Date.now() + expiresIn * 1000))



//       return res.json({
//         messages: "Login successfully!",
//         token: decodeURIComponent(token),
//         userPayLoad: {
//           user: {
//             username: decodeURIComponent(user.username),
//             role: decodeURIComponent(roleName),
//             id: decodeURIComponent(user._id),
//           }

//         },
//       });



//     } catch (error) {

//       return sendResponse(res, 400, "Server is Error");

//     }

//   }
// ]


exports.logged = async (c) => {
  try {
    const { username, password } = await c.req.json()

    const info = getClientIP(c) // info is `ConnInfo`
 
    if (!username || !password) {
      return sendResponseHono(c, 400, "กรุณากรอก username และ password", null);
    }

    // ตรวจสอบจากฐานข้อมูล admin ก่อน
    let user = await Profile.findOne({ username: { $regex: new RegExp(`^${username}$`, 'i') } }).populate('role', 'name');


    if (!user) {
      // ถ้าไม่เจอในทั้งสอง ให้ส่ง response กลับว่าไม่พบ
      return sendResponseHono(c, 400, "User not Found!!");
    }


    // ตรวจสอบสถานะ enabled
    if (!user.enabled) {
      return sendResponseHono(c, 403, "Account is disabled");
    }

    // ✅ ตรวจสอบว่ามี Token ที่ยังไม่หมดอายุใน DB หรือไม่
    let existingToken = await getExistingToken(
      user._id.toString(),
    );

    if (existingToken) {
      await deleteTokenLogin(existingToken._id);
    }


    const passIsMatch = await bcrypt.compare(password, user.password);
    if (!passIsMatch) {

      return sendResponseHono(c, 401, "Password Invalid")
    }
    const roleName = user.role?.name;

    const userPayLoad = {
      user: {
        username: user.username,
        role: roleName,
        id: user._id,
      },
    };
    const expiresIn = 60 * 60 * 6; // อายุ 3 ชั่วโมงหน่อวย ms
    const refreshTokenExpireInSeconds = 60 * 60 * 24 * 7; // 7 วัน (เป็นวินาที)
    //const token = jwt.sign(userPayLoad, "jwtSecret", { expiresIn: expiresIn });


    // สร้าง Token
    const token = jwt.sign(userPayLoad, process.env.JWT_SECRET, { expiresIn: "15m" });
    const refreshToken = jwt.sign(userPayLoad, process.env.JWT_REFRESH_SECRET, { expiresIn: "7d" });
    console.log(`⩇⩇:⩇⩇🚨 ~ refreshToken :`, refreshToken);






    const fff = await createTokenLogin(user._id.toString(), refreshToken, new Date(Date.now() + refreshTokenExpireInSeconds * 1000))

    setCookie(c, 'refreshToken', refreshToken, {
      httpOnly: true,
      // secure: process.env.NODE_ENV === 'production',
      // sameSite: process.env.NODE_ENV === 'production' ? 'Strict' : 'Lax',
      secure: true, // ✅ ต้องใช้ https เท่านั้น
      sameSite: 'None', // ✅ เพื่อให้ cookie ใช้ข้าม origin ได้
      maxAge: 7 * 24 * 60 * 60, // 7 วัน
      path: '/',
    })

    await SubmitLogs(
      {
        ipAddress: info || '',
        action: "login",
        actor: user._id,
        details: userPayLoad
      }
    )




    return c.json({
      messages: "Login successfully!",
      token: decodeURIComponent(token),
      userPayLoad: {
        user: {
          username: decodeURIComponent(user.username),
          role: decodeURIComponent(roleName),
          id: decodeURIComponent(user._id),
        }

      },
    });



    //return c.json({ message: "keng" })
  } catch (error) {
    throw error
  }
}

exports.logouted = async (c) => {
  const { id } = await c.req.json()

  await tokenModel.findOneAndDelete({ userId: id.toString() }).exec()

  setCookie(c, 'refreshToken', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'Strict' : 'Lax',
    maxAge: 0,
    path: '/'
  })


  await SubmitLogs(
    {
      ipAddress: 0 || '',
      action: "logout",
      actor: id,
      details: ''
    }
  )

  return c.json({ message: 'logout successfully' })

}

exports.refreshToken = async (c) => {

  const refreshToken = getCookie(c, 'refreshToken'); // ✅ ใช้ getCookie

  if (!refreshToken) {
    return c.json({ error: "No refresh token" }, 401); // ✅ ใช้ c.json
  }

  try {
    const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    // ตรวจสอบว่า Refresh Token ยังอยู่ใน DB
    const savedToken = await findeToken(refreshToken);
    if (!savedToken) {

      return c.json({ error: "Invalid refresh token" }, 403);
    }

    // สร้าง Access Token ใหม่
    const newAccessToken = jwt.sign(
      {
        user: { // ✅ ให้ตรงกับ structure เดิม
          id: payload.user.id,
          role: payload.user.role,
          username: payload.user.username
        }
      },
      process.env.JWT_SECRET, // ✅ ใช้ string เดียวกับที่ login
      { expiresIn: "15m" }
    );


    return c.json({ accessToken: newAccessToken });

  } catch (err) {
    console.log('JWT Error:', err);
    return c.json({ error: "Invalid or expired refresh token" }, 403);
  }


}

const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { query, check, matchedData, validationResult } = require('express-validator');
const { sendResponse, sendResponseHono } = require("../../frameworks/webserver/utils/responseMessage");
const Profile = require("../../frameworks/database/mongoDB/models/profile");
const { createTokenLogin, deleteTokenLogin, getExistingToken } = require("../repositories/login");
const tokenModel = require("../../frameworks/database/mongoDB/models/tokenModel");


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

    if (!username || !password) {
      return sendResponseHono(c, 400, "กรุณากรอก username และ password", null);
    }


    // ตรวจสอบจากฐานข้อมูล admin ก่อน
    let user = await Profile.findOne({ username: { $regex: new RegExp(`^${username}$`, 'i') } }).populate('role', 'name');

    console.log(`⩇⩇:⩇⩇🚨 user :`, user);



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

    const token = jwt.sign(userPayLoad, "jwtSecret", { expiresIn: expiresIn });



    const fff = await createTokenLogin(user._id.toString(), token, new Date(Date.now() + expiresIn * 1000))



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

  console.log(`⩇⩇:⩇⩇🚨 id :`, id);

  await tokenModel.findOneAndDelete({ userId: id.toString() }).exec()

  return c.json({ message: 'logout successfully' })

}
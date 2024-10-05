const memberUser = require("../../frameworks/database/mongoDB/models/userModel");
const adminUser = require("../../frameworks/database/mongoDB/models/adminModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { query, check, matchedData, validationResult } = require('express-validator');
const { sendResponse } = require("../../frameworks/webserver/utils/responseMessage");


exports.logged = [
  check('username').trim().escape(),
  check('password').trim().escape(),
  check('role').trim().escape(),
  async (req, res) => {
    console.log(`⩇⩇:⩇⩇🚨  file: logged.js:13  req :`, req.body);

    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        // return res.status(400).json({ errors: errors.array() });
        return sendResponse(res, 400, errors.array());
      }
      const { username, password, role } = req.body;
      console.log(`⩇⩇:⩇⩇🚨  file: logged.js:22  username :`, username);

      // ตรวจสอบจากฐานข้อมูล admin ก่อน
      let user = await adminUser.findOne({ username: { $regex: new RegExp(`^${username}$`, 'i') } });

      if (!user) {


        // ถ้าไม่เจอใน adminUser ค้นหาต่อใน memberUser
        user = await memberUser.findOne({ username: { $regex: new RegExp(`^${username}$`, 'i') } });

        if (!user) {
          // ถ้าไม่เจอในทั้งสอง ให้ส่ง response กลับว่าไม่พบ
          return sendResponse(res, 400, "User or Admin is not Found!!");
        }
      }

      // ตรวจสอบสถานะ enabled
      if (!user.enabled) {
        return sendResponse(res, 403, "Account is disabled");
      }


      const passIsMatch = await bcrypt.compare(password, user.password);
      if (!passIsMatch) {
        return sendResponse(res, 401, "Password Invalid")
      }

      const userPayLoad = {
        user: {
          username: user.username,
          role: user.role,
          id: user._id,
        },
      };
      console.log(`⩇⩇:⩇⩇🚨  file: logged.js:52  userPayLoad :`, userPayLoad);


      const token = jwt.sign(userPayLoad, "jwtSecret", { expiresIn: "3h" });



      return res.json({
        messages: "Login successfully",
        token: encodeURIComponent(token),
        userPayLoad: {
          user: {
            username: encodeURIComponent(user.username),
            role: encodeURIComponent(user.role),
            id: encodeURIComponent(user._id),
          }

        },
      });



    } catch (error) {
      console.log(`⩇⩇:⩇⩇🚨  file: logged.js:93  error :`, error);


      return sendResponse(res, 400, "Server is Error");

    }

  }
]


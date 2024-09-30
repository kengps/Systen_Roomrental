const express = require("express");
const router = express.Router();

const { userRegister,getUsers } = require('../../../adapters/controllers/userController');


router.post('/register', userRegister)

router.get('/listmember', getUsers)


module.exports = router;

const express = require("express");
const router = express.Router();

const { getUsers, userRegister } = require('../../../adapters/controllers/userController');


router.post('/register', userRegister)

router.get('/listmember', getUsers)


module.exports = router;

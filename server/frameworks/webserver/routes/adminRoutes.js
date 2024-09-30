const express = require('express');
const router = express.Router();

const { adminRegister, getAdminUser } = require('../../../adapters/controllers/adminController');


router.post('/register', adminRegister)
router.get('/listadmin', getAdminUser)



module.exports = router
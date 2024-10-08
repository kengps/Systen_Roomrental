const express = require('express');
const { createRoom ,collectRent,createRentDetails,addRentDetails ,listRoom,listRentDetails} = require('../../../adapters/controllers/roomController');
const router = express.Router();


router.post('/create', createRoom);

router.post('/collect', collectRent);

router.post('/collectrent', addRentDetails);

router.get('/listroom',listRoom)
router.get('/listrent',listRentDetails)



module.exports = router
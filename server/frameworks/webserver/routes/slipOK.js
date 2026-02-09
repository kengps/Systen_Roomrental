const express = require('express');
const { createRoom, addRentDetails, listRentDetails, listRoom, collectRent, addTenetRoom, updatePrice, apartmant, apartmantData } = require('../../../adapters/controllers/roomController');
const { Hono } = require('hono');
const { checkSlip } = require('../../../adapters/controllers/slipuploadController');


const appSlipOK = new Hono()


appSlipOK.post('/create', createRoom);


appSlipOK.post('/checkslip', checkSlip);



module.exports = appSlipOK
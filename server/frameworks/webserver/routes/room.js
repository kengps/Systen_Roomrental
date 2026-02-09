const express = require('express');
const { createRoom, addRentDetails, listRentDetails, listRoom, collectRent, addTenetRoom, updatePrice, updateUnitMeter, apartmant, apartmantData } = require('../../../adapters/controllers/roomController');
const { Hono } = require('hono');


const appRooms = new Hono()


appRooms.post('/create', createRoom);

appRooms.put('/update-price', updatePrice);
appRooms.put('/update-unit-meter', updateUnitMeter);


appRooms.post('/collect', collectRent);


appRooms.post('/collectrent', addRentDetails);

appRooms.get('/listroom', listRoom)

appRooms.get('/listrent', listRentDetails)


appRooms.put('/update', addTenetRoom)


//apartmentName
// appRooms.post('/apartment-address', apartmant);
// appRooms.get('/apartment', apartmantData);


module.exports = appRooms
const express = require('express');
const { Registers, getListUsers } = require('../../../adapters/controllers/registerController');
const { Hono } = require('hono');
const router = express.Router();

const appRegister = new Hono()


appRegister.post('/register', Registers)

appRegister.get('/list-users/:userId', getListUsers)




module.exports = appRegister
const express = require('express');
const { Registers } = require('../../../adapters/controllers/registerController');
const { Hono } = require('hono');
const router = express.Router();

const appRegister = new Hono()


appRegister.post('/register', Registers)




module.exports = appRegister
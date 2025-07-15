const express = require("express");
const router = express.Router();


const { getUsers, userRegister } = require('../../../adapters/controllers/userController');
const { Hono } = require("hono");

const appAccount = new Hono()


// appAccount.post('/register', userRegister)

appAccount.get('/listmember', getUsers)


module.exports = appAccount;

// const express = require("express");
// const router = express.Router();
const { logged, logouted } = require("../../../adapters/controllers/logged");
const { auth } = require("../middleware/auth");
const { currentUser } = require("../middleware/currentUsers");
const { adminCheck } = require("../middleware/adminCheck");


// router.post('/login', logged)
// router.post('/logout', logouted)




// router.post('/current-user', auth, currentUser)

// //router.post('/current-admin', auth, adminCheck, currentUser)
// router.post('/current-admin', auth, adminCheck, currentUser)

//module.exports = router;




const { Hono } = require('hono')

const appLogin = new Hono()

appLogin.post('/login', logged)

appLogin.post('/logout', logouted)


appLogin.post('/current-user', auth, currentUser)

// //router.post('/current-admin', auth, adminCheck, currentUser)
appLogin.post('/current-admin', auth, adminCheck, currentUser)



module.exports = appLogin
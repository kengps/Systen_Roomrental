const express = require("express");
const router = express.Router();
const { logged } = require("../../../adapters/controllers/logged");
const { auth, adminRoute, memberRoute } = require("../middleware/auth");
const { currentUser } = require("../middleware/currentUsers");
const { adminCheck } = require("../middleware/adminCheck");


router.post('/login', logged)



router.post('/current-user', auth, currentUser)

router.post('/current-admin', auth, adminCheck, currentUser)

router.post('/admin', auth, adminRoute, currentUser)

router.post('/member', auth, memberRoute, currentUser)


module.exports = router;


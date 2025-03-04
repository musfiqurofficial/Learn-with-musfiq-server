const express = require("express");
const { authUser } = require("../controllers/authController");

const router = express.Router();

router.post("/signin-signup", authUser);

module.exports = router;

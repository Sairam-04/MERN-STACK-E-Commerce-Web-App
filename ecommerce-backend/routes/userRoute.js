const express = require("express");
const {
  registerUser,
  loginUser,
  logoutUser,
  forgotPassword,
} = require("../controllers/userController");
const { _router } = require("../app");
const router = express.Router();

router.route("/signup").post(registerUser);
router.route("/signin").post(loginUser);
router.route("/password/forgot").post(forgotPassword);
router.route("/logout").get(logoutUser);

module.exports = router;

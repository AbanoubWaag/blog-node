const express = require("express");
const { body } = require("express-validator");
const { register, login } = require("../controllers/authController");

const router = express.Router();

router.post(
  "/register",
  [
    body("name").notEmpty().withMessage("Name Is Required"),
    body("email").isEmail().withMessage("Valid Email Is Required"),
    body("password").isLength({ min: 6 }).withMessage("Password Must Be At Least 6 Characters"),
  ],
  register,
);

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Valid Email Is Required"),
    body("password").notEmpty().withMessage("Password Is Required"),
  ],
  login,
);

module.exports = router;

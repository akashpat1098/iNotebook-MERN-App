const express = require("express");
const router = express.Router();
const User = require("../models/UserSchema");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { useId } = require("react");
const fetchuser = require("../middleware/fetchuser");

const JWT_SECRET = "mynameisakashpatel";
// Create a User using :POST "/api/auth/createuser". No Login required
router.post(
  "/createuser",
  [
    body("name", "Enter a valid name").isLength({ min: 3 }),
    body("email", "Enter a valid email").isEmail(),
    body("password", "Paswword must be atleast 5 character").isLength({
      min: 5,
    }),
  ],
  async (req, res) => {
    let success = false;
    // Finds the validation errors in this request and wraps them in an object with handy functions
    // If there are errors, return Bad request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success, errors: errors.array() });
    }
    // Check wheather the user with same email exists already
    try {
      let user = await User.findOne({ email: req.body.email });
      if (user) {
        return res
          .status(400)
          .json({ success,error: "Sorry a user with this email already exists" });
      }
      // securing password
      const salt = await bcrypt.genSalt(10);
      const secPass = await bcrypt.hash(req.body.password, salt);
      // create new user
      user = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: secPass,
      });
      // creating jwtToken and sending to user

      const data = {
        user: {
          id: user.id,
        },
      };
      const authtoken = jwt.sign(data, JWT_SECRET);
      success=true;
      res.json({ success, authtoken });
    } catch (e) {
      // throw error if occur
      console.error(e.message);
      res.status(500).send("Internal server error occur");
    }
  }
);
// Authenticate a User using :POST "/api/auth/login". No Login required
router.post(
  "/login",
  // checking for errors
  [
    body("email", "Enter a valid email").isEmail(),
    body("password", "Paswword cannot be blanked").exists(),
  ],
  async (req, res) => {
    let success=false
    // throw error if occur
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    // Checking email of user
    const { email, password } = req.body;
    try {
      let user = await User.findOne({ email });
      if (!user) {
        success = false;
        return res
          .status(400)
          .json({ error: "Please try to login with correct credential" });
      }
      // Checking password of user
      const passwordCompare = await bcrypt.compare(password, user.password);
      if (!passwordCompare) {
        success=false;
        return res
          .status(400)
          .json({ success,error: "Please try to login with correct credential" });
      }
      // creating jwtToken and sending to user
      const data = {
        user: {
          id: user.id,
        },
      };
      const authtoken = jwt.sign(data, JWT_SECRET);
      success=true;
      res.json({success, authtoken });
    } catch (e) {
      // throw error if occur
      console.error(e.message);
      res.status(500).send("Internal server error occur");
    }
  }
);

router.get("/getuser", fetchuser, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select("-password");
    res.send(user);
  } catch (e) {
    console.error(e.message);
    res.status(500).send("Internal server error occur");
  }
});
module.exports = router;

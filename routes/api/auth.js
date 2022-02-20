const express = require("express");
const router = express.Router();
const bcrybt = require("bcryptjs");
const jwttoken = require("jsonwebtoken");
const config = require("config");
const { check, validationResult } = require("express-validator");
const User = require("../../models/User");

//@route    GET api/auth
//@desc     test route
//@access   public
router.get("/", (req, res) => res.send("Hey auth"));

//@route    POST api/auth
//@desc     test route
//@access   public
router.post(
  "/",
  [check("email").isEmail(), check("password").exists()],
  async (req, res) => {
    const errors = validationResult(req);
    console.log(errors);
    if (!errors.isEmpty()) {
      return res.status(400).json({ er: errors.array() });
    }
    const { email, password } = req.body;
    try {
      let user = await User.findOne({ email });
      if (!user) {
        return res
          .status(400)
          .json({ errors: [{ msg: "Invalid credential" }] });
      }

      user = new User({ email, password });
      user.password = await bcrybt.compare(password, user.password);

      const payload = { user: { id: user.id } };

      jwttoken.sign(
        payload,
        config.get("jwtS"),
        { expiresIn: 360000 },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    } catch (error) {
      console.error(error.message);
      res.status(500).send("server error");
    }
  }
);

module.exports = router;

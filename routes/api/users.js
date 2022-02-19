const express = require("express");
const router = express.Router();
const gravatar = require("gravatar");
const bcrybt = require("bcryptjs");
const jwttoken = require("jsonwebtoken");
const config = require("config");
const { check, validationResult } = require("express-validator");
const User = require("../../models/User");
//@route    POST api/users
//@desc     register users
//@access   public
router.post(
  "/",
  [
    check("name", "Name is require").not().isEmpty(),
    check("email").isEmail(),
    check("password").isLength({ min: 6 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    console.log(errors);
    if (!errors.isEmpty()) {
      return res.status(400).json({ er: errors.array() });
    }
    const { name, email, password } = req.body;
    try {
      let user = await User.findOne({ email });
      if (user) {
        return res
          .status(400)
          .json({ errors: [{ msg: "user already exist" }] });
      }
      const avatar = gravatar.url(email, {
        s: 200,
        r: "pg",
        d: "mm",
      });
      user = new User({ name, email, avatar, password });
      const salt = await bcrybt.genSalt(10);
      user.password = await bcrybt.hash(password, salt);
      await user.save(); // promise returns doc saved with id
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

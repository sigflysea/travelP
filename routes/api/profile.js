const express = require("express");
const router = express.Router();
const Profile = require("../../models/Profile");
const User = require("../../models/User");
const auth = require("../../middleware/auth");
const { json } = require("express/lib/response");
const { check, validationResult } = require("express-validator");
const normalize = require("normalize-url");
//@route    GET api/profile/me
//@desc     get profile
//@access   private
router.get("/me", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.body.id }).populate(
      "user",
      ["name", "avatar"]
    );
    if (!profile) {
      return res.status(401).json({ err: "No profile found" });
    }
    res.json(profile);
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Server error");
  }
});
// @route    POST api/profile
// @desc     Create or update user profile
// @access   Private
router.post(
  "/",
  auth,
  check("status", "Status is required").notEmpty(),
  check("skills", "Skills is required").notEmpty(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    // destructure the request
    const {
      website,
      skills,
      youtube,
      twitter,
      instagram,
      linkedin,
      facebook,
      // spread the rest of the fields we don't need to check
      ...rest
    } = req.body;

    // build a profile
    const profileFields = {
      user: req.user.id,
      website:
        website && website !== ""
          ? normalize(website, { forceHttps: true })
          : "",
      skills: Array.isArray(skills)
        ? skills
        : skills.split(",").map((skill) => " " + skill.trim()),
      ...rest,
    };
    try {
      let profile = await Profile.findOneAndUpdate(
        { user: req.body.id },
        { $set: profileFields },
        { new: true, upsert: true, setDefaultsOnInsert: true }
      );
      return res.json(profile);
    } catch (err) {
      console.log(err.message);
      return res.status(500).send("server error");
    }
  }
);
module.exports = router;

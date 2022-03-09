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
    const profile = await Profile.findOne({ user: req.user.id }).populate(
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
        { user: req.user.id },
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

// @route    GET api/profile
// @desc     get all profiles
// @access   Public
router.get('/', async (req, res)=>{
  try {
const profiles = await Profile.find().populate('user', ["name", "avatar"]);
res.json(profiles);
  } catch (error) {
   console.log(error.message);
   res.status(500).send('Server error')
  }
})
// @route    GET api/profile/users/:user_id
// @desc     Get user by id
// @access   Public
router.get('/user/:user_id', async (req, res)=>{
  try {
const profile = await Profile.findOne({user: req.params.user_id}).populate('user', ["name", "avatar"]);
if(!profile){
  return res.status(400).send('Profile not found')
}
res.json(profile);
  } catch (error) {
   console.log(error.message);
   if(error.kind=="ObjectId") return res.status(400).send('Profile not found');
   res.status(500).send('Server error');
  }
})

// @route    DELETE api/profile
// @desc     delete profie and user
// @access   private
router.delete('/', auth, async (req, res)=>{
  try {
  await Profile.findOneAndDelete({user: req.user.id});
  await User.findOneAndDelete({_id: req.user.id})
  res.json({msg:"Profile removed"});
  } catch (error) {
   console.log(error.message);
    res.status(500).send('Server error');
  }
})
 


module.exports = router;


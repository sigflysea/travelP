const jwt = require("jsonwebtoken");
const config = require("config");
const res = require("express/lib/response");
const req = require("express/lib/request");

module.exports = function (req, res, next) {
  //get token
  const token = req.header("x-auth-token");
  if (!token) {
    res.status(401).json({ msg: "No token, authorization denied" });
  }
  try {
    const decoded = jwt.verify(token, config.get("jwtS"));
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ mes: "Token is not valid" });
  }
};

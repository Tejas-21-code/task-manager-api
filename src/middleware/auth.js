const users = require("../models/users");
const jwt = require("jsonwebtoken");
const router = require("../router/user");

const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization").replace("Bearer ", "");
    const decode = jwt.verify(token, process.env.JWT_SECRET);
    const user = await users.findOne({
      _id: decode._id,
      "tokens.token": token,
    });
    if (!user) {
      throw new Error();
    }
    req.token = token;
    req.user = user;
    // console.log(user);
    next();
  } catch (e) {
    res.status(401).send("something is wrong");
  }
};

module.exports = auth;

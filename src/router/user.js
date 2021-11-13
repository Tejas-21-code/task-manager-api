// const { Router } = require("express"); another way of using router for use case check task.js in router directory
const express = require("express");
const multer = require("multer");
const sharp = require("sharp");
const auth = require("../middleware/auth");
const {
  sendWelcomeEmail,
  sendCancelationEmail,
} = require("../emails/accounts");

const Users = require("../models/users");
const router = new express.Router();
const upload = multer({
  limits: {
    fileSize: 1000000,
  },
  fileFilter(req, file, cb) {
    //regular expressions
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error("Please Upload a jpg , png or jpeg file"));
    }
    cb(undefined, true);
  },
});

router.post("/user", async (req, res) => {
  const user = new Users(req.body);
  try {
    await user.save();
    sendWelcomeEmail(user.email, user.name);
    const token = await user.generateAuthToken();
    res.status(201).send({ user, token });
  } catch (e) {
    res.status(400).send(e);
  }
});
router.post("/user/login", async (req, res) => {
  try {
    const user = await Users.findByCredintials(req.body);
    // console.log(user);
    const token = await user.generateAuthToken();
    // console.log(user);
    res.send({ user, token });
  } catch (e) {
    res.status(500).send(e);
  }
});
router.post("/user/logout", auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter(
      (token) => token.token != req.token
    );
    await req.user.save();
    res.send();
  } catch (e) {
    res.status(500).send();
  }
});
router.post("/user/logoutAll", auth, async (req, res) => {
  try {
    req.user.tokens = [];
    req.user.save();
    res.send();
  } catch (e) {
    res.status(500).send();
  }
});
router.get("/user/me", auth, async (req, res) => {
  res.send(req.user);
});
router.patch("/user/me", auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdate = ["name", "age", "email", "password"];
  const isValid = updates.every((update) => allowedUpdate.includes(update));
  if (!isValid) {
    return res.status(400).send("invalid update");
  }
  try {
    updates.forEach((update) => (req.user[update] = req.body[update])); //[ ]notation used because update has dynamica data
    await req.user.save();
    res.send(req.user);
  } catch (e) {
    res.status(500).send(e);
  }
});
router.delete("/user/me", auth, async (req, res) => {
  try {
    req.user.remove();
    sendCancelationEmail(req.user.email, req.user.name);
    res.send(req.user);
  } catch (e) {
    res.status(500).send();
  }
});

router.post(
  "/user/me/avatar",
  auth,
  upload.single("avatar"),
  async (req, res) => {
    const buffer = await sharp(req.file.buffer)
      .resize({ width: 250, height: 250 })
      .png()
      .toBuffer();
    req.user.avatar = buffer;
    await req.user.save();
    res.send();
  },
  (error, req, res, next) => {
    res.status(400).send({
      error: error.message,
    });
  }
);
router.delete("/user/me/avatar", auth, async (req, res) => {
  try {
    req.user.avatar = undefined;
    await req.user.save();
    res.send();
  } catch (e) {
    res.status(500).send();
  }
});
router.get("/user/:id/avatar", async (req, res) => {
  try {
    const user = await Users.findById(req.params.id);
    if (!user || !user.avatar) {
      throw new Error();
    }
    res.set("Content-Type", "image/png");
    res.send(user.avatar);
  } catch (e) {
    res.status(404).send();
  }
});

module.exports = router;

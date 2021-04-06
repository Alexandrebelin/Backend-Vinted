const express = require("express");
const router = express.Router();

const uid2 = require("uid2");
const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");

const cloudinary = require("cloudinary").v2;

// MODELS IMPORT
const User = require("../Models/User");
const Offer = require("../Models/Offer");

// SIGN UP
router.post("/user/signup", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.fields.email });

    let securePassword = req.fields.password;
    let strongPassword = /^(?=.*[\d])(?=.*[A-Z])(?=.*[a-z])(?=.*[!@#$%^&*])[\w!@#$%^&*]{8,}$/.test(
      securePassword
    );

    if (!user) {
      if (req.fields.email && req.fields.username && req.fields.password) {
        if (strongPassword) {
          const password = req.fields.password;

          const salt = uid2(64);
          const hash = SHA256(password + salt).toString(encBase64);
          const token = uid2(64);

          const newUser = new User({
            email: req.fields.email,
            account: {
              username: req.fields.username,
              phone: req.fields.phone,
            },
            token: token,
            hash: hash,
            salt: salt,
          });

          if (req.fields.avatar) {
            let pictureToUpload = req.files.avatar.path;
            const result = await cloudinary.uploader.upload(pictureToUpload, {
              folder: `/Vinted/users/${newUser._id}`,
              allowed_formats: ["png, jpg"],
            });
            newUser.account.avatar = result;
          }

          const returnUser = (({ email, account, token, hash, salt, _id }) => ({
            account,
            token,
            _id,
          }))(newUser);
          await newUser.save();
          res.status(200).json(returnUser);
        } else {
          res.status(404).json({ error: "Password not strong enought" });
        }
      } else {
        res.status(404).json({ error: "Missing parameters" });
      }
    } else {
      res.status(404).json({ error: "Email already exists" });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// LOG IN
router.post("/user/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.fields.email });

    if (user) {
      const newHash = SHA256(req.fields.password + user.salt).toString(
        encBase64
      );
      if (newHash === user.hash) {
        res
          .status(200)
          .json({ _id: user._id, token: user.token, account: user.account });
      } else {
        res.status(401).json({ error: "Unauthorized" });
      }
    } else {
      res.status(401).json({ error: "Unauthorized" });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;

const express = require("express");
const router = express.Router();
const gravtar = require("gravatar");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const keys = require("../../config/keys");
const registerInputValidation = require("../../validation /register");

// Load User model
const User = require("../../models/User");

router.get("/test", (req, res) => {
  res.json({ mes: "users works" });
});

/**
 * @route POST api/users/register
 * @description register
 * @access public
 */
router.post("/register", (req, res) => {
  const { errors, isValid } = registerInputValidation(req.body);
  if (!isValid) {
    res.status(400).json(errors);
  }
  User.findOne({ email: req.body.email }).then(user => {
    if (user) {
      errors.email = "Email already Exists";
      return res.status(400).json(errors);
    } else {
      const avatar = gravtar.url(req.body.email, {
        s: "200",
        r: "pg",
        d: "mm"
      });

      const newUser = new User({
        name: req.body.name,
        email: req.body.email,
        avatar,
        password: req.body.password
      });

      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          if (err) throw err;
          newUser.password = hash;
          newUser
            .save()
            .then(user => res.json(user))
            .catch(err => console.log(err));
        });
      });
    }
  });
});

/**
 * @route POST /api/users/login
 * @description login
 * @access public
 */
router.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  User.findOne({ email }).then(user => {
    if (!user) {
      res.status(404).json({ email: "User not found" });
    }

    bcrypt.compare(password, user.password).then(iMatch => {
      if (!iMatch) {
        res.status(400).json({ password: "Password incorrect" });
      } else {
        const payload = { id: user.id, name: user.name, avatar: user.avatar };
        jwt.sign(
          payload,
          keys.secretOrKey,
          { expiresIn: 3600 },
          (err, token) => {
            res.json({
              success: true,
              token: "Bearer " + token
            });
          }
        );
      }
    });
  });
});

/**
 * @route GET api/users/current
 * @description current
 * @access private
 */

router.get(
  "/current",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    console.log(req);
    res.json({
      id: req.user.id,
      name: req.user.name,
      email: req.user.email
    });
  }
);

module.exports = router;

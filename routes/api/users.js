const express = require("express");
const router = express.Router();
const gravtar = require("gravatar");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Load User model
const User = require("../../models/User");
const keys = require("../../config/keys");

router.get("/test", (req, res) => {
  res.json({ mes: "users works" });
});

/**
 * @route GET api/users/register
 * @description register
 * @access public
 */
router.post("/register", (req, res) => {
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
 * @route /api/users/login
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
            console.log(keys.secretOrKey);
            res.json({
              success: true,
              token: "bearer " + token
            });
          }
        );
      }
    });
  });
});

module.exports = router;

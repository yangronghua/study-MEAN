const express = require("express");
const router = express.Router();
const passport = require("passport");
const Profile = require("../../models/profile");
const profileInputValidation = require("../../validation /profile");

router.get("/test", (req, res) => {
  res.json({ mes: "profile works" });
});

/**
 * @route GET api/profile
 * @description get profile
 * @access private
 */
router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const errors = {};
    Profile.findOne({ user: req.user.id })
      .populate("user", ["name", "avatar"])
      .then(profile => {
        if (!profile) {
          errors.noprofile = "There is no profile for this user";
          res.status(404).json(errors);
        }
        res.json(profile);
      })
      .catch(err => res.status(404).json(err));
  }
);

/**
 * @route GET api/profile/all
 * @description get all profile
 * @access public
 */
router.get("/all", (req, res) => {
  const errors = {};
  Profile.find()
    .populate("user", ["name", "avatar"])
    .then(profile => {
      if (!profile) {
        errors.noprofile = "There are no profile";
        res.status(404).json(errors);
      } else {
        res.json(profile);
      }
    })
    .catch(err => {
      res.status(404).json(err);
    });
});

/**
 * @route GET api/profile/user/:user_id
 * @description get profile by user
 * @access public
 */
router.get("/user/:user_id", (req, res) => {
  const errors = {};

  Profile.findOne({ user: req.params.user_id })
    .populate("user", ["name", "avatar"])
    .then(profile => {
      if (!profile) {
        errors.noprofile = "There is no profile for this user";
        res.status(404).json(errors);
      } else {
        res.json(profile);
      }
    })
    .catch(err => {
      res.status(404).json(errors);
    });
});

/**
 * @route GET api/profile/handle/:handle_id
 * @description get profile by handle
 * @access public
 */
router.get("/handle/:handle_id", (req, res) => {
  Profile.findOne({ handle: req.params.handle_id })
    .populate("user", ["name", "avatar"])
    .then(profile => {
      const errors = {};
      if (!profile) {
        errors.noprofile = "There is no profile for this handle";
        res.status(404).json(errors);
      } else {
        res.json(profile);
      }
    })
    .catch(err => {
      res.status(404).json(err);
    });
});

/**
 * @route POST api/profile
 * @description create or update profile
 * @access private
 */
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = profileInputValidation(req.body);
    //check validation
    if (!isValid) {
      res.status(400).json(errors);
    }

    //get fileds
    const profileFields = {};
    profileFields.user = req.user._id;
    if (req.body.handle) profileFields.handle = req.body.handle;
    if (req.body.company) profileFields.company = req.body.company;
    if (req.body.website) profileFields.website = req.body.website;
    if (req.body.location) profileFields.location = req.body.location;
    if (req.body.bio) profileFields.bio = req.body.bio;
    if (req.body.status) profileFields.status = req.body.status;
    if (req.body.githubusername)
      profileFields.githubusername = req.body.githubusername;
    if (typeof req.body.skills !== "undefined") {
      profileFields.skills = req.body.skills.split(",");
    }

    // Social
    profileFields.social = {};
    if (req.body.youtube) profileFields.social.youtube = req.body.youtube;
    if (req.body.twitter) profileFields.social.twitter = req.body.twitter;
    if (req.body.facebook) profileFields.social.facebook = req.body.facebook;
    if (req.body.linkedin) profileFields.social.linkedin = req.body.linkedin;
    if (req.body.instagram) profileFields.social.instagram = req.body.instagram;

    Profile.findOne({ user: req.user._id }).then(profile => {
      if (profile) {
        //update
        Profile.findOneAndUpdate(
          { user: req.user._id },
          { $set: profileFields },
          { new: true }
        ).then(profile => {
          res.json(profile);
        });
      } else {
        //create
        Profile.findOne({ handle: profileFields.handle }).then(profile => {
          if (profile) {
            errors.handle = "That handle already exists";
            res.status(400).json(errors);
          } else {
            new Profile(profileFields).save().then(profile => {
              res.json(profile);
            });
          }
        });
      }
    });
  }
);

//experience
/**
 * @route POST /api/profile/experience
 * @description create or update experience
 * @access private
 */
router.post(
  "/experience",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    //validate input
    const errors = {};
    Profile.findOne({ user: req.user._id })
      .then(profile => {
        const newExp = {
          title: req.body.title,
          company: req.body.company,
          location: req.body.location,
          from: req.body.from,
          to: req.body.to,
          current: req.body.current,
          description: req.body.description
        };
        // Add to exp array
        profile.experience.unshift(newExp);
        profile.save().then(profile => res.json(profile));
      })
      .catch(err => {
        res.status(400).json(err);
      });
  }
);

/**
 * @route DELETE /api/profile/experience/exp_id
 * @description delete experience
 * @access private
 */
router.delete(
  "/experience/:exp_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const errors = {};

    Profile.findOne({ user: req.user.id }) //experience 存在profile文件中，没有单独存储一个文件
      .then(profile => {
        const removeIndex = profile.experience
          .map(item => item.id)
          .indexOf(req.params.exp_id);
        console.log(removeIndex);
        //删除移除数据后存储
        profile.experience.splice(removeIndex, 1);
        profile.save().then(profile => res.json(profile));
      })
      .catch(err => {
        res.status(400).json(err);
      });
  }
);

//education
/**
 * @route POST /api/profile/education
 * @description create or update education
 * @access private
 */
router.post(
  "/education",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const errors = {};
    //TODO  Check Validation
    Profile.findOne({ user: req.user.id }).then(profile => {
      const newEdu = {
        school: req.body.school,
        degree: req.body.degree,
        fieldofstudy: req.body.fieldofstudy,
        from: req.body.from,
        to: req.body.to,
        current: req.body.current,
        description: req.body.description
      };

      // Add to edu array
      profile.education.unshift(newEdu);

      profile.save().then(profile => res.json(profile));
    });
  }
);

/**
 * @route DELETE /api/profile/education/edu_id
 * @description delete education
 * @access private
 */
router.delete(
  "/education/edu_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id })
      .then(profile => {
        // Get remove index
        const removeIndex = profile.education
          .map(item => item.id)
          .indexOf(req.params.edu_id);

        // Splice out of array
        profile.education.splice(removeIndex, 1);

        // Save
        profile.save().then(profile => res.json(profile));
      })
      .catch(err => res.status(404).json(err));
  }
);

module.exports = router;

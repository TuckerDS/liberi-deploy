const passport = require('passport');
const userModel = require('./userModel.js');
const sessionModel = require('../models/sessionModel.js');
const ObjectId = require('mongoose').Types.ObjectId;
const session = require("express-session");

// Bcrypt let us encrypt passwords
const bcrypt = require("bcryptjs");
const bcryptSalt = 10;

/**
 * userController.js
 *
 * @description :: Server-side logic for managing users.
 */
module.exports = {

  // TODO: for admin panel
  // // userController.list()
  // list: function(req, res) {
  //   userModel.find(function(err, users) {
  //     if (err) {
  //       return res.status(500).json({
  //         message: 'Error when getting user.',
  //         error: err
  //       });
  //     }
  //     return res.json(users);
  //   });
  // },

  // userController.show()
  show: function(req, res) {
    var id = req.params.id;
    userModel.findOne({
      _id: id
    }, function(err, user) {
      if (err) {
        return res.status(500).json({
          message: 'Error when getting user.',
          error: err
        });
      }
      if (!user) {
        return res.status(404).json({
          message: 'No such user'
        });
      }
      return res.json(user);
    });
  },

  // userController.update()
  update: function(req, res) {
    var id = req.params.id;
    userModel.findOne({
      _id: id
    }, function(err, user) {
      if (err) {
        return res.status(500).json({
          message: 'Error when getting user',
          error: err
        });
      }
      if (!user) {
        return res.status(404).json({
          message: 'No such user'
        });
      }

      user.username = req.body.username ? req.body.username : user.username;
      user.password = req.body.password ? bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(bcryptSalt)) : user.password;
      user.email = req.body.email ? req.body.email : user.email;
      user.role = req.body.role ? req.body.role : user.role;
      user.description = req.body.description ? req.body.description : user.description;

      user.save(function(err, user) {
        if (err) {
          return res.status(500).json({
            message: 'Error when updating user.',
            error: err
          });
        }

        return res.json(user);
      });
    });
  },

  // userController.remove()
  remove: function(req, res) {
    var id = req.params.id;
    userModel.findByIdAndRemove(id, function(err, user) {
      if (err) {
        return res.status(500).json({
          message: 'Error when deleting the user.',
          error: err
        });
      }
      return res.status(204).json();
    });
  },

  //AUTH user

  // userController.signup()
  signup: function(req, res, next) {
    console.log(req.body);
    var username = req.body.username;
    var password = req.body.password;
    var email = req.body.email;
    var role = req.body.role;
    var description = req.body.description;

    if (!username || !password) {
      res.status(400).json({
        message: "Provide username and password"
      });
      return;
    }

    userModel.findOne({
      username
    }, "username", (err, user) => {
      if (user !== null) {
        res.status(400).json({
          message: "The username already exists"
        });
        return;
      }

      var salt = bcrypt.genSaltSync(bcryptSalt);
      var hashPass = bcrypt.hashSync(password, salt);

      var newUser = userModel({
        username: username,
        password: hashPass,
        email: email,
        role: role,
        description: description
      });

      newUser.save((err) => {
        if (err) {
          res.status(400).json({
            message: "Something went wrong"
          });
        } else {
          req.login(newUser, function(err) {
            if (err) {
              console.log(err);
              return res.status(500).json({
                message: 'something went wrong :('
              });
            }
            res.status(200).json(req.user);
          });
        }
      });
    });
  },

  // userController.login()
  login: function(req, res, next) {
    passport.authenticate('local', function(err, user, info) {
      if (err) {
        return res.status(500).json({
          message: 'Something Wrong'
        });
      }
      if (!user) {
        return res.status(401).json(info);
      }

      req.login(user, function(err) {
        if (err) {
          return res.status(500).json({
            message: 'something went wrong :('
          });
        }

        let loggedUser = {
          _id: req.user._id,
          username: req.user.username,
          email: req.user.email,
          description: req.user.description,
          validated: req.user.validated,
          role: req.user.role
        };

        res.status(200).json({
          user: loggedUser,
          session: req.session,
          sID: req.sessionID
        });
      });
    })(req, res, next);
  },

  // userController.logout()
  logout: function(req, res) {
    let sID = req.body.sID;
    req.logout();
    sessionModel.findOneAndRemove({
      _id: sID
    }, (err, session) => {
      if (session) {
        res.status(200).json({
          message: 'Success logout of session ' + session
        });
      }
      if (err) {
        res.status(400).json("Error at logout" + err);
      }
    });
  },

  // userController.loggedin()
  loggedin: function(req, res) {
    let sID = req.body.sID;

    sessionModel.findOne({
      _id: sID
    }, (err, session) => {
      if (session !== null) {
        let userID = JSON.parse(session.session).passport.user;

        userModel.findOne({
          _id: userID
        }, (err, user) => {
          if (user) {
            let loggedUser = {
              _id: user._id,
              username: user.username,
              email: user.email,
              description: user.description,
              validated: user.validated,
              role: user.role
            };
            res.status(200).json({
              session,
              "user": loggedUser
            });
          }
          return;
        });
        return;
      } else {
        res.status(400).json({
          message: 'Unauthorized: Session do not exist'
        });
        return;
      }
      if (err) {
        res.status(400).json({
          message: 'Error checking LoggedIn'
        });
        return;
      }
    });
  },

  // userController.private()
  private: function(req, res) {
    if (req.isAuthenticated()) {
      return res.json({
        message: 'This is a private message'
      });
    }
    return res.status(403).json({
      message: 'Unauthorized'
    });
  }
};

var mongoose = require("mongoose");
var passport = require("passport");
var User = require("../models/user");

var userController = {};

// Restrict access to root page
userController.home = function(req, res) {
    console.log(req.user);
    if (req.user){
        res.render('index', { user : req.user });
    }else{
        res.render('indexNotAuth', { user : req.user });
    }  
};

// Go to registration page
userController.register = function(req, res) {
  res.render('createAccount');
};

// Post registration
userController.doRegister = function(req, res) {
    x = { username : req.body.username, name: req.body.name, email: req.body.email, currentClue: 1, pointsMarked: [1,1], adViews: [1], admin: false};
    console.log(x);
    User.register(new User(x), req.body.password, function(err, user) {
        if (err) {
            console.log(err);
            return res.render('createAccount', { user : user });
        }
        passport.authenticate('local')(req, res, function () {
        res.redirect('/');
    });
  });
};

// Go to login page
userController.login = function(req, res) {
  res.render('login');
};

// Post login
userController.doLogin = function(req, res) {
  passport.authenticate('local')(req, res, function () {
    res.redirect('/');
  });
};

// play screen
userController.play = function(req, res) {
    if (req.user){
      res.render('play');
    }else{
      res.render('notLogIn')
    }
  };

// logout
userController.logout = function(req, res) {
  req.logout();
  res.redirect('/');
};

module.exports = userController;
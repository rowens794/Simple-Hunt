var mongoose = require("mongoose");
var passport = require("passport");
var User = require("../models/user");
var Clue = require("../models/clue");
var supportFunctions = require("./SupportFunctions");

var userController = {};

// Restrict access to root page
userController.home = async function(req, res) {
    //get leader list
    list = await supportFunctions.getLeaders();

    if (req.user){
        if(req.user.admin){
            //render page
            res.render('indexAdmin', { user : req.user, leaderList: list });
        }else{
            res.render('index', { user : req.user, leaderList: list });
        }
    }else{
        res.render('indexNotAuth', { user : req.user, leaderList: list });
    }  
};

// Go to registration page
userController.register = async function(req, res) {
    //get leader list
    list = await supportFunctions.getLeaders();
    res.render('createAccount',{leaderList: list});
};

// Post registration
userController.doRegister = async function(req, res) {
    //get leader list
    list = await supportFunctions.getLeaders();

    //collect and store inputs appropriotely
    x = { username : req.body.username, name: req.body.name, email: req.body.email, currentClue: 1, pointsMarked: [1,1], adViews: [1], admin: false};
    //store the user in the database and redirect back to home page
    User.register(new User(x), req.body.password, function(err, user) {
        if (err) {
            console.log(err);
            return res.render('createAccount', { user : user, leaderList: list });
        }
        passport.authenticate('local')(req, res, function () {
        res.redirect('/');
    });
  });
};

// Login Controller
userController.login = async function(req, res) {
    //get leader list
    list = await supportFunctions.getLeaders();

    res.render('login',{leaderList: list});
};

userController.doLogin = function(req, res) {
  passport.authenticate('local')(req, res, function () {
    res.redirect('/');
  });
};

// logout
userController.logout = function(req, res) {
  req.logout();
  res.redirect('/');
};

module.exports = userController;
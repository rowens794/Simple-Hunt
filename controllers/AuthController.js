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
    console.log(req.user);

    if (req.user){
        if(req.user.admin){
            //render page
            res.render('LayoutD', { user : req.user, leaderList: list });
            //res.render('indexAdmin', { user : req.user, leaderList: list });
        }else{
            res.render('LayoutD', { user : req.user, leaderList: list });
            //res.render('index', { user : req.user, leaderList: list });
        }
    }else{
        res.render('LayoutD', { user : req.user, leaderList: list });
    }  
};


// login
userController.login = function(req, res) {
    if (req.user){
        res.redirect('/');
    }
    else{
        res.render('Login');
    }
};

//user login 
//userController.doLogin = function(req, res) {
//    passport.authenticate('local')(req, res, function () {
//      res.redirect('/');
//    });
//};

userController.doLogin = function(req, res, next) {
    passport.authenticate('local', function(err, user, info) {
        if (err) { 
            return res.redirect('/'); 
        }

        if (!user) { 
            console.log(info.message);
            return res.render("Login", {info: info.message}); 
        }

        req.logIn(user, function(err) {
            if (err) { return next(err); }
            return res.redirect('/');
        });
    })(req, res, next);
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
            return res.render('LayoutD', { user : user, leaderList: list });
        }
        passport.authenticate('local')(req, res, function () {
        res.redirect('/');
    });
  });
};

// rules
userController.rules = function(req, res) {
    res.render('Rules', { user : req.user });
};

// privacy
userController.privacy = function(req, res) {
    res.render('Privacy', { user : req.user });
};

// logout
userController.logout = function(req, res) {
    req.logout();
    res.redirect('/');
  };


// 404 error
userController.fourOfour = function(req, res) {
    res.render('404',{ user : req.user });
  };

module.exports = userController;
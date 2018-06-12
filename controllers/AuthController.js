var mongoose = require("mongoose");
var passport = require("passport");
var User = require("../models/user");
var Clue = require("../models/clue");
var supportFunctions = require("./SupportFunctions");
const mail = require("../handlers/mail");

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
            return res.render("Login", {info: info.message}); 
        }

        req.logIn(user, function(err) {
            if (err) { return next(err); }
            return res.redirect('/');
        });
    })(req, res, next);
};

userController.register = function(req, res, next) {
    res.render("Register");
};

//function takes in an unverified users hash and sets them = to verified
userController.verify = function(req, res, next) {
    hashID = req.params.acctHash;

    User.findOneAndUpdate({urlHash: hashID}, {verified: true, urlHash: ""}, function (err, user) {
        if (err){
            //something else when wrong
            res.render("404");
        }
        else{
            if (user == undefined){
                //if this is triggered then no user with this urlHash has been found
                res.render("404");
            }
            else{
                //TODO Replace with a rendered page
                res.send("it worked is confirmed!");
            }
        }
    })
};

// Post registration
userController.doRegister = async function(req, res) {
    //get leader list
    list = await supportFunctions.getLeaders();

    //collect and store inputs appropriotely
    urlHash = supportFunctions.getHash();
    x = { username : req.body.username, name: req.body.name, email: req.body.email, currentClue: 1, pointsMarked: [1,1], adViews: [1], admin: false, verified: false, urlHash: urlHash};
    
    // check that passwords match

    if (req.body.password != req.body.confirmPassword){
        console.log(req.body);
        res.render("Register", {error: 'Your password does not match', body: req.body});
    }
    else{
        //store the user in the database and redirect back to home page
        User.register(new User(x), req.body.password, function(err, user) {
            //check for the two possible errors (email in use & username taken)
            if (err) {
                if (err.code == 11000){
                    res.render("Register", {error: "The email "+ req.body.email + " is already being used", body: req.body});
                }
                else {
                    console.log(err);
                    console.log(req.body);
                    res.render("Register", {error: "The username "+ req.body.username + " is already taken", body: req.body});
                }
            }

            //send welcome email
            userInfo ={
                realName: req.body.name,
                username: req.body.username,
                urlHash: urlHash
            }

            const mailOptions = {
                from: "TheHunt <welcome@thehunt.com>",
                to: req.body.email,
                subject: "You Are In",
                html: "You are registered for the hunt and signed up as " + req.body.username +" click this link to verify account:" + urlHash + " .",
                text: "You are registered for the hunt - you text only tool."
            }

            mail.sendEmail(mailOptions);

            //authenticate new user with passport
            passport.authenticate('local')(req, res, function () {
                res.redirect('/');
            });
        });
    }
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
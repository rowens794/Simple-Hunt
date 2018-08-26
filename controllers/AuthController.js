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
    console.log("---user----");
    console.log(req.body);
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
            res.render("404", {user : req.user});
        }
        else{
            if (user == undefined){
                //if this is triggered then no user with this urlHash has been found
                res.render("404", {user : req.user});
            }
            else{
                //TODO Replace with a rendered page
                res.render("AcctVerified", {user : req.user});
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
    x = { username : req.body.username, name: req.body.name, email: req.body.email, huntsData: {}, currentClue: 1, pointsMarked: [1,1], adViews: [1], admin: false, verified: false, urlHash: urlHash};
    
    // check that passwords match

    if (req.body.password != req.body.confirmPassword){
        res.render("Register", {error: 'Your password does not match', body: req.body});
    }

    else if(req.body.username.includes(".")){
        res.render("Register", {error: 'Your username cannot contain a "  .  "', body: req.body});
    }

    else{
        //store the user in the database and redirect back to home page
        User.register(new User(x), req.body.password, function(err, user) {
            //check for the two possible errors (email in use & username taken)
            if (err) { //user entry is not valid
                if (err.code == 11000){
                    res.render("Register", {error: "The email "+ req.body.email + " is already being used", body: req.body});
                }
                else if(err.name = "UserExistsError"){
                    res.render("Register", {error: "The username "+ req.body.username + " is already taken", body: req.body});
                }
                else if(err){
                    console.log(err);
                    res.render("Register", {error: "The username "+ req.body.username + " is already taken", body: req.body});
                }
            }
            
            else { //user entry is valid
                //send welcome email
                const mailOptions = {
                    from: "TheHunt <welcome@charlestontreasurehunt.com>",
                    to: req.body.email,
                    subject: "You Are In - Verify Account",
                    html: "",
                    text: "",
                    filename: "verify-account",
                    realName: req.body.name,
                    username: req.body.username,
                    urlHash: urlHash,
                    resetURL: `http://${req.headers.host}/verify/${urlHash}`
                }

                mail.sendEmail(mailOptions);

                //authenticate new user with passport
                passport.authenticate('local')(req, res, function () {
                    res.redirect('/');
                });
            }
        });
    }
};

userController.reVerify = function (req, res){
    //if user logged in and account not verified then resend email
    console.log("------Here-------1");
    console.log(req.user);

    if (req.user.verified === false){
        //send welcome email
        const mailOptions = {
            from: "TheHunt <welcome@charlestontreasurehunt.com>",
            to: req.user.email,
            subject: "You Are In - Verify Account",
            html: "",
            text: "",
            filename: "verify-account",
            realName: req.user.name,
            username: req.user.username,
            urlHash: req.user.urlHash,
            resetURL: `http://${req.headers.host}/verify/${req.user.urlHash}`
        }
        console.log("------Here-------");
        console.log(mailOptions);

        mail.sendEmail(mailOptions);

        res.render("NewVerificationEmailSent", {user : req.user} );
    }

    //else redirect to play screen
    res.render("PlayD", {user : req.user});
}

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


// forgot password mechanism
userController.forgotPassword = function(req, res) {
    req.logout();
    res.render('ForgotPassword');
    };

userController.postForgotPassword = function(req, res) {
    //log user out just to be safe
    req.logout();
    console.log(req.body)


    User.findOne({email: req.body.email}, function (err, user) {
        if (err){
            //something else when wrong
            res.render("404");
        }
        else{
            if (user == undefined){
                //if this is triggered then no user with this email has been found
                res.render("EmailNotRegistered");
                }
            else{
                //generate hash and send password reset hash to users email
                passwordHash = supportFunctions.getHash();

                User.findById(user._id, function (err, user) {
                    if (err) res.send("an error occured updating the user");//throw and error if problem
                    
                    //update user variables in database
                    console.log(user);
                    user.passwordHash = passwordHash;//add password reset hash to user
                    user.save(function (err, user) {
                        if (err) res.send("an error occured updating the user");//throw and error if problem
                    
                        //send email with link to user
                        const mailOptions = {
                            from: "TheHunt <welcome@charlestontreasurehunt.com>",
                            to: user.email,
                            subject: "TheHunt: Password Reset",
                            html: "Password Reset",
                            text: "",
                            filename: "reset-password",
                            realName: user.name,
                            username: user.username,
                            passwordHash: passwordHash,
                            resetURL: `http://${req.headers.host}/resetpassword/${passwordHash}`
                        }
        
                        mail.sendEmail(mailOptions);
                        res.render("PasswordResetSent");
                    });
                });
            }
        }

    });
}

userController.resetPassword = function(req, res) {
    //collect password hash lookup value
    passwordHash = req.params.passwordHash;
    res.render("ResetPasswordForm", {passwordHash: passwordHash})
}

userController.resetPasswordExecute = function(req, res) {
    //collect password hash lookup value
    passwordHash = req.params.passwordHash;
    password = req.body.Password;
    confirmPassword = req.body.ConfirmPassword;

    if(passwordHash!= ""){
        User.findOneAndUpdate({passwordHash: passwordHash},{passwordHash: ""},  function (err, user) {
            if (err) res.render("ResetPasswordSuccess");//show success screen - user must have already updated

            else{
                if (password != confirmPassword){
                    //redisplay reset password form with notification
                    //TODO add notification
                    res.render("ResetPasswordForm", {passwordHash: passwordHash, notification:"Passwords do not match"})
                    }

                else{
                    if (user == null){
                        res.render("ResetPasswordSuccess");
                    }
                    else {
                        user.setPassword(password, function(){
                            user.save();
                            res.render("ResetPasswordSuccess");
                        });
                    }
                }
            }   
        });
    }
    else{
        //password hash = "" -> user must have updated show success
        res.render("ResetPasswordSuccess");
    }

};


// 404 error
userController.fourOfour = function(req, res) {
    //lookup the user with the input email address

    res.render('404',{ user : req.user });
  };

module.exports = userController;
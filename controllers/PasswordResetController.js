var mongoose = require("mongoose");
var passport = require("passport");
var User = require("../models/user");
var Clue = require("../models/clue");
var supportFunctions = require("./SupportFunctions");
const mail = require("../handlers/mail");

var passResetController = {};

// forgot password mechanism
passResetController.forgotPassword = function(req, res) {
    req.logout();
    res.render('ForgotPassword');
    };

passResetController.postForgotPassword = function(req, res) {
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
                            from: "TheHunt <welcome@thehunt.com>",
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

passResetController.resetPassword = function(req, res) {
    //collect password hash lookup value
    passwordHash = req.params.passwordHash;
    res.render("ResetPasswordForm", {passwordHash: passwordHash})
}

passResetController.resetPasswordExecute = function(req, res) {
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

module.exports = passResetController;
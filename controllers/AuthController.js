var mongoose = require("mongoose");
var passport = require("passport");
var User = require("../models/user");
var Clue = require("../models/clue");

var userController = {};

// Restrict access to root page
userController.home = function(req, res) {
    console.log(req.user);
    if (req.user){
        if(req.user.admin){
            res.render('indexAdmin', { user : req.user });
        }else{
            res.render('index', { user : req.user });
        }
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
    //collect and store inputs appropriotely
    x = { username : req.body.username, name: req.body.name, email: req.body.email, currentClue: 1, pointsMarked: [1,1], adViews: [1], admin: false};
    //store the user in the database and redirect back to home page
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

// Login Controller
userController.login = function(req, res) {
  res.render('login');
};

userController.doLogin = function(req, res) {
  passport.authenticate('local')(req, res, function () {
    res.redirect('/');
  });
};

// play screen
userController.play = function(req, res) {
    if (req.user){
        //get the users current clue
        userClueNum = req.user.currentClue;

        Clue.find({clueOrder: userClueNum}, function(err, clue){
            if (err){res.send("the database failed find the users current clue")}//err out if database call fails
            else{
                //return the corresponding clue
                res.render('play', { user : req.user, clue: clue[0]});
            }
        });
    }else{
        res.render('notLogIn')
    }
};

userController.playPost = function(req, res){
    if (req.user){
        //get the x/y coords
        userLat = req.body.lat;
        userLong = req.body.long;

        //get the clues coordinates and margin of error
        user = req.user;
        currentClue = req.user.currentClue;

        //make database call to get clue info
        Clue.find({clueOrder: currentClue}, function(err, clue){
            if (err){res.send("the database failed find the user's current clue")}//err out if database call fails
            else{
                clue = clue[0];
                clueLat = clue.clueLat;
                clueLong = clue.clueLong;
                margin = clue.marginOfError; //in feet
                convertedMargin = margin * .0000027397; //returns the margin in decimal notation
                
                //test the users lat and long against the clues location
                clueFound = false;
                console.log(Math.abs(userLat - clueLat));
                console.log(convertedMargin);

                if (Math.abs(userLat - clueLat) < convertedMargin && Math.abs(userLong - clueLong) < convertedMargin){
                    clueFound = true;
                    res.send("You found the clue")
                }else{
                    //you didn't find the clue
                    res.send("You didn't find the clue")
                }

                //if user found correct location then update database send success page


                //else send you didn't find it page
        
            }
        });

        
    }else{
        res.render('notLogIn') 
    }
}

// Manage Clues Controller -------------------------------------------------------------------------------
userController.manageClues = function(req, res) {
    //2 layer if statement: if authenticated then if admin == true, everyone else gets "not authorized"
    if (req.user){
        if (req.user.admin){
            //first collect the clues from the database and store them all to an object named 'clues'
            Clue.find({}, function(err, clues){
                if (err){res.send("the database failed to return a list of all clues")}//err out if database call fails
                else{
                    console.log(clues);
                    res.render('manageClues', { user : req.user, clues: clues });
                }
            });

        //both of the below else statments are triggered if the user is not logged in or not an admin
        }else{res.send('you are not authorized to view this page')}
    }else{res.send('you are not authorized to view this page')}
};


userController.createClue = function(req, res) {
    if (req.user){
        if (req.user.admin){
            resData = req.body;
            clue = new Clue;
            
            Clue.count({}, function(err, count){
                if (err){
                    res.send('something went wrong with the db when attempting to save clue')
                }else{
                clue.clueOrder = count + 1;
                clue.clueShortName = resData.shortName;
                clue.clueText = resData.clue;
                clue.clueText = resData.clue;
                clue.clueIMG = resData.imageLink;
                clue.clueLong = resData.yCord;
                clue.clueLat = resData.xCord;
                clue.marginOfError = resData.marginOfError;

                //save the clue to the database
                clue.save(function(err,saveObject){
                    if (err){
                        console.log(err);
                        res.send("oops something went wrong when trying to save the clue");
                    }else{
                        //first collect the clues from the database and store them all to an object named 'clues'
                        Clue.find({}, function(err, clues){
                            if (err){res.send("the database failed to return a list of all clues")}//err out if database call fails
                            else{
                                console.log(clues);
                                res.render('manageClues', { user : req.user, clues: clues });
                            }
                        });
                    }
                })
                }
            })

    //both of the below else statments are triggered if the user is not logged in or not an admin        
        }else{res.send('you are not authorized to view this page')}
    }else{res.send('you are not authorized to view this page')}
};
//---------------------------------------------------------------------------------------------------------------

// logout
userController.logout = function(req, res) {
  req.logout();
  res.redirect('/');
};

module.exports = userController;
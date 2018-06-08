var mongoose = require("mongoose");
var passport = require("passport");
var User = require("../models/user");
var Clue = require("../models/clue");
var supportFunctions = require("./SupportFunctions");

var playController = {};

// help screen
playController.help = async function(req, res) {
    //get leader list
    list = await supportFunctions.getLeaders();

    if (req.user){
        res.render('howToPlay', {leaderList: list})
    }else{
        res.render('howToPlayNA', {leaderList: list})
    }
      
};


// play screen
playController.play = async function(req, res) {
    //get leader list
    list = await supportFunctions.getLeaders();

    if (req.user){

        //get the users current clue
        userClueNum = req.user.currentClue;

        Clue.find({clueOrder: userClueNum}, function(err, clue){
            if (err){res.send("the database failed find the users current clue")}//err out if database call fails
            else{
                //return the corresponding clue
                res.render('PlayD', { user : req.user, clue: clue[0], leaderList: list});
            }
        });
    }else{
        res.render('notLoggedInD', {leaderList: list})
    }
};

playController.playPost = async function(req, res){
    //get leader list
    list = await supportFunctions.getLeaders();

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
                margin = clue[0].marginOfError;
                convertedMargin =  margin * .0000027397;

                clueResponseObj = {
                    clueNum: clue[0].clueOrder,
                    clueLat: clue[0].clueLat,
                    clueLong: clue[0].clueLong,
                    margin: clue[0].marginOfError, //in feet
                    convertedMargin: convertedMargin, //returns the margin in decimal notation
                    userLat: userLat,
                    userLong: userLong,
                    result: ""
                }

                //check if player found correct location
                if (Math.abs(userLat - clue[0].clueLat) < convertedMargin && Math.abs(userLong - clue[0].clueLong) < convertedMargin){
                    clueResponseObj.resultHeader = "Ahoy Matey";
                    clueResponseObj.result = "You've marked the location and are one step closer to the prize!";
                    
                    //update the user in the database
                    User.findById(user._id, function (err, user) {
                        if (err) res.send("an error occured updating the user");//throw and error if problem
                        
                        //update user variables
                        user.currentClue = clueResponseObj.clueNum + 1;
                        var pointMarkedTime = Date.now(); //create a date object
                        user.pointsMarked.push([userLat, userLong, pointMarkedTime]);//add time/loc to user array
                        user.lastClueFound = pointMarkedTime;
                        user.save(async function (err, user) {
                            //get leader list
                            list = await supportFunctions.getLeaders();

                            //render success page
                            if (err) res.send("an error occured updating the user");//throw and error if problem
                            res.render('xPressD', {clueResponseObj: clueResponseObj, leaderList: list});
                        });
                    });
                }else{

                    clueResponseObj.resultHeader = "Arrrrgh!!";
                    clueResponseObj.result = "You didn't find the clue. But that's ok, go get back in the hunt!";

                    User.findById(user._id, function (err, user) {
                        if (err) res.send("an error occured updating the user");//throw and error if problem
                        
                        //update user variables
                        var pointMarkedTime = Date.now(); //create a date object
                        user.pointsMarked.push([userLat, userLong, pointMarkedTime]);//add time/loc to user array
                        user.save(function (err, user) {
                          if (err) res.send("an error occured updating the user");//throw and error if problem
                          res.render('xPressD', {clueResponseObj: clueResponseObj, leaderList: list});
                        });
                    });
                }
            }
        });

        
    }else{
        res.render('notLoggedInD', {leaderList: list}) 
    }
}

module.exports = playController;
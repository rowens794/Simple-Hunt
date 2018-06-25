var mongoose = require("mongoose");
var passport = require("passport");
var User = require("../models/user");
var Clue = require("../models/clue");
var Game = require("../models/clue");
var supportFunctions = require("./SupportFunctions");

var playController = {};


// play screen
playController.play = async function(req, res) {
    //get leader list
    list = await supportFunctions.getLeaders();
    totalClues = await supportFunctions.getNumberOfClues();
    totalClues = totalClues.length

    if (req.user){

        //check if account is veriified
        if (req.user.verified){

            //get the users current clue
            userClueNum = req.user.currentClue;

            //check if user has won the hunt
            if (userClueNum > totalClues){
                res.render("HuntComplete", { user : req.user, leaderList: list, totalClues: totalClues});
            }

            else{
                Clue.find({clueOrder: userClueNum}, function(err, clue){
                    if (err){res.send("the database failed find the users current clue")}//err out if database call fails
                    else{
                        //return the corresponding clue
                        res.render(clue[0].clueType, { user : req.user, clue: clue[0], leaderList: list});
                    }
                });
            }
        }
        //if user is not verified let them know to do it
        else{
            res.render("NotVerified", { user : req.user });
        }

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

        //make database call to get clue info based on type of clue
        Clue.find({clueOrder: currentClue}, function(err, clue){
            console.log("-------Checking this 123-------");
            console.log(clue[0].clueType);

            if (err){res.send("the database failed find the user's current clue")}//err out if database call fails
            else{
                console.log("Check 2****************")
                console.log(clue[0].clueType);
                if (clue[0].clueType == "HotColdClue"){
                    hotColdClueCheck(req, res, clue);
                }else{
                    standardClueCheck(req, res, clue);
                }
            }
        
        });
    }    
}

module.exports = playController;


//-----non-exporting functions---------------//
standardClueCheck = function(req, res, clue) {

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
        
        //User didn't find the clue
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

hotColdClueCheck = function(req, res, clue) {
    console.log("hotColdCheck");

    margin = clue[0].marginOfError;
    convertedMargin =  margin * .0000027397;
    maxColdDistance = clue[0].clueOptions.maxColdDistance;

    clueResponseObj = {
        clueNum: clue[0].clueOrder,
        clueLat: clue[0].clueLat,
        clueLong: clue[0].clueLong,
        margin: clue[0].marginOfError, //in feet
        convertedMargin: convertedMargin, //returns the margin in decimal notation
        maxColdDistance: maxColdDistance, //returns the distance for max cold
        userLat: userLat,
        userLong: userLong,
        result: ""
    }

    //check if player found correct location
    if (Math.abs(userLat - clue[0].clueLat) < convertedMargin && Math.abs(userLong - clue[0].clueLong) < convertedMargin){
        clueResponseObj.resultHeader = "You Did It!";
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

        //THIS IS WHERE THE CODE NEEDS TO OCCUR
        //User didn't find the clue
        //calculate distance in feet from clue
        latDist = Math.abs(clueResponseObj.userLat - clueResponseObj.clueLat);
        longDist = Math.abs(clueResponseObj.userLong - clueResponseObj.clueLong);
        feetInDegree = 364000;
        distanceInFeet = Math.round((latDist**2 + longDist**2)**(1/2) * feetInDegree);

        if (distanceInFeet > maxColdDistance){
            temperatureDegrees = 0;
        }else{
            temperatureDegrees = Math.round((maxColdDistance - distanceInFeet) / maxColdDistance * 100);
        }

        height = temperatureDegrees / 100 * 29;
        margin = 29 - height + .5;

        console.log("margin: "+ margin + " height: " + height);

        //Determine the hotness of the user
        if (temperatureDegrees > 90){
            tempText = "You're on fire";
            mercuryTop = 'background-color: red; margin-top: ' + margin + 'vh; height: ' + height +'vh; box-shadow: 0px 0px 10px red;';
            mercuryBottom = 'background-color: red; margin-top: 0vh; height: 6.7vh; box-shadow: 0px 0px 10px red;';

        } else if (temperatureDegrees > 75){
            tempText = "You're Hot";
            mercuryTop = 'background-color: orange; margin-top: ' + margin + 'vh; height: ' + height +'vh; box-shadow: 0px 0px 10px orange;';
            mercuryBottom = 'background-color: orange; margin-top: 0vh; height: 6.7vh; box-shadow: 0px 0px 10px orange;';
        } else if (temperatureDegrees > 50){
            tempText = "You're Warm";
            mercuryTop = 'background-color: yellow; margin-top: ' + margin + 'vh; height: ' + height +'vh; box-shadow: 0px 0px 10px yellow;';
            mercuryBottom = 'background-color: yellow; margin-top: 0vh; height: 6.7vh; box-shadow: 0px 0px 10px yellow;';
        } else if (temperatureDegrees > 25){
            tempText = "You're Cold";
            mercuryTop = 'background-color: grey; margin-top: ' + margin + 'vh; height: ' + height +'vh; box-shadow: 0px 0px 10px grey;';
            mercuryBottom = 'background-color: grey; margin-top: 0vh; height: 6.7vh; box-shadow: 0px 0px 10px grey;';
        } else if (temperatureDegrees >= 0){
            tempText = "You're Freezing";
            mercuryTop = 'background-color: blue; margin-top: ' + margin + 'vh; height: ' + height +'vh; box-shadow: 0px 0px 10px blue;';
            mercuryBottom = 'background-color: blue; margin-top: 0vh; height: 6.7vh; box-shadow: 0px 0px 10px blue;';
        } else {
            tempText = "";
        }

        clueResponseObj.tempText = tempText;
        clueResponseObj.temperature = temperatureDegrees;
        clueResponseObj.mercuryTop = mercuryTop;
        clueResponseObj.mercuryBottom = mercuryBottom;

        User.findById(user._id, function (err, user) {
            if (err) res.send("an error occured updating the user");//throw and error if problem
            
            //update user variables
            var pointMarkedTime = Date.now(); //create a date object
            user.pointsMarked.push([userLat, userLong, pointMarkedTime]);//add time/loc to user array
            user.save(function (err, user) {
                if (err) res.send("an error occured updating the user");//throw and error if problem
                res.render('HotColdClue', {clueResponseObj: clueResponseObj, leaderList: list, clue: clue[0]});
            });
        });
    }
}
var mongoose = require("mongoose");
var User = require("../models/user");
var Clue = require("../models/clue");


var supportFunctions = {};

supportFunctions.getLeaders = function(){
    var leaderList;
    try{
        const leaderListQuery = User.find({}).sort({"currentClue": -1}).limit(5);
        leaderList = leaderListQuery.then();
        return leaderList;
    }catch(err){
        return err;
    }
}

supportFunctions.getNumberOfClues = async function(){
    var NumberOfClues;
    try{
        const NumberOfCluesQuery = Clue.find({});
        NumberOfClues = NumberOfCluesQuery.then();
        return NumberOfClues;
    }catch(err){
        return err;
    }
}

supportFunctions.getPlayers = function(){
    var playerList;
    try{
        const playerListQuery = User.find({}).sort({"currentClue": -1}).limit(100);
        playerList = playerListQuery.then();
        return playerList;
    }catch(err){
        return err;
    }
}

supportFunctions.getHash = function () {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  
    for (var i = 0; i < 55; i++)
      text += possible.charAt(Math.floor(Math.random() * possible.length));
  
    return text;
  }

supportFunctions.hotColdClueCheck = async function(req, res, clue, pointMarkedTime) {

    margin = clue.marginOfError;
    convertedMargin =  margin * .0000027397;
    maxColdDistance = clue.maxCold;

    clueResponseObj = {
        clueNum: clue.clueOrder,
        clueLat: clue.clueLat,
        clueLong: clue.clueLong,
        margin: clue.marginOfError, //in feet
        convertedMargin: convertedMargin, //returns the margin in decimal notation
        maxColdDistance: maxColdDistance, //returns the distance for max cold
        userLat: req.body.lat,
        userLong: req.body.long,
        result: ""
    }

    //check if player found correct location
    if (Math.abs(userLat - clue.clueLat) < convertedMargin && Math.abs(userLong - clue.clueLong) < convertedMargin){
        console.log("user Found clue");

        //set response object
        clueResponseObj = responseGenerator('positive');

        //update hunt info with user
        timeFound = new Date().getTime(),
        await huntUpdateClueFound(huntID, user.username, currentClue + 1, timeFound);
        list = await getLeaders(huntID);

        
        //update the user in the database
        User.findById(user._id, function (err, user) {
            if (err) res.send("an error occured updating the user");//throw and error if problem
            
            //update the huntsData entry
            updatedHuntsData = user.huntsData;
            updatedHuntsData[req.params.huntID].markedLocations.push([userLat, userLong, pointMarkedTime]);
            updatedHuntsData[req.params.huntID].foundLocations.push([userLat, userLong, pointMarkedTime]);
            updatedHuntsData[req.params.huntID].userClueNumber = updatedHuntsData[req.params.huntID].userClueNumber + 1;

            //set the changes to the user
            user.markModified('huntsData');//must inform mongoose that huntsData has been modified
            user.set({ huntsData: updatedHuntsData });
            user.save();

            //set response object
            const clueResponseObj = {};
            clueResponseObj.resultHeader = "You Did It!";
            clueResponseObj.result = "You've marked the location and are one step closer to the prize!";
            clueResponseObj.huntUrl = "/play2/" + huntID;
            clueResponseObj.userUrl = "/play/" + user.username;

            //render success page
            if (err) res.send("an error occured updating the user");//throw and error if problem
            res.render('xPressExp', {user: user, clueResponseObj: clueResponseObj, leaderList: list});  //else it worked fine
        });
    }
    
    else{
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
        clueResponseObj.huntUrl = "/play2/" + huntID;
        clueResponseObj.userUrl = "/play/" + user.username;

        console.log(clueResponseObj);

        //user did not find the clue
        console.log("User did not find the clue");
                
        //get leaderlist
        list = await getLeaders(huntID);
        console.log(list);

        
        //update the user in the database
        User.findById(user._id, function (err, user) {
            if (err) res.send("an error occured updating the user");//throw and error if problem

            //update the entire huntsData entry
            updatedHuntsData = user.huntsData;
            updatedHuntsData[req.params.huntID].markedLocations.push([userLat, userLong, pointMarkedTime]);
            
            //set the changes to the user
            user.markModified('huntsData');//must inform mongoose that huntsData has been modified
            user.set({ huntsData: updatedHuntsData });
            
            user.save(async function (err, user) {
                if (err) res.send("an error occured updating the user");//throw and error if problem

                //rerender HotColdClue 
                res.render('HotColdClue', {user: user, clueResponseObj: clueResponseObj, leaderList: list, clue: clue});
                //res.render('xPressExp', {user: user, clueResponseObj: clueResponseObj, leaderList: list});  //else it worked fine
            });
        });
    }
}

module.exports = supportFunctions;
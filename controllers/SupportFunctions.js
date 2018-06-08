var mongoose = require("mongoose");
var User = require("../models/user");


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

module.exports = supportFunctions;
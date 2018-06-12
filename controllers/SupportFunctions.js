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

supportFunctions.getHash = function () {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  
    for (var i = 0; i < 55; i++)
      text += possible.charAt(Math.floor(Math.random() * possible.length));
  
    return text;
  }

module.exports = supportFunctions;
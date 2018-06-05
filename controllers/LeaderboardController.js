var mongoose = require("mongoose");
var passport = require("passport");
var User = require("../models/user");
var Clue = require("../models/clue");
var supportFunctions = require("./SupportFunctions");

var leaderboardController = {};

// help screen
leaderboardController.leaderboard = async function(req, res) {
    //get leader list
    list = await supportFunctions.getPlayers();

    res.render('LeaderboardD', {playerList: list, user : req.user})
};

module.exports = leaderboardController;
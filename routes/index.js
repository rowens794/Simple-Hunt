var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var auth = require("../controllers/AuthController.js");
var manage = require("../controllers/ManageController.js");
var play = require("../controllers/PlayController.js");
var leaderboard = require("../controllers/LeaderboardController.js");

// restrict index for logged in user only
router.get('/', auth.home);

// route to register page
router.get('/register', auth.register);
router.post('/register', auth.doRegister);

// route to register page
router.get('/verify/:acctHash', auth.verify);
router.get('/resendverificationemail', auth.reVerify);

// route to sign in
router.get('/login', auth.login);
router.post('/login', auth.doLogin);

// route for play action
router.get('/play', play.play);
router.post('/play', play.playPost);

// route for manage clues
router.get('/clues', manage.manageClues);
router.post('/clues', manage.createClue);

// route for leaderboard
router.get('/leaderboard', leaderboard.leaderboard);

// route for logout action
router.get('/logout', auth.logout);

// rules/privacy
router.get('/rules', auth.rules);
router.get('/privacy', auth.privacy);

//404 error page --ALWAYS KEEP LAST--
router.get('*', auth.fourOfour);

module.exports = router;
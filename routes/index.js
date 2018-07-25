var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var auth = require("../controllers/AuthController.js");
var manage = require("../controllers/ManageController.js");
var play = require("../controllers/PlayController.js");
var resetPass = require("../controllers/PasswordResetController.js");
var leaderboard = require("../controllers/LeaderboardController.js");
var expiramental = require("../controllers/ExpController.js");
var maps = require("../controllers/MapController.js");

// restrict index for logged in user only
router.get('/', expiramental.home);  //introduced expiramental features rollback to ** router.get('/', auth.home);

// route to register page
router.get('/register', auth.register);
router.post('/register', auth.doRegister);

// route to verify pages
router.get('/verify/:acctHash', auth.verify);
router.get('/resendverificationemail', auth.reVerify);

// route to sign in
router.get('/login', auth.login);
router.post('/login', auth.doLogin);

// forgot password routes
router.get('/forgotpassword', resetPass.forgotPassword);
router.post('/forgotpassword', resetPass.postForgotPassword);
router.get('/resetpassword/:passwordHash', resetPass.resetPassword);
router.post('/resetpassword/:passwordHash', resetPass.resetPasswordExecute);

// route for play action
router.get('/play', play.play);
router.post('/play', play.playPost);

// route for manage clues
router.get('/clues', manage.manageClues);
router.post('/clues', manage.createClue);

// route for leaderboard
//router.get('/leaderboard', leaderboard.leaderboard);

// route for maps
router.get('/maps', maps.showMapExpiramental);

// route for logout action
router.get('/logout', auth.logout);

// rules/privacy
router.get('/rules', auth.rules);
router.get('/privacy', auth.privacy);

// expiramental
//router.get('/exp-home', expiramental.home); //generates a new home page whether logged in or not **IN USE
router.get('/manageHunts', expiramental.manageHunts);  //generates a page for admin to create/edit hunts
router.get('/manageHunts/map/:huntID', maps.showMapExpiramental);  //generates a page for admin to create/edit hunts

router.get('/editHunt', expiramental.editNewHunt); //generates a page for admin to edit individual hunt 
router.get('/editHunt/:huntID', expiramental.editExistingHunt); //generates a page for admin to edit individual hunt 
router.post('/editHunt', expiramental.saveNewHunt);  //url to post to save changes to a new individual hunt 
router.post('/editHunt/:huntID', expiramental.updateHunt);  //url to post to save changes to and existing individual hunt 
router.post('/createClue/:huntID', expiramental.createClue);  //url to post to save changes to and existing individual hunt 
router.get('/editHunt/:huntID/deletehunt/',expiramental.deleteExistingHunt);//url to delete a hunt

router.get('/hunt/:huntID', expiramental.huntPage);  //display information about an individual hunt

router.get('/play/:username', expiramental.userPage);  // generates individual user dashboard of hunts and user info
router.post('/play/:username', expiramental.feedback);  // post feedback to user dashboard
router.get('/play2/:huntID', expiramental.play);  // play page for individual hunt
router.post('/play2/:huntID', expiramental.playSubmit);  // post response to clue

router.post('/resetpassword', expiramental.updatePassword);  // post updated password

//404 error page --ALWAYS KEEP LAST--
router.get('*', auth.fourOfour);

module.exports = router;
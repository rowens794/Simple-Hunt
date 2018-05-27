var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var auth = require("../controllers/AuthController.js");
var manage = require("../controllers/ManageController.js");
var play = require("../controllers/PlayController.js");

// restrict index for logged in user only
router.get('/', auth.home);

// route to register page
router.get('/register', auth.register);
router.post('/register', auth.doRegister);

// route to login page
router.get('/login', auth.login);
router.post('/login', auth.doLogin);

// route for help action
router.get('/help', play.help);

// route for play action
router.get('/play', play.play);
router.post('/play', play.playPost);

// route for manage clues
router.get('/clues', manage.manageClues);
router.post('/clues', manage.createClue);

// route for logout action
router.get('/logout', auth.logout);

module.exports = router;
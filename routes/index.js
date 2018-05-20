var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var auth = require("../controllers/AuthController.js");

// restrict index for logged in user only
router.get('/', auth.home);

// route to register page
router.get('/register', auth.register);
router.post('/register', auth.doRegister);

// route to login page
router.get('/login', auth.login);
router.post('/login', auth.doLogin);

// route for play action
router.get('/play', auth.play);

// route for manage clues
router.get('/clues', auth.manageClues);
router.post('/clues', auth.createClue);

// route for logout action
router.get('/logout', auth.logout);

module.exports = router;
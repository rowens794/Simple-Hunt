var mongoose = require("mongoose");

var playController = {};

// logout
playController.play = function(req, res) {
  if (req.user){
    res.render('/play');
  }else{
    res.render('/notLogIn')
  }
};

module.exports = playController;
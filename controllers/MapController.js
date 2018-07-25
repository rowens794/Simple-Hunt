var mongoose = require("mongoose");
var passport = require("passport");
var User = require("../models/user");
var Clue = require("../models/clue");

var mapController = {};

// Manage Clues Controller -------------------------------------------------------------------------------
mapController.showMap = function(req, res) {
    //2 layer if statement: if authenticated then if admin == true, everyone else gets "not authorized"
    if (req.user){
        
        if (req.user.admin){

            //first collect the clues from the database and store them all to an object named 'clues'
            User.find({}, function(err, users){
                gpsPoints = [];
                
                for (i=0; i < users.length; i++ ) {
                    for (j=0; j < users[i].pointsMarked.length; j++ ){
                        if (users[i].pointsMarked[j] != 1){
                            point = []
                            point.push(Number(users[i].pointsMarked[j].slice(0, 1)));
                            point.push(Number(users[i].pointsMarked[j].slice(1, 2)));
                            gpsPoints.push(point);
                        } 
                    }
                }


                if (err){res.send("the database failed to return a list of all users")}//err out if database call fails
                else{
                    res.render('Maps', { user : req.user, locations : gpsPoints });
                }
            });

        //both of the below else statments are triggered if the user is not logged in or not an admin
        }else{res.render('404')}
    }else{res.render('404')}
};


mapController.showMapExpiramental = function(req, res) {
    //2 layer if statement: if authenticated then if admin == true, everyone else gets "not authorized"
    if (req.user){
        if (req.user.admin){
            huntID = req.params.huntID;

            //first collect the users from the database
            User.find({}, function(err, users){
                gpsPoints = [];

                for (key in Object.keys(users)){ // grab a user from list of users
                    user = users[key]
                    hunts = user.huntsData;

                    if(hunts){ // grab a hunt from the user
                        keys = Object.keys(hunts);

                        for (i=0; i<keys.length; i++){
                            if(hunts[keys[i]]){ //if hunt data exists
                                
                                for (j=0; j<hunts[keys[i]].markedLocations.length; j++){ //grab a location from list of marked locations
                                    location = hunts[keys[i]].markedLocations[j];
                                    point = []
                                    point.push(Number(location.slice(0, 1)));
                                    point.push(Number(location.slice(1, 2)));
                                    gpsPoints.push(point);
                                }
                            } 
                        }
                    }
                }   

                if (err){res.send("the database failed to return a list of all users")}//err out if database call fails

                else{
                    res.render('Maps', { user : req.user, locations : gpsPoints });
                }
            });

        //both of the below else statments are triggered if the user is not logged in or not an admin
        }else{res.render('404')}
    }else{res.render('404')}
};



module.exports = mapController;
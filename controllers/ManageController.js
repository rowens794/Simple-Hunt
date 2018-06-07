var mongoose = require("mongoose");
var passport = require("passport");
var User = require("../models/user");
var Clue = require("../models/clue");

var manageController = {};

// Manage Clues Controller -------------------------------------------------------------------------------
manageController.manageClues = function(req, res) {
    //2 layer if statement: if authenticated then if admin == true, everyone else gets "not authorized"
    if (req.user){
        
        if (req.user.admin){

            //first collect the clues from the database and store them all to an object named 'clues'
            Clue.find({}, function(err, clues){
                if (err){res.send("the database failed to return a list of all clues")}//err out if database call fails
                else{
                    console.log(clues);
                    res.render('manageCluesD', { user : req.user, clues: clues });
                }
            });

        //both of the below else statments are triggered if the user is not logged in or not an admin
        }else{res.send('you are not authorized to view this page')}
    }else{res.send('you are not authorized to view this page')}
};


manageController.createClue = function(req, res) {
    if (req.user){
        if (req.user.admin){

            resData = req.body;
            clue = new Clue;
            
            Clue.count({}, function(err, count){
                if (err){
                    res.send('something went wrong with the db when attempting to save clue')
                }else{
                clue.clueOrder = count + 1;
                clue.clueShortName = resData.shortName;
                clue.clueText = resData.clue;
                clue.clueText = resData.clue;
                clue.clueIMG = resData.imageLink;
                clue.clueLong = resData.yCord;
                clue.clueLat = resData.xCord;
                clue.marginOfError = resData.marginOfError;

                //save the clue to the database
                clue.save(function(err,saveObject){
                    if (err){
                        console.log(err);
                        res.send("oops something went wrong when trying to save the clue");
                    }else{
                        //first collect the clues from the database and store them all to an object named 'clues'
                        Clue.find({}, function(err, clues){
                            if (err){res.send("the database failed to return a list of all clues")}//err out if database call fails
                            else{
                                console.log(clues);
                                res.render('manageCluesD', { user : req.user, clues: clues });
                            }
                        });
                    }
                })
                }
            })

    //both of the below else statments are triggered if the user is not logged in or not an admin        
        }else{res.send('you are not authorized to view this page')}
    }else{res.send('you are not authorized to view this page')}
};
//---------------------------------------------------------------------------------------------------------------

module.exports = manageController;
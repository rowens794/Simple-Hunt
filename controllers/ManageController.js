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
        }else{res.render('404')}
    }else{res.render('404')}
};

manageController.createClue = function(req, res) {
    if (req.user){
        if (req.user.admin){
            resData = req.body;
            console.log(resData);
            if(resData.clueType == "BasicClue"){
                basicClue(req, res, resData);
            }else if(resData.clueType == "MultiImgClue"){
                MultiImgClue(req, res, resData);
            }


    //both of the below else statments are triggered if the user is not logged in or not an admin        
        }else{res.render('404')}
    }else{res.render('404')}
};
//---------------------------------------------------------------------------------------------------------------

module.exports = manageController;


//--- Non-exported Functions ---------------------------------------------------------------------------------------------------

basicClue = function(req, res, resData){
    clue = new Clue;
            
    Clue.count({}, function(err, count){
        if (err){
            res.send('something went wrong with the db when attempting to save clue')
        }else{
            clue.clueOrder = count + 1;
            clue.clueShortName = resData.shortName;
            clue.clueText = resData.clue;
            clue.clueIMG = resData.imageLink;
            clue.clueLong = resData.yCord;
            clue.clueLat = resData.xCord;
            clue.marginOfError = resData.marginOfError;
            clue.clueType = resData.clueType;

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
                            res.render('manageCluesD', { user : req.user, clues: clues });
                        }
                    });
                }
            })
        }
    })
}

MultiImgClue = function(req, res, resData){
    clue = new Clue;
            
    Clue.count({}, function(err, count){
        if (err){
            res.send('something went wrong with the db when attempting to save clue')
        }else{
            clue.clueOrder = count + 1;
            clue.clueShortName = resData.shortName;
            clue.clueText = resData.clue;
            clue.clueLong = resData.yCord;
            clue.clueLat = resData.xCord;
            clue.marginOfError = resData.marginOfError;
            clue.clueType = resData.clueType;
            clue.clueOptions.imgs = resData.imageLink;
            
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
                            res.render('manageCluesD', { user : req.user, clues: clues });
                        }
                    });
                }
            })
        }
    })
}
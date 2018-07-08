var mongoose = require("mongoose");
var passport = require("passport");
var User = require("../models/user");
var Clue = require("../models/clue");
var Hunt = require("../models/hunts");
var supportFunctions = require("./SupportFunctions");
const mail = require("../handlers/mail");
var ObjectId = mongoose.Types.ObjectId 

var expController = {};

// new home page
expController.home = async function(req, res) {
    //get leader list
    hunts = await getHunts();
    res.render('LayoutExp', { user : req.user, hunts: hunts });
};

// hunt specific info page
expController.huntPage = async function(req, res) {
    //get leader list
    huntID = req.params;
    console.log(huntID);
    hunt = await getHuntsByID(huntID);
    console.log(hunt);

    res.render('HuntPage', { user : req.user, hunt : hunt[0] });
};

// user specific play page
expController.userPage = async function(req, res) {
    if (req.user){  //check if user is signed in
        if (req.params.username == req.user.username){  //check if user is attempting to access their own page
            res.render('UserDash', { user : req.user });
        }else{
            res.render('404', { user : req.user });
        }
    }else{
        res.render('404', { user : req.user });
    } 
};


expController.manageHunts = async function(req, res) {

    hunts = await getHunts();
    res.render('ManageHunts', { user : req.user, hunts });

    /*
    if (req.user){
        if(req.user.admin){
            //render page
            res.render('ManageHunts', { user : req.user });
        }else{
            res.render('404', { user : req.user });
        }
    }else{
        res.render('404', { user : req.user });
    }  
    */
};

//post to createhunts
expController.saveNewHunt = async function(req, res) {
    hunt = new Hunt(req.body);

    //Send new hunt data to database
    hunt.save(function(err, huntDetails){
        if (err){ //something went wrong with the database save
            res.render('error', {user : req.user})
        }else{ //everything worked correctl
            res.render('EditHunt', { user : req.user , huntDetails });
        }
    })  
};

expController.updateHunt = async function(req, res) {
    huntID = req.params.huntID;
    huntDetails = req.body;

    Hunt.findById(huntID, function (err, hunt) {
        if (err) res.send("an error occured finding hunt ID: " + huntID);//throw and error if problem
        //update user variables
        hunt.huntName = huntDetails.huntName;
        hunt.difficulty = huntDetails.difficulty;
        hunt.startDate = huntDetails.startDate;
        hunt.cardPicture = huntDetails.cardPicture;
        hunt.headerPicture = huntDetails.headerPicture;
        hunt.mapAreaPicture = huntDetails.mapAreaPicture;
        hunt.huntDescription = huntDetails.huntDescription;
        hunt.huntStory = huntDetails.huntStory;

        hunt.save(async function (err, hunt) {
            //render success page
            if (err) res.send("an error occured updating the hunt");//throw and error if problem
            res.render('EditHunt', { user : req.user, huntDetails: hunt });
        });
    });
};

expController.editNewHunt = async function(req, res) {
    res.render('EditNewHunt', { user : req.user });

    /* Don't require login during development
    if (req.user){
        if(req.user.admin){
            //render page
            res.render('EditHunt', { user : req.user });
        }else{
            res.render('404', { user : req.user });
        }
    }else{
        res.render('404', { user : req.user });
    }
    */
};

expController.editExistingHunt = async function(req, res) {
    huntID = req.params;
    huntDetails = await getHuntsByID(huntID);
    res.render('EditHunt', { user : req.user, huntDetails: huntDetails[0] });

    /* Don't require login during development
    if (req.user){
        if(req.user.admin){
            //render page
            res.render('EditHunt', { user : req.user });
        }else{
            res.render('404', { user : req.user });
        }
    }else{
        res.render('404', { user : req.user });
    }
    */
};


expController.createClue = async function(req, res) {
    huntID = req.params;
    resData = req.body;

    //get the hunt
    huntDetails = await getHuntsByID(huntID);
    huntDetails = huntDetails[0];

    console.log(resData);

    //update the clue object
    if(resData.clueType == "BasicClue"){
        newClue = basicClue(resData, huntDetails);
    }else if(resData.clueType == "MultiImgClue"){
        newClue = multiImgClue(resData, huntDetails);
    }else if(resData.clueType == "HotColdClue"){
        newClue = hotColdClue(resData, huntDetails);
    }

    console.log("----------------------------------------------------------");
    console.log("----------------------------------------------------------");
    console.log(newClue);

    //add clue to clues array
    console.log("----------------------------------------------------------");
    console.log("----------------------------------------------------------");
    console.log(huntDetails.clues);
    huntDetails.clues.push(newClue);
    

    console.log("----------------------------------------------------------");
    console.log("----------------------------------------------------------");
    console.log(huntDetails);
    console.log("----------------------------------------------------------");
    console.log("----------------------------------------------------------");

    //save the clue object back to the hunt
    huntDetails.save();

    //redirect back to the edit hunt page
    res.redirect('/editHunt/'+huntID.huntID);

    /* Don't require login during development
    if (req.user){
        if(req.user.admin){
            //render page
            res.render('EditHunt', { user : req.user });
        }else{
            res.render('404', { user : req.user });
        }
    }else{
        res.render('404', { user : req.user });
    }
    */
};

expController.deleteExistingHunt = async function(req, res) {
    huntID = req.params.huntID;
    resVar = await deleteHuntByID(huntID);
    res.redirect('/ManageHunts');

    /* Don't require login during development
    if (req.user){
        if(req.user.admin){
            //render page
            res.render('EditHunt', { user : req.user });
        }else{
            res.render('404', { user : req.user });
        }
    }else{
        res.render('404', { user : req.user });
    }
    */
};

module.exports = expController;

//gets all hunts and returns an object of hunts
getHunts = function(huntID){
    var huntList;
    try{
        const huntListQuery = Hunt.find({});
        huntList = huntListQuery.then();
        return huntList;
    }catch(err){
        return err;
    }
}

getHuntsByID = function(huntID){
    var huntList;
    try{
        const huntListQuery = Hunt.find({"_id" : (huntID.huntID)});
        huntList = huntListQuery.then();
        return huntList;
    }catch(err){
        return err;
    }
}

deleteHuntByID = function(huntID){
    Hunt.deleteOne({ "_id": huntID }, function (err) {
        if (err) return "something went wrong deleting the hunt";
        // deleted at most one hunt document
    });
}


//--- Non-exported Functions ---------------------------------------------------------------------------------------------------

basicClue = function(resData, huntDetails){
    //create a clue object
    clue = {};

    //establish the position of the clue
    if (huntDetails.clues){
        clue.clueOrder = huntDetails.clues.length + 1;
    } else{
        clue.clueOrder = 1;
    }
    //save info to the clue object
    clue.clueShortName = resData.shortName;
    clue.clueText = resData.clue;
    clue.clueIMG = resData.imageLink;
    clue.clueLong = resData.yCord;
    clue.clueLat = resData.xCord;
    clue.marginOfError = resData.marginOfError;
    clue.clueType = resData.clueType;

    return clue;
}

multiImgClue = function(resData, huntDetails){
    //create a clue object
    clue = {};

    //establish the position of the clue
    if (huntDetails.clues){
        clue.clueOrder = huntDetails.clues.length + 1;
    } else{
        clue.clueOrder = 1;
    }

    //save info to the clue object
    clue.clueShortName = resData.shortName;
    clue.clueText = resData.clue;
    clue.imgs = resData.imageLink;
    clue.clueLong = resData.yCord;
    clue.clueLat = resData.xCord;
    clue.marginOfError = resData.marginOfError;
    clue.clueType = resData.clueType;

    return clue;
}

hotColdClue = function(resData, huntDetails){
    //create a clue object
    clue = {};

    //establish the position of the clue
    if (huntDetails.clues){
        clue.clueOrder = huntDetails.clues.length + 1;
    } else{
        clue.clueOrder = 1;
    }
            
    //save info to the clue object
    clue.clueShortName = resData.shortName;
    clue.clueText = resData.clue;
    clue.clueIMG = resData.imageLink;
    clue.clueLong = resData.yCord;
    clue.clueLat = resData.xCord;
    clue.maxCold = resData.maxCold;
    clue.marginOfError = resData.marginOfError;
    clue.clueType = resData.clueType;

    return clue;
}
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
expController.test = async function(req, res) {
    //get leader list
    hunts = await getHunts();
    res.render('ClueFound', { user : req.user, hunts: hunts });
};

// new home page
expController.home = async function(req, res) {
    //get leader list
    hunts = await getHunts();
    res.render('LayoutExp', { user : req.user, hunts: hunts });
};

// hunt specific info page
expController.huntPage = async function(req, res) {
    huntID = req.params;
    hunt = await getHuntsByID(huntID);
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

// user specific play page
expController.play = async function(req, res) {

    huntID = {};
    huntID.huntID = req.params.huntID; //need to convert the id string into a pseudo huntID object for the function to work.
    hunt = await getHuntsByID(huntID);
    hunt = hunt[0];   
    currentTime = new Date().getTime();
    huntTime = new Date(hunt.startDate).valueOf()
    huntLength = hunt.clues.length;
    console.log(req.user);

    //Check number 1 - make sure user is logged in
    if (!req.user){
        console.log("Failed Check 1");
        res.render("404", { user : req.user});
    }
    
    //Check number 2 - verify that the user has verified their email address
    else if (req.user.verified == false){
        console.log("Failed Check 1");
        res.render("NotVerified", { user : req.user});
    }

    //Check number 3 - verify that hunt has started
    else if (huntTime > currentTime){
        console.log("Failed Check 2");
        res.render("HuntNotLive", { user : req.user, hunt : hunt});
    }

    //check number 4 - verify that hunter has not already completed the hunt
    else if(!!req.user.huntsData){
        console.log("1-------------------------");
        if (!!req.user.huntsData[huntID.huntID]){
            console.log("2-------------------------");
            if (req.user.huntsData[huntID.huntID].userClueNumber > huntLength){ //verify that it's not the users first time accessing any hunts to prevent "undefined" error
                console.log("Failed Check 3");
                //set response object
                const clueResponseObj = {};
                clueResponseObj.resultHeader = "You've Finished the Hunt!";
                clueResponseObj.result = "Way to go! You've finished the entire hunt.  We hope you had a blast";
                clueResponseObj.huntUrl = "/";
                clueResponseObj.userUrl = "/play/" + req.user.username;
                
                //get leaders
                list = await getLeaders(huntID.huntID);

                //render success page
                res.render('xPressFinished', {user: req.user, clueResponseObj: clueResponseObj, leaderList: list});  //else it worked fine
            }
            else{
                console.log("duplicate final if statement");
                //hunt is already in users library -- just render it

                userClueNumber = req.user.huntsData[huntID.huntID].userClueNumber;
                clueData = hunt.clues[userClueNumber - 1] //collect clue data
                console.log("------------------------");
                console.log(clueData);
                res.render(clueData.clueType, { user : req.user, clue: clueData});
            }
        }
    }

    //get user clue number
    else if (req.user.huntsData == undefined || req.user.huntsData[huntID.huntID] == undefined ) { //if hunt doesn't exit in user account then create an object
        console.log("get user clue number");
        huntsData = {
            userClueNumber: 1,
            startTime: new Date().getTime(),
            endTime: undefined,
            markedLocations: [],
            foundLocations: []
        }

        saveRegistration(req); //save users registration to hunt DB

        User.findById(req.user._id, function (err, user) {
            if (err) res.send("an error occured updating the user");
            
            user.huntsData = mergeObjs({[huntID.huntID]: huntsData}, user.huntsData);

            user.save(function (err, updatedUser) {
                if (err) res.send("an error occured updating the user");
                
                //if no error then generate hunt screen
                currentClue = user.huntsData[huntID.huntID].userClueNumber; //define current clue
                clueData = hunt.clues[currentClue - 1] //collect clue data
                res.render(clueData.clueType, { user : updatedUser, clue: clueData});
            });
        });

    }
    else{
        console.log("maybe never reached");
        //hunt is already in users library -- just render it

        userClueNumber = req.user.huntsData[huntID.huntID].userClueNumber;
        clueData = hunt.clues[userClueNumber - 1] //collect clue data
        console.log("------------------------");
        console.log(clueData);
        res.render(clueData.clueType, { user : req.user, clue: clueData});
    }
};

expController.playSubmit = async function(req, res){
    //get leader list
    huntID = req.params.huntID;

    if (req.user){

        //get the x/y coords and time
        var pointMarkedTime = Date.now(); //create a date object
        userLat = req.body.lat;
        userLong = req.body.long;

        //get the clues coordinates and margin of error
        user = req.user;
        currentClue = req.user.huntsData[req.params.huntID].userClueNumber; //users current clue for the hunt
        

        //current clue
        clueDetails = await getHuntsByID(req.params);
        currentClueDetails = clueDetails[0].clues[currentClue-1]; //pull out the users current clue from the appropriote hunt
        console.log("Clue Details");
        console.log(currentClueDetails);

        if (currentClueDetails.clueType == "HotColdClue"){
            console.log("hot cold clue selected");
            supportFunctions.hotColdClueCheck(req,res,currentClueDetails,pointMarkedTime);
        }else{
            console.log("regular clue selected");
            //compare the actual clue location to user submitted location
            //use pythagorean theorm to determine distance of user from clue location
            latDist = Math.abs(userLat - currentClueDetails.clueLat);
            longDist = Math.abs(userLong - currentClueDetails.clueLong);
            feetInDegree = 308000; //google says true number is 364,000
            distanceInFeet = Math.round((latDist**2 + longDist**2)**(1/2) * feetInDegree);

            //if user is within margin of error -> success
            if (distanceInFeet < currentClueDetails.marginOfError){
                console.log("user Found clue");

                //set response object
                clueResponseObj = responseGenerator('positive');

                //update hunt info with user
                timeFound = new Date().getTime(),
                await huntUpdateClueFound(huntID, user.username, currentClue + 1, timeFound);
                

                
                //update the user in the database
                User.findById(user._id, async function (err, user) {
                    if (err) res.send("an error occured updating the user");//throw and error if problem
                    
                        //update the huntsData entry
                        updatedHuntsData = user.huntsData;
                        updatedHuntsData[req.params.huntID].markedLocations.push([userLat, userLong, pointMarkedTime]);
                        updatedHuntsData[req.params.huntID].foundLocations.push([userLat, userLong, pointMarkedTime]);
                        updatedHuntsData[req.params.huntID].userClueNumber = updatedHuntsData[req.params.huntID].userClueNumber + 1;

                        //set the changes to the user
                        user.markModified('huntsData');//must inform mongoose that huntsData has been modified
                        user.set({ huntsData: updatedHuntsData });
                        user.save();

                        //set response object
                        const clueResponseObj = {};
                        clueResponseObj.resultHeader = "You Did It!";
                        clueResponseObj.result = "You've marked the location and are one step closer to the prize!";
                        clueResponseObj.huntUrl = "/play2/" + huntID;
                        clueResponseObj.userUrl = "/play/" + user.username;

                        list = await getLeaders(huntID);

                        //render success page
                        if (err) res.send("an error occured updating the user");//throw and error if problem

                        console.log({user: user, clueResponseObj: clueResponseObj, leaderList: list});
                        res.render('ClueFound', {user: user, clueResponseObj: clueResponseObj, leaderList: list});  //else it worked fine
                    });

            }else{
                //user did not find the clue
                console.log("User did not find the clue");
                
                //get leaderlist
                list = await getLeaders(huntID);
                console.log(list);
                
                //update the user in the database
                User.findById(user._id, function (err, user) {
                    if (err) res.send("an error occured updating the user");//throw and error if problem

                    //update the entire huntsData entry
                    updatedHuntsData = user.huntsData;
                    updatedHuntsData[req.params.huntID].markedLocations.push([userLat, userLong, pointMarkedTime]);
                    
                    //set the changes to the user
                    user.markModified('huntsData');//must inform mongoose that huntsData has been modified
                    user.set({ huntsData: updatedHuntsData });
                    
                    user.save(async function (err, user) {
                        if (err) res.send("an error occured updating the user");//throw and error if problem

                        //set message to user
                        clueResponseObj = responseGenerator('negative');
                        clueResponseObj.huntUrl = "/play2/" + huntID;
                        clueResponseObj.userUrl = "/play/" + user.username;
                        console.log(clueResponseObj);

                        //render success page
                        res.render('xPressExp', {user: user, clueResponseObj: clueResponseObj, leaderList: list});  //else it worked fine
                    });
                });
            }

        }
    }else{
        //user is not logged in
        list = await supportFunctions.getLeaders(); //this is not working yet
        res.render('notLoggedInD', {leaderList: list})
    } 
}


expController.manageHunts = async function(req, res) {
    //confirm admin is logged in
    if (req.user){
        if(req.user.admin){
            //render page
            hunts = await getHunts();
            res.render('ManageHunts', { user : req.user, hunts });

        }else{
            res.render('404', { user : req.user });
        }
    }else{
        res.render('404', { user : req.user });
    } 
};

//post to createhunts
expController.saveNewHunt = async function(req, res) {

    //confirm admin is logged in
    if (req.user){
        if(req.user.admin){
            hunt = new Hunt(req.body);

            //Send new hunt data to database
            hunt.save(function(err, huntDetails){
                if (err){ //something went wrong with the database save
                    res.render('error', {user : req.user})
                }else{ //everything worked correctl
                    res.render('EditHunt', { user : req.user , huntDetails });
                }
            })  
        }else{
            res.render('404', { user : req.user });
        }
    }else{
        res.render('404', { user : req.user });
    } 

};

expController.updateHunt = async function(req, res) {

    //confirm admin is logged in
    if (req.user){
        if(req.user.admin){
            //render page
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

        }else{
            res.render('404', { user : req.user });
        }
    }else{
        res.render('404', { user : req.user });
    } 


};

expController.editNewHunt = async function(req, res) {
    if (req.user){
        if(req.user.admin){
            //render page
            res.render('EditNewHunt', { user : req.user });
        }else{
            res.render('404', { user : req.user });
        }
    }else{
        res.render('404', { user : req.user });
    }
};

expController.editExistingHunt = async function(req, res) {
    if (req.user){
        if(req.user.admin){
            //render page
            huntID = req.params;
            huntDetails = await getHuntsByID(huntID);
            res.render('EditHunt', { user : req.user, huntDetails: huntDetails[0] });
        }else{
            res.render('404', { user : req.user });
        }
    }else{
        res.render('404', { user : req.user });
    }
}

expController.createClue = async function(req, res) {
    
    if (req.user){
        if(req.user.admin){
            //process data and redirect to page
            huntID = req.params;
            resData = req.body;

            //get the hunt
            huntDetails = await getHuntsByID(huntID);
            huntDetails = huntDetails[0];

            //update the clue object
            if(resData.clueType == "BasicClue"){
                newClue = basicClue(resData, huntDetails);
            }else if(resData.clueType == "MultiImgClue"){
                newClue = multiImgClue(resData, huntDetails);
            }else if(resData.clueType == "HotColdClue"){
                newClue = hotColdClue(resData, huntDetails);
            }

            //add clue to clues array
            huntDetails.clues.push(newClue);

            //save the clue object back to the hunt
            huntDetails.save();

            //redirect back to the edit hunt page
            res.redirect('/editHunt/'+huntID.huntID);

        }else{
            res.render('404', { user : req.user });
        }
    }else{
        res.render('404', { user : req.user });
    }
};

expController.deleteExistingHunt = async function(req, res) {
    if (req.user){
        if(req.user.admin){
            //process and render page
                huntID = req.params.huntID;
                resVar = await deleteHuntByID(huntID);
                res.redirect('/ManageHunts');
        }else{
            res.render('404', { user : req.user });
        }
    }else{
        res.render('404', { user : req.user });
    }
};

expController.feedback = async function(req, res) {
    if (req.user){
        message = req.body.feedback;
        messageResponse = "Thanks for the feedback!";
        redirectURL = '/play/'+ req.user.username;
        console.log(message);

        const mailOptions = {
            from: "TheHunt <feedback@charlestontreasurehunt.com>",
            to: "Ryan <ryan@charlestontreasurehunt.com>",
            subject: "User Feedback",
            name: req.user.name,
            username: req.user.username,
            message: "FEEDBACK: " + message,
            filename: "user-feedback",
            html: message,
            text: message
        }

        mail.sendEmail(mailOptions);

        res.render("UserDash", { user : req.user , message: messageResponse})
    }else{
        res.render('404', { user : req.user });
    }
};

expController.updatePassword = async function(req, res) {
    if (req.user){
        message = req.body.feedback;
        currentpassword = req.body.Current;
        newpassword = req.body.New;
        confirmpassword = req.body.Confirm;
        console.log(currentpassword);
        console.log(newpassword);
        console.log(confirmpassword);

        if (newpassword === confirmpassword){
            User.findByUsername(req.user.username).then(function(sanitizedUser){
                if (sanitizedUser){
                    sanitizedUser.setPassword(newpassword, function(){
                        sanitizedUser.save();
                        messageResponse = "Password Updated Sucessfully";
                        res.render("UserDash", { user : req.user , message: messageResponse})
                    });
                } else {
                    messageResponse = "There was an error updatng your password";
                    res.render("UserDash", { user : req.user , message: messageResponse})
                }
            },function(err){
                messageResponse = "There was an error updatng your password";
                res.render("UserDash", { user : req.user , message: messageResponse})
            })
        }else{
            messageResponse = "There was an error updatng your password";
            res.render("UserDash", { user : req.user , message: messageResponse})
        }

        res.render("UserDash", { user : req.user , message: messageResponse})
    }else{
        res.render('404', { user : req.user });
    }
};

module.exports = expController;

//gets all hunts and returns an object of hunts
getHunts = function(){
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

getLeaders = async function(huntID){
    //collects all users from a hunt document and sorts them by clue and time clue was logged.
    huntInfo = await getHuntInfo(huntID);
    
    numberOfClues = huntInfo.clues.length;
    players = huntInfo.registeredPlayers;

    console.log("--------------Players ---------------");
    console.log(players);

    sortableList = [];
    for (var player in players){
        sortableList.push([player, players[player].currentClue, parseFloat((players[player].currentClue) - (players[player].timeFound / 2000000000000) || 0 )]);  //converts epoch time to a decimal less than 1 to determine who leader is
    }

    console.log("--------------Sortable List---------------");
    console.log(sortableList);

    const sortedList = sortableList.sort((a,b) => a[2] > b[2] ? -1 : 1);

    console.log("--------------Sorted List---------------");
    console.log(sortedList);

    return sortedList.slice(0,5);
}

getHuntInfo = function(huntID){
    try{
        //collect the hunt data from the database
        const huntQuery = Hunt.findOne({ "_id": huntID });
        const hunt = huntQuery.then();
        return hunt;
    }catch(err){
        return err;
    }
}

saveRegistration = function(req){
    //save the new registered user to the hunt 
    newRegistration = {
        startTime: new Date().getTime(),
        currentClue: 1
    }

    Hunt.findById(req.params.huntID, function (err, hunt) {
        if (err) res.send("an error occured updating the hunt");
        
        hunt.registeredPlayers = mergeObjs({[req.user.username]: newRegistration}, hunt.registeredPlayers);

        hunt.save(function (err) {
            if (err) res.send("an error occured updating the user");
        });
    });
}

huntUpdateClueFound = function(huntID, username, clueNumber, timeFound){
    Hunt.findById(huntID, function (err, hunt){
        if(err) Response.send("An error occured");

        //updated user object in hunt model
        hunt.registeredPlayers[username] = {"currentClue": clueNumber, "timeFound": timeFound, "startTime": hunt.registeredPlayers[username].startTime}
        hunt.markModified('registeredPlayers');

        hunt.save(function (err) {
            if(err) Response.send("An error occured");
        });
    });
}

responseGenerator = function(responseType){
    positiveHeader = ["You did it!", "WHAMMO!", "Great Scotts!", "Glory Hallelujah!", "What do you know!", "Hooray for you!", "Well I'll be switched!"];
    negativeHeader = ["Sorry about your luck", "There's always next time", "Don't give up yet", "That burns my buscuits", "Ratsolfats", "You win some, you lose some", ];
    positiveMessage = ["You've solved the clue and are one step closer to the prize.", "One clue down (some?) more to go.", "You are one giant leap closer to solving the puzzle."];
    negativeMessage = ["You didn't solve it this time, but don't let that get you down.", "It's true, you didn't get it.  But you are still in the game.", "Push through the hardship and you'll get there eventually."];

    if (responseType === 'positive'){
        console.log("11111111");
        headerItem =  positiveHeader[Math.floor(Math.random() * positiveHeader.length)];
        messageItem = positiveMessage[Math.floor(Math.random() * positiveMessage.length)];
    }else{
        console.log("222222222222");
        headerItem =  negativeHeader[Math.floor(Math.random() * negativeHeader.length)];
        messageItem = negativeMessage[Math.floor(Math.random() * negativeMessage.length)];
    }
    return {resultHeader: headerItem, result: messageItem};
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
    clue.successPic = resData.successPic;

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

    console.log(resData);
    
    //save info to the clue object
    clue.clueShortName = resData.shortName;
    clue.clueText = resData.clue;
    clue.imgs = resData.imageLink;
    clue.clueLong = resData.yCord;
    clue.clueLat = resData.xCord;
    clue.marginOfError = resData.marginOfError;
    clue.clueType = resData.clueType;
    clue.successPic = resData.successPic;

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
    clue.successPic = resData.successPic;

    return clue;
}

mergeObjs = function (obj, src) {
    if (src === undefined){return obj}//if its the first element in the array return src only
    Object.keys(src).forEach(function(key) { obj[key] = src[key]; });
    return obj;
}
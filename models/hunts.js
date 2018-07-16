var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var huntsSchema = new Schema({
    huntName: {
        type: String,
        unique: true,
    },
    huntStory: String,
    huntDescription: String,
    registeredPlayers: Schema.Types.Mixed,
    finishedPlayers: [],
    clues: [],
    difficulty: String,
    averageTimeToComplete: Number,
    startDate: String,
    cardPicture: String,
    headerPicture: String,
    mapAreaPicture: String
});

module.exports = mongoose.model('Hunt', huntsSchema);
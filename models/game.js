var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var gameSchema = new Schema({
    finishedPlayers: [],
    pointsMarked: []
});

module.exports = mongoose.model('Game', gameSchema);
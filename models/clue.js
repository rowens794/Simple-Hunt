var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var clueSchema = new Schema({
    clueOrder: {
        type: Number,
        required: 'clueOrder is required'
    },
    clueShortName: {
        type: String,
        trim: true
    },
    clueText: {
        type: String,
        trim: true,
        required: 'Clue Text is required'
    },
    clueIMG: {
        type: String,
        trim: true,
        lowercase: true
    },
    clueType: {
        type: String,
        trim: true,
        required: 'Clue type is required'
    },
    clueOptions: {
        imgs: [],
        videoURL: String,
        controller: String,
        function: String
    },
    clueLong: Number,
    clueLat: Number,
    marginOfError: Number,
    optionalHTML: String
});

module.exports = mongoose.model('Clue', clueSchema);
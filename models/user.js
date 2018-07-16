var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

var UserSchema = new Schema({
    username: {
        type: String,
        trim: true,
        lowercase: true,
        unique: true,
        required: 'Username is required',
    },
    password: {
        type: String,
        trim: true,
    },
    name: {
        type: String,
        trim: true,
        required: 'Name is required',
    },
    email: {
        type: String,
        trim: true,
        lowercase: true,
        unique: true,
        required: 'Email address is required',
    },
    huntsData: Schema.Types.Mixed,
    currentClue: Number,
    lastClueFound: Number,
    pointsMarked: [],
    adViews: [],
    admin: Boolean,
    verified: Boolean,
    urlHash: String,
    passwordHash: String
});

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', UserSchema);
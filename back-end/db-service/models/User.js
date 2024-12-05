// models/User.js
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    uid: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    color: {
        type: String,
        required: true
    },
    active: {
        type: Boolean,
        required: true
    },
    date: {
        type: Date,
        default: Date.now 
    }
});

module.exports = User = mongoose.model('User', UserSchema); 
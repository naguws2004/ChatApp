// models/Room.js
const mongoose = require('mongoose');

const RoomSchema = new mongoose.Schema({
    rid: {
        type: String,
        required: true,
        unique: true
    },
    name: {
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

module.exports = Room = mongoose.model('Room', RoomSchema); 
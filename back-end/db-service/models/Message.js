// models/Message.js
const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
    mid: {
        type: String,
        required: true,
        unique: true
    },
    content: {
        type: String,
        required: true
    },
    sender: {
        type: Object,
        required: true,
    },
    room: {
        type: Object,
        required: true
    },
    date: {
        type: Date,
        default: Date.now 
    }
});

module.exports = Message = mongoose.model('Message', MessageSchema); 
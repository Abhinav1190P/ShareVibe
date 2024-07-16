const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'auth',
        required: true
    },
    content: {
        type: String,
        required: true
    },
    media_url:{
        type:String,
        required:false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const groupSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    participants: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'auth',
            required: true
        },
        userName: {
            type: String,
            required: true
        },
        profile_photo:{
            type:String,
            required:true
        },
    }],
    messages: [messageSchema],
    admin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'auth'
    },
    room: {
        type: String,
        unique: true
    }
});


const Group = mongoose.model('Group', groupSchema);

module.exports = Group;

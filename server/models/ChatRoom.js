const { model, Schema } = require("mongoose");

const chatRoomSchema = Schema({
    roomCode: {
        type: String,
        unique: true,
        required: true
    },
    participants: [{
        type: Schema.Types.ObjectId,
        ref: 'auth'
    }],
    messages: [{
        sender: {
            type: Schema.Types.ObjectId,
            ref: 'auth'
        },
        content: String,
        createdAt: {
            type: Date,
            default: Date.now
        },
        media_url: {
            type: String,
            default: null
        },
        user_profile: {
            type: String,
            default: null
        },
        scheduledAt: {
            required:false,
            type: Date,
            default: null
        }
    }]
});

module.exports = model("chatroom", chatRoomSchema);
const { model, Schema } = require("mongoose");

const scheduledMessageSchema = Schema({
    sender: {
        type: Schema.Types.ObjectId,
        ref: 'auth',
        required: true
    },
    content: {
        type: String,
        required: true
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
        type: Date,
        required: true
    },
    roomCode: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'sent'],
        default: 'pending'
    }
});

module.exports = model("scheduledMessage", scheduledMessageSchema);

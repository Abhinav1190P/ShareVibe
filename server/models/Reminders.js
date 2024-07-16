const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const reminderSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    eventId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
        required: true
    },
    reminderTime: {
        type: Date,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Reminder = mongoose.model('Reminder', reminderSchema);

module.exports = Reminder;

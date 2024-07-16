const bcrypt = require("bcryptjs");
const { model, Schema } = require("mongoose");


const eventsSchema = new Schema({

    title: {
        type: String,
        required: true
    }, description: {
        type: String,
        required: true
    }, date: {
        type: String,
        required: true
    }
}, {
    versionKey: false,
    timestamps: true,
})

module.exports = model("event", eventsSchema);
const bcrypt = require("bcryptjs");
const { model, Schema } = require("mongoose");


const announcementSchema = new Schema({
    text: {
        type: String,
        required: true
    }
}, {

    versionKey: false,
    timestamps: true,

})


module.exports = model("announcement", announcementSchema);
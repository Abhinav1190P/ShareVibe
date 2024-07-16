const { model, Schema } = require("mongoose");

const requestSchema = new Schema({
    from: {
        type: Schema.Types.ObjectId,
        ref: 'auth',
        required: true
    },
    to: {
        type: Schema.Types.ObjectId,
        ref: 'auth',
        required: true
    },
    status: {
        type: String,
        required: false,
        enum: ["start","pending", "accepted"],
        default: "start"
    },
    roomCode: {
        type: String,
        default: null
    }
}, {
    versionKey: false,
    timestamps: true,
})

module.exports = model("request", requestSchema);
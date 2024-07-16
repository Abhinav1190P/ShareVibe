const { model, Schema } = require("mongoose");

const commentSchema = new Schema({
    post_id: {
        type: Schema.Types.ObjectId,
        ref: 'posts',
        required: true
    },
    post_user_id: {
        type: Schema.Types.ObjectId,
        ref: 'auth',
        required: true
    },
    comment_by_photo: {
        type: String,
    },
    comment_by_username: {
        type: String,
        required: true
    },
    comment_text: {
        type: String,
        required: true
    }
},
    {
        versionKey: false,
        timestamps: true,
    })

module.exports = model("comment", commentSchema);
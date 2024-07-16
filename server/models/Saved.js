const { model, Schema } = require("mongoose");

const saveSchema = new Schema({
    post_title: {
        type: String,
        required: true
    },
    post_description: {
        type: String,
        required: true
    },
    post_files_n_folders: {
        type: Array,
        required: false
    },
    post_user_name: {
        type: String,
        required: true
    },
    post_user_email: {
        type: String,
        required: true
    },
    post_user_id: {
        type: Schema.Types.ObjectId,
        ref: 'auth',
        required: true
    },
    save_user_id: {
        type: Schema.Types.ObjectId,
        ref: 'auth',
        required: true
    },
    post_id: {
        type: Schema.Types.ObjectId,
        ref: 'auth',
        required: true
    }
}, {
    versionKey: false,
    timestamps: true,
})

module.exports = model("saved", saveSchema);
const { model, Schema } = require("mongoose");

const fileSchema = new Schema({
    id: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    bytes: {
        type: Number,
        required: true
    },
    isDir: {
        type: Boolean,
        required: true
    },
    icon: {
        type: String,
        required: true
    },
    thumbnailLink: {
        type: String,
        required: false
    }
});

const postSchema = new Schema(
    {
        post_title: {
            type: String,
            required: true
        },
        post_description: {
            type: String,
            required: true
        },
        post_files_n_folders: [{
            url: {
                type: String,
                required: true
            }
        }],
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
        post_user_photo:{
            type:String,
            required:true
        },
        likes: [
            {
                type: Schema.Types.ObjectId,
                ref: 'auth'
            }
        ],
        likeCount: {
            type: Number,
            default: 0
        }
    },
    {
        versionKey: false,
        timestamps: true,
    }
);

module.exports = model("posts", postSchema);

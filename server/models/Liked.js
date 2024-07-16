const bcrypt = require("bcryptjs");
const { model, Schema } = require("mongoose");


const likedSchema = new Schema({
    post_id:{
        type: Schema.Types.ObjectId,
        ref: 'posts',
        required: true
    },
    post_user_id:{
        type: Schema.Types.ObjectId,
        ref:'auth',
        required:true
    },
    post_liked_by:{
        type:Schema.Types.ObjectId,
        ref:'auth',
        required:true
    },
    post_liked_by_name:{
        type:String,
        required:true
    }
},
{
    versionKey: false,
    timestamps: true,
})

module.exports = model("liked", likedSchema);
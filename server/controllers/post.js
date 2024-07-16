const Liked = require('../models/Liked')
const Post = require('../models/Post')
const Comment = require('../models/Comment')
const Auth = require('../models/Auth')
const Save = require('../models/Saved')

const CreatePost = async (req, res, next) => {
    const { post_title, post_description, post_files_n_folders, post_user_name, post_user_email, post_user_id, post_user_photo } = req.body;
    console.log(post_files_n_folders);
    try {
        const newPost = await Post.create({
            post_title,
            post_description,
            post_files_n_folders,
            post_user_name,
            post_user_email,
            post_user_id,
            post_user_photo
        });
        if (newPost) {
            return res.status(200).json({ success: true, message: "Post was created!", newPost });
        }
        return res.status(400).json({ success: false, message: "Something went wrong" });
    } catch (error) {
        next(error);
        res.status(500).json({ error: error.message });
    }
};


const GetPosts = async (req, res, next) => {
    const page = req.params.page;
    const size = req.params.size;

    try {
        const skip = (page - 1) * size;

        const total = await Post.countDocuments();
        let posts = await Post.find().skip(skip).limit(size);

        return res.json({ posts, total });
    } catch (error) {
        next(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


const LikeorUnlikePost = async (req, res, next) => {
    const { post_id, post_liked_by } = req.body;

    try {
        let post = await Post.findById(post_id);

        if (!post) {
            return res.status(404).json({ success: false, message: "Post not found" });
        }

        const likedIndex = post.likes.indexOf(post_liked_by);

        if (likedIndex !== -1) {

            post.likes.splice(likedIndex, 1);
            post.likeCount -= 1;
        } else {
            // If user hasn't liked the post, add the like
            post.likes.push(post_liked_by);
            post.likeCount += 1;
        }

        // Save the updated post
        post = await post.save();

        return res.status(200).json({ success: true, message: likedIndex !== -1 ? "You unliked the post" : "You liked the post", post });
    } catch (error) {
        next(error);
    }
};

const CreateComment = async (req, res, next) => {
    const { post_id, post_user_id, comment_text, comment_by_photo } = req.body
    console.log('POST username', post_user_id)
    try {
        const findCommenterUserName = await Auth.findById(post_user_id).select('userName profile_photo')

        const newComment = await Comment.create({
            post_id, post_user_id, comment_by_username: findCommenterUserName.userName, comment_text, comment_by_photo: findCommenterUserName.profile_photo
        })
        if (newComment) {
            return res.status(200).json({ success: true, message: "You added a comment", comment: newComment });
        }
        return res.status(400).json({ success: false, message: "Something went wrong" });

    } catch (error) {
        next(error);
    }

}

const GetComments = async (req, res, next) => {
    const postid = req.params.postid

    try {
        const comments = await Comment.find({ post_id: postid })
        if (comments.length <= 0) {
            return res.status(200).json({
                success: true,
                comments: []
            })
        }
        return res.status(200).json({
            success: true,
            comments: comments
        })
    } catch (error) {
        next(error)
    }
}

const DeletePost = async (req, res, next) => {
    const postId = req.params.postid;
    const userId = req.params.userid;

    try {
        const query = { _id: postId, post_user_id: userId };

        const deletedPost = await Post.deleteOne(query);

        if (deletedPost.deletedCount === 1) {
            return res.json({ success: true, message: "Post deleted successfully" });
        } else {
            return res.status(404).json({ success: false, message: "Post not found or you do not have permission to delete it" });
        }
    } catch (error) {
        next(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const SavePost = async (req, res, next) => {
    const { post_title, post_description, post_files_n_folders, post_user_name, post_user_email, post_user_id, post_id, user_id } = req.body;
    try {
        const existingSavedPost = await Save.findOne({ post_id: post_id, save_user_id: user_id });
        console.log(existingSavedPost)
        if (existingSavedPost) {
            return res.status(400).json({ success: false, message: "Post is already saved" });
        }

        const savedPost = await Save.create({
            post_id: post_id,
            post_title,
            post_description,
            post_files_n_folders,
            post_user_name,
            post_user_email,
            post_user_id,
            save_user_id: user_id
        });

        if (savedPost) {
            return res.status(200).json({
                success: true,
                message: "Post saved"
            });
        }

        return res.status(404).json({ success: false, message: "Something went wrong" });
    } catch (error) {
        next(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


const GetSavedPosts = async (req, res, next) => {
    const page = req.params.page;
    const size = req.params.size;
    try {
        const skip = (page - 1) * size;

        const total = await Save.countDocuments();
        let posts = await Save.find().skip(skip).limit(size);

        return res.json({ posts, total });
    } catch (error) {
        next(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

const GetMyPosts = async (req, res, next) => {
    const page = req.params.page;
    const size = req.params.size;

    try {
        const skip = (page - 1) * size;

        const total = await Post.countDocuments({ post_user_id: req.user.userId });
        let posts = await Post.find({ post_user_id: req.user.userId }).skip(skip).limit(size);

        return res.json({ posts, total });
    } catch (error) {
        next(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

const GetPostsByUserName = async (req, res, next) => {
    const page = req.params.page;
    const size = req.params.size;
    const username = req.params.username

    try {

        const user = await Auth.findOne({ userName: username })
        const userId = user._id
        const skip = (page - 1) * size;

        const total = await Post.countDocuments({ post_user_id: userId });
        let posts = await Post.find({ post_user_id: userId }).skip(skip).limit(size);

        return res.json({ posts, total });
    } catch (error) {
        next(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

module.exports = { CreatePost, GetPosts, GetMyPosts, LikeorUnlikePost, GetPostsByUserName, CreateComment, GetComments, DeletePost, SavePost, GetSavedPosts };
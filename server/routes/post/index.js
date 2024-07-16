// Routes folder contains the backend routes on which calls are made from the frontend there can be different routes for different things, in this case for tweets, comments, etc...

const { Router } = require("express");
const postController = require("../../controllers/post");

const router = Router();

// GET: /api/user/profile this is an example (for the user route)

router.use("/create-post", postController.CreatePost);

router.use("/get-posts-feed/:page/:size/:id", postController.GetPosts)

router.use("/get-saved-posts/:page/:size", postController.GetSavedPosts)

router.use("/like-unlike-post", postController.LikeorUnlikePost)

router.use("/create-comment", postController.CreateComment)

router.use("/get-comments/:postid", postController.GetComments)

router.use("/delete-post/:postid/:userid", postController.DeletePost)

router.use("/save-post", postController.SavePost)

router.use("/get-my-posts/:page/:size", postController.GetMyPosts)

router.use("/get-my-posts-user/:page/:size/:username", postController.GetPostsByUserName)


module.exports = router;
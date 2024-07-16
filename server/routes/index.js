// The index page in the routes is combining all the routes from the user folder, or any other.
const { Router } = require("express");
const authRouters = require("./auth");
const adminRouters = require("./admin");
const userRouters = require("./user");
const postRouters = require('./post')
const isAuth = require("../middleware/isAuth");
const uploadRoutes = require('./upload')
const router = Router();

// auth routes
router.use("/api/auth", authRouters);

// admin routes
router.use("/api/admin", isAuth("admin"), adminRouters);

// user routes
// The final route would be like this.... http://localhost:4000/api/user/profile
//Server port/root route/subroute

router.use("/api/user", isAuth("user"), userRouters);
router.use("/api/uploads",uploadRoutes)
router.use("/api/post", isAuth("user"), postRouters)

module.exports = router;
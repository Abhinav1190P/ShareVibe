const { Router } = require("express");
const adminController = require("../../controllers/admin");

const router = Router();

// api/admin/profile
router.use("/profile", adminController.profile);

router.use("/create-announcement", adminController.CreateAnnouncements);

router.use("/create-events", adminController.CreateEvents);


module.exports = router;
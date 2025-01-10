const express = require("express");
const router = express.Router();
const FollowController = require("../controllers/FollowController");
const check = require("../middlewares/auth");

router.post("/save", check.auth, FollowController.save)
router.get("/following/:id?/:page?", check.auth, FollowController.following)
router.get("/followers/:id?/:page?", check.auth, FollowController.followers)
router.delete("/unfollow/:id", check.auth, FollowController.unfollow)

module.exports = router
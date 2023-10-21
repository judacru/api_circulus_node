const express = require("express");
const router = express.Router();
const PublicationController = require("../controllers/PublicationController");
const check = require("../middlewares/auth");
const multer = require("multer");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./uploads/publications/");
    },

    filename: (req, file, cb) => {
        cb(null, "pub-"+Date.now()+"-"+file.originalname);
    }
})

const uploads = multer({storage})

router.post("/save", check.auth, PublicationController.save);
router.post("/upload/:id", [check.auth, uploads.single("file0")], PublicationController.upload);
router.get("/detail/:id", check.auth, PublicationController.detail);
router.get("/user/:id/:page?", check.auth, PublicationController.upload);
router.get("/media/:file", check.auth, PublicationController.media);
router.get("/feed/:page?", check.auth, PublicationController.feed);
router.delete("/remove/:id", check.auth, PublicationController.remove);

module.exports = router
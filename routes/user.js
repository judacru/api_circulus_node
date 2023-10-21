const express = require("express");
const router = express.Router();
const multer = require("multer");
const UserController = require("../controllers/UserController");
const check = require("../middlewares/auth");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./uploads/avatars/");
    },

    filename: (req, file, cb) => {
        cb(null, "avatar-"+Date.now()+"-"+file.originalname);
    }
})

const uploads = multer({storage});

router.post("/create", UserController.create);
router.post("/login", UserController.login);
router.post("/upload", [check.auth, uploads.single("file0")], UserController.upload);
router.get("/prueba", check.auth, UserController.prueba);
router.get("/profile/:id", check.auth, UserController.profile);
router.get("/list/:page?", check.auth, UserController.list);
router.get("/avatar/:file", check.auth, UserController.avatar);
router.put("/update/:id", check.auth, UserController.update);

module.exports = router
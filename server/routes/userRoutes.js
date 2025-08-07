const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const {getAllUsers, editUser} = require("../controllers/userControllers");
const {single} = require("../config/multer");

const router = express.Router();

router.get('/all', authMiddleware, getAllUsers)
router.put('/edit/:userId', single, authMiddleware, editUser);

module.exports = router;
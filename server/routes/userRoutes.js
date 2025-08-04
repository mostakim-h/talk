const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const {getAllUsers, editUser} = require("../controllers/userControllers");

const router = express.Router();

router.get('/all', authMiddleware, getAllUsers)
router.put('/edit/:userId', authMiddleware, editUser);

module.exports = router;
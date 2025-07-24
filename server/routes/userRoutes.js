const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const {getAllUsers} = require("../controllers/userControllers");

const router = express.Router();

router.get('/all', authMiddleware, getAllUsers)

module.exports = router;
const authMiddleware = require("../middlewares/authMiddleware");
const {getChatByRoomId} = require("../controllers/chatControllers");
const router = require('express').Router();

router.get('/:roomId', authMiddleware, getChatByRoomId)

module.exports = router;
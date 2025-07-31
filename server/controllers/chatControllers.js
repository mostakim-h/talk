const {ChatModel} = require('../models/index');
const sendRes = require("../utils/sendRes");

exports.getChatByRoomId = async (req, res) => {
  const { roomId } = req.params;

  try {
    const chat = await ChatModel
      .find({roomId})
      .sort({createdAt: 1})
      .lean(true);

    return sendRes(res, 200, "Chat retrieved successfully", {chat});

  } catch (error) {
    console.error('Error retrieving chat:', error);
    return sendRes(res, 500, "Server error while retrieving chat", {});
  }
}
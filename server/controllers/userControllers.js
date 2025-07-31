const {UserModel} = require('../models/index');
const sendRes = require("../utils/sendRes");

exports.getAllUsers = async function (req, res) {
  try {
    const users = await UserModel.find({}, '-password -__v').sort({ createdAt: -1 });

    if (!users || users.length === 0) {
      return sendRes(res, 404, "No users found", {});
    }

    return sendRes(res, 200, "Users retrieved successfully", { users });
  } catch (error) {
    console.error('Get all users error:', error);
    return sendRes(res, 500, "Server error while retrieving users", {});
  }
}
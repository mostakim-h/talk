const {UserModel} = require('../models/index');
const sendRes = require("../utils/sendRes");
const {uploader} = require("../config/cloudinary");

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

exports.editUser = async function (req, res) {
  const { userId } = req.params;
  const body = req.body;

  if (req.file) {
    const url = await uploader.upload(req.file.path, {
      folder: 'users',
      public_id: userId,
      overwrite: true
    }).catch((error) => {
      return sendRes(res, 500, "Error uploading image to Cloudinary", {error});
    });

    if (!url) {
      return sendRes(res, 500, "Error uploading image to Cloudinary", {});
    }

    body.avatar = url.secure_url;
  }

  if (!body) {
    return sendRes(res, 400, "No fields to update!", {});
  }

  try {
    const user = await UserModel.findByIdAndUpdate(
      userId,
      body,
      { new: true, runValidators: true }
    )

    if (!user) {
      return sendRes(res, 404, "User not found", {});
    }

    delete user.password

    return sendRes(res, 200, "User updated successfully", {user});
  } catch (error) {
    console.error('Edit user error:', error);
    return sendRes(res, 500, "Server error while updating user", {});
  }
}
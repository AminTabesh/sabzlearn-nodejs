const userModel = require("./../../models/user");
const bannedUserModel = require("./../../models/banned-user");
const { isValidObjectId } = require("mongoose");
const bcrypt = require("bcrypt");
const updatePasswordValidator = require("../../validators/update-password");

exports.getAll = async (req, res) => {
  const users = await userModel.find({}, "-password -__v");
  return res.status(200).json({
    success: true,
    data: users,
  });
};

exports.banUser = async (req, res) => {
  const id = req.params.id;

  try {
    const targetUser = await userModel.findOne({ _id: id }).lean();

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const bannedUser = await bannedUserModel.create({
      phone: targetUser.phone,
    });

    return res.status(201).json({
      success: true,
      message: "User banned successfully.",
      bannedUser: {
        id: bannedUser.id,
        phone: bannedUser.phone,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "User is already banned.",
      });
    }

    throw error;
  }
};

exports.removeUser = async (req, res) => {
  const { id } = req.params;
  const isIdValid = isValidObjectId(id);

  if (!isIdValid) {
    return res
      .status(422)
      .json({ success: false, message: "The id is invalid." });
  }

  const deletedUser = await userModel.findByIdAndDelete(id);

  if (!deletedUser) {
    return res
      .status(404)
      .json({ success: false, message: "No user found with this id" });
  }

  return res.json({ success: true, message: "User deleted successfully." });
};

exports.changeRole = async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return res.status(422).json({
      success: false,
      message: "Invalid user ID.",
    });
  }

  const user = await userModel.findById(id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found.",
    });
  }

  user.role = user.role === "ADMIN" ? "USER" : "ADMIN";
  await user.save();

  return res.json({
    success: true,
    message: "Role updated successfully.",
    user: { id: user.id, role: user.role },
  });
};

exports.updateInfo = async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return res.status(422).json({
      success: false,
      message: "Invalid user ID.",
    });
  }

  if (String(req.user._id) !== id) {
    return res.status(403).json({
      success: false,
      message: "You can only update your own profile.",
    });
  }

  const { username, name, email, phone } = req.body;

  const updatedUser = await userModel
    .findByIdAndUpdate(
      id,
      { name, username, email, phone },
      { new: true, runValidators: true },
    )
    .select("-password -__v");

  if (!updatedUser) {
    return res.status(404).json({
      success: false,
      message: "User not found.",
    });
  }

  return res.json({
    success: true,
    data: updatedUser,
  });
};

exports.updatePassword = async (req, res) => {
  const { id } = req.params;

  if (id !== String(req.user._id)) {
    return res.status(403).json({
      success: false,
      message: "You can only change your own password.",
    });
  }

  const validationResult = updatePasswordValidator(req.body);
  if (validationResult !== true) {
    return res.status(422).json({
      success: false,
      message: validationResult[0].message,
      errors: validationResult,
    });
  }

  const { currentPassword, password } = req.body;
  const user = await userModel.findById(id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found.",
    });
  }

  if (!(await bcrypt.compare(currentPassword, user.password))) {
    return res.status(401).json({
      success: false,
      message: "Current password is incorrect.",
    });
  }

  user.password = await bcrypt.hash(password, 10);
  await user.save();

  return res.json({
    success: true,
    message: "Password updated successfully.",
  });
};

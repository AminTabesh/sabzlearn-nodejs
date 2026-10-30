const userModel = require("./../../models/user");
const bannedUserModel = require("./../../models/banned-user");

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

    const bannedUser = await bannedUserModel.create({ phone: targetUser.phone });

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

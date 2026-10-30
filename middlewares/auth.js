const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const userModel = require("../models/user");

module.exports = async (req, res, next) => {
  const match = req.get("Authorization")?.match(/^Bearer\s+(\S+)$/i);
  if (!match) {
    return res.status(401).json({
      success: false,
      message: "Bearer token is missing or malformed.",
    });
  }

  let id;
  try {
    ({ id } = jwt.verify(match[1], process.env.JWT_SECRET));
  } catch {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token.",
    });
  }

  if (!mongoose.isValidObjectId(id)) {
    return res.status(401).json({
      success: false,
      message: "Invalid token.",
    });
  }

  try {
    const user = await userModel.findById(id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User no longer exists.",
      });
    }

    const { password, __v, ...safeUser } = user.toObject();
    req.user = safeUser;

    return next();
  } catch (err) {
    return next(err);
  }
};

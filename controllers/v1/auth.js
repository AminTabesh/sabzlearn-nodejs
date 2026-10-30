const userModel = require("../../models/user");
const bannedUserModel = require("./../../models/banned-user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const registerValidator = require("./../../validators/register");
const loginValidator = require("./../../validators/login");

exports.register = async (req, res) => {
  const validatorResult = registerValidator(req.body);

  if (validatorResult !== true) {
    return res.status(422).json(validatorResult);
  }

  try {
    const { name, username, email, phone, password } = req.body;

    //check if user is in ban list
    const isBanned = await bannedUserModel.findOne({ phone });

    if (isBanned) {
      return res.status(403).json({
        success: false,
        message: "This phone number is banned from registering.",
      });
    }

    const usersCount = await userModel.countDocuments();

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await userModel.create({
      name,
      username,
      email,
      phone,
      password: hashedPassword,
      role: usersCount == 0 ? "ADMIN" : "USER",
    });

    const { password: userPassword, __v, ...safeUser } = user.toObject();

    const accessToken = jwt.sign(
      { id: user._id, username },
      process.env.JWT_SECRET,
      {
        expiresIn: "30 day",
      },
    );

    return res.status(201).json({
      success: true,
      user: safeUser,
      accessToken,
    });
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];

      return res.status(409).json({
        success: false,
        message: `${field} already exists`,
      });
    }

    throw error;
  }
};

exports.login = async (req, res) => {
  const validatorResult = loginValidator(req.body);

  if (validatorResult !== true) {
    return res.status(422).json(validatorResult);
  }
  const { username, email, password } = req.body;

  if (!username && !email) {
    return res.status(422).json({
      success: false,
      message: "username or email is required",
    });
  }

  if (username && email) {
    return res.status(422).json({
      success: false,
      message: "Send either username or email, not both.",
    });
  }

  const user = await userModel.findOne(username ? { username } : { email });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({
      success: false,
      message: "Invalid credentials.",
    });
  }

  const isBanned = await bannedUserModel.exists({ phone: user.phone });

  if (isBanned) {
    return res.status(403).json({
      success: false,
      message: "This account is banned.",
    });
  }

  const { password: userPassword, __v, ...safeUser } = user.toObject();

  const accessToken = jwt.sign(
    { id: user._id, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: "30 day" },
  );

  return res.status(200).json({
    success: true,
    user: safeUser,
    accessToken,
  });
};

exports.getMe = async (req, res) => {
  return res.status(200).json({ success: true, user: req.user });
};

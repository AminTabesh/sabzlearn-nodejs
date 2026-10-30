const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    phone: {
      type: String,
      required: true,
      unique: true,
    },
  },
  { timestamps: true },
);

const model = mongoose.model("BannedUser", schema);

module.exports = model;

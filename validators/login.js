const Validator = require("fastest-validator");

const v = new Validator();

const schema = {
  username: { type: "string", optional: true },
  email: { type: "email", optional: true },
  password: { type: "string" },
};

const check = v.compile(schema);

module.exports = check;

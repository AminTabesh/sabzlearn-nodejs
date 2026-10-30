const Validator = require("fastest-validator");

const v = new Validator();

const schema = {
  currentPassword: { type: "string", empty: false },
  password: { type: "string", min: 8, max: 40 },
  passwordConfirm: { type: "equal", field: "password" },
  $$strict: true,
};

module.exports = v.compile(schema);

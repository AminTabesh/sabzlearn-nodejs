const Validator = require("fastest-validator");

const v = new Validator();

const schema = {
  name: { type: "string", min: 3, max: 255 },
  username: { type: "string", min: 3, max: 100 },
  email: { type: "email" },
  phone: { type: "string", empty: false, pattern: /^09[0-9]{9}$/ },
  password: { type: "string", min: 8, max: 40 },
  passwordConfirm: { type: "equal", field: "password" },
  $$strict: true,
};

const check = v.compile(schema);

module.exports = check;

export const emptyRegister = {
  name: "",
  username: "",
  email: "",
  phone: "",
  password: "",
  passwordConfirm: "",
};

function normalizeDigits(value) {
  return value.replace(/[۰-۹٠-٩]/g, (digit) => {
    const code = digit.charCodeAt(0);
    return String(code >= 0x06f0 ? code - 0x06f0 : code - 0x0660);
  });
}

export function registerPayload(form) {
  return {
    name: form.name.trim(),
    username: form.username.trim(),
    email: form.email.trim(),
    phone: normalizeDigits(form.phone.trim()),
    password: form.password,
    passwordConfirm: form.passwordConfirm,
  };
}

export function loginPayload(identifier, password) {
  const value = identifier.trim();
  return value.includes("@")
    ? { email: value, password }
    : { username: value, password };
}

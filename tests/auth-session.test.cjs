const { test, before, after } = require("node:test");
const assert = require("node:assert/strict");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const users = require("../models/user");
const banned = require("../models/banned-user");
process.env.JWT_SECRET = "integration-test-secret";
const id = "507f1f77bcf86cd799439011";
let user;
let server;
let base;
let token;
const originals = {
  findById: users.findById,
  findOne: users.findOne,
  findByIdAndUpdate: users.findByIdAndUpdate,
  exists: banned.exists,
};
before(async () => {
  user = {
    _id: id,
    name: "سارا محمدی",
    username: "sara",
    email: "sara@example.com",
    phone: "09123456789",
    role: "ADMIN",
    password: await bcrypt.hash("password123", 4),
    __v: 0,
  };
  users.findById = async (value) =>
    value === id && user
      ? {
          ...user,
          toObject: () => ({ ...user }),
          save: async function () {
            user = { ...user, password: this.password, role: this.role };
          },
        }
      : null;
  users.findOne = async (query) =>
    Object.entries(query).every(([k, v]) => user?.[k] === v)
      ? { ...user, toObject: () => ({ ...user }) }
      : null;
  users.findByIdAndUpdate = (value, changes) => ({
    select: async () => {
      Object.assign(user, changes);
      const { password, __v, ...safe } = user;
      return safe;
    },
  });
  banned.exists = async () => false;
  token = jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1h" });
  server = require("../app").listen(0, "127.0.0.1");
  await new Promise((resolve, reject) => {
    server.once("listening", resolve);
    server.once("error", reject);
  });
  base = `http://127.0.0.1:${server.address().port}/api/v1`;
});
after(async () => {
  Object.assign(users, {
    findById: originals.findById,
    findOne: originals.findOne,
    findByIdAndUpdate: originals.findByIdAndUpdate,
  });
  banned.exists = originals.exists;
  if (server?.listening) await new Promise((resolve) => server.close(resolve));
});
const request = (path, options = {}) =>
  fetch(base + path, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
test("me requires a valid bearer token and returns only safe middleware user data", async () => {
  for (const header of [
    "",
    "Bearer invalid",
    `Bearer ${jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: -1 })}`,
  ])
    assert.equal(
      (await request("/auth/me", { headers: { Authorization: header } }))
        .status,
      401,
    );
  const response = await request("/auth/me");
  assert.equal(response.status, 200);
  const data = await response.json();
  assert.equal(data.success, true);
  assert.equal(data.user._id, id);
  assert.equal(data.user.role, "ADMIN");
  assert.ok(!("password" in data.user));
  assert.ok(!("__v" in data.user));
});
test("login returns a safe account and profile changes appear in subsequent me", async () => {
  const login = await request("/auth/login", {
    method: "POST",
    body: JSON.stringify({ username: "sara", password: "password123" }),
  });
  assert.equal(login.status, 200);
  assert.ok((await login.json()).accessToken);
  const result = await request(`/users/${id}`, {
    method: "PUT",
    body: JSON.stringify({
      name: "سارا تازه",
      username: "sara",
      email: "new@example.com",
      phone: "09123456789",
    }),
  });
  assert.equal(result.status, 200);
  assert.equal(
    (await (await request("/auth/me")).json()).user.email,
    "new@example.com",
  );
});
test("incorrect current password leaves the session valid; valid password changes succeed", async () => {
  const payload = {
    currentPassword: "wrong",
    password: "newpassword123",
    passwordConfirm: "newpassword123",
  };
  const wrong = await request(`/users/update-password/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  assert.equal(wrong.status, 401);
  assert.equal((await wrong.json()).message, "Current password is incorrect.");
  assert.equal((await request("/auth/me")).status, 200);
  const mismatch = await request(`/users/update-password/${id}`, {
    method: "PUT",
    body: JSON.stringify({ ...payload, passwordConfirm: "different" }),
  });
  assert.equal(mismatch.status, 422);
  const correct = await request(`/users/update-password/${id}`, {
    method: "PUT",
    body: JSON.stringify({ ...payload, currentPassword: "password123" }),
  });
  assert.equal(correct.status, 200);
  assert.ok(await bcrypt.compare(payload.password, user.password));
});
test("server checks live role and account existence for every authenticated request", async () => {
  user.role = "USER";
  assert.equal((await request("/users")).status, 403);
  assert.equal((await (await request("/auth/me")).json()).user.role, "USER");
  user = null;
  assert.equal((await request("/auth/me")).status, 401);
});

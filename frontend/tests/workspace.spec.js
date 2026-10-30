import { test, expect } from "@playwright/test";
const admin = {
  _id: "507f1f77bcf86cd799439011",
  name: "سارا محمدی",
  username: "sara",
  email: "sara@example.com",
  phone: "09123456789",
  role: "ADMIN",
};
const normal = { ...admin, role: "USER" };
const token = `header.${Buffer.from(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600 })).toString("base64url")}.signature`;
async function setup(
  page,
  { user = admin, stored = user, delay = 0, meFailure = 0 } = {},
) {
  const state = {
    user: { ...user },
    users: [
      { ...user },
      ...Array.from({ length: 12 }, (_, i) => ({
        ...normal,
        _id: `person${i}`,
        name: `کاربر ${i}`,
        username: `person${i}`,
        email: `person${i}@example.com`,
      })),
    ],
    meFailure,
    passwordFailure: true,
    profileFailure: false,
    authFailure: false,
    authorizationFailure: false,
    calls: [],
  };
  await page.addInitScript(
    ({ stored, token }) => {
      if (stored)
        sessionStorage.setItem(
          "rasta-session",
          JSON.stringify({ user: stored, accessToken: token }),
        );
    },
    { stored, token },
  );
  await page.route("**/api/v1/**", async (route) => {
    const req = route.request(),
      path = new URL(req.url()).pathname.replace("/api/v1", "");
    const body = req.postDataJSON();
    state.calls.push({
      path,
      method: req.method(),
      body,
      authorization: req.headers().authorization,
    });
    const reply = (data, status = 200) => route.fulfill({ status, json: data });
    if (path === "/auth/me") {
      if (delay) await new Promise((r) => setTimeout(r, delay));
      return reply(
        state.meFailure
          ? { message: "failure" }
          : { success: true, user: state.user },
        state.meFailure || 200,
      );
    }
    if (path === "/auth/login" || path === "/auth/register")
      return state.authFailure
        ? reply({ message: "Invalid credentials." }, 401)
        : reply({ success: true, user: state.user, accessToken: token });
    if (path.includes("/update-password/"))
      return reply(
        state.passwordFailure
          ? { message: "Current password is incorrect." }
          : { success: true },
        state.passwordFailure ? 401 : 200,
      );
    if (path.includes("/change-role/")) {
      const id = path.split("/").pop();
      const target = state.users.find((u) => u._id === id);
      target.role = target.role === "ADMIN" ? "USER" : "ADMIN";
      if (id === state.user._id) state.user.role = target.role;
      return reply({ success: true, user: { id, role: target.role } });
    }
    if (path.includes("/ban/"))
      return reply({ success: true, bannedUser: { phone: admin.phone } }, 201);
    if (path === "/users") {
      if (state.authorizationFailure) {
        state.user.role = "USER";
        return reply({ message: "This route requires admin role." }, 403);
      }
      return reply({ success: true, data: state.users });
    }
    if (req.method() === "PUT") {
      if (state.profileFailure)
        return reply({ message: "email already exists" }, 409);
      Object.assign(state.user, body);
      return reply({ success: true, data: state.user });
    }
    if (req.method() === "DELETE") {
      state.users = state.users.filter((u) => u._id !== path.split("/").pop());
      return reply({ success: true });
    }
    return reply({ message: "not found" }, 404);
  });
  return state;
}
const nav = (page, text) =>
  page
    .getByRole("navigation", { name: "منوی اصلی" })
    .getByRole("link", { name: text, exact: true });
async function menu(page, name = "سارا محمدی") {
  await page
    .getByRole("button", { name: `عملیات ${name}`, exact: true })
    .click();
}
test("restoration hides protected content until live role arrives; ordinary user cannot enter admin", async ({
  page,
}) => {
  await setup(page, { user: normal, stored: admin, delay: 300 });
  await page.goto("/admin/users");
  await expect(page.getByRole("heading", { level: 1 })).toHaveCount(0);
  await expect(page).toHaveURL(/\/profile$/);
  await expect(nav(page, "مدیریت کاربران")).toHaveCount(0);
});
test("restoration network/server failure retries and expired sessions sign out", async ({
  page,
}) => {
  const s = await setup(page, { meFailure: 503 });
  await page.goto("/profile");
  await expect(page.getByRole("button", { name: "تلاش دوباره" })).toBeVisible();
  await expect(page.getByText("شناسنامه حساب")).toHaveCount(0);
  s.meFailure = 0;
  await page.getByRole("button", { name: "تلاش دوباره" }).click();
  await expect(page.getByText("شناسنامه حساب")).toBeVisible();
  s.meFailure = 401;
  await page.reload();
  await expect(page).toHaveURL(/\/login$/);
  expect(
    await page.evaluate(() => sessionStorage.getItem("rasta-session")),
  ).toBeNull();
});
test("login failure retains entries and success creates session; registration sends contract", async ({
  page,
}) => {
  const s = await setup(page, { stored: null });
  s.authFailure = true;
  await page.goto("/login");
  await page.getByLabel("نام کاربری یا ایمیل", { exact: true }).fill("sara");
  await page.getByLabel("رمز عبور", { exact: true }).fill("password123");
  await page
    .getByRole("button", { name: "ورود به حساب", exact: true })
    .last()
    .click();
  await expect(page.getByRole("status")).toContainText("درست نیست");
  await expect(
    page.getByLabel("نام کاربری یا ایمیل", { exact: true }),
  ).toHaveValue("sara");
  s.authFailure = false;
  await page
    .getByRole("button", { name: "ورود به حساب", exact: true })
    .last()
    .click();
  await expect(page).toHaveURL(/\/profile$/);
  await page.getByRole("button", { name: "خروج از حساب" }).click();
  await page.getByRole("button", { name: "ساخت حساب", exact: true }).click();
  for (const [label, value] of [
    ["نام و نام خانوادگی", "کاربر تازه"],
    ["نام کاربری", "freshuser"],
    ["ایمیل", "fresh@example.com"],
    ["شماره موبایل", "۰۹۱۲۳۴۵۶۷۸۹"],
    ["رمز عبور", "password123"],
    ["تکرار رمز عبور", "password123"],
  ])
    await page.getByLabel(label, { exact: true }).fill(value);
  await page
    .getByRole("button", { name: "ساخت حساب کاربری", exact: true })
    .click();
  await expect(page).toHaveURL(/\/profile$/);
  expect(s.calls.find((c) => c.path === "/auth/register").body.phone).toBe(
    "09123456789",
  );
});
test("profile errors preserve input and success synchronizes UI and session storage", async ({
  page,
}) => {
  const s = await setup(page);
  s.profileFailure = true;
  await page.goto("/profile/edit");
  await page.getByLabel("نام و نام خانوادگی", { exact: true }).fill("نام تازه");
  await page.getByRole("button", { name: "ذخیره تغییرات" }).click();
  await expect(page.getByRole("status")).toContainText("قبلاً");
  await expect(
    page.getByLabel("نام و نام خانوادگی", { exact: true }),
  ).toHaveValue("نام تازه");
  s.profileFailure = false;
  await page.getByRole("button", { name: "ذخیره تغییرات" }).click();
  await expect(page.locator(".topbar-user")).toContainText("نام تازه");
  expect(
    await page.evaluate(
      () => JSON.parse(sessionStorage.getItem("rasta-session")).user.name,
    ),
  ).toBe("نام تازه");
  await nav(page, "حساب من").click();
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "نام تازه",
  );
});
test("wrong current password does not sign out; successful change clears all secrets", async ({
  page,
}) => {
  const s = await setup(page);
  await page.goto("/profile/password");
  for (const [label, value] of [
    ["رمز عبور فعلی", "wrong"],
    ["رمز عبور جدید", "newpassword123"],
    ["تکرار رمز عبور جدید", "newpassword123"],
  ])
    await page.getByLabel(label, { exact: true }).fill(value);
  await page.getByRole("button", { name: "ذخیره تغییرات" }).click();
  await expect(page.getByRole("status")).toContainText("فعلی درست نیست");
  await expect(page).toHaveURL(/password$/);
  expect(
    await page.evaluate(() => sessionStorage.getItem("rasta-session")),
  ).not.toBeNull();
  await expect(page.getByLabel("رمز عبور فعلی", { exact: true })).toHaveValue(
    "wrong",
  );
  s.passwordFailure = false;
  await page.getByRole("button", { name: "ذخیره تغییرات" }).click();
  await expect(page.getByLabel("رمز عبور فعلی", { exact: true })).toHaveValue(
    "",
  );
  await expect(page.getByLabel("رمز عبور جدید", { exact: true })).toHaveValue(
    "",
  );
  await expect(
    page.getByLabel("تکرار رمز عبور جدید", { exact: true }),
  ).toHaveValue("");
});
test("user search, role filter and client pagination use real returned users", async ({
  page,
}) => {
  await setup(page);
  await page.goto("/admin/users");
  await expect(page.getByRole("row")).toHaveCount(9);
  await page.getByRole("button", { name: "صفحه بعد" }).click();
  await expect(page.getByRole("row")).toHaveCount(6);
  await page.getByLabel("جست‌وجوی کاربران").fill("person10@example.com");
  await expect(page.getByRole("row")).toHaveCount(2);
  await page.getByLabel("جست‌وجوی کاربران").fill("noresult");
  await expect(page.getByText("کاربری با این مشخصات پیدا نشد")).toBeVisible();
  await page.getByRole("button", { name: "پاک کردن فیلترها" }).click();
  await page.getByLabel("نقش", { exact: true }).selectOption("ADMIN");
  await expect(page.getByRole("row")).toHaveCount(2);
});
test("ban confirmation names user, traps focus, cancels safely and submits once", async ({
  page,
}) => {
  const s = await setup(page);
  await page.goto("/admin/users");
  await menu(page, "کاربر 0");
  await page.getByRole("menuitem", { name: "مسدود کردن ورود" }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toContainText("کاربر 0");
  await expect(dialog).toContainText("نشست فعلی او بسته نمی‌شود");
  await expect(dialog.getByRole("button", { name: "انصراف" })).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  expect(
    await page.evaluate(
      () => document.activeElement.closest("[role=dialog]") !== null,
    ),
  ).toBe(true);
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  expect(s.calls.filter((c) => c.path.includes("/ban/"))).toHaveLength(0);
  await menu(page, "کاربر 0");
  await page.getByRole("menuitem", { name: "مسدود کردن ورود" }).click();
  await page.getByRole("button", { name: "تأیید و ادامه" }).click();
  await expect(dialog).toHaveCount(0);
  expect(s.calls.filter((c) => c.path.includes("/ban/"))).toHaveLength(1);
});
test("self-demotion confirms loss of access, refreshes session and leaves admin screens", async ({
  page,
}) => {
  const s = await setup(page);
  await page.goto("/admin/users");
  await menu(page);
  await page.getByRole("menuitem", { name: "تغییر نقش به کاربر" }).click();
  await expect(page.getByRole("dialog")).toContainText(
    "دسترسی مدیریت خودت را از دست می‌دهی",
  );
  await page.getByRole("button", { name: "تأیید و ادامه" }).click();
  await expect(page).toHaveURL(/\/profile$/);
  await expect(nav(page, "مدیریت کاربران")).toHaveCount(0);
  expect(
    JSON.parse(
      await page.evaluate(() => sessionStorage.getItem("rasta-session")),
    ).user.role,
  ).toBe("USER");
  expect(s.calls.some((c) => c.path.includes("change-role"))).toBe(true);
});
test("self-deletion confirms sign-out and clears session", async ({ page }) => {
  await setup(page);
  await page.goto("/admin/users");
  await menu(page);
  await page.getByRole("menuitem", { name: "حذف حساب", exact: true }).click();
  await expect(page.getByRole("dialog")).toContainText("از رستا خارج می‌شوی");
  await page.getByRole("button", { name: "تأیید و ادامه" }).click();
  await expect(page).toHaveURL(/\/login$/);
  expect(
    await page.evaluate(() => sessionStorage.getItem("rasta-session")),
  ).toBeNull();
});
test("admin authorization failures refresh role and redirect", async ({
  page,
}) => {
  const s = await setup(page);
  s.authorizationFailure = true;
  await page.goto("/admin/users");
  await expect(page).toHaveURL(/\/profile$/);
  await expect(nav(page, "مدیریت کاربران")).toHaveCount(0);
});
test("list failures offer retry and confirmed non-self role/deletion refresh the list", async ({
  page,
}) => {
  const s = await setup(page);
  let failed = true;
  await page.route("**/api/v1/users", async (route) => {
    if (failed)
      return route.fulfill({ status: 503, json: { message: "failed" } });
    return route.fallback();
  });
  await page.goto("/admin/users");
  await expect(page.getByText("فهرست به دستمان نرسید")).toBeVisible();
  failed = false;
  await page.getByRole("button", { name: "تلاش دوباره" }).click();
  await menu(page, "کاربر 0");
  await page.getByRole("menuitem", { name: "تغییر نقش به مدیر" }).click();
  await page.getByRole("button", { name: "تأیید و ادامه" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(
    page.getByRole("row").filter({ hasText: "person0@example.com" }),
  ).toContainText("مدیر");
  await menu(page, "کاربر 0");
  await page.getByRole("menuitem", { name: "حذف حساب", exact: true }).click();
  await page.getByRole("button", { name: "تأیید و ادامه" }).click();
  await expect(
    page.getByRole("row").filter({ hasText: "person0@example.com" }),
  ).toHaveCount(0);
  expect(s.users.length).toBe(12);
});
test("mobile RTL sheet has role-aware navigation, focus and no page overflow", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await setup(page);
  await page.goto("/profile");
  await page.getByRole("button", { name: "باز کردن منو" }).click();
  const sheet = page.getByRole("dialog");
  await expect(sheet).toBeVisible();
  await expect(
    sheet.getByRole("link", { name: "مدیریت کاربران" }),
  ).toBeVisible();
  const bounds = await sheet.boundingBox();
  expect(Math.round(bounds.x + bounds.width)).toBe(390);
  await sheet.getByRole("link", { name: "مدیریت کاربران" }).click();
  await expect(page.getByRole("row")).toHaveCount(9);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await expect(page.getByRole("heading", { level: 1 })).toBeFocused();
});
test("slow mutations disable repeat submit and keep typed input on network failure", async ({
  page,
}) => {
  await setup(page);
  let attempts = 0;
  await page.route("**/api/v1/users/" + admin._id, async (route) => {
    attempts++;
    await new Promise((r) => setTimeout(r, 500));
    return route.abort("failed");
  });
  await page.goto("/profile/edit");
  await page
    .getByLabel("نام و نام خانوادگی", { exact: true })
    .fill("نام محفوظ");
  await page.getByRole("button", { name: "ذخیره تغییرات" }).click();
  await expect(
    page.getByRole("button", { name: "در حال ذخیره…" }),
  ).toBeDisabled();
  await expect(page.getByRole("status")).toContainText("ارتباط با سرور");
  await expect(
    page.getByLabel("نام و نام خانوادگی", { exact: true }),
  ).toHaveValue("نام محفوظ");
  expect(attempts).toBe(1);
});

test("desktop and mobile screen layouts render without runtime errors or overflow", async ({
  page,
}, testInfo) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await setup(page);
  for (const [width, height] of [
    [1440, 1000],
    [390, 844],
  ]) {
    await page.setViewportSize({ width, height });
    for (const path of [
      "/profile",
      "/profile/edit",
      "/profile/password",
      "/admin/users",
    ]) {
      await page.goto(path);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      if (path === "/admin/users")
        await expect(page.getByRole("row")).toHaveCount(9);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      await page.screenshot({
        path: testInfo.outputPath(`${width}-${path.replaceAll("/", "-")}.png`),
        fullPage: true,
        animations: "disabled",
      });
    }
    await page.evaluate(() => sessionStorage.removeItem("rasta-session"));
    // Init scripts seed each navigation, so use in-app logout to inspect authentication.
    const logout =
      width > 800 ? page.getByRole("button", { name: "خروج از حساب" }) : null;
    if (logout) await logout.click();
    else {
      await page.getByRole("button", { name: "باز کردن منو" }).click();
      await page
        .getByRole("dialog")
        .getByRole("button", { name: "خروج از حساب" })
        .click();
    }
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "دوباره شروع کنیم",
    );
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.screenshot({
      path: testInfo.outputPath(`${width}-login.png`),
      fullPage: true,
      animations: "disabled",
    });
    await page.getByRole("button", { name: "ساخت حساب", exact: true }).click();
    await page.screenshot({
      path: testInfo.outputPath(`${width}-register.png`),
      fullPage: true,
      animations: "disabled",
    });
  }
  expect(errors).toEqual([]);
});

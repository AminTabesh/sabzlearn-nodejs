const base = import.meta.env.VITE_API_BASE_URL || "";
export class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.status = status;
    this.data = data;
  }
}
const fields = {
  name: "نام",
  username: "نام کاربری",
  email: "ایمیل",
  phone: "شماره موبایل",
  password: "رمز عبور",
  passwordConfirm: "تکرار رمز عبور",
  currentPassword: "رمز عبور فعلی",
};
function message(data, status, operation) {
  const raw = data?.message || "";
  if (operation === "password" && raw === "Current password is incorrect.")
    return "رمز عبور فعلی درست نیست. دوباره امتحان کن.";
  if (status === 401)
    return operation === "auth"
      ? "نام کاربری، ایمیل یا رمز عبور درست نیست."
      : "نشستت به پایان رسیده؛ دوباره وارد شو.";
  if (status === 403)
    return operation === "auth"
      ? "امکان ورود یا ثبت‌نام با این حساب وجود ندارد."
      : "برای این کار دسترسی لازم را نداری.";
  if (status === 409) {
    const field = Object.keys(fields).find((f) => raw.startsWith(f));
    return raw.includes("banned")
      ? "این شماره قبلاً مسدود شده است."
      : `${fields[field] || "این اطلاعات"} قبلاً ثبت شده است.`;
  }
  const errors = Array.isArray(data) ? data : data?.errors;
  if (errors?.length)
    return `${fields[errors[0].field] || "اطلاعات فرم"} معتبر نیست. لطفاً بررسی کن.`;
  if (status === 422) return "اطلاعات واردشده معتبر نیست. فرم را بررسی کن.";
  if (status === 404) return "این حساب دیگر در دسترس نیست. فهرست را تازه کن.";
  const operations = {
    profile: "ذخیره اطلاعات حساب",
    password: "تغییر رمز عبور",
    admin: "انجام تغییرات کاربر",
    auth: "ورود یا ثبت‌نام",
  };
  return operations[operation]
    ? `${operations[operation]} انجام نشد. کمی بعد دوباره تلاش کن.`
    : "سرور نتوانست درخواست را انجام دهد. کمی بعد دوباره تلاش کن.";
}
export async function api(
  path,
  { token, method = "GET", body, operation, signal } = {},
) {
  let response;
  try {
    response = await fetch(`${base}/api/v1${path}`, {
      method,
      signal,
      headers: {
        ...(body ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
  } catch (e) {
    if (e.name === "AbortError") throw e;
    throw new ApiError(
      "ارتباط با سرور برقرار نشد. اتصال اینترنت را بررسی کن.",
      0,
    );
  }
  let data;
  try {
    data = await response.json();
  } catch {
    throw new ApiError(
      "پاسخ سرور قابل خواندن نیست. دوباره تلاش کن.",
      response.ok ? 0 : response.status,
    );
  }
  if (!response.ok || data?.success === false)
    throw new ApiError(
      message(data, response.status, operation),
      response.status,
      data,
    );
  return data;
}

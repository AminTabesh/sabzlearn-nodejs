const apiBase = import.meta.env.VITE_API_BASE_URL || "";

const fieldNames = {
  name: "نام و نام خانوادگی",
  username: "نام کاربری",
  email: "ایمیل",
  phone: "شماره موبایل",
  password: "رمز عبور",
  passwordConfirm: "تکرار رمز عبور",
};

export class AuthApiError extends Error {}

function errorMessage(response, status) {
  if (Array.isArray(response)) {
    const label = fieldNames[response[0]?.field] || "اطلاعات واردشده";
    return `${label} معتبر نیست. لطفاً آن را بررسی کنید.`;
  }

  if (status === 401) return "نام کاربری، ایمیل یا رمز عبور درست نیست.";
  if (status === 409) {
    const duplicate = Object.keys(fieldNames).find((field) => response?.message?.startsWith(field));
    return duplicate ? `${fieldNames[duplicate]} قبلاً ثبت شده است.` : "این اطلاعات قبلاً ثبت شده‌اند.";
  }
  if (status === 403) return "امکان ورود یا ثبت‌نام با این حساب وجود ندارد.";
  if (status === 422) return "لطفاً اطلاعات فرم را بررسی کنید.";
  return "مشکلی پیش آمد. لطفاً کمی بعد دوباره تلاش کنید.";
}

export async function submitAuth(mode, body) {
  const response = await fetch(`${apiBase}/api/v1/auth/${mode}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await response.json();

  if (!response.ok || !data?.user || !data?.accessToken) {
    throw new AuthApiError(errorMessage(data, response.status));
  }

  return { user: data.user, accessToken: data.accessToken };
}

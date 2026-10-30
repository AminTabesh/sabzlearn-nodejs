import { api } from "../../lib/api";
export async function submitAuth(mode, body) {
  const data = await api(`/auth/${mode}`, {
    method: "POST",
    body,
    operation: "auth",
  });
  if (
    !data.user?._id ||
    !["USER", "ADMIN"].includes(data.user.role) ||
    !data.accessToken
  )
    throw new Error("پاسخ ورود کامل نیست. دوباره تلاش کن.");
  return { user: data.user, accessToken: data.accessToken };
}

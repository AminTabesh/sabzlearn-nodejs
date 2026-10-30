import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  ArrowUpLeft,
  ShieldCheck,
  PencilLine,
  LockKeyhole,
  UserRound,
} from "lucide-react";
import { useAccount } from "../../hooks/useSession";
import { registerPayload } from "../auth/authPayload";
import TextField from "../../components/TextField";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../components/ui/card";
export const roleLabel = (role) => (role === "ADMIN" ? "مدیر" : "کاربر");
export function PageHeading({ eyebrow = "حساب کاربری", title, children }) {
  useEffect(() => {
    document.querySelector("main h1")?.focus();
  }, []);
  return (
    <div className="page-heading">
      <span className="eyebrow">{eyebrow}</span>
      <h1 tabIndex={-1}>{title}</h1>
      <p>{children}</p>
    </div>
  );
}
export default function ProfileScreen() {
  const {
    session: { user },
  } = useAccount();
  return (
    <>
      <PageHeading title={`سلام ${user.name}، خوش آمدی.`}>
        این فضای توست؛ اطلاعاتت را مرور کن و حسابت را به‌روز نگه دار.
      </PageHeading>
      <section className="profile-banner">
        <div>
          <Badge className="banner-badge">فضای شخصی تو</Badge>
          <h2>قدم بعدی، از همین‌جا.</h2>
          <p>یک حساب مرتب، یک شروع آسوده.</p>
          <Button asChild variant="secondary">
            <Link to="/profile/edit">
              ویرایش اطلاعات
              <PencilLine size={16} />
            </Link>
          </Button>
        </div>
        <div className="workspace-art" aria-hidden="true">
          <div className="art-square square-back" />
          <div className="art-square square-front">
            <UserRound size={56} strokeWidth={1.2} />
          </div>
          <span className="art-label">RASTA / YOUR SPACE</span>
        </div>
      </section>
      <div className="profile-columns">
        <Card>
          <CardHeader className="card-heading">
            <div>
              <CardTitle>شناسنامه حساب</CardTitle>
              <CardDescription>
                اطلاعاتی که با رستا به اشتراک گذاشته‌ای
              </CardDescription>
            </div>
            <Badge variant="secondary">{roleLabel(user.role)}</Badge>
          </CardHeader>
          <CardContent>
            <dl className="details">
              {[
                ["نام و نام خانوادگی", user.name],
                ["نام کاربری", user.username],
                ["ایمیل", user.email],
                ["شماره موبایل", user.phone],
              ].map(([label, value], i) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd dir={i ? "ltr" : "auto"}>{value || "ثبت نشده"}</dd>
                </div>
              ))}
            </dl>
          </CardContent>
        </Card>
        <Card className="security-card">
          <CardHeader>
            <span className="icon-tile">
              <ShieldCheck size={24} />
            </span>
            <CardTitle>امنیت، با چند قدم ساده</CardTitle>
            <CardDescription>
              رمز عبوری انتخاب کن که فقط خودت می‌دانی. اطلاعات ورودت را با
              دیگران به اشتراک نگذار.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="full-width">
              <Link to="/profile/password">
                تغییر رمز عبور
                <ArrowUpLeft size={17} />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
function AccountForm({ password = false }) {
  const { session, request, updateUser } = useAccount();
  const initial = password
    ? { currentPassword: "", password: "", passwordConfirm: "" }
    : Object.fromEntries(
        ["name", "username", "email", "phone"].map((k) => [
          k,
          session.user[k] || "",
        ]),
      );
  const [values, setValues] = useState(initial);
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);
  const change = (e) =>
    setValues((v) => ({ ...v, [e.target.name]: e.target.value }));
  async function submit(e) {
    e.preventDefault();
    if (lock.current) return;
    if (password && values.password !== values.passwordConfirm)
      return toast.error("تکرار رمز عبور با رمز جدید یکسان نیست.");
    if (!password && !/^09[0-9]{9}$/.test(registerPayload(values).phone))
      return toast.error("شماره موبایل باید ۱۱ رقم باشد و با ۰۹ شروع شود.");
    lock.current = true;
    setBusy(true);
    const id = toast.loading("در حال ذخیره تغییرات…");
    try {
      const body = password ? values : registerPayload(values);
      if (!password) {
        delete body.password;
        delete body.passwordConfirm;
      }
      const data = await request(
        password
          ? `/users/update-password/${session.user._id}`
          : `/users/${session.user._id}`,
        { method: "PUT", body, operation: password ? "password" : "profile" },
      );
      if (password) setValues(initial);
      else updateUser(data.data);
      toast.success(
        password ? "رمز عبورت تغییر کرد." : "اطلاعات حسابت به‌روز شد.",
        { id },
      );
    } catch (e) {
      toast.error(e.message, { id });
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  return (
    <Card className="edit-card">
      <CardHeader>
        <span className="icon-tile">
          {password ? <LockKeyhole /> : <PencilLine />}
        </span>
        <CardTitle>
          {password ? "یک رمز تازه برای حسابت" : "اطلاعاتت را به‌روز کن"}
        </CardTitle>
        <CardDescription>
          {password
            ? "رمز جدید باید بین ۸ تا ۴۰ کاراکتر باشد."
            : "ایمیل و شماره موبایلت را با دقت وارد کن."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={submit}>
          <fieldset disabled={busy} className="account-fields">
            {password ? (
              <>
                <TextField
                  id="currentPassword"
                  label="رمز عبور فعلی"
                  type="password"
                  autoComplete="current-password"
                  value={values.currentPassword}
                  onChange={change}
                />
                <TextField
                  id="password"
                  label="رمز عبور جدید"
                  type="password"
                  autoComplete="new-password"
                  minLength={8}
                  maxLength={40}
                  value={values.password}
                  onChange={change}
                />
                <TextField
                  id="passwordConfirm"
                  label="تکرار رمز عبور جدید"
                  type="password"
                  autoComplete="new-password"
                  minLength={8}
                  maxLength={40}
                  value={values.passwordConfirm}
                  onChange={change}
                />
              </>
            ) : (
              <div className="field-grid">
                {[
                  ["name", "نام و نام خانوادگی", "text", "name"],
                  ["username", "نام کاربری", "text", "username"],
                  ["email", "ایمیل", "email", "email"],
                  ["phone", "شماره موبایل", "tel", "tel"],
                ].map(([id, label, type, autoComplete]) => (
                  <TextField
                    key={id}
                    {...{ id, label, type, autoComplete }}
                    minLength={
                      id === "name" || id === "username" ? 3 : undefined
                    }
                    maxLength={
                      id === "name" ? 255 : id === "username" ? 100 : undefined
                    }
                    value={values[id]}
                    onChange={change}
                  />
                ))}
              </div>
            )}
            <div className="form-actions">
              <Button type="submit" disabled={busy}>
                {busy ? "در حال ذخیره…" : "ذخیره تغییرات"}
              </Button>
              <Button asChild variant="ghost">
                <Link to="/profile">بازگشت به حساب</Link>
              </Button>
            </div>
          </fieldset>
        </form>
      </CardContent>
    </Card>
  );
}
export function ProfileEdit() {
  return (
    <>
      <PageHeading title="ویرایش اطلاعات">
        تغییرات کوچک، اطلاعات دقیق‌تر.
      </PageHeading>
      <AccountForm />
    </>
  );
}
export function PasswordScreen() {
  return (
    <>
      <PageHeading title="تغییر رمز عبور">
        کنترل امنیت حسابت دست توست.
      </PageHeading>
      <AccountForm password />
    </>
  );
}

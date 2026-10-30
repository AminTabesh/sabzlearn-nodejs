import { useEffect, useState } from "react";
import {
  BrowserRouter,
  Navigate,
  NavLink,
  Outlet,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import {
  Moon,
  Sun,
  UserRound,
  PencilLine,
  LockKeyhole,
  UsersRound,
  LogOut,
  Menu,
  ChevronLeft,
  LayoutDashboard,
} from "lucide-react";
import { Direction } from "radix-ui";
import useSession, { SessionContext, useAccount } from "./hooks/useSession";
import AuthScreen from "./features/auth/AuthScreen";
import ProfileScreen, {
  ProfileEdit,
  PasswordScreen,
} from "./features/profile/ProfileScreen";
import UsersScreen from "./features/users/UsersScreen";
import Brand from "./components/Brand";
import { Button } from "./components/ui/button";
import { Skeleton } from "./components/ui/skeleton";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "./components/ui/sheet";

export function LoadingScreen() {
  return (
    <div
      className="loading-screen"
      aria-label="در حال بارگذاری"
      aria-busy="true"
    >
      <Brand />
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-40 w-full max-w-xl" />
    </div>
  );
}
function SessionGate() {
  const { session, status, refresh, logout } = useAccount();
  if (status === "loading") return <LoadingScreen />;
  if (status === "error")
    return (
      <div className="loading-screen">
        <Brand />
        <h1>حسابت را دوباره بررسی کنیم</h1>
        <p>ارتباط با سرور برقرار نشد. برای ادامه دوباره تلاش کن.</p>
        <Button onClick={() => refresh().catch(() => {})}>تلاش دوباره</Button>
        <Button variant="ghost" onClick={logout}>
          بازگشت به ورود
        </Button>
      </div>
    );
  return session ? <Outlet /> : <Navigate to="/login" replace />;
}
function AdminGate() {
  const { refresh, session } = useAccount();
  const [checking, setChecking] = useState(true);
  useEffect(() => {
    let active = true;
    refresh()
      .catch(() => {})
      .finally(() => {
        if (active) setChecking(false);
      });
    return () => {
      active = false;
    };
  }, [refresh]);
  if (checking) return <LoadingScreen />;
  return session?.user.role === "ADMIN" ? (
    <Outlet />
  ) : (
    <Navigate to="/profile" replace />
  );
}
const links = [
  ["/profile", "حساب من", UserRound],
  ["/profile/edit", "ویرایش اطلاعات", PencilLine],
  ["/profile/password", "تغییر رمز عبور", LockKeyhole],
];
function Navigation({ close }) {
  const { session, logout } = useAccount();
  return (
    <>
      <div className="nav-label">فضای شخصی</div>
      <nav aria-label="منوی اصلی">
        {links.map(([to, text, Icon]) => (
          <NavLink end key={to} to={to} onClick={close} className="nav-item">
            <Icon size={19} />
            {text}
            <ChevronLeft size={15} className="nav-chevron" />
          </NavLink>
        ))}
        {session.user.role === "ADMIN" && (
          <>
            <div className="nav-label admin-label">مدیریت رستا</div>
            <NavLink to="/admin/users" onClick={close} className="nav-item">
              <UsersRound size={19} />
              مدیریت کاربران
              <ChevronLeft size={15} className="nav-chevron" />
            </NavLink>
          </>
        )}
      </nav>
      <div className="nav-bottom">
        <div className="nav-note">
          <LayoutDashboard size={22} />
          <strong>همه‌چیز، سر جای خودش.</strong>
          <p>اطلاعات و امنیت حسابت را از اینجا مدیریت کن.</p>
        </div>
        <Button variant="ghost" className="logout" onClick={logout}>
          <LogOut size={18} />
          خروج از حساب
        </Button>
      </div>
    </>
  );
}
function Workspace() {
  const { session } = useAccount();
  const [open, setOpen] = useState(false);
  const location = useLocation();
  useEffect(() => {
    document.querySelector("main h1")?.focus();
  }, [location.pathname]);
  return (
    <div className="workspace">
      <a href="#main-content" className="skip-link">
        رفتن به محتوای اصلی
      </a>
      <aside className="sidebar">
        <Brand />
        <Navigation />
      </aside>
      <div className="workspace-body">
        <header className="topbar">
          <div className="mobile-nav">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" aria-label="باز کردن منو">
                  <Menu size={20} />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="mobile-sheet"
                dir="rtl"
                onCloseAutoFocus={(event) => {
                  // Keep normal dismissal on the menu button; route entrances focus their own heading.
                  if (
                    document.querySelector("main h1") === document.activeElement
                  )
                    event.preventDefault();
                }}
              >
                <SheetHeader>
                  <SheetTitle>منوی رستا</SheetTitle>
                  <SheetDescription>دسترسی به حساب و تنظیمات</SheetDescription>
                </SheetHeader>
                <Brand />
                <Navigation close={() => setOpen(false)} />
              </SheetContent>
            </Sheet>
          </div>
          <span className="breadcrumb">
            فضای کار <ChevronLeft size={14} />
            <strong>رستا</strong>
          </span>
          <div className="topbar-user">
            <span className="avatar small">
              {session.user.name?.slice(0, 1)}
            </span>
            <span>{session.user.name}</span>
            <span className="session-dot" title="وارد حساب شده‌ای" />
          </div>
        </header>
        <main id="main-content" className="content" key={location.pathname}>
          <Outlet />
        </main>
        <footer className="workspace-footer">
          <Brand />
          <span>فضایی برای قدم بعدی تو.</span>
          <span>با خیال راحت، رو به جلو</span>
        </footer>
      </div>
    </div>
  );
}
function Login() {
  const account = useAccount();
  if (account.status !== "ready") return <SessionGate />;
  return account.session ? (
    <Navigate to="/profile" replace />
  ) : (
    <AuthScreen onAuthenticated={account.authenticate} />
  );
}
function ThemeToggle() {
  const [dark, setDark] = useState(
    () => document.documentElement.dataset.theme === "dark",
  );
  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.dataset.theme = next ? "dark" : "light";
    try {
      localStorage.setItem("rasta-theme", next ? "dark" : "light");
    } catch {}
  }
  return (
    <Button
      className="theme-toggle"
      variant="outline"
      onClick={toggle}
      aria-label={dark ? "فعال کردن حالت روشن" : "فعال کردن حالت تیره"}
    >
      {dark ? <Sun size={18} /> : <Moon size={18} />}{" "}
      {dark ? "حالت روشن" : "حالت تیره"}
    </Button>
  );
}
function Landing() {
  return (
    <main className="landing">
      <header className="landing-header">
        <Brand />
        <Button asChild variant="outline">
          <NavLink to="/login">ورود به حساب</NavLink>
        </Button>
      </header>
      <section className="learning-hero">
        <div>
          <span className="hero-label">رستا / آموزش برنامه‌نویسی</span>
          <h1>
            از اولین خط کد،
            <br />
            <span>تا ساختن ایده‌هات.</span>
          </h1>
          <p>
            هر چیزی که می‌سازی، با یک قدم شروع می‌شه. رستا داره آماده می‌شه تا
            همراه مسیر یادگیری برنامه‌نویسی تو باشه.
          </p>
          <Button asChild>
            <NavLink to="/login">ورود / ساخت حساب</NavLink>
          </Button>
        </div>
        <div
          className="code-window"
          dir="ltr"
          aria-label="نمونه کد برنامه‌نویسی"
        >
          <div className="code-caption">hello.js</div>
          <pre>
            <code>
              {
                'const idea = "Something great";\n\nfunction startLearning() {\n  return "Hello, future!";\n}\n\nstartLearning();'
              }
            </code>
          </pre>
          <div className="code-caption">A small start. A new possibility.</div>
        </div>
      </section>
      <section className="launch-note">
        <h2>یک مسیر تازه، به‌زودی</h2>
        <p>
          داریم دوره‌های برنامه‌نویسی رستا رو آماده می‌کنیم. هنوز دوره‌ای برای
          خرید در دسترس نیست؛ فعلاً می‌تونی حسابت رو بسازی و اطلاعاتت رو مدیریت
          کنی.
        </p>
      </section>
    </main>
  );
}
export default function App() {
  const account = useSession();
  return (
    <Direction.Provider dir="rtl">
      <SessionContext.Provider value={account}>
        <BrowserRouter>
          <ThemeToggle />
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route element={<SessionGate />}>
              <Route element={<Workspace />}>
                <Route path="/profile" element={<ProfileScreen />} />
                <Route path="/profile/edit" element={<ProfileEdit />} />
                <Route path="/profile/password" element={<PasswordScreen />} />
                <Route element={<AdminGate />}>
                  <Route path="/admin/users" element={<UsersScreen />} />
                </Route>
              </Route>
            </Route>
            <Route path="*" element={<Navigate to="/profile" replace />} />
          </Routes>
        </BrowserRouter>
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 4500,
            className: "rasta-toast",
            style: {
              direction: "rtl",
              fontFamily: "Vazirmatn",
              background: "var(--surface)",
              color: "var(--foreground)",
              border: "1px solid var(--line)",
              borderRadius: "12px",
            },
            ariaProps: { role: "status", "aria-live": "polite" },
            success: { iconTheme: { primary: "#2854db", secondary: "#fff" } },
          }}
        />
      </SessionContext.Provider>
    </Direction.Provider>
  );
}

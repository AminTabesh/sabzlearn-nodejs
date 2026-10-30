import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import {
  MoreHorizontal,
  Search,
  UsersRound,
  RefreshCw,
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { useAccount } from "../../hooks/useSession";
import { PageHeading, roleLabel } from "../profile/ProfileScreen";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Badge } from "../../components/ui/badge";
import { Card, CardContent } from "../../components/ui/card";
import { Skeleton } from "../../components/ui/skeleton";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "../../components/ui/table";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "../../components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../../components/ui/dialog";
const size = 8;
const fa = (n) => n.toLocaleString("fa-IR");
export default function UsersScreen() {
  const { request, refresh, session, logout } = useAccount();
  const [users, setUsers] = useState([]),
    [loading, setLoading] = useState(true),
    [failed, setFailed] = useState(false);
  const [search, setSearch] = useState(""),
    [role, setRole] = useState("ALL"),
    [page, setPage] = useState(1);
  const [action, setAction] = useState(null),
    [busy, setBusy] = useState(false);
  const lock = useRef(false),
    menuButton = useRef(null),
    alive = useRef(true),
    cancelButton = useRef(null);
  const load = useCallback(async () => {
    setLoading(true);
    setFailed(false);
    try {
      const data = await request("/users");
      if (!Array.isArray(data.data))
        throw new Error("فهرست کاربران کامل دریافت نشد. دوباره تلاش کن.");
      if (alive.current) setUsers(data.data);
    } catch (e) {
      if (alive.current) {
        setFailed(true);
        toast.error(e.message);
      }
    } finally {
      if (alive.current) setLoading(false);
    }
  }, [request]);
  useEffect(() => {
    alive.current = true;
    load();
    return () => {
      alive.current = false;
    };
  }, [load]);
  const filtered = useMemo(
    () =>
      users.filter(
        (u) =>
          (role === "ALL" || u.role === role) &&
          [u.name, u.username, u.email, u.phone].some((v) =>
            v?.toLocaleLowerCase().includes(search.trim().toLocaleLowerCase()),
          ),
      ),
    [users, role, search],
  );
  const pages = Math.max(1, Math.ceil(filtered.length / size));
  const activePage = Math.min(page, pages);
  const rows = filtered.slice((activePage - 1) * size, activePage * size);
  const self = action?.user._id === session.user._id;
  const consequence =
    action?.type === "delete"
      ? `حساب «${action.user.name}» برای همیشه حذف می‌شود.${self ? " حساب خودت حذف می‌شود و از رستا خارج می‌شوی." : ""}`
      : action?.type === "ban"
        ? `شماره موبایل «${action.user.name}» برای ورودهای بعدی و ثبت‌نام مسدود می‌شود. نشست فعلی او بسته نمی‌شود و امکان رفع مسدودی در این پنل وجود ندارد.`
        : action
          ? `نقش «${action.user.name}» به ${roleLabel(action.user.role === "ADMIN" ? "USER" : "ADMIN")} تغییر می‌کند.${self ? " دسترسی مدیریت خودت را از دست می‌دهی و به صفحه حساب می‌روی." : ""}`
          : "";
  async function confirm() {
    if (lock.current || !action) return;
    lock.current = true;
    setBusy(true);
    const id = toast.loading("در حال انجام درخواست…");
    const { user, type } = action;
    try {
      await request(
        type === "delete"
          ? `/users/${user._id}`
          : `/users/${type === "ban" ? "ban" : "change-role"}/${user._id}`,
        { method: type === "delete" ? "DELETE" : "POST", operation: "admin" },
      );
      toast.success(
        type === "delete"
          ? "حساب حذف شد."
          : type === "ban"
            ? "شماره این حساب مسدود شد."
            : "نقش کاربر تغییر کرد.",
        { id },
      );
      setAction(null);
      if (type === "delete" && self) {
        logout();
        return;
      }
      const me = await refresh();
      if (me?.role === "ADMIN") {
        await load();
        document.querySelector("main h1")?.focus();
      }
    } catch (e) {
      toast.error(e.message, { id });
    } finally {
      lock.current = false;
      if (alive.current) setBusy(false);
    }
  }
  return (
    <>
      <PageHeading eyebrow="مدیریت رستا" title="آدم‌های پشت این فضا">
        حساب‌ها را پیدا کن، دسترسی‌ها را مدیریت کن.
      </PageHeading>
      <div className="stats-grid">
        <div className="stat">
          <span className="icon-tile">
            <UsersRound />
          </span>
          <div>
            <span>همه کاربران</span>
            <strong>{loading ? "…" : fa(users.length)}</strong>
          </div>
        </div>
        <div className="stat">
          <span className="icon-tile">
            <ShieldCheck />
          </span>
          <div>
            <span>مدیران</span>
            <strong>
              {loading
                ? "…"
                : fa(users.filter((u) => u.role === "ADMIN").length)}
            </strong>
          </div>
        </div>
        <div className="stat stat-note">
          <strong>دسترسی، به اندازه نیاز</strong>
          <p>پیش از تغییر نقش یا حذف حساب، پیامد آن را بررسی کن.</p>
        </div>
      </div>
      <Card className="users-card">
        <CardContent>
          <div className="users-toolbar">
            <div className="search-box">
              <Label htmlFor="user-search" className="sr-only">
                جست‌وجوی کاربران
              </Label>
              <Search size={18} />
              <Input
                id="user-search"
                placeholder="نام، ایمیل یا شماره موبایل…"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </div>
            <div className="role-filter">
              <Label htmlFor="role-filter">نقش</Label>
              <select
                id="role-filter"
                value={role}
                onChange={(e) => {
                  setRole(e.target.value);
                  setPage(1);
                }}
              >
                <option value="ALL">همه نقش‌ها</option>
                <option value="ADMIN">مدیر</option>
                <option value="USER">کاربر</option>
              </select>
            </div>
            <Button
              variant="outline"
              size="icon"
              aria-label="تازه کردن فهرست"
              disabled={loading || busy}
              onClick={load}
            >
              <RefreshCw size={17} />
            </Button>
          </div>
          {loading ? (
            <div
              className="table-loading"
              aria-label="در حال دریافت کاربران"
              aria-busy="true"
            >
              {Array.from({ length: 5 }, (_, i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : failed ? (
            <div className="empty-state">
              <h2>فهرست به دستمان نرسید</h2>
              <p>اتصال را بررسی کن و دوباره تلاش کن.</p>
              <Button onClick={load}>تلاش دوباره</Button>
            </div>
          ) : !rows.length ? (
            <div className="empty-state">
              <UsersRound size={32} />
              <h2>
                {users.length
                  ? "کاربری با این مشخصات پیدا نشد"
                  : "هنوز کاربری در فهرست نیست"}
              </h2>
              <p>می‌توانی جست‌وجو یا فیلتر را تغییر بدهی.</p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearch("");
                  setRole("ALL");
                }}
              >
                پاک کردن فیلترها
              </Button>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>کاربر</TableHead>
                    <TableHead>شماره موبایل</TableHead>
                    <TableHead>نقش</TableHead>
                    <TableHead className="text-end">عملیات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((user) => (
                    <TableRow key={user._id}>
                      <TableCell>
                        <div className="user-cell">
                          <span className="avatar">
                            {user.name?.slice(0, 1)}
                          </span>
                          <div>
                            <strong>
                              {user.name}{" "}
                              {user._id === session.user._id && (
                                <span className="you-label">(خودت)</span>
                              )}
                            </strong>
                            <span dir="ltr">{user.email}</span>
                            <span dir="auto" className="username">
                              {user.username}
                            </span>
                            <span dir="ltr" className="mobile-user-phone">
                              {user.phone}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell dir="ltr" className="phone-cell">
                        {user.phone}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            user.role === "ADMIN" ? "default" : "secondary"
                          }
                        >
                          {roleLabel(user.role)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-end">
                        <DropdownMenu dir="rtl">
                          <DropdownMenuTrigger asChild>
                            <Button
                              disabled={busy}
                              variant="ghost"
                              size="icon"
                              aria-label={`عملیات ${user.name}`}
                              onPointerDown={(e) => {
                                menuButton.current = e.currentTarget;
                              }}
                              onKeyDown={(e) => {
                                menuButton.current = e.currentTarget;
                              }}
                            >
                              <MoreHorizontal />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>{user.name}</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {[
                              [
                                "role",
                                user.role === "ADMIN"
                                  ? "تغییر نقش به کاربر"
                                  : "تغییر نقش به مدیر",
                              ],
                              ["ban", "مسدود کردن ورود"],
                              ["delete", "حذف حساب"],
                            ].map(([type, label]) => (
                              <DropdownMenuItem
                                key={type}
                                variant={
                                  type === "role" ? "default" : "destructive"
                                }
                                onSelect={() => setAction({ type, user })}
                              >
                                {label}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="pagination">
                <span>
                  {fa(filtered.length)} کاربر · صفحه {fa(activePage)} از{" "}
                  {fa(pages)}
                </span>
                <div>
                  <Button
                    variant="outline"
                    size="icon"
                    aria-label="صفحه قبل"
                    disabled={activePage === 1}
                    onClick={() => setPage(activePage - 1)}
                  >
                    <ChevronRight />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    aria-label="صفحه بعد"
                    disabled={activePage === pages}
                    onClick={() => setPage(activePage + 1)}
                  >
                    <ChevronLeft />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
      <p className="admin-footnote">
        مسدود کردن، ورودهای بعدی و ثبت‌نام با شماره موبایل را متوقف می‌کند.
        وضعیت مسدودی در این فهرست نمایش داده نمی‌شود.
      </p>
      <Dialog
        open={!!action}
        onOpenChange={(open) => {
          if (!busy && !open) setAction(null);
        }}
      >
        <DialogContent
          dir="rtl"
          showCloseButton={!busy}
          onOpenAutoFocus={(e) => {
            e.preventDefault();
            cancelButton.current?.focus();
          }}
          onCloseAutoFocus={(e) => {
            e.preventDefault();
            menuButton.current?.focus();
          }}
          onEscapeKeyDown={(e) => {
            if (busy) e.preventDefault();
          }}
          onPointerDownOutside={(e) => {
            if (busy) e.preventDefault();
          }}
        >
          <DialogHeader>
            <DialogTitle>
              {action?.type === "delete"
                ? "حذف حساب"
                : action?.type === "ban"
                  ? "مسدود کردن ورود"
                  : "تغییر نقش کاربر"}
            </DialogTitle>
            <DialogDescription className="confirmation-copy">
              {consequence}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              ref={cancelButton}
              variant="outline"
              disabled={busy}
              onClick={() => setAction(null)}
            >
              انصراف
            </Button>
            <Button
              variant={action?.type === "role" ? "default" : "destructive"}
              disabled={busy}
              onClick={confirm}
            >
              {busy ? "در حال انجام…" : "تأیید و ادامه"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

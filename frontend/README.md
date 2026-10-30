# رستا — فضای حساب کاربری

رابط فارسی راست‌به‌چپ با React، JavaScript، Vite و Tailwind 4. اجزای JavaScript از shadcn/ui، رفتارهای دسترس‌پذیر Radix، مسیریابی React Router و اعلان‌های react-hot-toast استفاده می‌کنند. فونت Vazirmatn به صورت محلی همراه برنامه ارائه می‌شود.

## اجرا

بک‌اند را از ریشه با `npm install` و `npm run dev` اجرا کنید؛ تنظیمات `MONGO_URI`، `JWT_SECRET` و `PORT=4000` در محیط سرور لازم‌اند. سپس:

```bash
cd frontend
npm ci
npm run dev
```

رابط روی `http://localhost:5173` اجرا می‌شود. Vite مسیر `/api` را به `http://localhost:4000` می‌فرستد؛ برای تغییر مقصد `BACKEND_URL` را تنظیم کنید. برای دامنهٔ مجزای API، `VITE_API_BASE_URL` را هنگام build تنظیم کنید. توکن را در متغیرهای Vite قرار ندهید.

```bash
npm run build
npm run preview
npm run test:e2e
```

تست مرورگر از Chrome نصب‌شده استفاده می‌کند؛ می‌توانید مسیر اجرایی را با `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` مشخص کنید. اگر Chrome محلی ندارید، `npx playwright install chromium` را اجرا کنید. تست‌ها پاسخ‌های API را کنترل می‌کنند و به دیتابیس واقعی دست نمی‌زنند. بررسی مسیرهای واقعی Express و کنترلرها با مدل‌های حافظه‌ای از ریشه اجرا می‌شود:

```bash
node --test tests/auth-session.test.cjs
```

## مسیرها و نشست

| مسیر | کاربرد |
| --- | --- |
| `/login` | ورود و ساخت حساب |
| `/profile` | مرور حساب |
| `/profile/edit` | ویرایش نام، نام کاربری، ایمیل و موبایل |
| `/profile/password` | تغییر رمز با رمز فعلی و تأیید رمز جدید |
| `/admin/users` | جست‌وجو، فیلتر نقش، صفحه‌بندی و عملیات مدیر |

برای انتشار، سرور میزبان باید مسیرهای غیر API را به `index.html` برگرداند تا لینک مستقیم صفحه‌ها کار کند.

حساب و توکن در `sessionStorage` همین تب ذخیره می‌شوند. هنگام بازیابی نشست و ورود به مدیریت، `GET /api/v1/auth/me` اطلاعات تازه را تأیید می‌کند. تا پایان بررسی، محتوای محافظت‌شده نمایش داده نمی‌شود. خطای اتصال امکان تلاش مجدد دارد؛ نشست نامعتبر پاک می‌شود. پاسخ اشتباه بودن رمز فعلی باعث خروج نمی‌شود. پس از تغییر مشخصات، کاربر برگشتی با حافظه و رابط همگام می‌شود؛ تغییر نقش خود مدیر او را به حساب شخصی برمی‌گرداند و حذف حساب خودش باعث خروج می‌شود.

مسدودی فقط ورودهای بعدی و ثبت‌نام با شماره موبایل را متوقف می‌کند. API وضعیت مسدودی یا امکان رفع آن را ارائه نمی‌دهد و نشست فعال را نمی‌بندد.

## ساختار و طراحی

- `src/lib/api.js`: هدر Bearer، خواندن پاسخ و پیام‌های فارسی خطا
- `src/hooks/useSession.js`: بازیابی و تازه‌سازی نشست و مدیریت دسترسی
- `src/features/`: ورود، حساب و مدیریت کاربران
- `src/components/ui/`: اجزای shadcn با تنظیمات RTL در `components.json`
- `src/styles.css`: توکن‌های مشترک، طراحی کبالت، رفتار پاسخ‌گو و reduced motion
- `tests/`: سناریوهای مرورگر برای نشست، فرم‌ها و عملیات حساس

برای افزودن اجزا از `npx shadcn@latest add <component>` استفاده کنید و import ابزار `cn` را به `@/lib/utils` نگه دارید. راهنمای نصب: [shadcn برای Vite](https://ui.shadcn.com/docs/installation/vite)، [RTL](https://ui.shadcn.com/docs/rtl)، [Toaster](https://react-hot-toast.com/docs/toaster).

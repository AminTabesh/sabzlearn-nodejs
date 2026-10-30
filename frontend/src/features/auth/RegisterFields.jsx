import TextField from "../../components/TextField.jsx";

export default function RegisterFields({ values, onChange }) {
  return (
    <>
      <div className="field-grid">
        <TextField
          id="name"
          label="نام و نام خانوادگی"
          value={values.name}
          onChange={onChange}
          placeholder="مثلاً سارا محمدی"
          autoComplete="name"
          minLength={3}
          maxLength={255}
        />
        <TextField
          id="username"
          label="نام کاربری"
          value={values.username}
          onChange={onChange}
          placeholder="مثلاً saram"
          autoComplete="username"
          minLength={3}
          maxLength={100}
        />
      </div>
      <div className="field-grid">
        <TextField
          id="email"
          label="ایمیل"
          type="email"
          value={values.email}
          onChange={onChange}
          placeholder="sara@example.com"
          autoComplete="email"
        />
        <TextField
          id="phone"
          label="شماره موبایل"
          type="tel"
          value={values.phone}
          onChange={onChange}
          placeholder="09123456789"
          autoComplete="tel"
          inputMode="numeric"
          note="با ۰۹ شروع شود؛ ۱۱ رقم"
        />
      </div>
      <div className="field-grid">
        <TextField
          id="password"
          label="رمز عبور"
          type="password"
          value={values.password}
          onChange={onChange}
          placeholder="حداقل ۸ کاراکتر"
          autoComplete="new-password"
          minLength={8}
          maxLength={40}
        />
        <TextField
          id="passwordConfirm"
          label="تکرار رمز عبور"
          type="password"
          value={values.passwordConfirm}
          onChange={onChange}
          placeholder="رمز عبور را تکرار کن"
          autoComplete="new-password"
          minLength={8}
          maxLength={40}
        />
      </div>
    </>
  );
}

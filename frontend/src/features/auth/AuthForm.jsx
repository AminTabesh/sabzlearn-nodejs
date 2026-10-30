import Icon from "../../components/Icon.jsx";
import LoginFields from "./LoginFields.jsx";
import RegisterFields from "./RegisterFields.jsx";
import useAuthForm from "./useAuthForm.js";

export default function AuthForm({ onAuthenticated }) {
  const form = useAuthForm(onAuthenticated);
  const isRegister = form.mode === "register";

  return (
    <div className="form-inner">
      <div className="form-heading">
        <span className="form-kicker"><span className="kicker-line" /> {isRegister ? "به جمع ما خوش آمدی" : "خوش برگشتی"}</span>
        <h1>{isRegister ? "حساب کاربری بساز" : "دوباره شروع کنیم"}<span className="heading-period">.</span></h1>
        <p>{isRegister ? "برای شروع مسیر یادگیری، چند قدم کوتاه تا ساخت حساب باقی مانده." : "برای دیدن اطلاعات حسابت، وارد دنیای رستا شو."}</p>
      </div>

      <div className="auth-tabs" aria-label="نوع ورود">
        <button type="button" aria-pressed={!isRegister} className={!isRegister ? "active" : ""} onClick={() => form.switchMode("login")}>ورود به حساب</button>
        <button type="button" aria-pressed={isRegister} className={isRegister ? "active" : ""} onClick={() => form.switchMode("register")}>ساخت حساب</button>
      </div>

      <form onSubmit={form.submit} className="auth-form" key={form.mode}>
        {isRegister
          ? <RegisterFields values={form.register} onChange={form.changeRegister} />
          : <LoginFields identifier={form.identifier} password={form.loginPassword} onIdentifierChange={form.changeIdentifier} onPasswordChange={form.changeLoginPassword} />}

        <div className="form-error" role="alert" aria-live="polite">{form.error}</div>
        <button type="submit" disabled={form.loading} className="submit-button">
          <span>{form.loading ? "لطفاً صبر کن..." : isRegister ? "ساخت حساب کاربری" : "ورود به حساب"}</span>
          {!form.loading && <Icon name="arrow" size={20} />}
          {form.loading && <span className="button-spinner" aria-hidden="true" />}
        </button>
      </form>

      <p className="switch-prompt">
        {isRegister ? "قبلاً حساب ساخته‌ای؟" : "هنوز حساب نداری؟"}{" "}
        <button type="button" onClick={() => form.switchMode(isRegister ? "login" : "register")}>{isRegister ? "وارد شو" : "همین حالا ثبت‌نام کن"}</button>
      </p>
    </div>
  );
}

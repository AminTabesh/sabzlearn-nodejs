import Brand from "../../components/Brand.jsx";
import Icon from "../../components/Icon.jsx";

function ProfileDetails({ user }) {
  const items = [
    ["نام و نام خانوادگی", user.name],
    ["نام کاربری", user.username],
    ["ایمیل", user.email],
    ["شماره موبایل", user.phone],
    ["نوع حساب", user.role === "ADMIN" ? "مدیر" : "کاربر"],
  ];

  return (
    <dl className="profile-details">
      {items.map(([label, value]) => (
        <div className="detail-row" key={label}>
          <dt>{label}</dt>
          <dd dir={label === "ایمیل" || label === "شماره موبایل" ? "ltr" : "auto"}>{value || "—"}</dd>
        </div>
      ))}
    </dl>
  );
}

export default function ProfileScreen({ user, onLogout }) {
  return (
    <div className="profile-page">
      <a href="#main-content" className="skip-link">رفتن به اطلاعات حساب</a>
      <header className="profile-header"><Brand /><span className="profile-header-label">فضای شخصی تو</span></header>
      <main id="main-content" className="profile-main">
        <div className="profile-decor profile-decor-one" aria-hidden="true" /><div className="profile-decor profile-decor-two" aria-hidden="true" />
        <section className="profile-intro">
          <span className="form-kicker"><span className="kicker-line" /> حساب کاربری من</span>
          <h1>خوش آمدی، <em>{user.name || user.username}</em><span className="heading-period">.</span></h1>
          <p>اطلاعات حسابت اینجاست. مسیر یادگیری‌ات از همین نقطه شروع می‌شود.</p>
        </section>
        <section className="profile-card" aria-labelledby="profile-title">
          <div className="profile-card-head">
            <span className="profile-icon"><Icon name="user" size={26} /></span>
            <div><h2 id="profile-title">اطلاعات حساب</h2><p>جزئیاتی که هنگام ثبت‌نام وارد کرده‌ای</p></div>
            <span className="profile-badge"><Icon name="shield" size={15} /> حساب فعال</span>
          </div>
          <ProfileDetails user={user} />
          <div className="profile-card-foot"><button type="button" className="logout-button" onClick={onLogout}><Icon name="logout" size={19} /> خروج از حساب</button></div>
        </section>
        <p className="profile-caption">یادگیری از یک قدم کوچک شروع می‌شود. ✳</p>
      </main>
    </div>
  );
}

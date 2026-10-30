import Brand from "../../components/Brand.jsx";
import AuthForm from "./AuthForm.jsx";
import StoryPanel from "./StoryPanel.jsx";

export default function AuthScreen({ onAuthenticated }) {
  return (
    <div className="app-shell auth-layout">
      <a href="#main-content" className="skip-link">
        رفتن به فرم
      </a>
      <StoryPanel />
      <main id="main-content" className="form-panel">
        <div className="mobile-brand">
          <Brand />
        </div>
        <AuthForm onAuthenticated={onAuthenticated} />
        <div className="form-footer">
          <span>با آرامش یاد بگیر، با اطمینان رشد کن.</span>
          <span dir="ltr">RASTA</span>
        </div>
      </main>
    </div>
  );
}

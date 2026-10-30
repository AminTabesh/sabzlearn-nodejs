import Brand from "../../components/Brand";
import { ArrowUpLeft, Layers3 } from "lucide-react";
export default function StoryPanel() {
  return (
    <aside className="story-panel">
      <Brand light />
      <div className="story-copy">
        <span className="story-label">فضایی برای قدم بعدی</span>
        <h2>
          مسیر تو.
          <br />
          با یک خط کد.
        </h2>
        <p>
          به رستا خوش آمدی؛
          <br />
          همراه قدم‌های تازه‌ات در دنیای برنامه‌نویسی.
        </p>
        <div className="auth-art" aria-hidden="true">
          <div className="art-card">
            <Layers3 size={32} />
            <span>شروع یک مسیر تازه</span>
            <ArrowUpLeft size={23} />
          </div>
          <div className="art-block" />
          <div className="art-circle" />
        </div>
      </div>
      <div className="story-footer">
        <span>رستا، همراه مسیر تو</span>
        <span dir="ltr">YOUR NEXT CHAPTER</span>
      </div>
    </aside>
  );
}

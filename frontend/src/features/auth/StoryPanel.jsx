import Brand from "../../components/Brand.jsx";
import Icon from "../../components/Icon.jsx";

function StoryArtwork() {
  return (
    <div className="story-art" aria-hidden="true">
      <div className="orbit orbit-one" /><div className="orbit orbit-two" />
      <div className="art-card art-card-back"><span className="art-card-small">آغاز یک مسیر تازه</span><span className="art-card-line" /><span className="art-card-line short" /></div>
      <div className="art-card art-card-front"><span className="art-sun" /><span className="art-hill hill-one" /><span className="art-hill hill-two" /><span className="art-stem" /><span className="art-leaf leaf-one" /><span className="art-leaf leaf-two" /></div>
      <span className="art-star star-one">✳</span><span className="art-star star-two">✴</span>
    </div>
  );
}

export default function StoryPanel() {
  return (
    <aside className="story-panel" aria-label="درباره رستا">
      <div className="story-grain" aria-hidden="true" />
      <div className="relative z-10 flex h-full flex-col justify-between">
        <Brand light />
        <div className="story-content">
          <StoryArtwork />
          <div className="story-copy">
            <span className="eyebrow"><Icon name="spark" size={17} /> یادگیری، به سبک تو</span>
            <h2>هر مسیرِ بزرگ،<br /><em>از یک قدم شروع می‌شود.</em></h2>
            <p>در رستا، مسیر یادگیری‌ات را با خیال راحت آغاز کن. اینجا قرار است هر روز، یک قدم به آنچه می‌خواهی نزدیک‌تر شوی.</p>
          </div>
        </div>
        <div className="story-footer"><span>فضایی برای رشد مداوم</span><span>۱۴۰۵ © رستا</span></div>
      </div>
    </aside>
  );
}

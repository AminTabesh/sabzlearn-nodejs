export default function Brand({ light = false }) {
  return (
    <div className={`brand ${light ? "brand-light" : ""}`} aria-label="رستا">
      <span className="brand-mark" aria-hidden="true">
        <i />
        <i />
        <i />
      </span>
      <span>
        رستا<span className="brand-dot">.</span>
      </span>
    </div>
  );
}

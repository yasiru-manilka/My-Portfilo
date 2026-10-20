export default function Section({ id, cfg, wide = false, bodyClass = "section-body", children }) {
  return (
    <section className={`section${wide ? " section-wide" : ""}`} id={id} aria-labelledby={`${id}Title`}>
      <div className="section-head">
        <h2 id={`${id}Title`}>{cfg.title}</h2>
        {cfg.note && <p className="section-note">{cfg.note}</p>}
      </div>
      <div className={bodyClass}>{children}</div>
    </section>
  );
}

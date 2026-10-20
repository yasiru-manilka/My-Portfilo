import Section from "./Section.jsx";
import { assetUrl } from "../lib/utils";

export default function Achievements({ items, cfg, onZoom }) {
  return (
    <div className="band">
      <Section id="achievements" cfg={cfg}>
        <ul className="honours">
          {items.map((r, i) => {
            const img = assetUrl(r.image_url);
            const caption = [r.title, r.date_label].filter(Boolean).join(", ");
            return (
              <li className={`honour${img ? " has-image" : ""}`} key={r.id || i}>
                <div className="honour-text">
                  <h3>{r.title}</h3>
                  <p className="honour-meta">
                    {r.org}
                    {r.date_label && <span>{r.date_label}</span>}
                  </p>
                  {r.note && <p className="honour-note">{r.note}</p>}
                </div>
                {img && (
                  <button
                    className="honour-img"
                    type="button"
                    aria-label={`View the ${r.title} image larger`}
                    onClick={() => onZoom({ src: img, caption })}
                  >
                    <img src={img} alt="" loading="lazy" />
                    <span className="honour-img-hint">View</span>
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      </Section>
    </div>
  );
}

import Section from "./Section.jsx";
import { assetUrl } from "../lib/utils";

export default function Certificates({ items, cfg, onZoom }) {
  return (
    <Section id="certificates" cfg={cfg}>
      <ul className="certs">
        {items.map((c, i) => {
          const img = assetUrl(c.image_url);
          const open = () => onZoom({ src: img, caption: c.title });
          return (
            <li className="cert" key={c.id || i}>
              {img ? (
                <button className="cert-thumb" type="button" aria-label={`View the ${c.title} certificate larger`} onClick={open}>
                  <img src={img} alt="" loading="lazy" />
                </button>
              ) : (
                <div className="cert-thumb cert-thumb-empty" aria-hidden="true" />
              )}
              <div className="cert-main">
                <h3>{c.title}</h3>
                <p className="cert-issuer">
                  {c.issuer}
                  {c.issued ? `, ${c.issued}` : ""}
                </p>
                {img && (
                  <button className="cert-view" type="button" onClick={open}>View certificate</button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </Section>
  );
}

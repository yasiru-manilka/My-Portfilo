import { useState } from "react";
import Section from "./Section.jsx";
import { assetUrl, list, range } from "../lib/utils";

function Logo({ src, alt, className }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) return null;
  return <img className={className} src={src} alt={alt} loading="lazy" onError={() => setFailed(true)} />;
}

export { Logo };

export default function Experience({ items, cfg }) {
  return (
    <Section id="experience" cfg={cfg}>
      <ol className="timeline">
        {items.map((x, i) => {
          const tags = list(x.tags);
          return (
            <li className="xp" key={x.id || i}>
              <p className="xp-when">{range(x.start_label, x.end_label, x.current)}</p>
              <div className="xp-main">
                <div className="xp-top">
                  <Logo className="xp-logo" src={assetUrl(x.logo_url)} alt={`${x.org} logo`} />
                  <div>
                    <h3 className="xp-role">{x.role}</h3>
                    <p className="xp-org">{x.org}</p>
                  </div>
                </div>
                {x.summary && <p className="xp-summary">{x.summary}</p>}
                {tags.length > 0 && <p className="xp-tags">{tags.join(", ")}</p>}
              </div>
            </li>
          );
        })}
      </ol>
    </Section>
  );
}

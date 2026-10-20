import Section from "./Section.jsx";
import { assetUrl, list } from "../lib/utils";

export default function Projects({ items, cfg, onOpen }) {
  return (
    <Section id="projects" cfg={cfg} wide>
      <div className="projects">
        {items.map((p, i) => {
          const cover = list(p.images).map(assetUrl).find(Boolean);
          const stack = list(p.stack);
          return (
            <button className="pcard" type="button" key={p.id || i} aria-haspopup="dialog" onClick={() => onOpen(p)}>
              <span className={`pcard-cover${cover ? "" : " is-empty"}`}>
                {cover ? (
                  <img src={cover} alt="" loading="lazy" />
                ) : (
                  <span className="pcard-cover-title" aria-hidden="true">{p.tagline || p.title}</span>
                )}
                {p.status && <span className="pcard-status">{p.status}</span>}
              </span>
              <span className="pcard-body">
                <span className="pcard-title">{p.title}</span>
                {p.tagline && <span className="pcard-tagline">{p.tagline}</span>}
                <span className="pcard-meta">{[p.role, p.year].filter(Boolean).join(", ")}</span>
                {stack.length > 0 && <span className="pcard-stack">{stack.slice(0, 5).join(", ")}</span>}
              </span>
            </button>
          );
        })}
      </div>
    </Section>
  );
}

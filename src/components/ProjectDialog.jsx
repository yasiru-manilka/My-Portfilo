import { useEffect, useState } from "react";
import Modal from "./Modal.jsx";
import { assetUrl, externalProps, list, parseLinks, safeUrl } from "../lib/utils";

export default function ProjectDialog({ project, onClose }) {
  const [current, setCurrent] = useState(0);
  useEffect(() => setCurrent(0), [project]);

  const p = project || {};
  const imgs = list(p.images).map(assetUrl).filter(Boolean);
  const hl = list(p.highlights);
  const stack = list(p.stack);
  const link = safeUrl(p.link);
  const repo = safeUrl(p.repo);
  const others = parseLinks(p.other_links);

  return (
    <Modal open={Boolean(project)} onClose={onClose} className="project-dialog" aria-labelledby="pdTitle">
      <div className="pd">
        <header className="pd-head">
          <div>
            <p className="pd-meta">
              {[p.role, p.year].filter(Boolean).join(", ")}
              {p.status && <span className="pd-status">{p.status}</span>}
            </p>
            <h2 id="pdTitle">{p.title}</h2>
            {p.tagline && <p className="pd-tagline">{p.tagline}</p>}
          </div>
          <form method="dialog">
            <button className="pd-close" aria-label="Close project">Close</button>
          </form>
        </header>

        {imgs.length > 0 && (
          <div className="pd-gallery">
            <img className="pd-main" src={imgs[current] || imgs[0]} alt={`${p.title} screenshot ${current + 1}`} />
            {imgs.length > 1 && (
              <div className="pd-thumbs">
                {imgs.map((src, k) => (
                  <button
                    type="button"
                    className="pd-thumb"
                    key={src + k}
                    aria-label={`Show screenshot ${k + 1}`}
                    aria-current={k === current ? "true" : undefined}
                    onClick={() => setCurrent(k)}
                  >
                    <img src={src} alt="" />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="pd-body">
          {p.summary && <p className="pd-summary">{p.summary}</p>}
          {hl.length > 0 && (
            <>
              <h3>My part</h3>
              <ul className="project-hl">
                {hl.map((h, i) => <li key={i}>{h}</li>)}
              </ul>
            </>
          )}
          {stack.length > 0 && (
            <p className="project-stack"><span>Built with</span> {stack.join(", ")}</p>
          )}
          {(link || repo || others.length > 0) && (
            <p className="pd-links">
              {link && <a className="btn btn-solid" href={link} target="_blank" rel="noopener">Open live project</a>}
              {repo && <a className="btn btn-line" href={repo} target="_blank" rel="noopener">View code on GitHub</a>}
              {others.map((o, i) => (
                <a className="btn btn-line" key={i} href={o.url} {...externalProps(o.url)}>{o.label}</a>
              ))}
            </p>
          )}
        </div>
      </div>
    </Modal>
  );
}

import { useEffect, useRef, useState } from "react";
import { assetUrl, safeUrl } from "../lib/utils";

function uniShortName(university) {
  if (/colombo school of computing/i.test(university || "")) return "UCSC";
  const caps = (university || "").match(/\b[A-Z]/g);
  return caps ? caps.join("").slice(0, 4) : "";
}

export default function Hero({ profile }) {
  const portraitRef = useRef(null);
  const [logoOk, setLogoOk] = useState(false);
  const words = String(profile.name || "Yasiru Manilka").trim().split(/\s+/);
  const email = (profile.email || "").trim();
  const cv = safeUrl(profile.cv_url);
  const uniUrl = safeUrl(profile.university_url);
  const logo = assetUrl(profile.university_logo_url);

  useEffect(() => {
    document.title = `${profile.name} · ${profile.role_line || "Portfolio"}`;
  }, [profile.name, profile.role_line]);

  useEffect(() => {
    let done = false;
    const reveal = () => {
      if (done) return;
      done = true;
      requestAnimationFrame(() => requestAnimationFrame(() => document.body.classList.remove("is-loading")));
    };
    const img = portraitRef.current;
    if (img && img.complete) reveal();
    else if (img) {
      img.addEventListener("load", reveal, { once: true });
      img.addEventListener("error", reveal, { once: true });
    }
    const t = setTimeout(reveal, 1500);
    return () => clearTimeout(t);
  }, []);

  return (
    <section className="hero" id="top" aria-labelledby="heroName">
      <div className="hero-text">
        {(profile.university || profile.role_line) && (
          <a className="uni" {...(uniUrl ? { href: uniUrl, target: "_blank", rel: "noopener" } : {})}>
            <span className="uni-logo">
              {logo && (
                <img
                  src={logo}
                  alt={`${profile.university || "University"} logo`}
                  hidden={!logoOk}
                  onLoad={() => setLogoOk(true)}
                  onError={() => setLogoOk(false)}
                />
              )}
              {!logoOk && <span className="uni-fallback">{uniShortName(profile.university)}</span>}
            </span>
            <span className="uni-text">
              <span className="uni-degree">{profile.role_line}</span>
              <span className="uni-name">{profile.university}</span>
            </span>
          </a>
        )}
        <h1 className="hero-name" id="heroName">
          {words.map((w, i) => (
            <span className="line" key={i}>
              <span style={{ "--i": i }}>{w}</span>
            </span>
          ))}
        </h1>
        {profile.intro && <p className="hero-intro">{profile.intro}</p>}
        <div className="hero-actions">
          <a className="btn btn-solid" href={email ? `mailto:${email}` : "#contact"}>Email me</a>
          <a className="btn btn-quiet" href="#projects">See my projects</a>
          {cv && (
            <a className="btn btn-quiet" href={assetUrl(cv)} target="_blank" rel="noopener">Download CV</a>
          )}
        </div>
        {profile.show_status && profile.status && (
          <p className="hero-status">
            <span className="pulse" aria-hidden="true" />
            <span>{profile.status}</span>
          </p>
        )}
      </div>
      <div className="hero-photo">
        <figure className="portrait">
          <img
            ref={portraitRef}
            src={assetUrl(profile.photo_url) || assetUrl("assets/portrait.jpg")}
            alt={`Portrait of ${profile.name}`}
            width="1100"
            height="1650"
            fetchpriority="high"
          />
        </figure>
      </div>
    </section>
  );
}

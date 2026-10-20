import { useEffect, useState } from "react";
import { assetUrl } from "../lib/utils";

function initials(name) {
  return String(name || "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("") || "YM";
}

export default function TopBar({ profile, nav }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [avatarFailed, setAvatarFailed] = useState(false);
  const avatar = assetUrl(profile.avatar_url);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const close = () => setOpen(false);

  return (
    <header className={`topbar${scrolled ? " is-scrolled" : ""}`}>
      <a className="mark" href="#top" aria-label="Back to top">
        <span className="mark-initials">
          {avatar && !avatarFailed ? (
            <img src={avatar} alt={profile.name || ""} onError={() => setAvatarFailed(true)} />
          ) : (
            <span>{initials(profile.name)}</span>
          )}
        </span>
        <span className="mark-name">{profile.name}</span>
      </a>
      <nav className={`nav${open ? " is-open" : ""}`} id="nav" aria-label="Sections">
        {nav.map((n) => (
          <a key={n.key} href={n.href} className={n.extra ? "nav-extra" : undefined} onClick={close}>
            {n.title}
          </a>
        ))}
        <a href="#contact" className="nav-contact" onClick={close}>Get in touch</a>
      </nav>
      <button className="menu-btn" aria-expanded={open} aria-controls="nav" onClick={() => setOpen(!open)}>
        <span className="menu-btn-label">{open ? "Close" : "Menu"}</span>
      </button>
    </header>
  );
}

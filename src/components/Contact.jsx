import { useEffect, useState } from "react";
import { assetUrl, externalProps, safeUrl } from "../lib/utils";

const timeFormat = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Colombo" });

export default function Contact({ profile }) {
  const [time, setTime] = useState(() => timeFormat.format(new Date()));
  useEffect(() => {
    const t = setInterval(() => setTime(timeFormat.format(new Date())), 30000);
    return () => clearInterval(t);
  }, []);

  const email = (profile.email || "").trim();
  const phone = (profile.phone || "").trim();
  const links = [
    ["LinkedIn", safeUrl(profile.linkedin)],
    ["GitHub", safeUrl(profile.github)],
    ["Download CV", safeUrl(profile.cv_url) && assetUrl(profile.cv_url)],
    [phone ? `Call ${phone}` : "", phone ? `tel:${phone.replace(/\s+/g, "")}` : ""]
  ].filter(([label, url]) => label && url);

  return (
    <div className="band band-contact">
      <section className="contact" id="contact" aria-labelledby="contactTitle">
        <h2 id="contactTitle" className="contact-title">
          {profile.contact_heading || "Let's talk about internships, projects or anything you're building."}
        </h2>
        {email && <a className="contact-email" href={`mailto:${email}`}>{email}</a>}
        {links.length > 0 && (
          <ul className="contact-links">
            {links.map(([label, url]) => (
              <li key={label}><a href={url} {...externalProps(url)}>{label}</a></li>
            ))}
          </ul>
        )}
        <p className="contact-time">It's <time>{time}</time> in Sri Lanka right now.</p>
      </section>
    </div>
  );
}

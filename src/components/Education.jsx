import Section from "./Section.jsx";
import { Logo } from "./Experience.jsx";
import { assetUrl, list, range } from "../lib/utils";

export default function Education({ items, cfg, profile }) {
  return (
    <Section id="education" cfg={cfg}>
      {items.map((e, i) => {
        const logo =
          assetUrl(e.logo_url) ||
          (e.school && e.school === profile.university ? assetUrl(profile.university_logo_url) : "");
        const courses = list(e.courses);
        return (
          <article className="edu" key={e.id || i}>
            <div className="edu-side">
              <p className="xp-when">{range(e.start_label, e.end_label, !e.end_label)}</p>
              <Logo className="edu-logo" src={logo} alt={`${e.school} logo`} />
            </div>
            <div>
              <h3 className="xp-role">{e.degree}</h3>
              <p className="xp-org">{e.school}</p>
              {e.note && <p className="xp-summary">{e.note}</p>}
              {courses.length > 0 && (
                <p className="edu-courses"><span>Current modules</span>{courses.join(", ")}</p>
              )}
            </div>
          </article>
        );
      })}
    </Section>
  );
}

import Section from "./Section.jsx";

export default function About({ profile, cfg }) {
  const facts = [
    ["Studying", [profile.role_line, profile.university].filter(Boolean).join(", ")],
    ["Based in", profile.location],
    ["Phone", profile.phone]
  ].filter(([, v]) => v);

  return (
    <Section id="about" cfg={cfg}>
      <p className="lede">{profile.about}</p>
      {facts.length > 0 && (
        <dl className="facts">
          {facts.map(([k, v]) => (
            <div key={k}>
              <dt>{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
      )}
    </Section>
  );
}

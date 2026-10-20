import Section from "./Section.jsx";

export default function Skills({ items, cfg }) {
  const groups = new Map();
  items.forEach((s) => {
    const k = s.category || "Other";
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k).push(s);
  });

  return (
    <Section id="skills" cfg={cfg}>
      <div className="skill-groups">
        {[...groups].map(([cat, skills]) => (
          <div className="skill-group" key={cat}>
            <h3>{cat}</h3>
            <ul>
              {skills.map((s, i) => <li key={s.id || i}>{s.name}</li>)}
            </ul>
          </div>
        ))}
      </div>
    </Section>
  );
}

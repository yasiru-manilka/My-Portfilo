import { useEffect, useMemo, useState } from "react";
import { loadPortfolio } from "./lib/data";
import { getSections } from "./lib/sections";
import TopBar from "./components/TopBar.jsx";
import Hero from "./components/Hero.jsx";
import About from "./components/About.jsx";
import Projects from "./components/Projects.jsx";
import ProjectDialog from "./components/ProjectDialog.jsx";
import Experience from "./components/Experience.jsx";
import Achievements from "./components/Achievements.jsx";
import Certificates from "./components/Certificates.jsx";
import Skills from "./components/Skills.jsx";
import Education from "./components/Education.jsx";
import Contact from "./components/Contact.jsx";
import Footer from "./components/Footer.jsx";
import Lightbox from "./components/Lightbox.jsx";

const NAV = [
  { key: "projects", href: "#projects", list: "projects" },
  { key: "experience", href: "#experience", list: "experience" },
  { key: "achievements", href: "#achievements", list: "recognition" },
  { key: "certificates", href: "#certificates", list: "certificates" },
  { key: "skills", href: "#skills", list: "skills" },
  { key: "education", href: "#education", list: "education", extra: true }
];

export default function App() {
  const [data, setData] = useState(null);
  const [project, setProject] = useState(null);
  const [image, setImage] = useState(null);

  useEffect(() => {
    loadPortfolio().then(setData);
  }, []);

  const sections = useMemo(() => getSections(data?.profile), [data]);

  if (!data) return null;

  const profile = data.profile || {};
  const shows = (key, items) => sections[key].visible !== false && (items === undefined || items.length > 0);

  const nav = NAV.filter((n) => shows(n.key, data[n.list] || [])).map((n) => ({
    ...n,
    title: sections[n.key].title
  }));

  return (
    <>
      <a className="skip" href="#main">Skip to content</a>
      <TopBar profile={profile} nav={nav} />
      <main id="main">
        <Hero profile={profile} />
        {shows("about") && profile.about && <About profile={profile} cfg={sections.about} />}
        {shows("projects", data.projects) && <Projects items={data.projects} cfg={sections.projects} onOpen={setProject} />}
        {shows("experience", data.experience) && <Experience items={data.experience} cfg={sections.experience} />}
        {shows("achievements", data.recognition) && (
          <Achievements items={data.recognition} cfg={sections.achievements} onZoom={setImage} />
        )}
        {shows("certificates", data.certificates) && (
          <Certificates items={data.certificates} cfg={sections.certificates} onZoom={setImage} />
        )}
        {shows("skills", data.skills) && <Skills items={data.skills} cfg={sections.skills} />}
        {shows("education", data.education) && (
          <Education items={data.education} cfg={sections.education} profile={profile} />
        )}
        <Contact profile={profile} />
      </main>
      <Footer name={profile.name} />
      <Lightbox image={image} onClose={() => setImage(null)} />
      <ProjectDialog project={project} onClose={() => setProject(null)} />
    </>
  );
}

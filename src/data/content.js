const content = {
  profile: {
    name: "Yasiru Manilka",
    role_line: "BSc Computer Science (UG), 2nd Year",
    university: "University of Colombo School of Computing",
    university_url: "https://ucsc.cmb.ac.lk",
    university_logo_url: "assets/ucsc-logo.png",
    intro: "I'm a second-year BSc Computer Science undergraduate at the University of Colombo School of Computing and the Finance Team Co-Lead of the CSSL GenZ Chapter of UCSC.",
    about: "Most of my time goes into coursework in software architecture, networks and statistics, and into ServiceHub, the smart technician booking management platform my team is building for our second-year group project. Outside class I handle budgets and records for the CSSL GenZ Chapter, which has taught me as much about planning and accountability as any module.",
    location: "Matara, Sri Lanka",
    email: "yasirumanilkaidw@gmail.com",
    phone: "",
    linkedin: "https://www.linkedin.com/in/yasiru-manilka-a800a0410",
    github: "https://github.com/yasiru-manilka",
    cv_url: "",
    photo_url: "assets/portrait.jpg",
    avatar_url: "assets/avatar-small.jpg",
    status: "Open to software engineering internships",
    show_status: true,
    contact_heading: "Let's talk about internships, projects or anything you're building.",
    sections: {
      about: {
        title: "About",
        note: "",
        visible: true
      },
      projects: {
        title: "Projects",
        note: "Open a project to see screenshots, my part in it and links.",
        visible: true
      },
      experience: {
        title: "Experience",
        note: "Roles I've held, most recent first.",
        visible: true
      },
      achievements: {
        title: "Achievements",
        note: "",
        visible: true
      },
      certificates: {
        title: "Certificates",
        note: "Courses I have completed. Open one to see it full size.",
        visible: true
      },
      skills: {
        title: "Skills",
        note: "",
        visible: true
      },
      education: {
        title: "Education",
        note: "",
        visible: true
      }
    }
  },
  experience: [
    {
      role: "Finance Team Co-Lead",
      org: "CSSL GenZ Chapter of UCSC",
      logo_url: "assets/logos/cssl-genz.png",
      start_label: "Apr 2026",
      end_label: "",
      current: true,
      summary: "Co-lead the chapter's five-person finance team. We plan event budgets, track income and spending, and keep the records the committee relies on.",
      tags: [
        "Financial management",
        "Budgeting",
        "Team leadership"
      ]
    },
    {
      role: "Organizing Committee, Finance Team",
      org: "GenZipher by CSSL GenZ Chapter of UCSC",
      logo_url: "assets/logos/cssl-genz.png",
      start_label: "2026",
      end_label: "2026",
      current: false,
      summary: "Worked on the finance team that organized GenZipher, supporting budgeting and sponsor coordination for the event.",
      tags: [
        "Event finance",
        "Sponsorships"
      ]
    },
    {
      role: "Member",
      org: "CSSL GenZ Chapter of UCSC",
      logo_url: "assets/logos/cssl-genz.png",
      start_label: "Aug 2025",
      end_label: "Apr 2026",
      current: false,
      summary: "Volunteered across chapter events and was named Volunteer of the Month in October 2025.",
      tags: [
        "Volunteering",
        "Event support"
      ]
    }
  ],
  projects: [
    {
      title: "ServiceHub",
      tagline: "Smart technician booking management platform",
      role: "2nd-year group project, 4 members",
      year: "2026",
      status: "In development",
      summary: "A platform that connects customers with technicians, manages bookings end to end, and gives administrators and the platform owner their own dashboards.",
      highlights: [
        "Built the customer management module, including customer address management",
        "Implemented JWT authentication with role-based access for four roles: customer, technician, administrator and platform owner",
        "Restructured the codebase into a clean MVC architecture",
        "Split a single-file prototype into 13 modular pages with shared CSS and JS",
        "Produced the UML documentation: use case, class, component and sequence diagrams"
      ],
      stack: [
        "PHP",
        "MySQL",
        "JavaScript",
        "HTML & CSS",
        "MVC"
      ],
      images: [],
      link: "",
      repo: "",
      other_links: []
    },
    {
      title: "Ticket Booking System",
      tagline: "A fault-tolerant distributed system",
      role: "Personal project",
      year: "2026",
      status: "In development",
      summary: "A ticket booking system designed to keep working when parts of it fail, built to learn how distributed systems handle replication and recovery.",
      highlights: [],
      stack: [],
      images: [],
      link: "",
      repo: "",
      other_links: []
    },
    {
      title: "Personal Budget Optimizer",
      tagline: "Plan and balance a personal budget",
      role: "Personal project",
      year: "2025",
      status: "Completed",
      summary: "A web app for planning a personal budget and seeing where money goes.",
      highlights: [],
      stack: [
        "TypeScript"
      ],
      images: [],
      link: "",
      repo: "https://github.com/yasiru-manilka/Personal_budget_optimizer",
      other_links: []
    },
    {
      title: "Learning Management App",
      tagline: "Courses, lessons and learners in one place",
      role: "Personal project",
      year: "2025",
      status: "Completed",
      summary: "A learning management web app for organizing courses and lessons.",
      highlights: [],
      stack: [
        "TypeScript"
      ],
      images: [],
      link: "",
      repo: "https://github.com/yasiru-manilka/Learning-management-app",
      other_links: []
    }
  ],
  certificates: [
    {
      title: "Server Side Web Programming",
      issuer: "Centre for Open & Distance Learning, University of Moratuwa",
      issued: "2026",
      image_url: "assets/certs/server-side-web-programming.jpg"
    },
    {
      title: "Python Programming",
      issuer: "Centre for Open & Distance Learning, University of Moratuwa",
      issued: "2026",
      image_url: "assets/certs/python-programming.jpg"
    }
  ],
  recognition: [
    {
      title: "Director's List",
      org: "University of Colombo School of Computing",
      date_label: "Academic Year 22, Year 1 Semester 2",
      note: "Selected for academic performance in the BSc in Computer Science. My index number is highlighted on the official list.",
      image_url: "assets/achievements/directors-list.jpg"
    },
    {
      title: "Volunteer of the Month",
      org: "CSSL GenZ Chapter of UCSC",
      date_label: "July 2026",
      note: "",
      image_url: ""
    },
    {
      title: "Volunteer of the Month",
      org: "CSSL GenZ Chapter of UCSC",
      date_label: "October 2025",
      note: "",
      image_url: ""
    }
  ],
  skills: [
    {
      name: "Python",
      category: "Languages and web"
    },
    {
      name: "PHP",
      category: "Languages and web"
    },
    {
      name: "TypeScript",
      category: "Languages and web"
    },
    {
      name: "JavaScript",
      category: "Languages and web"
    },
    {
      name: "HTML & CSS",
      category: "Languages and web"
    },
    {
      name: "MySQL",
      category: "Languages and web"
    },
    {
      name: "Server-side web programming",
      category: "Languages and web"
    },
    {
      name: "MVC architecture",
      category: "Building software"
    },
    {
      name: "JWT authentication",
      category: "Building software"
    },
    {
      name: "Role-based access control",
      category: "Building software"
    },
    {
      name: "UML and system design",
      category: "Building software"
    },
    {
      name: "Git and GitHub",
      category: "Building software"
    },
    {
      name: "Software architecture",
      category: "Computing foundations"
    },
    {
      name: "Computer networks",
      category: "Computing foundations"
    },
    {
      name: "Statistical inference",
      category: "Computing foundations"
    },
    {
      name: "Numerical methods",
      category: "Computing foundations"
    },
    {
      name: "IT project management",
      category: "Computing foundations"
    },
    {
      name: "Financial management",
      category: "Leadership and finance"
    },
    {
      name: "Budgeting",
      category: "Leadership and finance"
    },
    {
      name: "Team leadership",
      category: "Leadership and finance"
    },
    {
      name: "Event organizing",
      category: "Leadership and finance"
    }
  ],
  education: [
    {
      school: "University of Colombo School of Computing",
      degree: "BSc in Computer Science (UG)",
      logo_url: "assets/ucsc-logo.png",
      start_label: "2025",
      end_label: "",
      note: "Currently in 2nd year. Director's List, Year 1 Semester 2.",
      courses: [
        "Software Architecture",
        "Statistical Inference",
        "IT Project Management",
        "Numerical Methods",
        "Computer Networks"
      ]
    }
  ]
};

export default content;

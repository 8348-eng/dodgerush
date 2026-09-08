/**
 * Tulip Dahiya - Curated Portfolio Projects Data
 * Verified against actual GitHub repositories (github.com/8348-eng) & local codebases.
 * Zero fabricated projects, zero fake stats, zero fictitious live demos.
 */

const PORTFOLIO_DATA = {
  profile: {
    name: "Tulip Dahiya",
    title: "B.Tech Computer Science (AI & ML) Student & Aspiring Software Developer",
    email: "dahiyatulip20@gmail.com",
    phone: "+91 8348342862",
    github: "https://github.com/8348-eng",
    linkedin: "https://www.linkedin.com/in/tulip-dahiya-3201173b2/",
    githubUsername: "8348-eng",
    reposCountFallback: 17
  },

  // Featured flagship project (Internship / Project work)
  flagshipProject: {
    id: "quiz-platform",
    title: "Online Quiz Application with Certificate Generation",
    subtitle: "Full-Stack Web & Assessment Engine",
    role: "Software / Web Development Intern",
    category: "python",
    description: "A robust online examination and assessment platform featuring dual student and admin authentication, question bank management, automated scoring, real-time leaderboards, and automated certificate generation.",
    longDescription: "Engineered during software development internship/project work to automate institutional quizzes. Features role-based access control with secure bcrypt password encryption, dynamic quiz categorization, timed MCQ assessment sessions, and automated instant score evaluation. Designed with administrative capabilities for bulk question ingestion via CSV/Excel using Pandas and OpenPyXL.",
    highlights: [
      "Role-based Student & Admin authentication powered by bcrypt password hashing",
      "Interactive MCQ assessment engine with randomized questions and instant score computation",
      "Bulk question bank ingestion and question management via CSV & Excel files (Pandas & OpenPyXL)",
      "Comprehensive Admin Dashboard for category creation, question curation, and student attempt monitoring",
      "Real-time leaderboard rankings and automated certificate generation upon quiz completion",
      "Relational data modeling with SQLite / MySQL for users, quizzes, questions, and attempt logs"
    ],
    technologies: ["Python", "Flask 3.0.3", "SQLite", "Pandas", "OpenPyXL", "bcrypt", "HTML5", "CSS3", "JavaScript"],
    githubUrl: "https://github.com/8348-eng",
    liveDemoUrl: null,
    statusBadge: "Flagship Internship Project"
  },

  // Verified Public Repositories
  projects: [
    {
      id: "dodgerush",
      name: "Dodge Rush",
      repoName: "dodgerush",
      title: "Dodge Rush - Mobile 3D Arcade Runner",
      category: "javascript",
      description: "A high-octane 3D endless runner game optimized for mobile and Android browsers with custom 3D perspective projection, procedural Web Audio synthesizer music, and touch/swipe controls.",
      technologies: ["JavaScript (ES6+)", "HTML5 Canvas", "Web Audio API", "CSS3", "PWA"],
      githubUrl: "https://github.com/8348-eng/dodgerush",
      liveDemoUrl: "https://8348-eng.github.io/dodgerush/",
      stars: 0,
      language: "JavaScript",
      isFeatured: true,
      featuredBadge: "Live Playable Game"
    },
    {
      id: "travel-planner",
      name: "travel-planner",
      repoName: "travel-planner",
      title: "Travel Planner & Itinerary Manager",
      category: "web",
      description: "A responsive travel itinerary web application built with modern React 19 and Vite. Allows travelers to organize destinations, categorize trips (Beach, Mountain, City), and persist plans locally.",
      technologies: ["React 19", "JavaScript (ES6+)", "Vite", "HTML5", "CSS3", "LocalStorage"],
      githubUrl: "https://github.com/8348-eng/travel-planner",
      liveDemoUrl: null,
      stars: 0,
      language: "CSS / React",
      isFeatured: true
    },
    {
      id: "student-scoreboard",
      name: "student-scoreboard",
      repoName: "student-scoreboard",
      title: "Student Scoreboard & Performance Tracker",
      category: "web",
      description: "An interactive student assessment and score management dashboard built with React 19, Tailwind CSS, and Vite. Supports real-time score updates, student roster summaries, and score distributions.",
      technologies: ["React 19", "Tailwind CSS", "JavaScript (ES6+)", "Vite", "Responsive Design"],
      githubUrl: "https://github.com/8348-eng/student-scoreboard",
      liveDemoUrl: null,
      stars: 0,
      language: "JavaScript",
      isFeatured: true
    },
    {
      id: "customer-portal",
      name: "customer-portal",
      repoName: "customer-portal",
      title: "Customer Portal Web Application",
      category: "web",
      description: "A modular frontend customer portal application built using React and Vite, featuring componentized UI modules, state-driven user interactions, and clean navigation architecture.",
      technologies: ["React", "JavaScript", "Vite", "CSS3", "Modular Architecture"],
      githubUrl: "https://github.com/8348-eng/customer-portal",
      liveDemoUrl: null,
      stars: 0,
      language: "JavaScript / React",
      isFeatured: false
    },
    {
      id: "capstone",
      name: "capstone",
      repoName: "capstone",
      title: "QuickBite - Food Delivery Platform",
      category: "web",
      description: "A responsive, single-page food delivery platform engineered with semantic HTML5 and advanced CSS (Flexbox & CSS Grid). Features dynamic meal filters, floating hero plate keyframes, and accessible design.",
      technologies: ["HTML5", "CSS3 Grid", "CSS Flexbox", "CSS Keyframe Animations"],
      githubUrl: "https://github.com/8348-eng/capstone",
      liveDemoUrl: null,
      stars: 0,
      language: "HTML / CSS",
      isFeatured: false
    },
    {
      id: "Bootcamp-python-assignments-",
      name: "Bootcamp-python-assignments-",
      repoName: "Bootcamp-python-assignments-",
      title: "Python Software & OOP Architecture Suite",
      category: "python",
      description: "An extensive collection of production-style Python modules demonstrating OOP design patterns, data pipelines, robust file processors, banking simulators, vehicle fleet management, and university grade evaluation.",
      technologies: ["Python 3", "OOP", "Data Pipelines", "File I/O", "Exception Handling", "Algorithms"],
      githubUrl: "https://github.com/8348-eng/Bootcamp-python-assignments-",
      liveDemoUrl: null,
      stars: 0,
      language: "Python",
      isFeatured: true
    },
    {
      id: "Python",
      name: "Python",
      repoName: "Python",
      title: "Python Academic Trackers & Gradebooks",
      category: "python",
      description: "Practical Python applications including an interactive study tracker and student gradebook system implementing data structures, statistical summaries, and structured terminal interfaces.",
      technologies: ["Python", "Data Structures", "CLI", "File Parsing"],
      githubUrl: "https://github.com/8348-eng/Python",
      liveDemoUrl: null,
      stars: 0,
      language: "Python",
      isFeatured: false
    },
    {
      id: "jungle-rush",
      name: "jungle-rush",
      repoName: "jungle-rush",
      title: "Jungle Rush - Arcade Runner Experiment",
      category: "javascript",
      description: "An arcade runner game experiment engineered with Vite and modern JavaScript, exploring real-time game loops, player collision detection, dynamic obstacle spawning, and responsive styling.",
      technologies: ["JavaScript", "Vite", "HTML5 Canvas", "CSS3"],
      githubUrl: "https://github.com/8348-eng/jungle-rush",
      liveDemoUrl: null,
      stars: 0,
      language: "JavaScript",
      isFeatured: false
    },
    {
      id: "nandtotetris",
      name: "nandtotetris",
      repoName: "nandtotetris",
      title: "Nand to Tetris: Systems Architecture",
      category: "data",
      description: "Academic coursework and implementation exploring computer systems architecture from primitive Boolean logic gates (NAND) up through ALU, CPU architecture, and machine language assembly.",
      technologies: ["Computer Architecture", "Hardware Description Language", "Assembly", "Digital Logic"],
      githubUrl: "https://github.com/8348-eng/nandtotetris",
      liveDemoUrl: null,
      stars: 0,
      language: "Systems",
      isFeatured: false
    },
    {
      id: "react-router-q2",
      name: "react-router-q2",
      repoName: "react-router-q2",
      title: "React Router Single Page Application",
      category: "web",
      description: "A Single Page Application exploring client-side routing, nested routes, route parameters, and stateful navigation with React Router and Vite.",
      technologies: ["React", "React Router", "Vite", "JavaScript"],
      githubUrl: "https://github.com/8348-eng/react-router-q2",
      liveDemoUrl: null,
      stars: 0,
      language: "JavaScript / React",
      isFeatured: false
    },
    {
      id: "assignment4",
      name: "assignment4",
      repoName: "assignment4",
      title: "Interactive DOM & JavaScript Web Lab",
      category: "javascript",
      description: "Hands-on JavaScript implementation exploring DOM manipulation, event-driven interfaces, form input validations, and dynamic UI state synchronization.",
      technologies: ["JavaScript (ES6+)", "HTML5", "CSS3", "DOM API"],
      githubUrl: "https://github.com/8348-eng/assignment4",
      liveDemoUrl: null,
      stars: 0,
      language: "JavaScript",
      isFeatured: false
    },
    {
      id: "Assignment1",
      name: "Assignment1",
      repoName: "Assignment1",
      title: "Responsive Semantic Web Architecture",
      category: "web",
      description: "Academic web development lab focusing on semantic HTML5 document outlining, responsive typography, and custom CSS layout patterns.",
      technologies: ["HTML5", "CSS3", "Responsive Design"],
      githubUrl: "https://github.com/8348-eng/Assignment1",
      liveDemoUrl: null,
      stars: 0,
      language: "HTML / CSS",
      isFeatured: false
    }
  ],

  // Skills Categories without fake percentages
  skills: [
    {
      category: "Programming",
      icon: "code",
      items: [
        { name: "Python", badge: "Core", icon: "🐍" },
        { name: "Java", badge: "Core", icon: "☕" },
        { name: "JavaScript", badge: "Core", icon: "⚡" }
      ]
    },
    {
      category: "Web Development",
      icon: "globe",
      items: [
        { name: "HTML5", badge: "Markup", icon: "🌐" },
        { name: "CSS3", badge: "Styling", icon: "🎨" },
        { name: "JavaScript", badge: "Frontend", icon: "⚡" },
        { name: "Flask", badge: "Backend", icon: "🌶️" },
        { name: "React", badge: "UI Library", icon: "⚛️" }
      ]
    },
    {
      category: "Database",
      icon: "database",
      items: [
        { name: "MySQL", badge: "Relational", icon: "🐬" },
        { name: "SQLite", badge: "Embedded", icon: "📦" }
      ]
    },
    {
      category: "Data & Libraries",
      icon: "bar-chart-2",
      items: [
        { name: "Pandas", badge: "Dataframes", icon: "🐼" },
        { name: "NumPy", badge: "Arrays", icon: "🔢" },
        { name: "Matplotlib", badge: "Plotting", icon: "📊" },
        { name: "OpenPyXL", badge: "Excel I/O", icon: "📑" }
      ]
    },
    {
      category: "Tools & Workflow",
      icon: "tool",
      items: [
        { name: "Git", badge: "VCS", icon: "🌿" },
        { name: "GitHub", badge: "Collaboration", icon: "🐙" },
        { name: "VS Code", badge: "IDE", icon: "💻" },
        { name: "Vite", badge: "Bundler", icon: "⚡" }
      ]
    }
  ],

  // Currently Exploring (Topics of active study and passion)
  currentlyExploring: [
    "Python",
    "Web Development",
    "Flask",
    "Data Science",
    "Machine Learning",
    "Databases",
    "Software Development"
  ],

  // Internship & Experience Details
  experience: [
    {
      role: "Software / Web Development Intern",
      organization: "Internship / Project Experience",
      period: "2026",
      badge: "Internship Project",
      projectTitle: "Online Quiz Application with Certificate Generation",
      summary: "Engineered a full-featured online assessment platform with Python and Flask, delivering authenticated testing workflows, question administration, and real-time reporting.",
      responsibilities: [
        "Developing web interfaces with clean HTML, CSS, and interactive JavaScript",
        "Implementing core application functionality and backend routing logic in Flask",
        "Integrating relational database storage with SQLite/MySQL for persistent records",
        "Building role-based authentication and authorization for students and administrators with bcrypt",
        "Developing question management features (add, edit, categorize, and delete questions)",
        "Implementing bulk question upload and management via CSV and Excel spreadsheets using Pandas & OpenPyXL",
        "Constructing real-time score calculation algorithms and student quiz attempt trackers",
        "Designing competitive live leaderboards and automated digital certificate generation upon quiz completion"
      ],
      technologies: ["Python", "Flask", "SQLite", "bcrypt", "Pandas", "OpenPyXL", "HTML", "CSS", "JavaScript"]
    }
  ]
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = PORTFOLIO_DATA;
}

/**
 * Tulip Dahiya - Personal Portfolio Core Controller
 * Handles interactive UI, filters, dynamic rendering, GitHub sync, and contact workflows.
 */

document.addEventListener("DOMContentLoaded", () => {
  App.init();
});

const App = {
  activeFilter: "all",
  projectsList: [],

  init() {
    this.projectsList = [...PORTFOLIO_DATA.projects];
    this.setupNavigation();
    this.renderHeroTerminal();
    this.renderFlagshipProject();
    this.renderSkills();
    this.renderCurrentlyExploring();
    this.renderProjects();
    this.setupProjectFilters();
    this.renderExperience();
    this.setupContactForm();
    this.setupBackToTop();
    this.syncGitHubData();
  },

  /* ==========================================================================
     NAVIGATION & SCROLL SPY
     ========================================================================== */
  setupNavigation() {
    const header = document.querySelector(".site-header");
    const mobileToggle = document.getElementById("mobile-toggle");
    const navMenu = document.getElementById("nav-menu");
    const navLinks = document.querySelectorAll(".nav-link");

    // Header shadow on scroll
    window.addEventListener("scroll", () => {
      if (window.scrollY > 40) {
        header.classList.add("scrolled");
      } else {
        header.classList.remove("scrolled");
      }
    }, { passive: true });

    // Mobile menu toggle
    if (mobileToggle && navMenu) {
      mobileToggle.addEventListener("click", () => {
        const isOpen = navMenu.classList.toggle("open");
        mobileToggle.classList.toggle("open");
        mobileToggle.setAttribute("aria-expanded", isOpen);
      });

      // Close menu on link click
      navLinks.forEach(link => {
        link.addEventListener("click", () => {
          navMenu.classList.remove("open");
          mobileToggle.classList.remove("open");
          mobileToggle.setAttribute("aria-expanded", "false");
        });
      });
    }

    // ScrollSpy using IntersectionObserver
    const sections = document.querySelectorAll("section[id]");
    const observerOptions = {
      root: null,
      rootMargin: "-20% 0px -70% 0px",
      threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const currentId = entry.target.getAttribute("id");
          navLinks.forEach(link => {
            if (link.getAttribute("href") === `#${currentId}`) {
              link.classList.add("active");
            } else {
              link.classList.remove("active");
            }
          });
        }
      });
    }, observerOptions);

    sections.forEach(sec => observer.observe(sec));
  },

  /* ==========================================================================
     HERO CODE TERMINAL
     ========================================================================== */
  renderHeroTerminal() {
    const terminalContainer = document.getElementById("hero-terminal-code");
    const tabs = document.querySelectorAll(".terminal-tab");

    const codeSnippets = {
      python: `<span class="code-comment"># Online Quiz Engine & Analytics (Flask 3.0.3)</span>
<span class="code-keyword">from</span> flask <span class="code-keyword">import</span> Flask, request, jsonify
<span class="code-keyword">import</span> pandas <span class="code-keyword">as</span> pd
<span class="code-keyword">import</span> bcrypt

<span class="code-keyword">class</span> <span class="code-function">AssessmentService</span>:
    <span class="code-keyword">def</span> <span class="code-function">evaluate_attempt</span>(<span class="code-variable">self</span>, student_id, answers):
        score = <span class="code-variable">self</span>.db.compute_score(answers)
        percent = (score / TOTAL_QUESTIONS) * <span class="code-string">100</span>
        
        <span class="code-keyword">if</span> percent >= <span class="code-string">75</span>:
            cert_id = <span class="code-variable">self</span>.generate_certificate(student_id)
            <span class="code-keyword">return</span> {<span class="code-string">"status"</span>: <span class="code-string">"PASSED"</span>, <span class="code-string">"cert"</span>: cert_id}
        <span class="code-keyword">return</span> {<span class="code-string">"status"</span>: <span class="code-string">"COMPLETED"</span>, <span class="code-string">"score"</span>: score}`,

      javascript: `<span class="code-comment">// Dodge Rush - 3D Perspective Projection</span>
<span class="code-keyword">function</span> <span class="code-function">project3D</span>(worldX, worldY, worldZ) {
  <span class="code-keyword">const</span> cameraZ = <span class="code-string">300</span>;
  <span class="code-keyword">const</span> scale = cameraZ / (cameraZ + worldZ);
  
  <span class="code-keyword">return</span> {
    screenX: (canvas.width / <span class="code-string">2</span>) + worldX * scale,
    screenY: (canvas.height / <span class="code-string">2</span>) + worldY * scale,
    scale: scale
  };
}
<span class="code-comment">// 60 FPS loop with procedural Web Audio</span>
requestAnimationFrame(gameEngine.tick);`,

      sql: `<span class="code-comment">-- Relational Database Schema</span>
<span class="code-keyword">CREATE TABLE</span> <span class="code-function">quiz_attempts</span> (
  attempt_id <span class="code-keyword">INTEGER PRIMARY KEY AUTOINCREMENT</span>,
  student_id <span class="code-keyword">INTEGER NOT NULL</span>,
  quiz_id <span class="code-keyword">INTEGER NOT NULL</span>,
  score <span class="code-keyword">REAL NOT NULL</span>,
  passed <span class="code-keyword">BOOLEAN DEFAULT</span> <span class="code-string">0</span>,
  completed_at <span class="code-keyword">DATETIME DEFAULT CURRENT_TIMESTAMP</span>,
  <span class="code-keyword">FOREIGN KEY</span> (student_id) <span class="code-keyword">REFERENCES</span> users(id)
);`
    };

    const updateSnippet = (lang) => {
      if (terminalContainer && codeSnippets[lang]) {
        terminalContainer.innerHTML = codeSnippets[lang];
      }
    };

    tabs.forEach(tab => {
      tab.addEventListener("click", () => {
        tabs.forEach(t => t.classList.remove("active"));
        tab.classList.add("active");
        const lang = tab.getAttribute("data-lang");
        updateSnippet(lang);
      });
    });

    // Initial render
    updateSnippet("python");
  },

  /* ==========================================================================
     FLAGSHIP FEATURED PROJECT
     ========================================================================== */
  renderFlagshipProject() {
    const container = document.getElementById("flagship-project-container");
    if (!container) return;

    const p = PORTFOLIO_DATA.flagshipProject;

    const highlightsHtml = p.highlights
      .map(item => `
        <div class="flagship-feature-item">
          <svg class="feature-check-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          <span>${item}</span>
        </div>
      `).join("");

    const techHtml = p.technologies
      .map(t => `<span class="tech-tag">${t}</span>`).join("");

    container.innerHTML = `
      <div class="flagship-card">
        <div class="flagship-top">
          <div>
            <span class="flagship-badge">★ ${p.statusBadge}</span>
            <h3 class="flagship-title">${p.title}</h3>
            <p class="flagship-subtitle">${p.subtitle} • ${p.role}</p>
          </div>
          <div class="project-card-actions">
            <a href="${p.githubUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-outline-cyan btn-sm" aria-label="View on GitHub">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
              <span>GitHub Profile</span>
            </a>
          </div>
        </div>

        <p class="flagship-desc">${p.longDescription}</p>

        <div class="flagship-features-grid">
          ${highlightsHtml}
        </div>

        <div class="flagship-footer">
          <div class="tech-badges-list">
            ${techHtml}
          </div>
          <span class="badge badge-emerald">Verified Architecture</span>
        </div>
      </div>
    `;
  },

  /* ==========================================================================
     PROJECTS SHOWCASE & FILTER
     ========================================================================== */
  renderProjects() {
    const grid = document.getElementById("projects-grid");
    if (!grid) return;

    const filtered = this.projectsList.filter(proj => {
      if (this.activeFilter === "all") return true;
      if (this.activeFilter === "web") return proj.category === "web";
      if (this.activeFilter === "python") return proj.category === "python";
      if (this.activeFilter === "javascript") return proj.category === "javascript";
      if (this.activeFilter === "data") return proj.category === "data" || proj.category === "other";
      return true;
    });

    if (filtered.length === 0) {
      grid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted);">No projects found in this category.</p>`;
      return;
    }

    grid.innerHTML = filtered.map(p => this.createProjectCardHtml(p)).join("");
  },

  createProjectCardHtml(p) {
    const techHtml = p.technologies
      .slice(0, 4)
      .map(t => `<span class="tech-tag">${t}</span>`)
      .join("");

    const liveDemoBtn = p.liveDemoUrl ? `
      <a href="${p.liveDemoUrl}" target="_blank" rel="noopener noreferrer" class="project-icon-link" aria-label="Open Live Demo" title="Open Live Playable Demo">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"></path>
          <polyline points="15 3 21 3 21 9"></polyline>
          <line x1="10" y1="14" x2="21" y2="3"></line>
        </svg>
      </a>
    ` : "";

    const featuredBadgeHtml = p.featuredBadge ? `
      <span class="badge badge-cyan" style="margin-left: 8px;">${p.featuredBadge}</span>
    ` : "";

    return `
      <article class="project-card">
        <div>
          <div class="project-card-header">
            <div class="project-folder-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"></path>
              </svg>
            </div>
            <div class="project-card-actions">
              ${liveDemoBtn}
              <a href="${p.githubUrl}" target="_blank" rel="noopener noreferrer" class="project-icon-link" aria-label="View Source on GitHub" title="View Source on GitHub">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
              </a>
            </div>
          </div>

          <h4 class="project-card-title">
            ${p.title}
            ${featuredBadgeHtml}
          </h4>
          <p class="project-card-desc">${p.description}</p>
        </div>

        <div class="project-card-footer">
          <div class="tech-badges-list">
            ${techHtml}
          </div>
          <div class="project-meta-row">
            <span class="project-language-pill">
              <span class="lang-dot"></span>
              <span>${p.liveLanguage || p.language}</span>
            </span>
            <span>⭐ ${p.stars || 0}</span>
          </div>
        </div>
      </article>
    `;
  },

  setupProjectFilters() {
    const filterButtons = document.querySelectorAll(".filter-btn");
    filterButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        filterButtons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        this.activeFilter = btn.getAttribute("data-filter");
        this.renderProjects();
      });
    });
  },

  /* ==========================================================================
     SKILLS & CURRENTLY EXPLORING
     ========================================================================== */
  renderSkills() {
    const container = document.getElementById("skills-container");
    if (!container) return;

    container.innerHTML = PORTFOLIO_DATA.skills.map(cat => {
      const itemsHtml = cat.items.map(item => `
        <div class="skill-item">
          <div class="skill-left">
            <span class="skill-icon-emoji">${item.icon}</span>
            <span class="skill-name">${item.name}</span>
          </div>
          <span class="skill-badge">${item.badge}</span>
        </div>
      `).join("");

      return `
        <div class="skill-category-card">
          <div class="category-header">
            <div class="category-icon-box">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="16 18 22 12 16 6"></polyline>
                <polyline points="8 6 2 12 8 18"></polyline>
              </svg>
            </div>
            <h4 class="category-title">${cat.category}</h4>
          </div>
          <div class="skill-items-list">
            ${itemsHtml}
          </div>
        </div>
      `;
    }).join("");
  },

  renderCurrentlyExploring() {
    const container = document.getElementById("exploring-tags-container");
    if (!container) return;

    container.innerHTML = PORTFOLIO_DATA.currentlyExploring.map(topic => `
      <div class="exploring-tag">
        <span style="color: var(--accent-secondary);">✦</span>
        <span>${topic}</span>
      </div>
    `).join("");
  },

  /* ==========================================================================
     EXPERIENCE TIMELINE
     ========================================================================== */
  renderExperience() {
    const container = document.getElementById("experience-timeline-container");
    if (!container) return;

    container.innerHTML = PORTFOLIO_DATA.experience.map(exp => {
      const listHtml = exp.responsibilities
        .map(r => `<li>${r}</li>`)
        .join("");

      const techHtml = exp.technologies
        .map(t => `<span class="tech-tag">${t}</span>`)
        .join("");

      return `
        <div class="timeline-item">
          <div class="timeline-dot"></div>
          <div class="timeline-content">
            <div class="timeline-header">
              <div>
                <h3 class="timeline-role">${exp.role}</h3>
                <h4 class="timeline-org">${exp.organization}</h4>
              </div>
              <span class="timeline-period">${exp.period}</span>
            </div>

            <span class="timeline-project-name">Project: ${exp.projectTitle}</span>
            <p class="timeline-summary">${exp.summary}</p>

            <ul class="timeline-list">
              ${listHtml}
            </ul>

            <div class="tech-badges-list">
              ${techHtml}
            </div>
          </div>
        </div>
      `;
    }).join("");
  },

  /* ==========================================================================
     DYNAMIC GITHUB SYNC
     ========================================================================== */
  async syncGitHubData() {
    const repoCountEl = document.getElementById("github-repo-count");
    const langChipsContainer = document.getElementById("github-lang-chips");
    const followersEl = document.getElementById("github-followers-count");

    try {
      // 1. Fetch Profile
      const profile = await GitHubService.fetchProfile();
      if (profile && repoCountEl) {
        repoCountEl.textContent = `${profile.publicRepos}+`;
      }
      if (profile && followersEl && profile.followers !== undefined) {
        followersEl.textContent = profile.followers;
      }

      // 2. Fetch Repositories
      const liveRepos = await GitHubService.fetchRepositories();
      if (liveRepos && Array.isArray(liveRepos)) {
        // Merge with project cards
        this.projectsList = GitHubService.mergeReposWithProjects(liveRepos, PORTFOLIO_DATA.projects);
        this.renderProjects();

        // Calculate language stats
        const langs = GitHubService.calculateLanguageStats(liveRepos);
        if (langChipsContainer && langs.length > 0) {
          langChipsContainer.innerHTML = langs.map(l => `
            <span class="language-chip">
              <span class="lang-dot" style="background-color: var(--accent-secondary);"></span>
              <span>${l.name} (${l.count})</span>
            </span>
          `).join("");
        }
      }
    } catch (err) {
      console.warn("GitHub sync completed with fallbacks:", err);
    }
  },

  /* ==========================================================================
     CONTACT FORM & COPY WORKFLOWS
     ========================================================================== */
  setupContactForm() {
    const form = document.getElementById("contact-form");
    const copyBtn = document.getElementById("copy-email-btn");

    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();

        const name = document.getElementById("contact-name").value.trim();
        const email = document.getElementById("contact-email").value.trim();
        const message = document.getElementById("contact-message").value.trim();

        if (!name || !email || !message) {
          this.showToast("Please fill in all required fields.");
          return;
        }

        // Direct mailto generation without fake server claims
        const subject = encodeURIComponent(`Portfolio Inquiry from ${name}`);
        const body = encodeURIComponent(
          `Hi Tulip,\n\nMy name is ${name} (${email}).\n\n${message}\n\nSent from your portfolio contact form.`
        );

        const mailtoUrl = `mailto:${PORTFOLIO_DATA.profile.email}?subject=${subject}&body=${body}`;
        window.location.href = mailtoUrl;

        this.showToast("Opening your email client to send message...");
      });
    }

    if (copyBtn) {
      copyBtn.addEventListener("click", () => {
        navigator.clipboard.writeText(PORTFOLIO_DATA.profile.email).then(() => {
          this.showToast("Email address copied to clipboard!");
        }).catch(() => {
          this.showToast(PORTFOLIO_DATA.profile.email);
        });
      });
    }
  },

  showToast(message) {
    const toast = document.getElementById("toast-notification");
    const toastMsg = document.getElementById("toast-message");
    if (!toast || !toastMsg) return;

    toastMsg.textContent = message;
    toast.classList.add("show");

    setTimeout(() => {
      toast.classList.remove("show");
    }, 4000);
  },

  setupBackToTop() {
    const backToTopBtn = document.getElementById("back-to-top-btn");
    if (!backToTopBtn) return;

    backToTopBtn.addEventListener("click", (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }
};

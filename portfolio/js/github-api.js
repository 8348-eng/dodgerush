/**
 * GitHub API Integration for Tulip Dahiya's Portfolio
 * Fetches dynamic repository statistics, public repos count, and language distributions
 * Gracefully falls back to curated local dataset on rate-limiting or network error.
 */

const GitHubService = {
  username: "8348-eng",
  apiBase: "https://api.github.com",

  /**
   * Fetch public profile metadata
   */
  async fetchProfile() {
    try {
      const response = await fetch(`${this.apiBase}/users/${this.username}`, {
        headers: { Accept: "application/vnd.github.v3+json" }
      });
      if (!response.ok) throw new Error(`GitHub API error: ${response.status}`);
      const data = await response.json();
      return {
        publicRepos: data.public_repos,
        followers: data.followers,
        following: data.following,
        createdAt: data.created_at,
        avatarUrl: data.avatar_url,
        htmlUrl: data.html_url
      };
    } catch (err) {
      console.warn("Could not fetch live GitHub profile, using fallback data:", err);
      return {
        publicRepos: PORTFOLIO_DATA.profile.reposCountFallback,
        followers: 0,
        following: 0,
        avatarUrl: null,
        htmlUrl: PORTFOLIO_DATA.profile.github
      };
    }
  },

  /**
   * Fetch user's public repositories
   */
  async fetchRepositories() {
    try {
      const response = await fetch(
        `${this.apiBase}/users/${this.username}/repos?per_page=100&sort=updated`,
        { headers: { Accept: "application/vnd.github.v3+json" } }
      );
      if (!response.ok) throw new Error(`GitHub API repos error: ${response.status}`);
      const repos = await response.json();
      return repos;
    } catch (err) {
      console.warn("Could not fetch live GitHub repos, using fallback data:", err);
      return null;
    }
  },

  /**
   * Merge live GitHub repos with curated project details
   */
  mergeReposWithProjects(liveRepos, curatedProjects) {
    if (!liveRepos || !Array.isArray(liveRepos)) return curatedProjects;

    const liveMap = new Map();
    liveRepos.forEach(r => liveMap.set(r.name.toLowerCase(), r));

    return curatedProjects.map(proj => {
      const live = liveMap.get(proj.repoName.toLowerCase());
      if (live) {
        return {
          ...proj,
          stars: live.stargazers_count,
          forks: live.forks_count,
          updatedAt: live.updated_at,
          githubUrl: live.html_url,
          liveLanguage: live.language || proj.language,
          isLiveSynced: true
        };
      }
      return proj;
    });
  },

  /**
   * Extract language breakdown from repos
   */
  calculateLanguageStats(repos) {
    const langCounts = {};
    if (!repos || !Array.isArray(repos)) {
      return [
        { name: "JavaScript", count: 6 },
        { name: "Python", count: 4 },
        { name: "HTML / CSS", count: 5 },
        { name: "React", count: 3 }
      ];
    }

    repos.forEach(repo => {
      if (repo.language) {
        langCounts[repo.language] = (langCounts[repo.language] || 0) + 1;
      }
    });

    return Object.entries(langCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }
};

window.GitHubService = GitHubService;

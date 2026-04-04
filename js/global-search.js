// Global Search (⌘K / Ctrl+K)
// Fast command palette for navigating the dashboard

let searchData = {
  students: [],
  pages: [
    { name: 'Dashboard', url: '/index.html', icon: 'home', category: 'Pages' },
    { name: 'Students', url: '/students.html', icon: 'users', category: 'Pages' },
    { name: 'Teams', url: '/teams.html', icon: 'shield', category: 'Pages' },
    { name: 'Tasks', url: '/tasks.html', icon: 'check-square', category: 'Pages' },
    { name: 'Projects', url: '/projects.html', icon: 'folder', category: 'Pages' },
    { name: 'Trials', url: '/trials.html', icon: 'user-plus', category: 'Pages' },
    { name: 'Inventory', url: '/inventory.html', icon: 'package', category: 'Pages' },
    { name: 'Foundation', url: '/foundation.html', icon: 'book-open', category: 'Pages' },
    { name: 'Reports', url: '/reports.html', icon: 'bar-chart', category: 'Pages' },
  ],
  teams: []
};

// Load search data from API
async function loadSearchData() {
  try {
    // Load students for search
    const students = await studentsAPI.getAll();
    searchData.students = students.map(s => ({
      id: s.id,
      name: `${s.firstName} ${s.lastName}`,
      grade: s.grade,
      team: s.teams && s.teams[0] ? s.teams[0].team.teamNumber : 'Unassigned',
      email: s.email,
      category: 'Students'
    }));

    // Load teams for search
    const teams = await teamsAPI.getAll();
    searchData.teams = teams.map(t => ({
      id: t.id,
      name: `Team ${t.teamNumber}`,
      season: t.season,
      memberCount: t.members ? t.members.length : 0,
      category: 'Teams'
    }));

  } catch (error) {
    console.error('Failed to load search data:', error);
  }
}

// Open search modal
function openSearchModal() {
  const modal = document.getElementById('search-modal');
  if (!modal) {
    console.error('Search modal not found in DOM');
    return;
  }

  modal.style.display = 'flex';

  const input = document.getElementById('search-input');
  if (input) {
    input.value = '';
    input.focus();
  }

  renderSearchResults('');
}

// Close search modal
function closeSearchModal() {
  const modal = document.getElementById('search-modal');
  if (modal) {
    modal.style.display = 'none';
  }

  const input = document.getElementById('search-input');
  if (input) {
    input.value = '';
  }
}

// Render search results
function renderSearchResults(query) {
  const resultsContainer = document.getElementById('search-results');
  if (!resultsContainer) return;

  // If no query, show quick navigation
  if (!query || query.trim() === '') {
    const quickNavHTML = `
      <div class="search-section">
        <div class="search-section-title">Quick Navigation</div>
        ${searchData.pages.map(page => `
          <div class="search-result-item" onclick="navigateToResult('${page.url}')">
            <i data-lucide="${page.icon}" class="search-result-icon"></i>
            <div class="search-result-text">
              <div class="search-result-title">${page.name}</div>
            </div>
          </div>
        `).join('')}
      </div>
    `;

    resultsContainer.innerHTML = quickNavHTML;
    lucide.createIcons();
    return;
  }

  // Search across all categories
  const lowerQuery = query.toLowerCase().trim();

  // Search students
  const matchingStudents = searchData.students
    .filter(s =>
      s.name.toLowerCase().includes(lowerQuery) ||
      s.email.toLowerCase().includes(lowerQuery) ||
      s.team.toLowerCase().includes(lowerQuery)
    )
    .slice(0, 5);

  // Search teams
  const matchingTeams = searchData.teams
    .filter(t =>
      t.name.toLowerCase().includes(lowerQuery) ||
      t.season.toLowerCase().includes(lowerQuery)
    )
    .slice(0, 3);

  // Search pages
  const matchingPages = searchData.pages
    .filter(p => p.name.toLowerCase().includes(lowerQuery));

  // Build results HTML
  let html = '';

  if (matchingStudents.length > 0) {
    html += `
      <div class="search-section">
        <div class="search-section-title">Students</div>
        ${matchingStudents.map(student => `
          <div class="search-result-item" onclick="navigateToResult('/student-profile.html?id=${student.id}')">
            <i data-lucide="user" class="search-result-icon"></i>
            <div class="search-result-text">
              <div class="search-result-title">${student.name}</div>
              <div class="search-result-subtitle">Grade ${student.grade} • ${student.team}</div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  if (matchingTeams.length > 0) {
    html += `
      <div class="search-section">
        <div class="search-section-title">Teams</div>
        ${matchingTeams.map(team => `
          <div class="search-result-item" onclick="navigateToResult('/teams.html#team-${team.id}')">
            <i data-lucide="shield" class="search-result-icon"></i>
            <div class="search-result-text">
              <div class="search-result-title">${team.name}</div>
              <div class="search-result-subtitle">${team.memberCount} members • ${team.season}</div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  if (matchingPages.length > 0) {
    html += `
      <div class="search-section">
        <div class="search-section-title">Pages</div>
        ${matchingPages.map(page => `
          <div class="search-result-item" onclick="navigateToResult('${page.url}')">
            <i data-lucide="${page.icon}" class="search-result-icon"></i>
            <div class="search-result-text">
              <div class="search-result-title">${page.name}</div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  // No results
  if (!matchingStudents.length && !matchingTeams.length && !matchingPages.length) {
    html = `
      <div class="search-section">
        <div style="padding:40px 20px;text-align:center;">
          <i data-lucide="search-x" style="width:40px;height:40px;margin:0 auto 10px;opacity:.3;color:var(--gray-2);"></i>
          <div style="font-size:14px;font-weight:600;color:var(--black-3);margin-bottom:4px;">
            No results found
          </div>
          <div style="font-size:12px;color:var(--gray-1);">
            Try searching for students, teams, or pages
          </div>
        </div>
      </div>
    `;
  }

  resultsContainer.innerHTML = html;
  lucide.createIcons();
}

// Navigate to result
function navigateToResult(url) {
  window.location.href = url;
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
  // ⌘K or Ctrl+K to open
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault();
    openSearchModal();
  }

  // ESC to close
  if (e.key === 'Escape') {
    closeSearchModal();
  }
});

// Search input handler
function initSearchInput() {
  const input = document.getElementById('search-input');
  if (input) {
    input.addEventListener('input', (e) => {
      renderSearchResults(e.target.value);
    });

    // Handle Enter key
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        // Navigate to first result
        const firstResult = document.querySelector('.search-result-item');
        if (firstResult) {
          firstResult.click();
        }
      }
    });
  }
}

// Click outside to close
function initModalBackdrop() {
  const modal = document.getElementById('search-modal');
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target.id === 'search-modal') {
        closeSearchModal();
      }
    });
  }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  loadSearchData();
  initSearchInput();
  initModalBackdrop();
});

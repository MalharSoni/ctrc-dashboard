// API Client for CTRC Dashboard
// Centralized API layer replacing localStorage

const API_BASE = '/.netlify/functions/api';

// Helper function to fetch from API with full HTTP method support
async function fetchAPI(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  };

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: `HTTP ${response.status}: ${response.statusText}`
      }));
      throw new Error(error.message || `Request failed with status ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API fetch error:', error);
    throw error;
  }
}

// Students API
const studentsAPI = {
  getAll: (filters = {}) => {
    const params = new URLSearchParams(filters);
    return fetchAPI(`/students${params.toString() ? '?' + params : ''}`);
  },
  getById: (id) => fetchAPI(`/students/${id}`),
  create: (data) => fetchAPI('/students', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  update: (id, data) => fetchAPI(`/students/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  delete: (id) => fetchAPI(`/students/${id}`, { method: 'DELETE' }),
  bulkAssign: (studentIds, teamId) => fetchAPI('/students/bulk-assign', {
    method: 'POST',
    body: JSON.stringify({ studentIds, teamId })
  })
};

// Attendance API
const attendanceAPI = {
  getAll: (filters = {}) => {
    const params = new URLSearchParams(filters);
    return fetchAPI(`/attendance${params.toString() ? '?' + params : ''}`);
  },
  getByStudent: (studentId) => fetchAPI(`/attendance/${studentId}`),
  record: (records) => fetchAPI('/attendance', {
    method: 'POST',
    body: JSON.stringify(records)
  }),
  getStats: () => fetchAPI('/attendance/stats'),
  getForSession: (date, session) => fetchAPI(`/attendance/session?date=${date}&session=${session}`)
};

// Tasks API
const tasksAPI = {
  getAll: (filters = {}) => {
    const params = new URLSearchParams(filters);
    return fetchAPI(`/tasks${params.toString() ? '?' + params : ''}`);
  },
  getById: (id) => fetchAPI(`/tasks/${id}`),
  create: (data) => fetchAPI('/tasks', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  update: (id, data) => fetchAPI(`/tasks/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  delete: (id) => fetchAPI(`/tasks/${id}`, { method: 'DELETE' }),
  assign: (taskId, studentIds) => fetchAPI(`/tasks/${taskId}/assign`, {
    method: 'POST',
    body: JSON.stringify({ studentIds })
  }),
  updateStatus: (id, status) => fetchAPI(`/tasks/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status })
  })
};

// Teams API
const teamsAPI = {
  getAll: () => fetchAPI('/teams'),
  getById: (id) => fetchAPI(`/teams/${id}`),
  create: (data) => fetchAPI('/teams', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  update: (id, data) => fetchAPI(`/teams/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  })
};

// Trials API
const trialsAPI = {
  getAll: (filters = {}) => {
    const params = new URLSearchParams(filters);
    return fetchAPI(`/trials${params.toString() ? '?' + params : ''}`);
  },
  getById: (id) => fetchAPI(`/trials/${id}`),
  create: (data) => fetchAPI('/trials', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  update: (id, data) => fetchAPI(`/trials/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  convert: (id) => fetchAPI(`/trials/${id}/convert`, { method: 'POST' }),
  delete: (id) => fetchAPI(`/trials/${id}`, { method: 'DELETE' })
};

// Dashboard API
const dashboardAPI = {
  getStats: () => fetchAPI('/dashboard/stats')
};

// Projects API
const projectsAPI = {
  getAll: () => fetchAPI('/projects'),
  getById: (id) => fetchAPI(`/projects/${id}`),
  create: (data) => fetchAPI('/projects', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  update: (id, data) => fetchAPI(`/projects/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  })
};

// Update dashboard stats on homepage
async function updateDashboardStats() {
  try {
    showLoadingState('stats-loading');
    const stats = await dashboardAPI.getStats();

    // Update stat cards
    const statElements = {
      students: document.querySelector('[data-stat="students"] .stat-value'),
      teams: document.querySelector('[data-stat="teams"] .stat-value'),
      attendance: document.querySelector('[data-stat="attendance"] .stat-value'),
      meetings: document.querySelector('[data-stat="meetings"] .stat-value'),
      overdue: document.querySelector('[data-stat="overdue"] .stat-value')
    };

    if (statElements.students) statElements.students.textContent = stats.totalStudents || '0';
    if (statElements.teams) statElements.teams.textContent = stats.activeTeams || '0';
    if (statElements.attendance) statElements.attendance.textContent = `${stats.attendance || 0}%`;
    if (statElements.meetings) statElements.meetings.textContent = stats.meetings || '0';
    if (statElements.overdue) statElements.overdue.textContent = stats.overdueTasks || '0';

    // Update attendance progress bar
    const progressBar = document.querySelector('[data-stat="attendance"] .progress-fill');
    if (progressBar) {
      progressBar.style.width = `${stats.attendance || 0}%`;
    }

    hideLoadingState('stats-loading');
  } catch (error) {
    console.error('Failed to load dashboard stats:', error);
    hideLoadingState('stats-loading');
    showToast('Failed to load dashboard stats', 'error');
  }
}

// Update students table
async function updateStudentsTable() {
  const tbody = document.querySelector('#students-table tbody');
  if (!tbody) return;

  try {
    showLoadingState('students-loading');
    const students = await studentsAPI.getAll();

    if (!students || students.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" style="text-align:center;padding:40px;color:var(--gray-2);">
            No students found
          </td>
        </tr>
      `;
      hideLoadingState('students-loading');
      return;
    }

    tbody.innerHTML = students.map(student => `
      <tr>
        <td>
          <div class="avatar-row">
            <div class="avatar" style="background: ${getAvatarColor(student.id)}">
              ${student.firstName[0]}${student.lastName[0]}
            </div>
            <a href="student-profile.html?id=${student.id}" class="avatar-name">
              ${student.firstName} ${student.lastName}
            </a>
          </div>
        </td>
        <td>${student.grade ? `Grade ${student.grade}` : '—'}</td>
        <td>${student.teams && student.teams.length > 0 ? student.teams.map(t => t.team.teamNumber).join(', ') : '—'}</td>
        <td>${student.teams && student.teams[0] ? student.teams[0].primaryRole : '—'}</td>
        <td>
          <span class="badge ${student.active ? 'badge-green' : 'badge-gray'}">
            ${student.active ? 'Active' : 'Inactive'}
          </span>
        </td>
      </tr>
    `).join('');

    hideLoadingState('students-loading');
    lucide.createIcons();
  } catch (error) {
    console.error('Failed to load students:', error);
    tbody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align:center;padding:40px;color:#DC2626;">
          Failed to load students. Please refresh the page.
        </td>
      </tr>
    `;
    hideLoadingState('students-loading');
    showToast('Failed to load students', 'error');
  }
}

// Update tasks table
async function updateTasksTable() {
  const tbody = document.querySelector('#tasks-table tbody');
  if (!tbody) return;

  try {
    showLoadingState('tasks-loading');
    const tasks = await tasksAPI.getAll();

    if (!tasks || tasks.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align:center;padding:40px;color:var(--gray-2);">
            No tasks found
          </td>
        </tr>
      `;
      hideLoadingState('tasks-loading');
      return;
    }

    tbody.innerHTML = tasks.map(task => {
      const isOverdue = task.dueDate && new Date(task.dueDate) < new Date();
      const badgeClass = task.priority === 'URGENT' ? 'badge-red' :
                         task.priority === 'HIGH' ? 'badge-yellow' : 'badge-gray';

      return `
        <tr>
          <td>
            <strong>${task.title}</strong>
          </td>
          <td>${task.team ? task.team.teamNumber : '—'}</td>
          <td>${task.category || '—'}</td>
          <td>
            <span class="badge ${badgeClass}">${task.priority}</span>
          </td>
          <td ${isOverdue ? 'style="color: #DC2626; font-weight: 600;"' : ''}>
            ${task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '—'}
          </td>
          <td>${task.assignedTo ? task.assignedTo.length : 0} assigned</td>
        </tr>
      `;
    }).join('');

    hideLoadingState('tasks-loading');
    lucide.createIcons();
  } catch (error) {
    console.error('Failed to load tasks:', error);
    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align:center;padding:40px;color:#DC2626;">
          Failed to load tasks. Please refresh the page.
        </td>
      </tr>
    `;
    hideLoadingState('tasks-loading');
    showToast('Failed to load tasks', 'error');
  }
}

// Helper: Generate avatar color from ID
function getAvatarColor(id) {
  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];
  const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
}

// Loading state helpers
function showLoadingState(id) {
  // Optionally show loading spinner
  // Implementation can be added per page
}

function hideLoadingState(id) {
  // Hide loading spinner
}

// Auto-load data based on current page
window.addEventListener('DOMContentLoaded', () => {
  const path = window.location.pathname;

  if (path.includes('index.html') || path.endsWith('/')) {
    updateDashboardStats();
  } else if (path.includes('students.html')) {
    updateStudentsTable();
  } else if (path.includes('tasks.html')) {
    updateTasksTable();
  }
});

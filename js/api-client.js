// API Client for CTRC Dashboard
// Fetches data from Netlify Functions

const API_BASE = '/.netlify/functions/api'

// Helper function to fetch from API
async function fetchAPI(endpoint) {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`)
    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`)
    }
    return await response.json()
  } catch (error) {
    console.error('API fetch error:', error)
    return null
  }
}

// Get dashboard stats
async function getDashboardStats() {
  return await fetchAPI('/stats')
}

// Get all students
async function getStudents() {
  return await fetchAPI('/students')
}

// Get single student
async function getStudent(id) {
  return await fetchAPI(`/students/${id}`)
}

// Get all tasks
async function getTasks() {
  return await fetchAPI('/tasks')
}

// Get all teams
async function getTeams() {
  return await fetchAPI('/teams')
}

// Update dashboard stats on homepage
async function updateDashboardStats() {
  const stats = await getDashboardStats()
  if (!stats) return

  // Update stat cards
  document.querySelector('[data-stat="students"] .stat-value').textContent = stats.totalStudents
  document.querySelector('[data-stat="teams"] .stat-value').textContent = stats.activeTeams
  document.querySelector('[data-stat="attendance"] .stat-value').textContent = `${stats.attendance}%`
  document.querySelector('[data-stat="meetings"] .stat-value').textContent = stats.meetings
  document.querySelector('[data-stat="overdue"] .stat-value').textContent = stats.overdueTasks

  // Update attendance progress bar
  const progressBar = document.querySelector('[data-stat="attendance"] .progress-fill')
  if (progressBar) {
    progressBar.style.width = `${stats.attendance}%`
  }
}

// Update students table
async function updateStudentsTable() {
  const students = await getStudents()
  if (!students) return

  const tbody = document.querySelector('#students-table tbody')
  if (!tbody) return

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
      <td>${student.teams.map(t => t.team.teamNumber).join(', ') || '—'}</td>
      <td>${student.teams[0]?.primaryRole || '—'}</td>
      <td>
        <span class="badge badge-green">${student.active ? 'Active' : 'Inactive'}</span>
      </td>
    </tr>
  `).join('')
}

// Update tasks table
async function updateTasksTable() {
  const tasks = await getTasks()
  if (!tasks) return

  const tbody = document.querySelector('#tasks-table tbody')
  if (!tbody) return

  tbody.innerHTML = tasks.map(task => {
    const isOverdue = task.dueDate && new Date(task.dueDate) < new Date()
    const badgeClass = task.priority === 'URGENT' ? 'badge-red' :
                       task.priority === 'HIGH' ? 'badge-yellow' : 'badge-gray'

    return `
      <tr>
        <td>
          <strong>${task.title}</strong>
        </td>
        <td>${task.team?.teamNumber || '—'}</td>
        <td>${task.category || '—'}</td>
        <td>
          <span class="badge ${badgeClass}">${task.priority}</span>
        </td>
        <td ${isOverdue ? 'style="color: var(--red)"' : ''}>
          ${task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '—'}
        </td>
        <td>${task.assignedTo.length} assigned</td>
      </tr>
    `
  }).join('')
}

// Helper: Generate avatar color from ID
function getAvatarColor(id) {
  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899']
  const index = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return colors[index % colors.length]
}

// Auto-load data based on current page
window.addEventListener('DOMContentLoaded', () => {
  const path = window.location.pathname

  if (path.includes('index.html') || path.endsWith('/')) {
    updateDashboardStats()
  } else if (path.includes('students.html')) {
    updateStudentsTable()
  } else if (path.includes('tasks.html')) {
    updateTasksTable()
  }
})

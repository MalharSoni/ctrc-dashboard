// Student Profile Page - Dynamic Data Loading
// Loads real data from API for student profiles

// Get student ID from URL
const urlParams = new URLSearchParams(window.location.search);
const studentId = urlParams.get('id');

if (!studentId) {
  window.location.href = '/students.html';
}

// Helper: Format date
function formatDate(dateString) {
  if (!dateString) return '—';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

// Helper: Get proficiency percentage
function getProficiencyPercent(level) {
  const levels = {
    BEGINNER: 25,
    INTERMEDIATE: 50,
    ADVANCED: 75,
    EXPERT: 100
  };
  return levels[level] || 0;
}

// Helper: Get task priority icon
function getTaskPriorityIcon(priority) {
  const icons = {
    URGENT: '🔴',
    HIGH: '⚠',
    MEDIUM: '⚪',
    LOW: '⚫'
  };
  return icons[priority] || '⚪';
}

// Helper: Get task priority badge class
function getTaskPriorityBadge(priority) {
  const badges = {
    URGENT: 'badge-red',
    HIGH: 'badge-yellow',
    MEDIUM: 'badge-gray',
    LOW: 'badge-gray'
  };
  return badges[priority] || 'badge-gray';
}

// Helper: Generate avatar color
function getAvatarColor(id) {
  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];
  const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
}

// Load student profile data
async function loadStudentProfile() {
  try {
    const student = await studentsAPI.getById(studentId);

    if (!student) {
      showToast('Student not found', 'error');
      setTimeout(() => window.location.href = '/students.html', 2000);
      return;
    }

    // Update profile header
    updateProfileHeader(student);

    // Load all sections in parallel
    await Promise.all([
      loadAttendanceHistory(studentId),
      loadSkillsProgress(student),
      loadTaskAssignments(studentId)
    ]);

  } catch (error) {
    console.error('Failed to load student profile:', error);
    showToast('Failed to load student profile', 'error');
    setTimeout(() => window.location.href = '/students.html', 2000);
  }
}

// Update profile header with student data
function updateProfileHeader(student) {
  // Update name
  const nameEl = document.querySelector('.hero-name');
  if (nameEl) {
    nameEl.textContent = `${student.firstName} ${student.lastName}`;
  }

  // Update meta info (grade, team, email)
  const metaContainer = document.querySelector('.hero-meta');
  if (metaContainer) {
    const teamName = student.teams && student.teams[0] ? student.teams[0].team.teamNumber : 'Unassigned';
    const teamRole = student.teams && student.teams[0] ? student.teams[0].primaryRole : 'Member';

    metaContainer.innerHTML = `
      <div class="hero-meta-item">
        <i data-lucide="graduation-cap" style="width:14px;height:14px;"></i>
        Grade ${student.grade || '—'}
      </div>
      <div class="hero-meta-item">
        <i data-lucide="shield" style="width:14px;height:14px;"></i>
        Team ${teamName}
      </div>
      <div class="hero-meta-item">
        <i data-lucide="user-circle" style="width:14px;height:14px;"></i>
        ${teamRole}
      </div>
      <div class="hero-meta-item">
        <i data-lucide="mail" style="width:14px;height:14px;"></i>
        ${student.email || 'No email'}
      </div>
    `;
    lucide.createIcons();
  }

  // Update avatar
  const avatarEl = document.querySelector('.hero-avatar');
  if (avatarEl) {
    const initials = `${student.firstName[0]}${student.lastName[0]}`;
    const color = getAvatarColor(student.id);
    avatarEl.innerHTML = initials;
    avatarEl.style.background = color;

    // Add status indicator
    const statusColor = student.active ? '#22C55E' : '#EF4444';
    avatarEl.innerHTML += `<div class="hero-avatar-status" style="background:${statusColor};"></div>`;
  }

  // Update status badge
  const statusBadge = document.querySelector('.status-pill');
  if (statusBadge) {
    const statusClass = student.active ? 'status-active' : 'status-inactive';
    const statusText = student.active ? 'Active' : 'Inactive';
    statusBadge.className = `status-pill ${statusClass}`;
    statusBadge.innerHTML = `
      <span style="width:5px;height:5px;background:currentColor;border-radius:50%;"></span>
      ${statusText}
    `;
  }
}

// Load attendance history
async function loadAttendanceHistory(studentId) {
  try {
    const records = await attendanceAPI.getByStudent(studentId);

    // Calculate stats
    const totalSessions = records.length;
    const presentCount = records.filter(r => r.status === 'PRESENT').length;
    const attendanceRate = totalSessions > 0 ? Math.round((presentCount / totalSessions) * 100) : 0;

    // Update attendance card header
    const attendanceHeader = document.querySelector('#tab-attendance .card-header span');
    if (attendanceHeader) {
      attendanceHeader.textContent = `${attendanceRate}% — ${presentCount} of ${totalSessions} sessions`;
    }

    // Update attendance card body
    const attendanceBody = document.querySelector('#tab-attendance .card-body');
    if (attendanceBody && records.length > 0) {
      // Build attendance list
      const recentRecords = records.slice(0, 20); // Show last 20 sessions
      const attendanceHTML = `
        <div style="display:flex;flex-direction:column;gap:10px;">
          ${recentRecords.map(record => {
            const statusIcon = record.status === 'PRESENT' ? '✓' : record.status === 'ABSENT' ? '✗' : '—';
            const statusColor = record.status === 'PRESENT' ? '#22C55E' : record.status === 'ABSENT' ? '#EF4444' : '#A3A3A3';
            const statusClass = record.status === 'PRESENT' ? 'badge-green' : record.status === 'ABSENT' ? 'badge-red' : 'badge-gray';

            return `
              <div style="display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid var(--gray-3);">
                <span style="font-size:16px;color:${statusColor};font-weight:900;width:20px;text-align:center;">${statusIcon}</span>
                <div style="flex:1;">
                  <div style="font-size:13px;font-weight:600;color:var(--black);">${formatDate(record.date)}</div>
                  <div style="font-size:11.5px;color:var(--gray-1);">${record.session} Session</div>
                </div>
                <span class="badge ${statusClass}" style="text-transform:capitalize;">${record.status.toLowerCase()}</span>
              </div>
            `;
          }).join('')}
        </div>
      `;

      attendanceBody.innerHTML = attendanceHTML;
    }

  } catch (error) {
    console.error('Failed to load attendance history:', error);
  }
}

// Load skills progress
async function loadSkillsProgress(student) {
  try {
    const skillsContainer = document.querySelector('#tab-skills .skill-grid');

    if (!student.skills || student.skills.length === 0) {
      const skillsCard = document.querySelector('#tab-skills .card-body');
      if (skillsCard) {
        skillsCard.innerHTML = '<div style="padding:40px 20px;text-align:center;"><div style="font-size:14px;font-weight:600;color:var(--black-3);margin-bottom:4px;">No skills recorded yet</div><div style="font-size:12px;color:var(--gray-1);">Skills will appear here as they are tracked</div></div>';
      }
      return;
    }

    if (skillsContainer) {
      const skillsHTML = student.skills.map(studentSkill => {
        const percent = getProficiencyPercent(studentSkill.proficiency);
        const levelMap = {
          BEGINNER: 'Level 1',
          INTERMEDIATE: 'Level 2',
          ADVANCED: 'Level 3',
          EXPERT: 'Level 4'
        };
        const levelText = levelMap[studentSkill.proficiency] || 'Level 1';

        return `
          <div>
            <div class="skill-item-label">
              <span class="skill-item-name">${studentSkill.skill.name}</span>
              <span class="skill-item-level">${levelText}</span>
            </div>
            <div class="skill-bar">
              <div class="skill-fill" style="width:${percent}%;background:var(--yellow);"></div>
            </div>
          </div>
        `;
      }).join('');

      skillsContainer.innerHTML = skillsHTML;
    }

  } catch (error) {
    console.error('Failed to load skills progress:', error);
  }
}

// Load task assignments
async function loadTaskAssignments(studentId) {
  try {
    // For now, we'll fetch all tasks and filter client-side
    // In production, the API should support filtering by student
    const allTasks = await tasksAPI.getAll();

    // Filter tasks assigned to this student
    const studentTasks = allTasks.filter(task => {
      if (!task.assignedTo || task.assignedTo.length === 0) return false;
      return task.assignedTo.some(assignment => assignment.studentId === studentId);
    });

    const activeTasks = studentTasks.filter(t => t.status !== 'COMPLETED');
    const completedTasks = studentTasks.filter(t => t.status === 'COMPLETED');

    // Update tasks in overview tab
    const tasksContainer = document.querySelector('#tab-overview .card-body[style*="padding-top:4px"]');
    if (tasksContainer && activeTasks.length > 0) {
      const tasksHTML = activeTasks.slice(0, 5).map(task => {
        const isOverdue = task.dueDate && new Date(task.dueDate) < new Date();
        const badgeClass = getTaskPriorityBadge(task.priority);
        const priorityIcon = getTaskPriorityIcon(task.priority);

        return `
          <div class="task-item">
            <div class="task-check"></div>
            <div style="flex:1;">
              <div class="task-name">${task.title}</div>
              <div class="task-meta">
                <span>${task.team ? task.team.teamNumber : 'General'}</span>
                <span>${task.category || 'Task'}</span>
                <span ${isOverdue ? 'style="color:#DC2626;font-weight:600;"' : ''}>
                  Due ${formatDate(task.dueDate)}
                </span>
              </div>
            </div>
            <span class="badge ${badgeClass}">${priorityIcon} ${task.priority}</span>
          </div>
        `;
      }).join('');

      tasksContainer.innerHTML = tasksHTML;
    } else if (tasksContainer) {
      tasksContainer.innerHTML = '<div style="padding:20px 0;text-align:center;color:var(--gray-2);font-size:12px;">No active tasks</div>';
    }

    // Update task count badge
    const taskCountBadge = document.querySelector('#tab-overview .card-header .badge');
    if (taskCountBadge) {
      taskCountBadge.textContent = `${activeTasks.length} active`;
      taskCountBadge.className = `badge ${activeTasks.length > 0 ? 'badge-yellow' : 'badge-gray'}`;
    }

  } catch (error) {
    console.error('Failed to load task assignments:', error);
  }
}

// Initialize profile page
document.addEventListener('DOMContentLoaded', () => {
  loadStudentProfile();
});

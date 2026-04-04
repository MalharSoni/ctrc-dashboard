// Student Profile Dynamic JavaScript
// Loads student data from API and renders attendance, tasks, and notes

// Global student object
let currentStudent = null;
let currentNotes = [];

// Load student profile on page load
document.addEventListener('DOMContentLoaded', async function() {
  // Get student ID from URL
  const params = new URLSearchParams(window.location.search);
  const studentId = params.get('id');

  // Validate ID exists
  if (!studentId) {
    showError('No student ID provided');
    setTimeout(() => window.location.href = 'students.html', 2000);
    return;
  }

  try {
    // Load student data from API
    currentStudent = await studentsAPI.getById(studentId);

    if (!currentStudent) {
      showError('Student not found');
      setTimeout(() => window.location.href = 'students.html', 2000);
      return;
    }

    // Populate profile
    populateStudentProfile(currentStudent);

    // Load additional data
    await Promise.all([
      loadAttendanceHistory(studentId),
      loadStudentTasks(studentId),
      loadStudentNotes(studentId)
    ]);

    // Initialize icons
    lucide.createIcons();
  } catch (error) {
    console.error('Failed to load student profile:', error);
    showError('Failed to load student profile. Please try again.');
  }
});

// Populate student profile header
function populateStudentProfile(student) {
  // Breadcrumb
  document.getElementById('bc-name').textContent = `${student.firstName} ${student.lastName}`;

  // Hero name
  document.getElementById('hero-name').textContent = `${student.firstName} ${student.lastName}`;

  // Generate initials
  const initials = `${student.firstName[0]}${student.lastName[0]}`;

  // Hero avatar
  const heroAvatar = document.getElementById('hero-avatar');
  const avatarColors = [
    { bg: '#DBEAFE', text: '#1D4ED8' },
    { bg: '#EDE9FE', text: '#5B21B6' },
    { bg: '#FEF3C7', text: '#92400E' },
    { bg: '#FCE7F3', text: '#9D174D' },
    { bg: '#ECFDF5', text: '#065F46' },
    { bg: '#FFF7ED', text: '#9A3412' },
    { bg: '#F0FDF4', text: '#15803D' }
  ];
  const colorIndex = student.id % avatarColors.length;
  heroAvatar.style.background = avatarColors[colorIndex].bg;
  heroAvatar.style.color = avatarColors[colorIndex].text;
  heroAvatar.textContent = initials;

  // Grade
  const gradeEl = document.querySelector('.hero-meta-item:nth-child(1)');
  if (gradeEl) {
    gradeEl.innerHTML = `<i data-lucide="graduation-cap" style="width:13px;height:13px;"></i> Grade ${student.grade}`;
  }

  // Team
  const teamEl = document.querySelector('.hero-meta-item:nth-child(2)');
  if (teamEl && student.teamId) {
    // TODO: Fetch team name from API
    teamEl.innerHTML = `<i data-lucide="cpu" style="width:13px;height:13px;"></i>
      <span class="pill pill-v5rc" style="font-size:11px;">Team ${student.teamId}</span>`;
  } else if (teamEl) {
    teamEl.innerHTML = `<i data-lucide="cpu" style="width:13px;height:13px;"></i>
      <span class="pill pill-gray" style="font-size:11px;">No Team</span>`;
  }

  // Email
  const emailEl = document.querySelector('.hero-meta-item:nth-child(4)');
  if (emailEl) {
    const email = `${student.firstName}.${student.lastName}@cautiontape.ca`;
    emailEl.innerHTML = `<i data-lucide="mail" style="width:13px;height:13px;"></i> ${email}`;
  }

  // Status
  const statusEl = document.querySelector('.status-pill');
  if (statusEl) {
    if (student.active) {
      statusEl.className = 'status-pill status-active';
      statusEl.innerHTML = `<i data-lucide="circle" style="width:7px;height:7px;fill:currentColor;"></i> Active`;
    } else {
      statusEl.className = 'status-pill status-inactive';
      statusEl.innerHTML = `<i data-lucide="circle" style="width:7px;height:7px;"></i> Inactive`;
    }
  }

  // Initialize icons
  lucide.createIcons();
}

// Load attendance history
async function loadAttendanceHistory(studentId) {
  try {
    const attendanceRecords = await attendanceAPI.getByStudent(studentId);

    if (!attendanceRecords || attendanceRecords.length === 0) {
      // Show empty state
      const calendarEl = document.querySelector('.att-calendar');
      if (calendarEl) {
        calendarEl.innerHTML = `
          <div style="text-align:center;padding:40px;color:var(--gray-2);">
            <i data-lucide="calendar-x" style="width:40px;height:40px;margin-bottom:12px;opacity:.3;"></i>
            <div style="font-size:13px;color:var(--gray-1);">No attendance records yet</div>
          </div>
        `;
        lucide.createIcons();
      }

      // Update stat card
      const attendanceStat = document.querySelector('.stat-mini:nth-child(1)');
      if (attendanceStat) {
        attendanceStat.querySelector('.stat-mini-value').textContent = '0%';
        attendanceStat.querySelector('.stat-mini-value').style.color = 'var(--gray-1)';
        attendanceStat.querySelector('.stat-mini-fill').style.width = '0%';
        attendanceStat.querySelector('.stat-mini-sub').textContent = 'No sessions yet';
      }
      return;
    }

    // Calculate attendance percentage
    const totalSessions = attendanceRecords.length;
    const presentSessions = attendanceRecords.filter(r => r.status === 'present').length;
    const attendanceRate = Math.round((presentSessions / totalSessions) * 100);

    // Update stat card
    const attendanceStat = document.querySelector('.stat-mini:nth-child(1)');
    if (attendanceStat) {
      attendanceStat.querySelector('.stat-mini-value').textContent = `${attendanceRate}%`;
      attendanceStat.querySelector('.stat-mini-value').style.color = 'var(--black)';
      attendanceStat.querySelector('.stat-mini-fill').style.width = `${attendanceRate}%`;
      attendanceStat.querySelector('.stat-mini-sub').textContent = `${presentSessions}/${totalSessions} sessions`;

      // Color the fill based on attendance rate
      const fillEl = attendanceStat.querySelector('.stat-mini-fill');
      if (attendanceRate >= 90) {
        fillEl.classList.add('green');
      } else if (attendanceRate < 70) {
        fillEl.classList.add('red');
      }
    }

    // Update attendance header
    const headerStat = document.querySelector('.card-header span');
    if (headerStat && headerStat.textContent.includes('%')) {
      headerStat.textContent = `${attendanceRate}% — ${presentSessions}/${totalSessions} sessions`;
      headerStat.style.color = attendanceRate >= 90 ? '#15803D' : (attendanceRate < 70 ? '#DC2626' : 'var(--gray-1)');
    }

    // Render attendance calendar (last 8 weeks, 3 sessions per week)
    renderAttendanceCalendar(attendanceRecords);

  } catch (error) {
    console.error('Failed to load attendance history:', error);
    showError('Failed to load attendance history');
  }
}

// Render attendance calendar
function renderAttendanceCalendar(records) {
  const calendarEl = document.querySelector('.att-calendar');
  if (!calendarEl) return;

  // Get last 24 attendance records (8 weeks × 3 sessions)
  const recentRecords = records.slice(-24).reverse();

  // Group into weeks
  const weeks = [];
  for (let i = 0; i < 8; i++) {
    const weekRecords = recentRecords.slice(i * 3, (i + 1) * 3);
    weeks.push(weekRecords);
  }

  // Render weeks
  let html = '';
  weeks.forEach((week, weekIndex) => {
    html += `<div class="att-week">`;
    html += `<div class="att-week-label">Week ${8 - weekIndex}</div>`;

    // Render 3 dots per week
    for (let i = 0; i < 3; i++) {
      const record = week[i];
      if (record) {
        const status = record.status || 'present';
        const dotClass = status === 'present' ? 'present' : (status === 'absent' ? 'absent' : 'excused');
        html += `<div class="att-dot ${dotClass}" title="${record.date}"></div>`;
      } else {
        html += `<div class="att-dot future"></div>`;
      }
    }

    html += `</div>`;
  });

  calendarEl.innerHTML = html;
}

// Load student tasks
async function loadStudentTasks(studentId) {
  try {
    // Get all tasks and filter by student assignment
    const allTasks = await tasksAPI.getAll();
    const studentTasks = allTasks.filter(task =>
      task.assignedTo && task.assignedTo.includes(studentId)
    );

    if (!studentTasks || studentTasks.length === 0) {
      // Update stat card
      const tasksStat = document.querySelector('.stat-mini:nth-child(4)');
      if (tasksStat) {
        tasksStat.querySelector('.stat-mini-value').textContent = '0';
        tasksStat.querySelector('.stat-mini-sub').textContent = 'No tasks assigned';
      }
      return;
    }

    // Count open tasks
    const openTasks = studentTasks.filter(t => t.status !== 'completed');

    // Update stat card
    const tasksStat = document.querySelector('.stat-mini:nth-child(4)');
    if (tasksStat) {
      tasksStat.querySelector('.stat-mini-value').textContent = openTasks.length;
      tasksStat.querySelector('.stat-mini-sub').textContent = `${openTasks.length} open`;
    }

    // Render tasks list
    renderTasksList(studentTasks);

  } catch (error) {
    console.error('Failed to load student tasks:', error);
    showError('Failed to load tasks');
  }
}

// Render tasks list
function renderTasksList(tasks) {
  const tasksCard = document.querySelector('.card-body');
  if (!tasksCard) return;

  // Get the tasks card specifically
  const tasksCardBody = document.querySelectorAll('.card-body')[1]; // Second card is tasks
  if (!tasksCardBody) return;

  if (!tasks || tasks.length === 0) {
    tasksCardBody.innerHTML = `
      <div style="padding:40px 20px;text-align:center;">
        <div style="color:var(--gray-2);font-size:13px;margin-bottom:6px;">
          <i data-lucide="circle-check" style="width:32px;height:32px;margin-bottom:8px;opacity:.3;"></i>
        </div>
        <div style="font-size:13px;color:var(--gray-1);">No tasks assigned yet</div>
      </div>
    `;
    lucide.createIcons();
    return;
  }

  // Render task items
  let html = '';
  tasks.slice(0, 5).forEach(task => {
    const isDone = task.status === 'completed';
    const checkClass = isDone ? 'task-check done' : 'task-check';
    const nameClass = isDone ? 'task-name done' : 'task-name';

    // Check if overdue
    const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !isDone;
    const dueDateClass = isOverdue ? 'task-due-red' : '';

    html += `
      <div class="task-item">
        <div class="${checkClass}">${isDone ? '✓' : ''}</div>
        <div style="flex:1;">
          <div class="${nameClass}">${task.title}</div>
          <div class="task-meta">
            <span class="${dueDateClass}">Due: ${task.dueDate || 'No due date'}</span>
            <span>${task.priority || 'Normal'} priority</span>
          </div>
        </div>
      </div>
    `;
  });

  tasksCardBody.innerHTML = html;
}

// Load student notes
async function loadStudentNotes(studentId) {
  try {
    // TODO: Replace with actual notes API when implemented
    // For now, use placeholder
    currentNotes = [];

    renderNotesList(currentNotes);
  } catch (error) {
    console.error('Failed to load notes:', error);
  }
}

// Render notes list
function renderNotesList(notes) {
  const notesContainer = document.querySelectorAll('.card')[2]; // Third card is notes
  if (!notesContainer) return;

  const notesBody = notesContainer.querySelector('.card-body') || notesContainer.querySelector('div[style*="padding"]');
  if (!notesBody) return;

  if (!notes || notes.length === 0) {
    notesBody.innerHTML = `
      <div style="padding:40px 20px;text-align:center;">
        <div style="color:var(--gray-2);font-size:13px;margin-bottom:6px;">
          <i data-lucide="message-square" style="width:32px;height:32px;margin-bottom:8px;opacity:.3;"></i>
        </div>
        <div style="font-size:13px;color:var(--gray-1);">No notes yet. Add the first one below!</div>
      </div>
    `;
    lucide.createIcons();
    return;
  }

  // Render notes
  let html = '<div style="padding:18px 20px;">';
  notes.forEach(note => {
    const initials = note.authorInitials || 'MS';
    const dateStr = new Date(note.createdAt).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });

    html += `
      <div class="note-item">
        <div class="note-avatar">${initials}</div>
        <div style="flex:1;">
          <div>
            <span class="note-author">${note.author || 'Coach'}</span>
            <span class="note-date">${dateStr}</span>
          </div>
          <div class="note-text">${note.content}</div>
        </div>
      </div>
    `;
  });
  html += '</div>';

  notesBody.innerHTML = html;
}

// Post a new note
async function postNote() {
  const noteInput = document.getElementById('note-input');
  const content = noteInput.value.trim();

  if (!content) {
    showWarning('Please enter a note');
    return;
  }

  if (!currentStudent) {
    showError('Student not loaded');
    return;
  }

  try {
    // TODO: Replace with actual notes API when implemented
    // For now, add to local array
    const newNote = {
      id: Date.now(),
      content: content,
      author: 'Malhar Soni',
      authorInitials: 'MS',
      createdAt: new Date().toISOString(),
      studentId: currentStudent.id
    };

    currentNotes.unshift(newNote);

    // Clear input
    noteInput.value = '';

    // Re-render notes
    renderNotesList(currentNotes);

    showSuccess('Note added successfully');
  } catch (error) {
    console.error('Failed to post note:', error);
    showError('Failed to add note');
  }
}

// Tab switching
function switchTab(tabName, tabEl) {
  // Hide all tabs
  document.querySelectorAll('[id^="tab-"]').forEach(tab => {
    tab.style.display = 'none';
  });

  // Show selected tab
  const selectedTab = document.getElementById(`tab-${tabName}`);
  if (selectedTab) {
    selectedTab.style.display = 'block';
  }

  // Update tab styles
  document.querySelectorAll('.tab').forEach(t => {
    t.classList.remove('active');
  });
  if (tabEl) {
    tabEl.classList.add('active');
  }

  // Reinitialize icons
  lucide.createIcons();
}

// Helper functions (placeholders for missing functions)
function togglePresent() {
  showInfo('Mark present functionality coming soon');
}

function openEditProfile() {
  showInfo('Edit profile functionality coming soon');
}

function openBadgeModal() {
  showInfo('Issue badge functionality coming soon');
}

function openManageRoles() {
  showInfo('Manage roles functionality coming soon');
}

function toggleSPMenu(event) {
  event.stopPropagation();
  const menu = document.getElementById('sp-more-menu');
  if (menu) {
    menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
  }
}

function showSPToast(message) {
  showInfo(message);
  const menu = document.getElementById('sp-more-menu');
  if (menu) {
    menu.style.display = 'none';
  }
}

function openNotifPanel() {
  showInfo('Notifications coming soon');
}

// Close menu when clicking outside
document.addEventListener('click', function() {
  const menu = document.getElementById('sp-more-menu');
  if (menu && menu.style.display === 'block') {
    menu.style.display = 'none';
  }
});

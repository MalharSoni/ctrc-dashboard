# localStorage to API Migration Guide

## Quick Start

This guide shows you how to replace localStorage calls with API calls in the remaining HTML files.

## Step 1: Add Script Imports

Add these script tags before the closing `</body>` tag in **all HTML files**:

```html
<!-- Toast Notifications -->
<script src="js/toast.js"></script>

<!-- API Client -->
<script src="js/api-client.js"></script>
```

## Step 2: Find and Replace Patterns

### Pattern 1: Loading Data

**Before (localStorage):**
```javascript
function loadStudents() {
  const students = JSON.parse(localStorage.getItem('students') || '[]');
  renderStudents(students);
}
```

**After (API):**
```javascript
async function loadStudents() {
  try {
    const students = await studentsAPI.getAll();
    renderStudents(students);
  } catch (error) {
    console.error('Failed to load students:', error);
    showError('Failed to load students. Please refresh.');
  }
}
```

### Pattern 2: Creating New Records

**Before (localStorage):**
```javascript
function addStudent(data) {
  const students = JSON.parse(localStorage.getItem('students') || '[]');
  students.push({ id: generateId(), ...data });
  localStorage.setItem('students', JSON.stringify(students));
  showToast('Student added!');
  loadStudents();
}
```

**After (API):**
```javascript
async function addStudent(data) {
  try {
    const newStudent = await studentsAPI.create(data);
    showSuccess('Student added successfully!');
    await loadStudents(); // Refresh the list
  } catch (error) {
    console.error('Failed to add student:', error);
    showError('Failed to add student. Please try again.');
  }
}
```

### Pattern 3: Updating Records

**Before (localStorage):**
```javascript
function updateStudent(id, data) {
  const students = JSON.parse(localStorage.getItem('students') || '[]');
  const index = students.findIndex(s => s.id === id);
  if (index !== -1) {
    students[index] = { ...students[index], ...data };
    localStorage.setItem('students', JSON.stringify(students));
    showToast('Student updated!');
  }
}
```

**After (API):**
```javascript
async function updateStudent(id, data) {
  try {
    await studentsAPI.update(id, data);
    showSuccess('Student updated successfully!');
    await loadStudents(); // Refresh
  } catch (error) {
    console.error('Failed to update student:', error);
    showError('Failed to update student.');
  }
}
```

### Pattern 4: Deleting Records

**Before (localStorage):**
```javascript
function deleteStudent(id) {
  const students = JSON.parse(localStorage.getItem('students') || '[]');
  const filtered = students.filter(s => s.id !== id);
  localStorage.setItem('students', JSON.stringify(filtered));
  showToast('Student deleted');
  loadStudents();
}
```

**After (API):**
```javascript
async function deleteStudent(id) {
  if (!confirm('Are you sure you want to delete this student?')) return;

  try {
    await studentsAPI.delete(id);
    showSuccess('Student deleted successfully!');
    await loadStudents(); // Refresh
  } catch (error) {
    console.error('Failed to delete student:', error);
    showError('Failed to delete student.');
  }
}
```

## File-Specific Migration

### students.html

**Replace:**
- `localStorage.getItem('students')` → `studentsAPI.getAll()`
- `localStorage.setItem('students', ...)` → `studentsAPI.create()` or `studentsAPI.update()`

**Functions to update:**
```javascript
// Load students
async function loadStudents() {
  try {
    const students = await studentsAPI.getAll();
    renderStudentTable(students);
  } catch (error) {
    showError('Failed to load students');
  }
}

// Add student
async function addStudent(formData) {
  try {
    await studentsAPI.create(formData);
    showSuccess('Student added!');
    await loadStudents();
    closeModal();
  } catch (error) {
    showError('Failed to add student');
  }
}

// Bulk assign to team
async function bulkAssignTeam(studentIds, teamId) {
  try {
    await studentsAPI.bulkAssign(studentIds, teamId);
    showSuccess('Students assigned to team!');
    await loadStudents();
  } catch (error) {
    showError('Failed to assign students');
  }
}
```

### tasks.html

**Replace:**
- `localStorage.getItem('tasks')` → `tasksAPI.getAll()`
- `localStorage.setItem('tasks', ...)` → `tasksAPI.create()` or `tasksAPI.update()`

**Functions to update:**
```javascript
// Load tasks
async function loadTasks() {
  try {
    const tasks = await tasksAPI.getAll();
    renderTasks(tasks);
  } catch (error) {
    showError('Failed to load tasks');
  }
}

// Create task
async function createTask(formData) {
  try {
    await tasksAPI.create(formData);
    showSuccess('Task created!');
    await loadTasks();
    closeModal();
  } catch (error) {
    showError('Failed to create task');
  }
}

// Update task status
async function updateTaskStatus(taskId, newStatus) {
  try {
    await tasksAPI.updateStatus(taskId, newStatus);
    showSuccess('Task status updated!');
    await loadTasks();
  } catch (error) {
    showError('Failed to update task');
  }
}

// Assign task to students
async function assignTask(taskId, studentIds) {
  try {
    await tasksAPI.assign(taskId, studentIds);
    showSuccess('Task assigned!');
    await loadTasks();
  } catch (error) {
    showError('Failed to assign task');
  }
}
```

### trials.html

**Replace:**
- `localStorage.getItem('trialStudents')` → `trialsAPI.getAll()`
- `localStorage.setItem('trialStudents', ...)` → `trialsAPI.create()` or `trialsAPI.update()`

**Functions to update:**
```javascript
// Load trials
async function loadTrials() {
  try {
    const trials = await trialsAPI.getAll();
    renderTrials(trials);
  } catch (error) {
    showError('Failed to load trial students');
  }
}

// Add trial booking
async function addTrial(formData) {
  try {
    await trialsAPI.create(formData);
    showSuccess('Trial booking created!');
    await loadTrials();
    closeModal();
  } catch (error) {
    showError('Failed to create trial booking');
  }
}

// Convert trial to full student
async function convertTrialToStudent(trialId) {
  if (!confirm('Convert this trial student to a full student?')) return;

  try {
    const student = await trialsAPI.convert(trialId);
    showSuccess(`${student.name} converted to full student!`);
    await loadTrials();
  } catch (error) {
    showError('Failed to convert trial student');
  }
}

// Delete trial
async function deleteTrial(trialId) {
  if (!confirm('Delete this trial booking?')) return;

  try {
    await trialsAPI.delete(trialId);
    showSuccess('Trial booking deleted');
    await loadTrials();
  } catch (error) {
    showError('Failed to delete trial booking');
  }
}
```

### teams.html

**Replace:**
- `localStorage.getItem('teams')` → `teamsAPI.getAll()`

**Functions to update:**
```javascript
// Load teams
async function loadTeams() {
  try {
    const teams = await teamsAPI.getAll();
    renderTeams(teams);
  } catch (error) {
    showError('Failed to load teams');
  }
}

// Create team
async function createTeam(formData) {
  try {
    await teamsAPI.create(formData);
    showSuccess('Team created!');
    await loadTeams();
    closeModal();
  } catch (error) {
    showError('Failed to create team');
  }
}

// Update team
async function updateTeam(teamId, data) {
  try {
    await teamsAPI.update(teamId, data);
    showSuccess('Team updated!');
    await loadTeams();
  } catch (error) {
    showError('Failed to update team');
  }
}
```

### projects.html

**Replace:**
- `localStorage.getItem('projects')` → `projectsAPI.getAll()`

**Functions to update:**
```javascript
// Load projects
async function loadProjects() {
  try {
    const projects = await projectsAPI.getAll();
    renderProjects(projects);
  } catch (error) {
    showError('Failed to load projects');
  }
}

// Create project
async function createProject(formData) {
  try {
    await projectsAPI.create(formData);
    showSuccess('Project created!');
    await loadProjects();
    closeModal();
  } catch (error) {
    showError('Failed to create project');
  }
}

// Update project
async function updateProject(projectId, data) {
  try {
    await projectsAPI.update(projectId, data);
    showSuccess('Project updated!');
    await loadProjects();
  } catch (error) {
    showError('Failed to update project');
  }
}
```

### student-profile.html

**Functions to update:**
```javascript
// Load student profile
async function loadStudentProfile() {
  const urlParams = new URLSearchParams(window.location.search);
  const studentId = urlParams.get('id');

  if (!studentId) {
    showError('No student ID provided');
    return;
  }

  try {
    const student = await studentsAPI.getById(studentId);
    renderStudentProfile(student);

    // Load attendance history
    const attendance = await attendanceAPI.getByStudent(studentId);
    renderAttendanceHistory(attendance);
  } catch (error) {
    showError('Failed to load student profile');
  }
}
```

## Common Patterns

### Show Loading Spinner (Optional)

```javascript
async function loadData() {
  const loadingEl = document.getElementById('loading');
  const contentEl = document.getElementById('content');

  loadingEl.style.display = 'block';
  contentEl.style.display = 'none';

  try {
    const data = await someAPI.getAll();
    renderData(data);
    loadingEl.style.display = 'none';
    contentEl.style.display = 'block';
  } catch (error) {
    loadingEl.style.display = 'none';
    showError('Failed to load data');
  }
}
```

### Empty State Handling

```javascript
async function loadData() {
  try {
    const data = await someAPI.getAll();

    if (data.length === 0) {
      showEmptyState('No data found');
    } else {
      renderData(data);
    }
  } catch (error) {
    showError('Failed to load data');
  }
}

function showEmptyState(message) {
  const container = document.getElementById('data-container');
  container.innerHTML = `
    <div style="text-align:center;padding:60px;color:var(--gray-2);">
      <i data-lucide="inbox" style="width:48px;height:48px;margin-bottom:12px;"></i>
      <div style="font-size:15px;font-weight:600;">${message}</div>
    </div>
  `;
  lucide.createIcons();
}
```

### Form Validation Before Submit

```javascript
async function handleFormSubmit(event) {
  event.preventDefault();

  const form = event.target;
  const formData = new FormData(form);
  const data = Object.fromEntries(formData);

  // Validate required fields
  if (!data.name || !data.email) {
    showWarning('Please fill in all required fields');
    return;
  }

  try {
    await someAPI.create(data);
    showSuccess('Created successfully!');
    form.reset();
    await loadData(); // Refresh
  } catch (error) {
    showError('Failed to create');
  }
}
```

## Checklist for Each File

- [ ] Import toast.js and api-client.js scripts
- [ ] Replace all `localStorage.getItem()` with API calls
- [ ] Replace all `localStorage.setItem()` with API calls
- [ ] Replace all `localStorage.removeItem()` with API delete calls
- [ ] Add `async` keyword to functions making API calls
- [ ] Add `try/catch` blocks around all API calls
- [ ] Add `showSuccess()` for successful operations
- [ ] Add `showError()` for failed operations
- [ ] Add `await` before API calls
- [ ] Refresh data after create/update/delete operations
- [ ] Test all CRUD operations
- [ ] Test error handling (disconnect network, invalid data)
- [ ] Test empty states
- [ ] Verify multiple browsers see same data

## Testing

After migration, test each file:

1. **Load data** - Does it fetch from API?
2. **Create record** - Does it save to database?
3. **Update record** - Does it update in database?
4. **Delete record** - Does it remove from database?
5. **Error handling** - Does it show error toasts?
6. **Success feedback** - Does it show success toasts?
7. **Multi-browser** - Do changes appear in other browsers?
8. **Offline** - Does it handle network errors gracefully?

## Tips

- Always use `await` before API calls
- Always wrap API calls in `try/catch`
- Always refresh data after mutations (create/update/delete)
- Use `showSuccess()` and `showError()` for user feedback
- Log errors to console for debugging
- Add confirmation dialogs for destructive actions (delete)
- Validate form data before sending to API
- Handle empty states gracefully
- Test with real backend before deploying

---

**Need Help?** Refer to `FRONTEND_API_INTEGRATION.md` for detailed API documentation.

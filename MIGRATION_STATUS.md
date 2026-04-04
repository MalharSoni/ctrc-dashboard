# localStorage → API Migration Status

## Completed Migrations

### trials.html
Status: COMPLETE
- Added API client and toast scripts
- Converted data loading to `trialsAPI.getAll()`
- Converted CRUD operations to async API calls
- Updated status enums to match API (SCHEDULED, ATTENDED, etc.)
- Removed all localStorage calls
- Error handling and toasts in place

### projects.html
Status: COMPLETE
- Added API client and toast scripts
- Converted data loading to `projectsAPI.getAll()`
- Converted save operations to async API calls
- Removed localStorage persistence
- Error handling and toasts in place

---

## Remaining Migrations

### students.html
Status: PENDING
Size: ~1,400 lines (large file)

**Required Changes:**

1. **Add scripts** (after line 8):
```html
<script src="https://unpkg.com/lucide@latest/dist/umd/lucide.min.js"></script>
<script src="/js/api-client.js"></script>
<script src="/js/toast.js"></script>
```

2. **Replace data initialization** (around line 653):
```javascript
// OLD
const STUDENTS = JSON.parse(localStorage.getItem('students') || 'null') || [/* mock data */];

// NEW
let STUDENTS = [];

async function loadStudents() {
  try {
    STUDENTS = await studentsAPI.getAll();
    applyFilters();
  } catch (error) {
    console.error('Failed to load students:', error);
    showToast('Could not load students. Please refresh the page.', 'error');
  }
}
```

3. **Replace bulk assign function** (around line 1135):
```javascript
// OLD - uses localStorage.setItem

// NEW
async function submitBulkAssign() {
  // ... existing validation logic ...

  try {
    await studentsAPI.bulkAssign(assignModalStudentIds, selectedTeam);

    // Update local state
    assignModalStudentIds.forEach(id => {
      const student = STUDENTS.find(s => s.id === id);
      if (student) {
        student.team = teamValue;
        student.teamLabel = teamLabel;
        student.evTeam = evTeamChecked;
      }
    });

    const count = assignModalStudentIds.length;
    const destination = selectedTeam === 'foundation' ? 'Foundation Program' : `Team ${selectedTeam}`;
    const message = count === 1
      ? `${names[0]} assigned to ${destination}`
      : `${count} students assigned to ${destination}`;

    showToast(message, 'success');

    document.getElementById('assign-backdrop').style.display = 'none';
    if (count > 1) clearSelection();
    applyFilters();
  } catch (error) {
    console.error('Failed to assign students:', error);
    showToast('Failed to assign students. Please try again.', 'error');
  }
}
```

4. **Data Structure Mapping:**
   - API returns `firstName` + `lastName` instead of combined `name`
   - API returns `teams` array with relations instead of flat `team` string
   - Update rendering to handle: `const fullName = s.firstName + ' ' + s.lastName`
   - Team access: `s.teams[0]?.team?.teamNumber` instead of `s.team`

5. **Initialize on page load** (around line 1177):
```javascript
// OLD
applyFilters();

// NEW
document.addEventListener('DOMContentLoaded', () => {
  loadStudents();
  lucide.createIcons();
});
```

6. **Remove ALL localStorage calls:**
   - Search for `localStorage.getItem('students')`
   - Search for `localStorage.setItem('students')`
   - Delete all occurrences

---

### tasks.html
Status: PENDING
Size: ~1,900 lines (very large file)

**Required Changes:**

1. **Add scripts** (in <head>):
```html
<script src="/js/api-client.js"></script>
<script src="/js/toast.js"></script>
```

2. **Replace data initialization:**
```javascript
let TASKS = [];

async function loadTasks() {
  try {
    TASKS = await tasksAPI.getAll();
    applyFilters();
  } catch (error) {
    console.error('Failed to load tasks:', error);
    showToast('Could not load tasks. Please refresh the page.', 'error');
  }
}
```

3. **Convert create task function:**
```javascript
async function createTask(formData) {
  try {
    const data = {
      title: formData.get('title'),
      description: formData.get('description'),
      teamId: formData.get('teamId'),
      priority: formData.get('priority') || 'MEDIUM',
      status: 'TODO',
      category: formData.get('category') || 'GENERAL',
      dueDate: formData.get('dueDate')
    };

    const newTask = await tasksAPI.create(data);
    TASKS.push(newTask);
    renderTasks();
    closeModal('add-task-modal');
    showToast('Task created!', 'success');
  } catch (error) {
    console.error('Failed to create task:', error);
    showToast('Failed to create task', 'error');
  }
}
```

4. **Convert update status function:**
```javascript
async function updateTaskStatus(taskId, newStatus) {
  try {
    await tasksAPI.updateStatus(taskId, newStatus);
    const task = TASKS.find(t => t.id === taskId);
    if (task) {
      task.status = newStatus;
    }
    renderTasks();
    showToast('Task updated!', 'success');
  } catch (error) {
    console.error('Failed to update task:', error);
    showToast('Failed to update task', 'error');
  }
}
```

5. **Convert delete task function:**
```javascript
async function deleteTask(taskId) {
  if (!confirm('Delete this task?')) return;

  try {
    await tasksAPI.delete(taskId);
    const index = TASKS.findIndex(t => t.id === taskId);
    if (index > -1) {
      TASKS.splice(index, 1);
    }
    renderTasks();
    showToast('Task deleted!', 'success');
  } catch (error) {
    console.error('Failed to delete task:', error);
    showToast('Failed to delete task', 'error');
  }
}
```

6. **Initialize on page load:**
```javascript
document.addEventListener('DOMContentLoaded', () => {
  loadTasks();
  lucide.createIcons();
});
```

7. **Remove ALL localStorage calls:**
   - Search for `localStorage.getItem`
   - Search for `localStorage.setItem`
   - Delete all occurrences

---

### teams.html
Status: PENDING
Complexity: Low (likely just displays data)

**Required Changes:**

1. **Add scripts:**
```html
<script src="/js/api-client.js"></script>
<script src="/js/toast.js"></script>
```

2. **Load data:**
```javascript
let TEAMS = [];

async function loadTeams() {
  try {
    TEAMS = await teamsAPI.getAll();
    renderTeams();
  } catch (error) {
    console.error('Failed to load teams:', error);
    showToast('Could not load teams', 'error');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadTeams();
  lucide.createIcons();
});
```

3. **Remove localStorage calls** (if any)

---

## Testing Checklist

After completing all migrations, test:

### trials.html
- [ ] Page loads trials from API
- [ ] Add trial creates database record
- [ ] Mark attended updates status
- [ ] Mark no-show updates status
- [ ] Convert to student works
- [ ] Delete trial works
- [ ] Toast notifications appear
- [ ] No console errors
- [ ] No localStorage calls remain

### projects.html
- [ ] Projects load from API
- [ ] Weekly progress saves to database
- [ ] Archive project updates status
- [ ] Toast notifications appear
- [ ] No console errors
- [ ] No localStorage calls remain

### students.html
- [ ] Page loads students from API
- [ ] Bulk assign saves to database
- [ ] Student data displays correctly (firstName + lastName)
- [ ] Team data displays correctly
- [ ] Toast notifications appear
- [ ] No console errors
- [ ] No localStorage calls remain

### tasks.html
- [ ] Tasks load from API
- [ ] Create task works
- [ ] Update status works
- [ ] Delete task works
- [ ] Assign task works (if applicable)
- [ ] Toast notifications appear
- [ ] No console errors
- [ ] No localStorage calls remain

### teams.html
- [ ] Teams load from API
- [ ] Team data displays correctly
- [ ] No console errors
- [ ] No localStorage calls remain

---

## Common Patterns

### Error Handling
```javascript
try {
  const result = await someAPI.someMethod();
  // Success - update UI
  showToast('Success!', 'success');
} catch (error) {
  console.error('Operation failed:', error);
  showToast('Operation failed. Please try again.', 'error');
}
```

### Data Structure Mapping
```javascript
// localStorage → API differences
// OLD: student.name
// NEW: student.firstName + ' ' + student.lastName

// OLD: student.team
// NEW: student.teams[0]?.team?.teamNumber

// OLD: trial.status = 'scheduled'
// NEW: trial.status = 'SCHEDULED'
```

### Always Use Toast
```javascript
// Success
showToast('Student added successfully!', 'success');

// Error
showToast('Failed to add student', 'error');

// Warning
showToast('Please fill required fields', 'warning');

// Info
showToast('Data loaded', 'info');
```

---

## Next Steps

1. Complete students.html migration (most complex)
2. Complete tasks.html migration (most complex)
3. Complete teams.html migration (simple)
4. Test all pages end-to-end
5. Verify no localStorage calls remain
6. Update documentation

---

## Files Already Migrated
- index.html (reference implementation)
- trials.html (complete)
- projects.html (complete)

## Files Needing Migration
- students.html (in progress)
- tasks.html (in progress)
- teams.html (pending)

---

Last Updated: 2026-04-03

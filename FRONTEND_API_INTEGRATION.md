# Frontend API Integration - CTRC Dashboard

## Overview

This document describes the frontend API integration layer that replaces localStorage with real database calls via Netlify Functions.

## Files Created/Modified

### New Files

1. **`/Users/malharsoni/Downloads/ctrc-dashboard/js/toast.js`**
   - Toast notification system for user feedback
   - Shows success/error/warning/info messages
   - Auto-dismisses after 3 seconds
   - Supports multiple simultaneous toasts

2. **Updated: `/Users/malharsoni/Downloads/ctrc-dashboard/js/api-client.js`**
   - Centralized API client for all database operations
   - Full CRUD operations (Create, Read, Update, Delete)
   - Error handling and loading states
   - Automatic data loading based on current page

### Modified Files

1. **`/Users/malharsoni/Downloads/ctrc-dashboard/index.html`**
   - Updated attendance saving to use `attendanceAPI.record()`
   - Updated attendance loading to use `attendanceAPI.getForSession()`
   - Updated trial students to use `trialsAPI.getAll()`
   - Added toast.js script import
   - Added error handling for all API calls

## API Client Structure

### Base Configuration

```javascript
const API_BASE = '/.netlify/functions';
```

All API calls go through the centralized `fetchAPI()` function which:
- Handles HTTP methods (GET, POST, PUT, PATCH, DELETE)
- Sets proper headers (Content-Type: application/json)
- Parses JSON responses
- Throws errors with meaningful messages
- Logs errors to console

### Available APIs

#### 1. Students API (`studentsAPI`)

```javascript
// Get all students (with optional filters)
await studentsAPI.getAll({ grade: 9, active: true });

// Get single student
await studentsAPI.getById('student_id');

// Create new student
await studentsAPI.create({
  firstName: 'John',
  lastName: 'Doe',
  grade: 10,
  active: true
});

// Update student
await studentsAPI.update('student_id', { grade: 11 });

// Delete student
await studentsAPI.delete('student_id');

// Bulk assign students to team
await studentsAPI.bulkAssign(['student_id_1', 'student_id_2'], 'team_id');
```

#### 2. Attendance API (`attendanceAPI`)

```javascript
// Get all attendance records (with optional filters)
await attendanceAPI.getAll({ date: '2025-04-05' });

// Get attendance for specific student
await attendanceAPI.getByStudent('student_id');

// Record attendance
await attendanceAPI.record({
  date: '2025-04-05',
  session: 'morning',
  presentStudents: ['student_id_1', 'student_id_2'],
  totalStudents: 7,
  timestamp: new Date().toISOString()
});

// Get attendance stats
await attendanceAPI.getStats();

// Get attendance for specific session
await attendanceAPI.getForSession('2025-04-05', 'morning');
```

#### 3. Tasks API (`tasksAPI`)

```javascript
// Get all tasks (with optional filters)
await tasksAPI.getAll({ status: 'pending', priority: 'HIGH' });

// Get single task
await tasksAPI.getById('task_id');

// Create new task
await tasksAPI.create({
  title: 'Mount intake motor',
  teamId: 'team_id',
  priority: 'HIGH',
  dueDate: '2025-04-10',
  category: 'Build'
});

// Update task
await tasksAPI.update('task_id', { status: 'completed' });

// Update just the status
await tasksAPI.updateStatus('task_id', 'in_progress');

// Delete task
await tasksAPI.delete('task_id');

// Assign task to students
await tasksAPI.assign('task_id', ['student_id_1', 'student_id_2']);
```

#### 4. Teams API (`teamsAPI`)

```javascript
// Get all teams
await teamsAPI.getAll();

// Get single team
await teamsAPI.getById('team_id');

// Create new team
await teamsAPI.create({
  teamNumber: '839Z',
  division: 'V5RC',
  active: true
});

// Update team
await teamsAPI.update('team_id', { active: false });
```

#### 5. Trials API (`trialsAPI`)

```javascript
// Get all trial students (with optional filters)
await trialsAPI.getAll({ status: 'scheduled' });

// Get single trial
await trialsAPI.getById('trial_id');

// Create new trial booking
await trialsAPI.create({
  studentName: 'Jordan Lee',
  parentName: 'Sarah Lee',
  sessionDate: '2025-04-05',
  timeSlot: 'AM',
  status: 'scheduled'
});

// Update trial
await trialsAPI.update('trial_id', { status: 'completed' });

// Convert trial student to full student
await trialsAPI.convert('trial_id');

// Delete trial
await trialsAPI.delete('trial_id');
```

#### 6. Dashboard API (`dashboardAPI`)

```javascript
// Get dashboard stats
const stats = await dashboardAPI.getStats();
// Returns: { totalStudents, activeTeams, attendance, meetings, overdueTasks }
```

#### 7. Projects API (`projectsAPI`)

```javascript
// Get all projects
await projectsAPI.getAll();

// Get single project
await projectsAPI.getById('project_id');

// Create new project
await projectsAPI.create({
  name: 'Build Intake',
  teamId: 'team_id',
  status: 'in_progress'
});

// Update project
await projectsAPI.update('project_id', { status: 'completed' });
```

## Toast Notification System

### Usage

```javascript
// Show success message
showToast('Student added successfully!', 'success');

// Show error message
showToast('Failed to save data', 'error');

// Show warning
showToast('This action cannot be undone', 'warning');

// Show info (default)
showToast('Data loaded', 'info');
```

### Convenience Functions

```javascript
showSuccess('Operation completed!');
showError('Something went wrong');
showWarning('Please confirm this action');
showInfo('New data available');
```

### Toast Types

- **success**: Green background, checkmark icon
- **error**: Red background, X icon
- **warning**: Orange background, warning icon
- **info**: Black background, info icon

## Implementation Examples

### Example 1: Save Attendance (index.html)

**Before (localStorage):**
```javascript
function saveAttendance() {
  const attendanceData = JSON.parse(localStorage.getItem('attendance') || '{}');
  attendanceData[sessionId] = { /* data */ };
  localStorage.setItem('attendance', JSON.stringify(attendanceData));
  showToast('Attendance saved');
}
```

**After (API):**
```javascript
async function saveAttendance() {
  const records = {
    date: dateStr,
    session: currentSession,
    presentStudents: Array.from(currentAttendance),
    totalStudents: totalStudents,
    timestamp: new Date().toISOString()
  };

  try {
    await attendanceAPI.record(records);
    showToast('Attendance saved: 15/20 present', 'success');
    closeAttendanceModal();
  } catch (error) {
    console.error('Failed to save attendance:', error);
    showToast('Failed to save attendance. Please try again.', 'error');
  }
}
```

### Example 2: Load Trial Students (index.html)

**Before (localStorage):**
```javascript
function loadTrialStudents() {
  const trials = JSON.parse(localStorage.getItem('trialStudents') || '[]');
  const upcoming = trials.filter(t => t.status === 'scheduled');
  // render...
}
```

**After (API):**
```javascript
async function loadTrialStudents() {
  try {
    const trials = await trialsAPI.getAll({ status: 'scheduled' });
    const upcoming = trials || [];
    // render...
    lucide.createIcons();
  } catch (error) {
    console.error('Failed to load trial students:', error);
    list.innerHTML = '<div>Failed to load trial students</div>';
  }
}
```

### Example 3: Create New Student (students.html)

```javascript
async function addStudent(formData) {
  try {
    const newStudent = await studentsAPI.create({
      firstName: formData.firstName,
      lastName: formData.lastName,
      grade: parseInt(formData.grade),
      active: true
    });

    showSuccess(`${newStudent.firstName} ${newStudent.lastName} added successfully!`);
    await updateStudentsTable(); // Refresh the table
    closeModal();
  } catch (error) {
    console.error('Failed to add student:', error);
    showError('Failed to add student. Please try again.');
  }
}
```

### Example 4: Update Task Status (tasks.html)

```javascript
async function updateTaskStatus(taskId, newStatus) {
  try {
    await tasksAPI.updateStatus(taskId, newStatus);

    // Update local UI
    const taskRow = document.querySelector(`[data-task-id="${taskId}"]`);
    taskRow.querySelector('.status-badge').textContent = newStatus;

    showSuccess('Task status updated!');
  } catch (error) {
    console.error('Failed to update task:', error);
    showError('Failed to update task status');
  }
}
```

## Error Handling Pattern

All API calls should follow this pattern:

```javascript
async function performOperation() {
  try {
    // Show loading state (optional)
    showLoadingState('operation-loading');

    // Make API call
    const result = await someAPI.someMethod(data);

    // Update UI with result
    updateUIWithData(result);

    // Hide loading state
    hideLoadingState('operation-loading');

    // Show success message
    showSuccess('Operation completed successfully!');

  } catch (error) {
    // Log error for debugging
    console.error('Operation failed:', error);

    // Hide loading state
    hideLoadingState('operation-loading');

    // Show user-friendly error message
    showError('Operation failed. Please try again.');

    // Optionally show fallback UI
    showEmptyState('Could not load data');
  }
}
```

## Loading States

The API client includes placeholder functions for loading states:

```javascript
function showLoadingState(id) {
  // Show spinner or skeleton UI
}

function hideLoadingState(id) {
  // Hide loading UI
}
```

These can be implemented per page as needed.

## Testing Checklist

- [x] Dashboard stats load from API
- [x] Attendance saves to database
- [x] Attendance loads from database for existing sessions
- [x] Trial students load from database
- [ ] Students CRUD operations work
- [ ] Tasks CRUD operations work
- [ ] Teams load and update
- [ ] Projects load and update
- [ ] Toast notifications appear on success/error
- [ ] Multiple browsers see same data (no localStorage)
- [ ] Error handling shows appropriate messages

## Next Steps

### Files to Update

1. **students.html**
   - Replace localStorage student management with studentsAPI
   - Add create/update/delete operations
   - Add bulk team assignment

2. **tasks.html**
   - Replace localStorage task management with tasksAPI
   - Add task status updates
   - Add task assignment

3. **trials.html**
   - Replace localStorage trial management with trialsAPI
   - Add convert to student functionality
   - Add delete trial

4. **teams.html**
   - Add teams loading via teamsAPI
   - Add team creation/update

5. **projects.html**
   - Add projects loading via projectsAPI
   - Add project creation/update

6. **student-profile.html**
   - Load individual student data via studentsAPI.getById()
   - Load student attendance history

## Notes

- All dates should be in ISO format (YYYY-MM-DD)
- All timestamps should be in ISO 8601 format
- Student IDs, team IDs, etc. should match the database format
- Error messages should be user-friendly, not technical
- Always log errors to console for debugging
- Toast notifications auto-dismiss after 3 seconds

## Backend API Endpoints Required

The following Netlify Function endpoints must exist:

- `GET /students` - List all students
- `GET /students/:id` - Get single student
- `POST /students` - Create student
- `PUT /students/:id` - Update student
- `DELETE /students/:id` - Delete student
- `POST /students/bulk-assign` - Bulk assign to team

- `GET /attendance` - List attendance records
- `GET /attendance/:studentId` - Get student attendance
- `POST /attendance` - Record attendance
- `GET /attendance/stats` - Get attendance statistics
- `GET /attendance/session` - Get session attendance

- `GET /tasks` - List tasks
- `GET /tasks/:id` - Get single task
- `POST /tasks` - Create task
- `PUT /tasks/:id` - Update task
- `DELETE /tasks/:id` - Delete task
- `PATCH /tasks/:id/status` - Update task status
- `POST /tasks/:id/assign` - Assign task to students

- `GET /teams` - List teams
- `GET /teams/:id` - Get single team
- `POST /teams` - Create team
- `PUT /teams/:id` - Update team

- `GET /trials` - List trial students
- `GET /trials/:id` - Get single trial
- `POST /trials` - Create trial
- `PUT /trials/:id` - Update trial
- `POST /trials/:id/convert` - Convert to student
- `DELETE /trials/:id` - Delete trial

- `GET /dashboard/stats` - Get dashboard statistics

- `GET /projects` - List projects
- `GET /projects/:id` - Get single project
- `POST /projects` - Create project
- `PUT /projects/:id` - Update project

---

**Last Updated:** April 3, 2026
**Author:** Frontend Engineer
**Version:** 1.0

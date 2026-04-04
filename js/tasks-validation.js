// Task Form Validation
// Integrates with validation.js for comprehensive form validation

// Initialize validators
const newTaskValidator = new FormValidator('new-task-form');
const editTaskValidator = new FormValidator('edit-task-form');

// ── NEW TASK VALIDATION RULES ────────────────────────────

const newTaskRules = {
  'nt-title': [
    ValidationRules.required('Task Title'),
    ValidationRules.minLength(3),
    ValidationRules.maxLength(100)
  ],
  'nt-team': [
    ValidationRules.required('Team')
  ],
  'nt-priority': [
    ValidationRules.required('Priority')
  ],
  'nt-assignee': [
    ValidationRules.maxLength(100)
  ],
  'nt-due': [
    ValidationRules.required('Due Date'),
    ValidationRules.date(false) // Don't allow past dates
  ],
  'nt-desc': [
    ValidationRules.maxLength(1000)
  ]
};

// ── EDIT TASK VALIDATION RULES ───────────────────────────

const editTaskRules = {
  'et-title': [
    ValidationRules.required('Task Title'),
    ValidationRules.minLength(3),
    ValidationRules.maxLength(100)
  ],
  'et-team': [
    ValidationRules.required('Team')
  ],
  'et-priority': [
    ValidationRules.required('Priority')
  ],
  'et-assignee': [
    ValidationRules.maxLength(100)
  ],
  'et-due': [],  // Optional for edit
  'et-desc': [
    ValidationRules.maxLength(1000)
  ]
};

// ── ENHANCED SUBMIT FUNCTIONS ────────────────────────────

async function submitNewTaskValidated() {
  const isValid = newTaskValidator.validateForm(newTaskRules);

  if (!isValid) {
    const firstError = Array.from(newTaskValidator.errors.keys())[0];
    const field = document.getElementById(firstError);
    if (field) {
      field.scrollIntoView({ behavior: 'smooth', block: 'center' });
      field.focus();
    }
    showToast(`Please fix ${newTaskValidator.errors.size} error${newTaskValidator.errors.size > 1 ? 's' : ''} before submitting`, 'error');
    return;
  }

  const submitBtn = document.querySelector('button[onclick*="submitNewTask"]');
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.style.opacity = '0.6';
    const originalHTML = submitBtn.innerHTML;
    submitBtn.innerHTML = 'Creating...';

    try {
      const title = document.getElementById('nt-title').value.trim();
      const teamId = document.getElementById('nt-team').value;
      const priority = document.getElementById('nt-priority').value;
      const assignee = document.getElementById('nt-assignee').value.trim();
      const dueDate = document.getElementById('nt-due').value;
      const description = document.getElementById('nt-desc').value.trim();

      const taskData = {
        title,
        teamId,
        priority,
        dueDate,
        description,
        status: 'TODO',
        category: 'General' // Default category
      };

      const newTask = await tasksAPI.create(taskData);

      // If assignee is specified, try to assign
      if (assignee && newTask.id) {
        // This would require looking up student by name
        // For now, we'll skip automatic assignment
      }

      showToast('Task created successfully', 'success');

      newTaskValidator.resetForm(['nt-title', 'nt-team', 'nt-priority', 'nt-assignee', 'nt-due', 'nt-desc']);

      // Close modal
      const backdrop = document.getElementById('nt-backdrop');
      if (backdrop) backdrop.style.display = 'none';

      // Reload tasks
      if (typeof updateTasksTable === 'function') {
        await updateTasksTable();
      }

    } catch (error) {
      console.error('Failed to create task:', error);
      showToast(error.message || 'Failed to create task', 'error');
      submitBtn.innerHTML = originalHTML;
    } finally {
      submitBtn.disabled = false;
      submitBtn.style.opacity = '1';
    }
  }
}

async function submitEditTaskValidated() {
  const isValid = editTaskValidator.validateForm(editTaskRules);

  if (!isValid) {
    const firstError = Array.from(editTaskValidator.errors.keys())[0];
    const field = document.getElementById(firstError);
    if (field) {
      field.scrollIntoView({ behavior: 'smooth', block: 'center' });
      field.focus();
    }
    showToast('Please fix errors before submitting', 'error');
    return;
  }

  const submitBtn = document.querySelector('button[onclick*="submitEditTask"]');
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.style.opacity = '0.6';
    const originalHTML = submitBtn.innerHTML;
    submitBtn.innerHTML = 'Saving...';

    try {
      const title = document.getElementById('et-title').value.trim();
      const teamId = document.getElementById('et-team').value;
      const priority = document.getElementById('et-priority').value;
      const assignee = document.getElementById('et-assignee').value.trim();
      const dueDate = document.getElementById('et-due')?.value;
      const description = document.getElementById('et-desc')?.value.trim();

      const taskId = currentEditingTaskId; // Should be set when opening edit modal

      if (!taskId) {
        throw new Error('Task ID not found');
      }

      const taskData = {
        title,
        teamId,
        priority
      };

      if (dueDate) taskData.dueDate = dueDate;
      if (description) taskData.description = description;

      await tasksAPI.update(taskId, taskData);

      showToast('Task updated successfully', 'success');

      editTaskValidator.resetForm(['et-title', 'et-team', 'et-priority', 'et-assignee', 'et-due', 'et-desc']);

      // Close modal
      const backdrop = document.getElementById('et-backdrop');
      if (backdrop) backdrop.style.display = 'none';

      // Reload tasks
      if (typeof updateTasksTable === 'function') {
        await updateTasksTable();
      }

    } catch (error) {
      console.error('Failed to update task:', error);
      showToast(error.message || 'Failed to update task', 'error');
      submitBtn.innerHTML = originalHTML;
    } finally {
      submitBtn.disabled = false;
      submitBtn.style.opacity = '1';
    }
  }
}

// ── ENABLE LIVE VALIDATION ───────────────────────────────

function enableTaskFormValidation() {
  newTaskValidator.enableLiveValidation(newTaskRules);
  editTaskValidator.enableLiveValidation(editTaskRules);
}

// Auto-enable on page load
if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', enableTaskFormValidation);
}

// Store current editing task ID
let currentEditingTaskId = null;

function setEditingTask(taskId) {
  currentEditingTaskId = taskId;
}

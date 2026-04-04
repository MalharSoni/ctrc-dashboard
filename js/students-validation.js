// Student Form Validation
// Integrates with validation.js for comprehensive form validation

// Initialize validators
const addStudentValidator = new FormValidator('add-student-form');
const assignTeamValidator = new FormValidator('assign-team-form');

// ── ADD STUDENT VALIDATION RULES ─────────────────────────

const addStudentRules = {
  'as-name': [
    ValidationRules.required('Full Name'),
    ValidationRules.minLength(2),
    ValidationRules.custom((value) => {
      // Ensure at least first and last name
      const parts = value.trim().split(/\s+/);
      if (parts.length < 2) {
        return 'Please enter both first and last name';
      }
      return null;
    })
  ],
  'as-email': [
    ValidationRules.email(),
    ValidationRules.custom((value) => {
      // Check for duplicate emails
      if (!value) return null;
      const existingStudent = STUDENTS.find(s =>
        s.email.toLowerCase() === value.toLowerCase()
      );
      if (existingStudent) {
        return 'This email is already registered';
      }
      return null;
    })
  ],
  'as-grade': [
    ValidationRules.required('Grade')
  ],
  'as-team': [],  // Optional
  'as-program': [
    ValidationRules.required('Program')
  ]
};

// ── ENHANCED SUBMIT FUNCTION ─────────────────────────────

async function submitAddStudentValidated() {
  const isValid = addStudentValidator.validateForm(addStudentRules);

  if (!isValid) {
    // Focus first error field
    const firstError = Array.from(addStudentValidator.errors.keys())[0];
    const field = document.getElementById(firstError);
    if (field) {
      field.scrollIntoView({ behavior: 'smooth', block: 'center' });
      field.focus();
    }
    showToast(`Please fix ${addStudentValidator.errors.size} error${addStudentValidator.errors.size > 1 ? 's' : ''} before submitting`, 'error');
    return;
  }

  // Show loading state
  const submitBtn = document.querySelector('#as-backdrop button[onclick*="submitAddStudent"]');
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.style.opacity = '0.6';
    const originalHTML = submitBtn.innerHTML;
    submitBtn.innerHTML = 'Adding...';

    try {
      // Get form data
      const name = document.getElementById('as-name').value.trim();
      const email = document.getElementById('as-email').value.trim();
      const grade = document.getElementById('as-grade').value;
      const team = document.getElementById('as-team').value;
      const program = document.getElementById('as-program').value;

      // Generate email if not provided
      const finalEmail = email || name.split(' ')[0].toLowerCase() + '@cautiontape.ca';

      // Prepare student data for API
      const studentData = {
        firstName: name.split(' ')[0],
        lastName: name.split(' ').slice(1).join(' '),
        email: finalEmail,
        grade: parseInt(grade),
        active: true
      };

      // Call API
      const newStudent = await studentsAPI.create(studentData);

      // If team is selected, assign student to team
      if (team) {
        await studentsAPI.bulkAssign([newStudent.id], team);
      }

      // Success
      showToast(`${name} added successfully`, 'success');

      // Reset form
      addStudentValidator.resetForm(['as-name', 'as-email', 'as-grade', 'as-team', 'as-program']);

      // Close modal
      document.getElementById('as-backdrop').style.display = 'none';

      // Reload students table
      await updateStudentsTable();

    } catch (error) {
      console.error('Failed to add student:', error);
      showToast(error.message || 'Failed to add student', 'error');
      submitBtn.innerHTML = originalHTML;
    } finally {
      submitBtn.disabled = false;
      submitBtn.style.opacity = '1';
    }
  }
}

// ── ASSIGN TEAM VALIDATION RULES ─────────────────────────

let selectedTeamForAssignment = null;

const assignTeamRules = {
  'assign-notes': [
    ValidationRules.maxLength(500)
  ]
};

function selectTeamValidated(teamId) {
  selectedTeamForAssignment = teamId;

  // Remove selection from all team cards
  ['839Z', '839Y', '839X', 'foundation'].forEach(id => {
    const card = document.getElementById(`team-card-${id}`);
    if (card) {
      card.style.borderColor = 'var(--gray-3)';
      card.style.background = 'var(--white)';
    }
  });

  // Highlight selected team
  const selectedCard = document.getElementById(`team-card-${teamId}`);
  if (selectedCard) {
    selectedCard.style.borderColor = 'var(--yellow)';
    selectedCard.style.background = 'var(--yellow-bg)';
  }
}

async function submitTeamAssignmentValidated() {
  // Validate team selection
  if (!selectedTeamForAssignment) {
    showToast('Please select a team', 'error');
    return;
  }

  const isValid = assignTeamValidator.validateForm(assignTeamRules);

  if (!isValid) {
    showToast('Please fix errors before submitting', 'error');
    return;
  }

  const submitBtn = document.querySelector('#assign-backdrop button[onclick*="submitTeamAssignment"]');
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.style.opacity = '0.6';
    const originalHTML = submitBtn.innerHTML;
    submitBtn.innerHTML = 'Assigning...';

    try {
      const evTeamChecked = document.getElementById('ev-team-checkbox')?.checked || false;
      const notes = document.getElementById('assign-notes')?.value || '';

      // Get selected student IDs
      const studentIds = Array.from(selectedStudents);

      if (studentIds.length === 0) {
        throw new Error('No students selected');
      }

      // Call API to assign students to team
      await studentsAPI.bulkAssign(studentIds, selectedTeamForAssignment);

      // Success
      const count = studentIds.length;
      showToast(`${count} student${count > 1 ? 's' : ''} assigned successfully`, 'success');

      // Reset
      assignTeamValidator.resetForm(['assign-notes']);
      selectedTeamForAssignment = null;
      if (document.getElementById('ev-team-checkbox')) {
        document.getElementById('ev-team-checkbox').checked = false;
      }

      // Close modal
      document.getElementById('assign-backdrop').style.display = 'none';

      // Clear selection and reload
      selectedStudents.clear();
      await updateStudentsTable();

    } catch (error) {
      console.error('Failed to assign students:', error);
      showToast(error.message || 'Failed to assign students', 'error');
      submitBtn.innerHTML = originalHTML;
    } finally {
      submitBtn.disabled = false;
      submitBtn.style.opacity = '1';
    }
  }
}

// ── ENABLE LIVE VALIDATION ───────────────────────────────

function enableStudentFormValidation() {
  // Enable live validation for add student form
  addStudentValidator.enableLiveValidation(addStudentRules);

  // Enable live validation for assign team form
  assignTeamValidator.enableLiveValidation(assignTeamRules);
}

// Auto-enable on page load
if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', enableStudentFormValidation);
}

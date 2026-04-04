// Foundation Program Form Validation
// Integrates with validation.js for comprehensive form validation

// Initialize validator
const enrollValidator = new FormValidator('enroll-form');

// ── ENROLL VALIDATION RULES ──────────────────────────────

const enrollRules = {
  'en-name': [
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
  'en-grade': [
    ValidationRules.required('Grade')
  ]
};

// ── ENHANCED SUBMIT FUNCTION ─────────────────────────────

async function submitEnrollValidated() {
  const isValid = enrollValidator.validateForm(enrollRules);

  if (!isValid) {
    const firstError = Array.from(enrollValidator.errors.keys())[0];
    const field = document.getElementById(firstError);
    if (field) {
      field.scrollIntoView({ behavior: 'smooth', block: 'center' });
      field.focus();
    }
    showToast(`Please fix ${enrollValidator.errors.size} error${enrollValidator.errors.size > 1 ? 's' : ''} before submitting`, 'error');
    return;
  }

  const submitBtn = document.querySelector('button[onclick*="submitEnroll"]');
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.style.opacity = '0.6';
    const originalHTML = submitBtn.innerHTML;
    submitBtn.innerHTML = 'Enrolling...';

    try {
      const name = document.getElementById('en-name').value.trim();
      const grade = document.getElementById('en-grade').value;

      // Prepare student data
      const studentData = {
        firstName: name.split(' ')[0],
        lastName: name.split(' ').slice(1).join(' '),
        email: name.split(' ')[0].toLowerCase() + '@cautiontape.ca',
        grade: parseInt(grade),
        active: true,
        foundationProgram: true
      };

      // Call API to create student
      const newStudent = await studentsAPI.create(studentData);

      showToast(`${name} enrolled successfully`, 'success');

      enrollValidator.resetForm(['en-name', 'en-grade']);

      // Close modal
      document.getElementById('enroll-backdrop').style.display = 'none';

      // Reload foundation students (if function exists)
      if (typeof applyFilters === 'function') {
        applyFilters();
      }

    } catch (error) {
      console.error('Failed to enroll student:', error);
      showToast(error.message || 'Failed to enroll student', 'error');
      submitBtn.innerHTML = originalHTML;
    } finally {
      submitBtn.disabled = false;
      submitBtn.style.opacity = '1';
    }
  }
}

// ── ENABLE LIVE VALIDATION ───────────────────────────────

function enableFoundationFormValidation() {
  enrollValidator.enableLiveValidation(enrollRules);
}

// Auto-enable on page load
if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', enableFoundationFormValidation);
}

// Team Form Validation
// Integrates with validation.js for comprehensive form validation

// Initialize validators
const createTeamValidator = new FormValidator('create-team-form');
const editTeamValidator = new FormValidator('edit-team-form');
const addMemberValidator = new FormValidator('add-member-form');

// ── CREATE TEAM VALIDATION RULES ─────────────────────────

const createTeamRules = {
  'ct-number': [
    ValidationRules.required('Team Number'),
    ValidationRules.minLength(2),
    ValidationRules.maxLength(10),
    ValidationRules.custom((value) => {
      // Check for VEX team number format (typically digits + letter)
      if (value && !/^[0-9]+[A-Z]?$/i.test(value.trim())) {
        return 'Team number should be digits followed by optional letter (e.g., 839Z)';
      }
      return null;
    })
  ],
  'ct-name': [
    ValidationRules.required('Team Name'),
    ValidationRules.minLength(3),
    ValidationRules.maxLength(50)
  ]
};

// ── EDIT TEAM VALIDATION RULES ───────────────────────────

const editTeamRules = {
  'et-number': [
    ValidationRules.required('Team Number'),
    ValidationRules.minLength(2),
    ValidationRules.maxLength(10),
    ValidationRules.custom((value) => {
      if (value && !/^[0-9]+[A-Z]?$/i.test(value.trim())) {
        return 'Team number should be digits followed by optional letter (e.g., 839Z)';
      }
      return null;
    })
  ],
  'et-name': [
    ValidationRules.required('Team Name'),
    ValidationRules.minLength(3),
    ValidationRules.maxLength(50)
  ]
};

// ── ENHANCED SUBMIT FUNCTIONS ────────────────────────────

async function submitCreateTeamValidated() {
  const isValid = createTeamValidator.validateForm(createTeamRules);

  if (!isValid) {
    const firstError = Array.from(createTeamValidator.errors.keys())[0];
    const field = document.getElementById(firstError);
    if (field) {
      field.scrollIntoView({ behavior: 'smooth', block: 'center' });
      field.focus();
    }
    showToast(`Please fix ${createTeamValidator.errors.size} error${createTeamValidator.errors.size > 1 ? 's' : ''} before submitting`, 'error');
    return;
  }

  const submitBtn = document.querySelector('button[onclick*="submitCreateTeam"]');
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.style.opacity = '0.6';
    const originalHTML = submitBtn.innerHTML;
    submitBtn.innerHTML = 'Creating...';

    try {
      const teamNumber = document.getElementById('ct-number').value.trim().toUpperCase();
      const teamName = document.getElementById('ct-name').value.trim();

      const teamData = {
        teamNumber,
        teamName,
        competition: 'V5RC',
        active: true
      };

      const newTeam = await teamsAPI.create(teamData);

      showToast(`Team ${teamNumber} created successfully`, 'success');

      createTeamValidator.resetForm(['ct-number', 'ct-name']);

      // Close modal
      const backdrop = document.getElementById('ct-backdrop');
      if (backdrop) backdrop.style.display = 'none';

      // Reload teams (if there's a reload function)
      if (typeof loadTeams === 'function') {
        await loadTeams();
      }

    } catch (error) {
      console.error('Failed to create team:', error);
      showToast(error.message || 'Failed to create team', 'error');
      submitBtn.innerHTML = originalHTML;
    } finally {
      submitBtn.disabled = false;
      submitBtn.style.opacity = '1';
    }
  }
}

async function submitEditTeamValidated() {
  const isValid = editTeamValidator.validateForm(editTeamRules);

  if (!isValid) {
    const firstError = Array.from(editTeamValidator.errors.keys())[0];
    const field = document.getElementById(firstError);
    if (field) {
      field.scrollIntoView({ behavior: 'smooth', block: 'center' });
      field.focus();
    }
    showToast('Please fix errors before submitting', 'error');
    return;
  }

  const submitBtn = document.querySelector('button[onclick*="submitEditTeam"]');
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.style.opacity = '0.6';
    const originalHTML = submitBtn.innerHTML;
    submitBtn.innerHTML = 'Saving...';

    try {
      const teamNumber = document.getElementById('et-number').value.trim().toUpperCase();
      const teamName = document.getElementById('et-name').value.trim();

      // Get current team ID from global state or data attribute
      const teamId = currentEditingTeamId; // This should be set when opening edit modal

      if (!teamId) {
        throw new Error('Team ID not found');
      }

      const teamData = {
        teamNumber,
        teamName
      };

      await teamsAPI.update(teamId, teamData);

      showToast('Team updated successfully', 'success');

      editTeamValidator.resetForm(['et-number', 'et-name']);

      // Close modal
      const backdrop = document.getElementById('et-backdrop');
      if (backdrop) backdrop.style.display = 'none';

      // Reload teams
      if (typeof loadTeams === 'function') {
        await loadTeams();
      }

    } catch (error) {
      console.error('Failed to update team:', error);
      showToast(error.message || 'Failed to update team', 'error');
      submitBtn.innerHTML = originalHTML;
    } finally {
      submitBtn.disabled = false;
      submitBtn.style.opacity = '1';
    }
  }
}

// ── ENABLE LIVE VALIDATION ───────────────────────────────

function enableTeamFormValidation() {
  createTeamValidator.enableLiveValidation(createTeamRules);
  editTeamValidator.enableLiveValidation(editTeamRules);
}

// Auto-enable on page load
if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', enableTeamFormValidation);
}

// Store current editing team ID
let currentEditingTeamId = null;

function setEditingTeam(teamId) {
  currentEditingTeamId = teamId;
}

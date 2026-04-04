// Comprehensive Form Validation Library for CTRC Dashboard
// Provides client-side validation with inline error display

class FormValidator {
  constructor(formId) {
    this.formId = formId;
    this.errors = new Map();
    this.isSubmitting = false;
  }

  // ── VALIDATION RULES ─────────────────────────────────

  validateRequired(value, fieldName) {
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      return `${fieldName} is required`;
    }
    return null;
  }

  validateEmail(value) {
    if (!value) return null; // Handle optional emails
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return 'Please enter a valid email address';
    }
    return null;
  }

  validatePhone(value) {
    if (!value) return null; // Handle optional phones
    // Accept formats: (123) 456-7890, 123-456-7890, 1234567890, +1 123-456-7890
    const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
    if (!phoneRegex.test(value.replace(/\s/g, ''))) {
      return 'Please enter a valid phone number';
    }
    return null;
  }

  validateNumber(value, min = null, max = null) {
    const num = parseFloat(value);
    if (isNaN(num)) {
      return 'Please enter a valid number';
    }
    if (min !== null && num < min) {
      return `Value must be at least ${min}`;
    }
    if (max !== null && num > max) {
      return `Value must be at most ${max}`;
    }
    return null;
  }

  validateInteger(value, min = null, max = null) {
    const num = parseInt(value, 10);
    if (isNaN(num) || !Number.isInteger(num)) {
      return 'Please enter a valid whole number';
    }
    if (min !== null && num < min) {
      return `Value must be at least ${min}`;
    }
    if (max !== null && num > max) {
      return `Value must be at most ${max}`;
    }
    return null;
  }

  validateDate(value, allowPast = true) {
    if (!value) return null;
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      return 'Please enter a valid date';
    }
    if (!allowPast && date < new Date()) {
      return 'Date cannot be in the past';
    }
    return null;
  }

  validateMinLength(value, minLength) {
    if (value && value.length < minLength) {
      return `Must be at least ${minLength} characters`;
    }
    return null;
  }

  validateMaxLength(value, maxLength) {
    if (value && value.length > maxLength) {
      return `Must be at most ${maxLength} characters`;
    }
    return null;
  }

  validateUrl(value) {
    if (!value) return null;
    try {
      new URL(value);
      return null;
    } catch {
      return 'Please enter a valid URL';
    }
  }

  validateFileSize(file, maxSizeMB) {
    if (!file) return null;
    const maxBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxBytes) {
      return `File size must be less than ${maxSizeMB}MB`;
    }
    return null;
  }

  validateFileType(file, allowedTypes) {
    if (!file) return null;
    const fileType = file.type;
    const fileExt = file.name.split('.').pop().toLowerCase();

    const allowed = allowedTypes.some(type => {
      if (type.startsWith('.')) {
        return fileExt === type.substring(1);
      }
      return fileType === type || fileType.startsWith(type);
    });

    if (!allowed) {
      return `File type must be ${allowedTypes.join(', ')}`;
    }
    return null;
  }

  // ── FIELD VALIDATION ─────────────────────────────────

  validateField(fieldId, rules) {
    const field = document.getElementById(fieldId);
    if (!field) {
      console.warn(`Field ${fieldId} not found`);
      return null;
    }

    let value = field.value;

    // Handle file inputs
    if (field.type === 'file') {
      value = field.files[0];
    }

    // Clear previous errors for this field
    this.clearFieldError(fieldId);

    // Run validation rules in order
    for (const rule of rules) {
      let error = null;

      switch (rule.type) {
        case 'required':
          error = this.validateRequired(value, rule.label || 'This field');
          break;
        case 'email':
          error = this.validateEmail(value);
          break;
        case 'phone':
          error = this.validatePhone(value);
          break;
        case 'number':
          error = this.validateNumber(value, rule.min, rule.max);
          break;
        case 'integer':
          error = this.validateInteger(value, rule.min, rule.max);
          break;
        case 'date':
          error = this.validateDate(value, rule.allowPast);
          break;
        case 'minLength':
          error = this.validateMinLength(value, rule.value);
          break;
        case 'maxLength':
          error = this.validateMaxLength(value, rule.value);
          break;
        case 'url':
          error = this.validateUrl(value);
          break;
        case 'fileSize':
          error = this.validateFileSize(value, rule.maxSizeMB);
          break;
        case 'fileType':
          error = this.validateFileType(value, rule.allowedTypes);
          break;
        case 'custom':
          error = rule.validator(value);
          break;
        default:
          console.warn(`Unknown validation rule: ${rule.type}`);
      }

      if (error) {
        this.setFieldError(fieldId, error);
        this.errors.set(fieldId, error);
        return error;
      }
    }

    this.errors.delete(fieldId);
    return null;
  }

  // ── ERROR DISPLAY ────────────────────────────────────

  setFieldError(fieldId, message) {
    const field = document.getElementById(fieldId);
    if (!field) return;

    // Add error styling to field
    field.style.borderColor = '#EF4444';
    field.style.background = '#FEF2F2';

    // Remove any existing error message
    this.clearFieldError(fieldId, false);

    // Create error message element
    const errorEl = document.createElement('div');
    errorEl.id = `${fieldId}-error`;
    errorEl.className = 'field-error';
    errorEl.style.cssText = `
      color: #DC2626;
      font-size: 12px;
      font-weight: 500;
      margin-top: 4px;
      display: flex;
      align-items: center;
      gap: 4px;
    `;
    errorEl.innerHTML = `
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
      </svg>
      <span>${message}</span>
    `;

    // Insert after field
    field.parentNode.appendChild(errorEl);

    // Store error
    this.errors.set(fieldId, message);
  }

  clearFieldError(fieldId, clearFromMap = true) {
    const field = document.getElementById(fieldId);
    if (!field) return;

    // Reset field styling
    field.style.borderColor = 'var(--gray-3)';
    field.style.background = '';

    // Remove error message
    const errorEl = document.getElementById(`${fieldId}-error`);
    if (errorEl) {
      errorEl.remove();
    }

    if (clearFromMap) {
      this.errors.delete(fieldId);
    }
  }

  clearAllErrors() {
    this.errors.forEach((_, fieldId) => {
      this.clearFieldError(fieldId);
    });
    this.errors.clear();
  }

  // ── FORM VALIDATION ──────────────────────────────────

  validateForm(validationRules) {
    this.clearAllErrors();

    for (const [fieldId, rules] of Object.entries(validationRules)) {
      this.validateField(fieldId, rules);
    }

    return this.errors.size === 0;
  }

  // ── LIVE VALIDATION ──────────────────────────────────

  enableLiveValidation(validationRules) {
    for (const [fieldId, rules] of Object.entries(validationRules)) {
      const field = document.getElementById(fieldId);
      if (!field) continue;

      // Validate on blur
      field.addEventListener('blur', () => {
        this.validateField(fieldId, rules);
      });

      // Clear error on focus
      field.addEventListener('focus', () => {
        this.clearFieldError(fieldId, false);
      });

      // Validate on input for certain field types
      if (field.type === 'email' || field.type === 'number' || field.type === 'tel') {
        field.addEventListener('input', () => {
          if (this.errors.has(fieldId)) {
            this.validateField(fieldId, rules);
          }
        });
      }
    }
  }

  // ── SUBMISSION HANDLING ──────────────────────────────

  async handleSubmit(validationRules, submitFn, buttonId) {
    if (this.isSubmitting) return;

    const isValid = this.validateForm(validationRules);
    if (!isValid) {
      // Scroll to first error
      const firstErrorField = Array.from(this.errors.keys())[0];
      const field = document.getElementById(firstErrorField);
      if (field) {
        field.scrollIntoView({ behavior: 'smooth', block: 'center' });
        field.focus();
      }

      showToast(`Please fix ${this.errors.size} error${this.errors.size > 1 ? 's' : ''} before submitting`, 'error');
      return;
    }

    const button = buttonId ? document.getElementById(buttonId) : null;

    try {
      this.isSubmitting = true;

      // Show loading state
      if (button) {
        button.disabled = true;
        button.style.opacity = '0.6';
        button.style.cursor = 'not-allowed';
        const originalText = button.innerHTML;
        button.innerHTML = `
          <span style="display:inline-flex;align-items:center;gap:6px;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="spinner">
              <circle cx="12" cy="12" r="10" opacity="0.25"></circle>
              <path d="M12 2a10 10 0 0 1 10 10" opacity="1"></path>
            </svg>
            Submitting...
          </span>
        `;

        // Add spinner animation
        const style = document.createElement('style');
        style.textContent = `
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
          .spinner { animation: spin 1s linear infinite; }
        `;
        document.head.appendChild(style);
      }

      // Call submit function
      await submitFn();

      // Success - form will be closed by submitFn

    } catch (error) {
      console.error('Form submission error:', error);
      showToast(error.message || 'Submission failed. Please try again.', 'error');
    } finally {
      this.isSubmitting = false;

      // Reset button state
      if (button) {
        button.disabled = false;
        button.style.opacity = '1';
        button.style.cursor = 'pointer';
      }
    }
  }

  // ── UTILITY METHODS ──────────────────────────────────

  getFormData(fieldIds) {
    const data = {};
    for (const fieldId of fieldIds) {
      const field = document.getElementById(fieldId);
      if (field) {
        if (field.type === 'checkbox') {
          data[fieldId] = field.checked;
        } else if (field.type === 'file') {
          data[fieldId] = field.files[0];
        } else {
          data[fieldId] = field.value;
        }
      }
    }
    return data;
  }

  resetForm(fieldIds) {
    for (const fieldId of fieldIds) {
      const field = document.getElementById(fieldId);
      if (field) {
        if (field.type === 'checkbox') {
          field.checked = false;
        } else {
          field.value = '';
        }
      }
    }
    this.clearAllErrors();
  }
}

// ── VALIDATION RULE BUILDERS ─────────────────────────────

const ValidationRules = {
  required: (label) => ({ type: 'required', label }),
  email: () => ({ type: 'email' }),
  phone: () => ({ type: 'phone' }),
  number: (min = null, max = null) => ({ type: 'number', min, max }),
  integer: (min = null, max = null) => ({ type: 'integer', min, max }),
  date: (allowPast = true) => ({ type: 'date', allowPast }),
  minLength: (value) => ({ type: 'minLength', value }),
  maxLength: (value) => ({ type: 'maxLength', value }),
  url: () => ({ type: 'url' }),
  fileSize: (maxSizeMB) => ({ type: 'fileSize', maxSizeMB }),
  fileType: (allowedTypes) => ({ type: 'fileType', allowedTypes }),
  custom: (validator) => ({ type: 'custom', validator })
};

// ── EXPORT ───────────────────────────────────────────────

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { FormValidator, ValidationRules };
}

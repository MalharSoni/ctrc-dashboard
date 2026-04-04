// Inventory Form Validation
// Integrates with validation.js for comprehensive form validation

// Initialize validators
const addItemValidator = new FormValidator('add-item-form');
const editItemValidator = new FormValidator('edit-item-form');
const purchaseRequestValidator = new FormValidator('purchase-request-form');

// ── ADD ITEM VALIDATION RULES ────────────────────────────

const addItemRules = {
  'ai-name': [
    ValidationRules.required('Item Name'),
    ValidationRules.minLength(2),
    ValidationRules.maxLength(100)
  ],
  'ai-category': [
    ValidationRules.required('Category')
  ],
  'ai-team': [],  // Optional
  'ai-qty': [
    ValidationRules.required('Quantity'),
    ValidationRules.integer(0, 10000)
  ],
  'ai-cost': [
    ValidationRules.custom((value) => {
      if (!value) return null;
      // Remove $ and spaces
      const cleaned = value.replace(/[$\s]/g, '');
      const num = parseFloat(cleaned);
      if (isNaN(num)) {
        return 'Please enter a valid cost (e.g., $10.50)';
      }
      if (num < 0) {
        return 'Cost cannot be negative';
      }
      if (num > 100000) {
        return 'Cost seems unreasonably high. Please verify.';
      }
      return null;
    })
  ],
  'ai-part': [
    ValidationRules.maxLength(50),
    ValidationRules.custom((value) => {
      if (!value) return null;
      // Check for valid part number format
      if (!/^[A-Z0-9\-]+$/i.test(value.trim())) {
        return 'Part number should only contain letters, numbers, and dashes';
      }
      return null;
    })
  ],
  'ai-location': [
    ValidationRules.maxLength(100)
  ]
};

// ── EDIT ITEM VALIDATION RULES ───────────────────────────

const editItemRules = {
  'ei-name': [
    ValidationRules.required('Item Name'),
    ValidationRules.minLength(2),
    ValidationRules.maxLength(100)
  ],
  'ei-qty': [
    ValidationRules.required('Quantity'),
    ValidationRules.integer(0, 10000)
  ],
  'ei-location': [
    ValidationRules.maxLength(100)
  ]
};

// ── PURCHASE REQUEST VALIDATION RULES ────────────────────

const purchaseRequestRules = {
  'pr-item': [
    ValidationRules.required('Item Name'),
    ValidationRules.minLength(2),
    ValidationRules.maxLength(100)
  ],
  'pr-qty': [
    ValidationRules.required('Quantity'),
    ValidationRules.integer(1, 1000)
  ],
  'pr-cost': [
    ValidationRules.required('Estimated Cost'),
    ValidationRules.custom((value) => {
      const cleaned = value.replace(/[$\s]/g, '');
      const num = parseFloat(cleaned);
      if (isNaN(num)) {
        return 'Please enter a valid cost';
      }
      if (num <= 0) {
        return 'Cost must be greater than zero';
      }
      if (num > 100000) {
        return 'Cost seems unreasonably high. Please verify.';
      }
      return null;
    })
  ],
  'pr-justification': [
    ValidationRules.required('Justification'),
    ValidationRules.minLength(10),
    ValidationRules.maxLength(500)
  ],
  'pr-url': [
    ValidationRules.url()
  ]
};

// ── ENHANCED SUBMIT FUNCTIONS ────────────────────────────

async function submitAddItemValidated() {
  const isValid = addItemValidator.validateForm(addItemRules);

  if (!isValid) {
    const firstError = Array.from(addItemValidator.errors.keys())[0];
    const field = document.getElementById(firstError);
    if (field) {
      field.scrollIntoView({ behavior: 'smooth', block: 'center' });
      field.focus();
    }
    showToast(`Please fix ${addItemValidator.errors.size} error${addItemValidator.errors.size > 1 ? 's' : ''} before submitting`, 'error');
    return;
  }

  const submitBtn = document.querySelector('button[onclick*="submitAddItem"]');
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.style.opacity = '0.6';
    const originalHTML = submitBtn.innerHTML;
    submitBtn.innerHTML = 'Adding...';

    try {
      const name = document.getElementById('ai-name').value.trim();
      const category = document.getElementById('ai-category').value;
      const teamId = document.getElementById('ai-team').value || null;
      const quantity = parseInt(document.getElementById('ai-qty').value);
      const cost = document.getElementById('ai-cost').value.replace(/[$\s]/g, '') || '0';
      const partNumber = document.getElementById('ai-part').value.trim() || null;
      const location = document.getElementById('ai-location').value.trim() || null;

      const itemData = {
        name,
        category,
        quantity,
        unitCost: parseFloat(cost),
        partNumber,
        location,
        teamId,
        status: 'IN_STOCK'
      };

      // Call inventory API (you'll need to add this to api-client.js)
      // const newItem = await inventoryAPI.create(itemData);

      showToast('Item added successfully', 'success');

      addItemValidator.resetForm(['ai-name', 'ai-category', 'ai-team', 'ai-qty', 'ai-cost', 'ai-part', 'ai-location']);

      // Close modal
      const backdrop = document.getElementById('ai-backdrop');
      if (backdrop) backdrop.style.display = 'none';

      // Reload inventory (if function exists)
      if (typeof loadInventory === 'function') {
        await loadInventory();
      }

    } catch (error) {
      console.error('Failed to add item:', error);
      showToast(error.message || 'Failed to add item', 'error');
      submitBtn.innerHTML = originalHTML;
    } finally {
      submitBtn.disabled = false;
      submitBtn.style.opacity = '1';
    }
  }
}

async function submitPurchaseRequestValidated() {
  const isValid = purchaseRequestValidator.validateForm(purchaseRequestRules);

  if (!isValid) {
    const firstError = Array.from(purchaseRequestValidator.errors.keys())[0];
    const field = document.getElementById(firstError);
    if (field) {
      field.scrollIntoView({ behavior: 'smooth', block: 'center' });
      field.focus();
    }
    showToast('Please fix errors before submitting', 'error');
    return;
  }

  const submitBtn = document.querySelector('button[onclick*="submitPurchaseRequest"]');
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.style.opacity = '0.6';
    const originalHTML = submitBtn.innerHTML;
    submitBtn.innerHTML = 'Submitting...';

    try {
      const item = document.getElementById('pr-item').value.trim();
      const quantity = parseInt(document.getElementById('pr-qty').value);
      const cost = document.getElementById('pr-cost').value.replace(/[$\s]/g, '');
      const justification = document.getElementById('pr-justification').value.trim();
      const url = document.getElementById('pr-url')?.value.trim() || null;

      const requestData = {
        itemName: item,
        quantity,
        estimatedCost: parseFloat(cost),
        justification,
        productUrl: url,
        status: 'PENDING',
        requestedBy: 'Current User' // Should come from auth context
      };

      // Call purchase request API
      // const newRequest = await purchaseAPI.create(requestData);

      showToast('Purchase request submitted successfully', 'success');

      purchaseRequestValidator.resetForm(['pr-item', 'pr-qty', 'pr-cost', 'pr-justification', 'pr-url']);

      // Close modal
      const backdrop = document.getElementById('pr-backdrop');
      if (backdrop) backdrop.style.display = 'none';

      // Reload purchases
      if (typeof loadPurchaseRequests === 'function') {
        await loadPurchaseRequests();
      }

    } catch (error) {
      console.error('Failed to submit purchase request:', error);
      showToast(error.message || 'Failed to submit request', 'error');
      submitBtn.innerHTML = originalHTML;
    } finally {
      submitBtn.disabled = false;
      submitBtn.style.opacity = '1';
    }
  }
}

// ── ENABLE LIVE VALIDATION ───────────────────────────────

function enableInventoryFormValidation() {
  addItemValidator.enableLiveValidation(addItemRules);
  editItemValidator.enableLiveValidation(editItemRules);
  purchaseRequestValidator.enableLiveValidation(purchaseRequestRules);
}

// Auto-enable on page load
if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', enableInventoryFormValidation);
}

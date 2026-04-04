# Form Validation Quick Reference

## Integration Checklist

### Step 1: Add Script Tags (Before `</body>`)
```html
<script src="js/toast.js"></script>
<script src="js/api-client.js"></script>
<script src="js/validation.js"></script>
<script src="js/[page]-validation.js"></script>
```

### Step 2: Update Button Handlers

| Page | Old Function | New Function |
|------|-------------|--------------|
| students.html | `submitAddStudent()` | `submitAddStudentValidated()` |
| students.html | `submitTeamAssignment()` | `submitTeamAssignmentValidated()` |
| students.html | `selectTeam('839Z')` | `selectTeamValidated('839Z')` |
| teams.html | `submitCreateTeam()` | `submitCreateTeamValidated()` |
| teams.html | `submitEditTeam()` | `submitEditTeamValidated()` |
| tasks.html | `submitNewTask()` | `submitNewTaskValidated()` |
| tasks.html | `submitEditTask()` | `submitEditTaskValidated()` |
| inventory.html | `submitAddItem()` | `submitAddItemValidated()` |
| inventory.html | `submitPurchaseRequest()` | `submitPurchaseRequestValidated()` |
| foundation.html | `submitEnroll()` | `submitEnrollValidated()` |

## Validation Rules by Form

### Students

**Add Student Form** (`as-name`, `as-email`, `as-grade`, `as-team`, `as-program`)
- ✓ Full name required (first + last)
- ✓ Email format check
- ✓ No duplicate emails
- ✓ Grade required
- ✓ Program required

**Assign Team Form** (`assign-notes`)
- ✓ Notes max 500 characters
- ✓ Team selection required (visual feedback)

### Teams

**Create Team** (`ct-number`, `ct-name`)
- ✓ Team number required
- ✓ Format: digits + optional letter (e.g., 839Z)
- ✓ Name required (3-50 chars)

**Edit Team** (`et-number`, `et-name`)
- ✓ Same as create team

### Tasks

**New Task** (`nt-title`, `nt-team`, `nt-priority`, `nt-assignee`, `nt-due`, `nt-desc`)
- ✓ Title required (3-100 chars)
- ✓ Team required
- ✓ Priority required
- ✓ Due date required (not in past)
- ✓ Assignee max 100 chars
- ✓ Description max 1000 chars

**Edit Task** (`et-title`, `et-team`, `et-priority`, `et-assignee`, `et-due`, `et-desc`)
- ✓ Same as new task (due date optional)

### Inventory

**Add Item** (`ai-name`, `ai-category`, `ai-team`, `ai-qty`, `ai-cost`, `ai-part`, `ai-location`)
- ✓ Name required (2-100 chars)
- ✓ Category required
- ✓ Quantity required (0-10,000)
- ✓ Cost format validation
- ✓ Part number format (A-Z, 0-9, -)
- ✓ Location max 100 chars

**Purchase Request** (`pr-item`, `pr-qty`, `pr-cost`, `pr-justification`, `pr-url`)
- ✓ Item required
- ✓ Quantity required (1-1,000)
- ✓ Cost required (> 0)
- ✓ Justification required (10-500 chars)
- ✓ URL validation (optional)

### Foundation

**Enroll Student** (`en-name`, `en-grade`)
- ✓ Full name required (first + last)
- ✓ Grade required

## Error States (Design System)

### Colors
```css
/* Error */
border-color: #EF4444
background: #FEF2F2
color: #DC2626

/* Success */
border-color: #22C55E
background: #F0FDF4
color: #15803D
```

### Error Message Format
```html
<div class="field-error" style="color:#DC2626; font-size:12px; margin-top:4px;">
  <svg><!-- Error icon --></svg>
  <span>Error message here</span>
</div>
```

## Common Validation Rules

```javascript
// Required field
ValidationRules.required('Field Name')

// Email
ValidationRules.email()

// Number range
ValidationRules.number(min, max)
ValidationRules.integer(min, max)

// Text length
ValidationRules.minLength(value)
ValidationRules.maxLength(value)

// Date
ValidationRules.date(allowPast)

// Custom
ValidationRules.custom((value) => {
  if (/* invalid */) return 'Error message';
  return null;
})
```

## Testing Commands

```bash
# Test client-side validation
# 1. Open browser DevTools (F12)
# 2. Go to Console tab
# 3. Try submitting empty form → Should show errors
# 4. Enter invalid data → Should show format errors
# 5. Fix all errors → Should submit successfully

# Test API integration
# 1. Open Network tab
# 2. Submit valid form
# 3. Check for POST/PUT request
# 4. Verify response status 200
# 5. Check toast notification appears
```

## Troubleshooting

### Validation not running?
- Check script tags are in correct order
- Verify field IDs match validation rules
- Check browser console for errors

### Errors not clearing?
- Ensure focus/blur events are firing
- Check field ID spelling
- Verify validation.js is loaded

### Form submitting without validation?
- Confirm button uses `...Validated()` function
- Check that validator is initialized
- Verify `enableLiveValidation()` runs on page load

## File Locations

```
/js/
  validation.js             # Core library
  students-validation.js    # Student forms
  teams-validation.js       # Team forms
  tasks-validation.js       # Task forms
  inventory-validation.js   # Inventory forms
  foundation-validation.js  # Foundation forms
  toast.js                  # Toast notifications
  api-client.js            # API endpoints
```

## Support Files

- `FORM_VALIDATION_GUIDE.md` - Detailed integration guide
- `VALIDATION_SUMMARY.md` - Implementation summary
- `VALIDATION_QUICK_REFERENCE.md` - This file

---

**Ready to integrate?** Follow steps 1-2 above for each HTML file.

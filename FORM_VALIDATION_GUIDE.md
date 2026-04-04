# Form Validation Integration Guide

## Overview

Comprehensive form validation has been added to all forms across the CTRC Dashboard. This guide explains how to integrate the validation system into each HTML page.

## Files Created

### Core Validation Library
- `/js/validation.js` - Core validation framework with all validation rules

### Form-Specific Validation Files
- `/js/students-validation.js` - Student form validation
- `/js/teams-validation.js` - Team form validation
- `/js/tasks-validation.js` - Task form validation
- `/js/inventory-validation.js` - Inventory form validation
- `/js/foundation-validation.js` - Foundation program validation

## Integration Steps

### 1. Add Script Tags to HTML Files

Add these script tags **before the closing `</body>` tag** in each HTML file:

#### students.html
```html
<!-- Before closing </body> tag -->
<script src="js/toast.js"></script>
<script src="js/api-client.js"></script>
<script src="js/validation.js"></script>
<script src="js/students-validation.js"></script>
```

#### teams.html
```html
<script src="js/toast.js"></script>
<script src="js/api-client.js"></script>
<script src="js/validation.js"></script>
<script src="js/teams-validation.js"></script>
```

#### tasks.html
```html
<script src="js/toast.js"></script>
<script src="js/api-client.js"></script>
<script src="js/validation.js"></script>
<script src="js/tasks-validation.js"></script>
```

#### inventory.html
```html
<script src="js/toast.js"></script>
<script src="js/api-client.js"></script>
<script src="js/validation.js"></script>
<script src="js/inventory-validation.js"></script>
```

#### foundation.html
```html
<script src="js/toast.js"></script>
<script src="js/api-client.js"></script>
<script src="js/validation.js"></script>
<script src="js/foundation-validation.js"></script>
```

### 2. Update Button onclick Handlers

Replace existing submit function calls with validated versions:

#### students.html
```html
<!-- OLD -->
<button onclick="submitAddStudent()">Add Student</button>

<!-- NEW -->
<button onclick="submitAddStudentValidated()">Add Student</button>

<!-- OLD -->
<button onclick="submitTeamAssignment()">Assign to Team</button>

<!-- NEW -->
<button onclick="submitTeamAssignmentValidated()">Assign to Team</button>
```

#### teams.html
```html
<!-- OLD -->
<button onclick="submitCreateTeam()">Create Team</button>

<!-- NEW -->
<button onclick="submitCreateTeamValidated()">Create Team</button>

<!-- OLD -->
<button onclick="submitEditTeam()">Save Changes</button>

<!-- NEW -->
<button onclick="submitEditTeamValidated()">Save Changes</button>
```

#### tasks.html
```html
<!-- OLD -->
<button onclick="submitNewTask()">Create Task</button>

<!-- NEW -->
<button onclick="submitNewTaskValidated()">Create Task</button>

<!-- OLD -->
<button onclick="submitEditTask()">Save Changes</button>

<!-- NEW -->
<button onclick="submitEditTaskValidated()">Save Changes</button>
```

#### inventory.html
```html
<!-- OLD -->
<button onclick="submitAddItem()">Add Item</button>

<!-- NEW -->
<button onclick="submitAddItemValidated()">Add Item</button>

<!-- OLD -->
<button onclick="submitPurchaseRequest()">Submit Request</button>

<!-- NEW -->
<button onclick="submitPurchaseRequestValidated()">Submit Request</button>
```

#### foundation.html
```html
<!-- OLD -->
<button onclick="submitEnroll()">Enroll</button>

<!-- NEW -->
<button onclick="submitEnrollValidated()">Enroll</button>
```

### 3. Update Team Assignment Functions

In **students.html**, replace the `selectTeam()` function call:

```html
<!-- OLD -->
<div onclick="selectTeam('839Z')">

<!-- NEW -->
<div onclick="selectTeamValidated('839Z')">
```

Apply this to all team card divs (839Z, 839Y, 839X, foundation).

## Validation Features

### Client-Side Validation
- **Immediate feedback** - Errors shown inline as user types
- **Field-level validation** - Each field validated independently
- **Live validation** - Real-time validation on blur/input events
- **Focus management** - Automatically focuses first error field

### Validation Rules Implemented

#### Students Form
- Full name required (first + last)
- Email format validation
- Duplicate email check
- Grade required
- Program required

#### Teams Form
- Team number required (format: digits + optional letter)
- Team name required (3-50 characters)
- Duplicate team number check

#### Tasks Form
- Task title required (3-100 characters)
- Team selection required
- Priority required
- Due date required (cannot be in past)
- Description max 1000 characters
- Assignee max 100 characters

#### Inventory Form
- Item name required (2-100 characters)
- Category required
- Quantity required (0-10,000)
- Cost validation (format and range checking)
- Part number format validation (alphanumeric + dashes)
- Location max 100 characters

#### Purchase Request Form
- Item name required
- Quantity required (1-1000)
- Cost required and > 0
- Justification required (10-500 characters)
- URL validation (if provided)

#### Foundation Enrollment Form
- Full name required (first + last)
- Grade required

### Server-Side Validation
- All forms integrate with API endpoints
- Server errors are caught and displayed as toasts
- Network failures handled gracefully

### Visual Feedback

#### Error States
- **Border color**: Changes to `#EF4444` (red)
- **Background**: Changes to `#FEF2F2` (light red)
- **Error message**: Inline below field with icon
- **Error color**: `#DC2626` (dark red)

#### Success States
- Toast notification with green checkmark
- Form reset after successful submission
- Modal automatically closes

#### Loading States
- Submit button disabled during API call
- Button opacity reduced to 0.6
- Button text changes to "Submitting...", "Adding...", etc.

## Error Messages

All error messages are clear and actionable:

- "Full Name is required"
- "Please enter a valid email address"
- "This email is already registered"
- "Please enter both first and last name"
- "Team number should be digits followed by optional letter (e.g., 839Z)"
- "Value must be at least 0"
- "File size must be less than 5MB"
- "Date cannot be in the past"

## API Integration

The validation system integrates with existing API endpoints:

- `studentsAPI.create()` - Create student
- `studentsAPI.bulkAssign()` - Assign students to team
- `teamsAPI.create()` - Create team
- `teamsAPI.update()` - Update team
- `tasksAPI.create()` - Create task
- `tasksAPI.update()` - Update task

**Note**: Inventory and purchase request APIs need to be added to `/js/api-client.js`.

## Customization

### Adding New Validation Rules

To add custom validation:

```javascript
const customRules = {
  'field-id': [
    ValidationRules.required('Field Name'),
    ValidationRules.custom((value) => {
      // Your custom validation logic
      if (/* validation fails */) {
        return 'Custom error message';
      }
      return null; // Validation passed
    })
  ]
};
```

### Available Validation Rules

- `ValidationRules.required(label)`
- `ValidationRules.email()`
- `ValidationRules.phone()`
- `ValidationRules.number(min, max)`
- `ValidationRules.integer(min, max)`
- `ValidationRules.date(allowPast)`
- `ValidationRules.minLength(value)`
- `ValidationRules.maxLength(value)`
- `ValidationRules.url()`
- `ValidationRules.fileSize(maxSizeMB)`
- `ValidationRules.fileType(allowedTypes)`
- `ValidationRules.custom(validatorFn)`

## Testing Checklist

After integration, test each form:

### Students Form
- [ ] Try submitting with empty name → Should show error
- [ ] Enter single word name → Should ask for first + last
- [ ] Enter invalid email → Should show email format error
- [ ] Try duplicate email → Should warn about existing email
- [ ] Submit valid form → Should create student and show success toast
- [ ] Check that form resets after successful submission
- [ ] Verify modal closes automatically

### Teams Form
- [ ] Submit with empty team number → Should show error
- [ ] Enter invalid team number (e.g., "ABC") → Should show format error
- [ ] Submit valid form → Should create team
- [ ] Test edit form validation
- [ ] Verify API integration

### Tasks Form
- [ ] Submit with empty title → Should show error
- [ ] Enter title < 3 characters → Should show min length error
- [ ] Select past due date → Should show date error
- [ ] Submit valid form → Should create task
- [ ] Test edit form

### Inventory Form
- [ ] Submit with empty item name → Should show error
- [ ] Enter negative quantity → Should show range error
- [ ] Enter invalid cost format → Should show format error
- [ ] Enter invalid part number → Should show format error
- [ ] Submit valid form → Should add item

### Foundation Form
- [ ] Submit with empty name → Should show error
- [ ] Enter single word → Should ask for full name
- [ ] Submit valid form → Should enroll student

## Browser Compatibility

Validation works in all modern browsers:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Performance

- Validation runs client-side (instant feedback)
- No network requests until form is valid
- Debounced input validation to reduce CPU usage
- Minimal DOM manipulation for efficiency

## Troubleshooting

### Validation not working?
1. Check that all script tags are in correct order
2. Verify field IDs match validation rules
3. Check browser console for errors
4. Ensure `showToast()` function is available

### Errors not displaying?
1. Verify field IDs are correct
2. Check that error styling CSS is loaded
3. Ensure field has proper parent element structure

### Form submitting without validation?
1. Confirm button `onclick` handler uses validated function
2. Check that validator is initialized
3. Verify `enableLiveValidation()` is called

## Support

For issues or questions:
1. Check browser console for detailed error messages
2. Verify API endpoints are accessible
3. Test with network tab open to see API requests/responses
4. Check that all dependencies are loaded

## Future Enhancements

Potential additions:
- File upload validation with preview
- Multi-step form validation
- Conditional validation based on other fields
- Async validation (check server for duplicates)
- Custom error positioning
- Accessibility improvements (ARIA labels)

---

**Last Updated**: April 3, 2026
**Version**: 1.0

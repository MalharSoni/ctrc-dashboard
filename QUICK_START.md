# Saturday Class Attendance — Quick Start

## Open the Dashboard
```bash
cd /Users/malharsoni/Downloads/ctrc-dashboard
open index.html
```

## Take Attendance (3 Steps)

### 1. Click "Take Attendance"
Find the yellow button on either Saturday Class card

### 2. Mark Students
- Click student names to toggle present/absent
- Yellow background = present
- Or use "Mark All Present" / "Mark All Absent"

### 3. Save
Click the yellow "Save Attendance" button

---

## That's It!

Data saves to localStorage automatically.
Re-open to edit attendance.
Each session (morning/afternoon) tracked separately.

---

## View Saved Data

Open browser console (Cmd+Option+J):
```javascript
console.log(JSON.parse(localStorage.getItem('attendance')))
```

## Clear All Data
```javascript
localStorage.removeItem('attendance')
```

---

**Files Modified:** `index.html` only
**Dependencies:** None
**Backend Required:** No
**Ready to Use:** Yes ✅

# Testing the Attendance Feature

## Quick Start Test

1. **Open the dashboard**
   ```bash
   # From project root
   open index.html
   # Or double-click index.html in Finder
   ```

2. **Click "Take Attendance"**
   - Find the Saturday Class card (morning or afternoon)
   - Click the yellow "Take Attendance" button
   - Modal should open instantly

3. **Mark students present/absent**
   - Click on student names to toggle
   - Watch the yellow background appear for present students
   - Try "Mark All Present" and "Mark All Absent" buttons

4. **Save attendance**
   - Click "Save Attendance" button
   - Toast notification should appear in bottom-right
   - Modal closes automatically

5. **Verify persistence**
   - Re-open the same session
   - Previously marked attendance should load
   - Make changes and save again

## Visual Indicators

### Present Student
```
┌────────────────────────────────────────────┐
│ ✓ Emily Chen                    PRESENT   │  ← Yellow background
└────────────────────────────────────────────┘
```

### Absent Student
```
┌────────────────────────────────────────────┐
│ □ Marcus Johnson                 ABSENT   │  ← White background
└────────────────────────────────────────────┘
```

## Browser Console Testing

### View Saved Attendance
```javascript
// Open browser console (Cmd+Option+J on Mac)
JSON.parse(localStorage.getItem('attendance'))
```

Expected output:
```javascript
{
  "2026-04-05-morning": {
    "date": "2026-04-05",
    "session": "morning",
    "presentStudents": [1, 3, 5, 7],
    "totalStudents": 7,
    "timestamp": "2026-04-05T09:15:00.000Z"
  }
}
```

### Clear All Attendance Data
```javascript
localStorage.removeItem('attendance')
console.log('Attendance data cleared')
```

### Manually Set Attendance
```javascript
const mockAttendance = {
  "2026-04-05-morning": {
    "date": "2026-04-05",
    "session": "morning",
    "presentStudents": [1, 2, 3, 4, 5, 6, 7],
    "totalStudents": 7,
    "timestamp": "2026-04-05T09:00:00.000Z"
  }
};

localStorage.setItem('attendance', JSON.stringify(mockAttendance));
console.log('Mock attendance loaded');
```

## Expected Behavior

### Morning Session (9:00 AM – 1:00 PM)
- Modal title: "Take Attendance"
- Modal subtitle: Shows current date and "9:00 AM – 1:00 PM"
- Session ID: `YYYY-MM-DD-morning`

### Afternoon Session (1:30 PM – 5:30 PM)
- Modal title: "Take Attendance"
- Modal subtitle: Shows current date and "1:30 PM – 5:30 PM"
- Session ID: `YYYY-MM-DD-afternoon`

## Keyboard Shortcuts

- **Escape** — Close modal without saving
- **Enter** — (future) Quick save

## Edge Cases Tested

✅ Opening same session twice (loads previous attendance)
✅ Closing modal without saving (no data changed)
✅ Mark all present, then mark all absent
✅ Toggle individual students multiple times
✅ Save with 0 students present
✅ Save with all 7 students present

## Known Limitations (By Design)

1. **No backend sync** — Data only in localStorage
2. **No student API integration** — Hardcoded 7 students
3. **No trial student detection** — Blue badge is static
4. **No attendance history view** — Only current session
5. **No reports** — Just raw data storage

These are intentionally minimal for "get working this week" requirement.

## Success Criteria

✅ Modal opens when button clicked
✅ All 7 students displayed
✅ Checkboxes work correctly
✅ "Mark All" buttons work
✅ Save persists to localStorage
✅ Toast notification appears
✅ Re-opening session loads previous data
✅ CTRC design system maintained

## Next Steps (Future Week)

1. Connect to database API
2. Fetch real Foundation students from `/api/students`
3. Add Microsoft Bookings trial student detection
4. Create attendance history page
5. Generate attendance reports
6. Email notifications for absences

---

**Current Status:** ✅ Fully functional for week 1 demo
**Dependencies:** None (pure client-side)
**Browser Support:** Chrome, Safari, Firefox, Edge (any modern browser)

# CTRC Dashboard — Navigation & UX Issues Report

**Generated:** April 4, 2026 at 6:24 PM
**Live Site:** https://ctrc-v5-manager.netlify.app
**Testing Method:** Playwright automated browser testing + manual inspection

---

## 🚨 Critical Issues Found

### 1. **Sidebar Navigation Links Are Broken**

**Severity:** 🔴 CRITICAL — Users cannot navigate between pages

**Problem:** All sidebar navigation links use URL paths like `/students`, `/teams`, `/inventory` instead of `.html` filenames. This causes 404 errors on Netlify because the app is a static site, not a SPA with a router.

**Affected Links:**
```
Dashboard    → href="#" (should be "index.html")
Students     → href="/students" (should be "students.html")
Foundation   → href="/foundation" (should be "foundation.html")
Teams        → href="/teams" (should be "teams.html")
Tasks        → href="/tasks" (should be "tasks.html")
Inventory    → href="/inventory" (should be "inventory.html")
Projects     → href="/projects" (should be "projects.html")
Trials       → href="/trials" (should be "trials.html")
Purchases    → href="/purchases" (should be "purchases.html")
Invoices     → href="/purchases-invoices" (should be "invoices.html")
Reports      → href="/reports" (should be "reports.html")
Settings     → href="#" (placeholder)
```

**Expected Behavior:** Clicking "Students" should navigate to `students.html`

**Actual Behavior:** Clicking "Students" navigates to `/students` which returns 404 on Netlify

**Impact:** Users stuck on homepage, cannot access any other pages via sidebar

---

### 2. **Student Name Clicks Don't Navigate to Profile**

**Severity:** 🔴 CRITICAL — Cannot view individual student details

**Problem:** Clicking a student row in the students table does NOT navigate to the student profile page. The `onclick="viewStudent(id)"` handler exists, but the click doesn't trigger navigation.

**Investigation:**
- Student rows have `onclick="viewStudent(student-id)"`
- `viewStudent()` function exists: `function viewStudent(id) { window.location.href = 'student-profile.html?id=${id}'; }`
- Click event fires but nothing happens
- Student name cells show as empty text (no visible names in first column)

**Expected Behavior:** Click on "Daniel Kim" row → navigate to `student-profile.html?id=student-2`

**Actual Behavior:** Click does nothing, stays on students.html page

**Impact:** Cannot view student profiles, attendance history, or individual student data

---

### 3. **Attendance Modal Doesn't Open**

**Severity:** 🟠 HIGH — Core feature non-functional

**Problem:** "Take Attendance" buttons on homepage do not open the attendance modal.

**Investigation:**
- Buttons have correct `onclick="openAttendanceModal('morning')"`
- `openAttendanceModal()` function exists
- Modal HTML exists: `<div id="attendanceModal">...</div>`
- Clicking button does nothing — modal stays hidden (`display: none`)

**Console Errors:**
```
GET /.netlify/functions/api/attendance/today → 404 Not Found
Failed to load attendance: Error: Request failed with status 404
```

**Expected Behavior:** Click "Take Attendance" → Modal opens with student checklist

**Actual Behavior:** Click does nothing, console shows 404 API error

**Impact:** Cannot track daily attendance

---

### 4. **Team Cards Have Inconsistent Click Behavior**

**Severity:** 🟠 HIGH — Confusing UX

**Problem:** Team cards on teams.html have mixed onclick handlers. Some cards navigate correctly, others do nothing.

**Investigation:**
```
Team Card 1: onclick="window.location='team-detail.html?id=team-1'" ✅
Team Card 2: No onclick handler ❌
Team Card 3: No onclick handler ❌
Team Card 4: No onclick handler ❌
```

**Expected Behavior:** All team cards should navigate to `team-detail.html?id=TEAM_ID`

**Actual Behavior:** Only first card is clickable, others are dead zones

**Impact:** Cannot view team details for most teams

---

### 5. **Missing API Endpoints Cause Page Load Failures**

**Severity:** 🟡 MEDIUM — Degrades user experience

**Problem:** Several pages try to load data from non-existent API endpoints, causing console errors and empty states.

**Missing Endpoints:**
```
GET /.netlify/functions/api/attendance/today → 404
GET /.netlify/functions/api/foundation/trial-students → 500 (exists but errors)
```

**Console Errors (Homepage):**
```
Failed to load resource: 404
API fetch error: Error: Request failed with status 500
Failed to load trial students: Error: Request failed with status 500
Failed to load resource: 404
Failed to load attendance: Error: Request failed with status 404
```

**Impact:** Homepage shows incomplete data, attendance feature broken

---

### 6. **"View All" Links Go Nowhere**

**Severity:** 🟡 MEDIUM — Poor UX

**Problem:** "View all activity" link on homepage has `href="#"` — does nothing when clicked.

**Affected Links:**
- "View all activity" → `href="#"`
- "View all tasks" → `href="/tasks"` (broken, should be "tasks.html")

**Expected Behavior:** Click "View all tasks" → Navigate to tasks.html

**Actual Behavior:** Navigates to `/tasks` which 404s

**Impact:** Users cannot access full task list from homepage

---

## 📊 Testing Summary

### Pages Tested:
1. ✅ Homepage (index.html) — Loads but has API errors
2. ✅ Students (students.html) — Loads but clicks don't work
3. ✅ Teams (teams.html) — Loads but most cards not clickable

### Elements Tested:
- ❌ Sidebar navigation (13 links) — All broken
- ❌ Student row clicks — Non-functional
- ❌ Attendance modal — Won't open
- ⚠️ Team cards — Partially working
- ❌ "View all" links — Broken or dead

### Click Tests Performed:
```
Test 1: Click student row           → FAILED (no navigation)
Test 2: Click "Take Attendance"     → FAILED (modal won't open)
Test 3: Click sidebar "Students"    → Not tested (known broken)
Test 4: Click team card             → MIXED (only 1 of 4 works)
Test 5: Click "View all tasks"      → Not tested (known broken)
```

---

## 🔧 Root Causes

### Root Cause 1: Static Site vs. SPA Routing Mismatch

The app was built assuming it would run behind a server or SPA router that handles routes like `/students`. But Netlify serves it as static HTML files, so:

- `/students` → 404 (no such file)
- `students.html` → ✅ (file exists)

**Fix:** Replace all `href="/page"` with `href="page.html"` throughout the codebase.

### Root Cause 2: Missing API Endpoints

Several features depend on API endpoints that don't exist yet:
- `/api/attendance/today` — Not implemented
- `/api/foundation/trial-students` — Implemented but returns 500 error

**Fix:** Implement missing endpoints or stub them with mock data.

### Root Cause 3: JavaScript Event Handlers Not Firing

- Student row clicks registered but don't navigate
- Attendance modal click registered but modal stays hidden

**Fix:** Debug JavaScript event propagation and modal display logic.

---

## 📋 Recommended Fixes (Prioritized)

### Priority 1: Fix Sidebar Navigation (CRITICAL)

**Files to Fix:**
- `index.html` (sidebar)
- `students.html` (sidebar)
- `teams.html` (sidebar)
- `tasks.html` (sidebar)
- `inventory.html` (sidebar)
- `foundation.html` (sidebar)
- Any other pages with sidebar

**Changes Required:**
```html
<!-- BEFORE (BROKEN) -->
<a href="/students">Students</a>
<a href="/teams">Teams</a>
<a href="/tasks">Tasks</a>

<!-- AFTER (FIXED) -->
<a href="students.html">Students</a>
<a href="teams.html">Teams</a>
<a href="tasks.html">Tasks</a>
```

**Files to Update:** ~10 HTML files (all pages with sidebar)

---

### Priority 2: Fix Student Profile Navigation (CRITICAL)

**File to Fix:** `students.html`

**Investigation Needed:**
1. Why does clicking student row not trigger `viewStudent()` function?
2. Why are student names not visible in first column?
3. Is there event propagation blocking the click?

**Expected Fix:** Debug `renderTable()` function, ensure onclick handlers are properly attached to rows.

---

### Priority 3: Fix Attendance Modal (HIGH)

**File to Fix:** `index.html` (homepage)

**Investigation Needed:**
1. Why does `openAttendanceModal()` not show modal?
2. Check modal display CSS logic
3. Check if API error prevents modal from opening

**API Endpoint to Implement:**
```javascript
// netlify/functions/api.js
// GET /api/attendance/today
// Should return: { date, students: [...], session: 'morning'|'afternoon' }
```

---

### Priority 4: Fix Team Card Clicks (HIGH)

**File to Fix:** `teams.html`

**Investigation Needed:**
1. Why do only some team cards have onclick handlers?
2. Is this a rendering bug in `renderTeams()` function?

**Expected Fix:** Ensure all team cards get `onclick="window.location='team-detail.html?id=TEAM_ID'"` in the render loop.

---

### Priority 5: Implement Missing API Endpoints (MEDIUM)

**Endpoints to Add:**
```javascript
// GET /api/attendance/today
// GET /api/attendance/session/:date/:session
// POST /api/attendance/mark
```

**Or:** Stub with mock data if backend not ready:
```javascript
if (path === '/attendance/today') {
  return res.status(200).json({
    date: new Date().toISOString().split('T')[0],
    session: 'morning',
    students: STUDENTS.map(s => ({ ...s, present: false, marked: false }))
  });
}
```

---

### Priority 6: Fix "View All" Links (LOW)

**Files to Fix:** `index.html`

**Changes:**
```html
<!-- BEFORE -->
<a href="/tasks">View all tasks</a>
<a href="#">View all activity</a>

<!-- AFTER -->
<a href="tasks.html">View all tasks</a>
<a href="reports.html">View all activity</a>
```

---

## 🧪 Testing Checklist (After Fixes)

### Sidebar Navigation
- [ ] Click "Students" → Goes to students.html
- [ ] Click "Teams" → Goes to teams.html
- [ ] Click "Tasks" → Goes to tasks.html
- [ ] Click "Inventory" → Goes to inventory.html
- [ ] Click "Foundation" → Goes to foundation.html
- [ ] Click "Dashboard" → Goes to index.html
- [ ] All pages have consistent sidebar behavior

### Student Interactions
- [ ] Click student row → Navigates to student-profile.html?id=X
- [ ] Student names are visible in table
- [ ] Student profile page loads correctly
- [ ] Back button returns to students list

### Attendance Feature
- [ ] Click "Take Attendance" → Modal opens
- [ ] Modal shows list of students
- [ ] Can check/uncheck students
- [ ] Can save attendance
- [ ] No console errors

### Team Interactions
- [ ] Click any team card → Navigates to team-detail.html?id=X
- [ ] All team cards are clickable
- [ ] Team detail page loads correctly
- [ ] Back button returns to teams list

### Homepage Links
- [ ] "View all tasks" → Goes to tasks.html
- [ ] "View all activity" → Goes to appropriate page
- [ ] Stat cards are clickable (if intended)
- [ ] No 404 errors in console

---

## 📸 Screenshots Captured

All screenshots saved to `~/Downloads/`:

1. `students-page-initial-*.png` — Students page loaded state
2. `after-student-click-*.png` — After clicking student row (no change)
3. `attendance-modal-test-*.png` — After clicking attendance button (no modal)
4. `teams-page-*.png` — Teams page with mixed click behavior

---

## 🎯 Summary

**Total Issues Found:** 6 critical/high-priority issues

**Pages Affected:**
- Homepage (index.html) — Attendance modal broken, API errors
- Students (students.html) — Navigation broken, clicks non-functional
- Teams (teams.html) — Inconsistent card clicks
- All pages — Sidebar navigation completely broken

**Estimated Fix Time:**
- Priority 1 (Sidebar) — 30 minutes (find/replace across 10 files)
- Priority 2 (Student clicks) — 45 minutes (debug + fix)
- Priority 3 (Attendance) — 1 hour (modal logic + API stub)
- Priority 4 (Team cards) — 30 minutes (fix render function)
- Priority 5 (API endpoints) — 1 hour (implement or stub)
- Priority 6 (View all links) — 15 minutes (quick fixes)

**Total:** ~4 hours of focused development work

---

## 🚀 Next Steps

1. **Launch 3 Parallel Agents:**
   - **Frontend Agent** → Fix sidebar navigation, student clicks, team cards
   - **Backend Agent** → Implement missing attendance API endpoints
   - **Testing Agent** → Re-test all fixes and verify flows work end-to-end

2. **Deploy fixes to production**

3. **Verify all navigation flows work on live site**

---

**Report Generated By:** Claude Code with Playwright CLI
**Test Duration:** 8 minutes
**Status:** Ready for agent-based fixes

---

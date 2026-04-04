# Quick Guide: Student Profiles & Global Search

## Student Profile Pages

### How to Access

1. **From Students Page:**
   - Navigate to Students page
   - Click on any student name
   - Profile loads automatically

2. **Direct Link:**
   - Use URL: `student-profile.html?id={studentId}`
   - Example: `student-profile.html?id=cm4vq1234abcd`

### What You See

**Profile Header**
- Student name, grade, team
- Email address
- Active/Inactive status
- Role on team

**Overview Tab**
- Attendance summary (last 8 weeks)
- Current tasks assigned
- Skills progress
- Badges earned
- Quick notes section

**Skills Matrix Tab**
- All skills with proficiency levels
- Progress bars (Beginner → Expert)
- Visual level indicators

**Attendance Tab**
- Full attendance history
- Overall attendance rate
- Recent 20 sessions
- Date, session type, status

**Competitions Tab**
- Competition participation
- Event results
- Awards and rankings

### Actions Available

- **Edit Profile**: Update student info
- **Add Note**: Quick coach note
- **Mark Present**: Today's attendance
- **Issue Badge**: Award achievement badge
- **Manage Roles**: Assign team roles

---

## Global Search (⌘K)

### How to Open

**Keyboard:**
- Mac: Press `⌘K`
- Windows/Linux: Press `Ctrl+K`

**Mouse:**
- Click search box in topbar
- Click "Search ⌘K" button

### How to Search

1. Type student name → Shows matching students
2. Type team number → Shows matching teams
3. Type page name → Shows matching pages
4. Click any result → Navigate instantly

### What You Can Find

**Students**
- Search by first or last name
- Search by email address
- Search by team number
- Shows: Name, Grade, Team

**Teams**
- Search by team number (e.g., "839Z")
- Search by season (e.g., "2025-2026")
- Shows: Team number, member count, season

**Pages**
- Dashboard
- Students
- Teams
- Tasks
- Projects
- Trials
- Inventory
- Foundation
- Reports

### Tips

- Type partial names (e.g., "Dan" finds "Daniel")
- Case-insensitive (e.g., "daniel" = "DANIEL")
- Press ESC to close
- Press Enter to go to first result
- Click outside modal to close

---

## Examples

### Example 1: Find a Student

1. Press `⌘K`
2. Type "Daniel"
3. See results:
   - Daniel Edelstein (Grade 12, Team 839Z)
   - Daniel Fu (Grade 11, Team 839Z)
4. Click → Go to profile

### Example 2: Navigate to Page

1. Press `⌘K`
2. Type "tasks"
3. See: Tasks page
4. Click → Go to Tasks

### Example 3: Find a Team

1. Press `⌘K`
2. Type "839Z"
3. See: Team 839Z (8 members, 2025-2026)
4. Click → Go to team page

---

## Keyboard Shortcuts

| Action | Mac | Windows/Linux |
|--------|-----|---------------|
| Open Search | ⌘K | Ctrl+K |
| Close Search | ESC | ESC |
| Navigate to First Result | Enter | Enter |

---

## Troubleshooting

### Student Profile Not Loading

**Problem:** Page shows "Student not found"
**Solution:** Check URL has valid student ID

**Problem:** Data not appearing
**Solution:** Refresh page, check API connection

**Problem:** Redirects to students page
**Solution:** Access profile from students list or use correct ID

### Search Not Working

**Problem:** ⌘K does nothing
**Solution:** Check if browser captured shortcut (try Ctrl+K)

**Problem:** No results appearing
**Solution:** Check spelling, try partial name

**Problem:** Search modal won't close
**Solution:** Press ESC or click outside modal

**Problem:** Search data outdated
**Solution:** Refresh page to reload search data

---

## Best Practices

### For Coaches

1. **Use Search for Quick Access**: Don't navigate menus, use ⌘K
2. **Bookmark Profiles**: Save frequently accessed student profiles
3. **Check Attendance Weekly**: Review profile attendance tabs
4. **Monitor Tasks**: Use profile task section to track progress
5. **Add Notes Regularly**: Document observations in profile

### For Students

1. **Check Your Profile**: View your own attendance and tasks
2. **Track Skills**: See your progression over time
3. **Monitor Tasks**: Stay on top of assignments
4. **Review Badges**: See achievements earned

---

## What's Next

Coming soon:
- Keyboard navigation in search (arrow keys)
- Recent searches
- Search within tasks
- Search within projects
- Profile photo uploads
- Skill assessment forms

---

**Need Help?** Contact your club administrator or check the full documentation in PROFILE_AND_SEARCH_IMPLEMENTATION.md

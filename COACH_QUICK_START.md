# CTRC Dashboard - Coach Quick Start Guide

**Welcome, Coach Malhar!** 🤖

This dashboard is ready for you to manage the Caution Tape Robotics Club.

---

## How to Open the Dashboard

### Option 1: Local Server (Easiest)

```bash
cd ~/Downloads/ctrc-dashboard
python3 -m http.server 8000
```

Then open your browser to: **http://localhost:8000**

Press `Ctrl+C` in Terminal to stop the server when done.

---

### Option 2: Direct File Open

Just double-click `index.html` in Finder. It will open in your default browser.

---

## What's Working Right Now

### ✅ Fully Functional Pages

1. **Students** (`students.html`)
   - View all 34 students with real names
   - Filter by: Team, Program, Role, Status
   - Search by name
   - Sort any column
   - View individual student profiles

2. **Teams** (`teams.html`)
   - See all 4 teams (42A, 42B, 42C, 42D)
   - Team rosters and stats

3. **Tasks** (`tasks.html`)
   - View and manage club tasks
   - Filter by team, priority, status

4. **Foundation** (`foundation.html`)
   - Track student progress through foundation levels

5. **Inventory** (`inventory.html`)
   - Parts and equipment tracking

6. **Purchases** (`purchases.html`)
   - Purchase order management

7. **Reports** (`reports.html`)
   - Generate club reports

---

## Dashboard Homepage (index.html)

**What You'll See:**
- Stat cards at top (currently show "—" placeholders)
- Today's meeting card
- Overdue tasks list
- Teams at a glance
- Low stock alerts
- Upcoming competitions

**Note:** The stat numbers show "—" because the backend API isn't connected yet. This doesn't affect any other functionality!

---

## Your Students (The Important Part!)

**All 34 Real Students Are Loaded:**

Navigate to **Students** page to see:
- Daniel Edelstein
- Matt Fong
- Daniel Fu
- Luke Fu
- Ryan Jung
- Bryan Kuan
- Alessio Lai
- Cyrus Liu
- Cici Ma
- Zuhaib Mansoor
- Eli Mindell
- Steven Papazian
- Brialyn Quast
- Keegan Ramsaran
- Kiara Ramsaran
- Justin Rui
- Brandon Situ
- Caden Situ
- Brayden Sun
- Nathan Tam
- Elyse To
- Allen Wang
- Jovan Wang
- Isaac Wong
- Kylie Woo
- Jayden Yang
- Thomas Yang
- Jake Yeung
- Tobias Yeung
- Tiger Zhang
- Brandon Zhao
- Yichen Zheng
- Spencer Tam
- Leo Wu

---

## Key Features You Can Use Today

### 1. Student Management
- **Search:** Type any name in the search box
- **Filter:** Use dropdowns to filter by team, program, role, or status
- **Click Student Name:** Opens full profile with attendance, skills, badges
- **Example:** Click "Steven Papazian" to see his full profile

### 2. Team Views
- See which students are on which teams
- View team win rates and status

### 3. Task Tracking
- See all club tasks
- Filter by team or priority
- Track overdue items

---

## Tips for Using the Dashboard

### Quick Filters (Students Page)
- Want to see only Team 42A? Click the Team dropdown → select "42A — Iron Gears"
- Want only V5RC students? Program dropdown → "V5RC"
- Clear all filters with the "Clear filters" button

### Student Search
- Start typing any name in the search box
- Results filter instantly
- Example: Type "Daniel" to see both Daniel Edelstein and Daniel Fu

### Student Profiles
- Click any student's name to open their full profile
- Shows: attendance %, skill levels, badges, tasks, coach notes, competition history

---

## What's Not Working Yet (And That's OK!)

1. **Dashboard Stats:** Top cards show "—" instead of numbers
   - **Why:** Backend API not connected
   - **Impact:** Visual only. Doesn't affect student data or other pages.

2. **Invoice Sync:** Invoice page shows "no data"
   - **Why:** Requires backend API
   - **Impact:** You can still view purchase orders on the Purchases page

3. **RobotEvents Sync Button:** Doesn't fetch live data yet
   - **Why:** API integration not deployed
   - **Impact:** Competition data is manually entered for now

**None of these affect your core workflows!** All student data, filtering, and browsing works perfectly.

---

## Browser Console Errors (Ignore These)

If you open Developer Tools (F12), you might see:
```
Failed to load resource: /.netlify/functions/api/stats (404)
```

**This is expected and harmless.** The dashboard is trying to fetch from the backend API that isn't deployed yet. The pages still work perfectly with embedded data.

---

## Mobile Use

The dashboard works on tablets and phones! It's fully responsive. Just open the same URL on any device.

---

## Need Help?

**Common Questions:**

**Q: Why do the stat cards show "—"?**
A: The backend API isn't connected yet. This is cosmetic only. All student data works fine.

**Q: Can I edit student information?**
A: Not yet in the current static version. This requires the backend to save changes. For now, use it for viewing and tracking.

**Q: Where is the real data stored?**
A: Currently embedded in the HTML files. Each page has a JavaScript data array. When we connect the backend, it will move to a database.

**Q: Is this safe to use with real student names?**
A: Yes! This is running locally on your computer. No data is sent anywhere. It's completely private.

---

## Quick Keyboard Shortcuts

- **⌘K (Mac) / Ctrl+K (Windows):** Open command palette (visual feature, not functional yet)
- **Click sidebar items:** Navigate between pages

---

## What's Next?

**This Week:**
Use the dashboard to browse students, teams, and tasks. Get familiar with the interface.

**Coming Soon:**
- Backend API connection for live stats
- Database integration for editing student info
- RobotEvents sync for automatic competition data
- Invoice syncing with accounting systems

---

## Summary: You're Good to Go! ✅

**What Works:**
- All 34 real students loaded and browseable
- Filtering, searching, sorting
- Student profiles with full details
- Team rosters
- Task lists
- Inventory tracking
- Purchase records

**What to Expect:**
- Some placeholder "—" on dashboard stats (harmless)
- Invoice page empty (use Purchases page instead)
- Everything else: fully functional!

**How to Start:**
1. Open Terminal
2. Run: `cd ~/Downloads/ctrc-dashboard && python3 -m http.server 8000`
3. Open browser to: `http://localhost:8000`
4. Click **Students** in the sidebar
5. Explore!

---

**Questions?** Contact Malhar (that's you! 😄)

**Enjoy your new club management dashboard!** 🤖⚡

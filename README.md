# CTRC Dashboard

Robotics club management dashboard for Caution Tape Robotics Club.

## Live Site

**Production:** https://ctrc-v5-manager.netlify.app/

## Quick Deploy

To update the production site with your latest changes:

```bash
cd /Users/malharsoni/Downloads/ctrc-dashboard
./deploy.sh
```

That's it! Your changes will be live in ~30 seconds.

## Development

Run locally:

```bash
python3 -m http.server 8000
```

Then open: http://localhost:8000

## Pages

- **Dashboard** - Main overview with stats and quick actions
- **Students** - Filterable student list with search
- **Foundation** - Saturday class tracker with per-student progress
- **Teams** - Team management and rosters
- **Tasks** - Task tracking with board/list views
- **Inventory** - Parts inventory with low stock alerts
- **Reports** - Analytics and report downloads

## Foundation Page Features

The Foundation page tracks individual student progress through the 8-week onboarding curriculum:

- **Stat Cards**: Enrolled count, average week, graduated count, stalled students
- **Color-Coded Week Badges**: Blue (weeks 1-2), Purple (3-4), Yellow (5-6), Green (7-8)
- **8-Segment Progress Bars**: Visual indicator of completion
- **Individual Progress Tracking**: Each student progresses at their own pace
- **Expandable Rows**: View detailed weekly progress, scores, notes, and photos
- **PDF Parent Reports**: Download individual progress reports

## Tech Stack

- Static HTML/CSS/JavaScript
- Lucide Icons
- Inter font
- shadcn-inspired design system
- Netlify hosting

# CTRC Dashboard

## What This Is

A robotics club management dashboard for Caution Tape Robotics Club (CTRC) coaches and students. Coaches track attendance, assess skills, form teams, and manage curriculum. Students access their profiles, track progress, and work through structured learning modules. Built for VEX V5 robotics competition teams.

## Core Value

Coaches must be able to quickly assess student skills and attendance to form effective competition teams and track individual progress throughout the season.

## Requirements

### Validated

(None yet — enhancing existing static site)

### Active

- [ ] Coaches can add, edit, and manage coach accounts
- [ ] Coaches can add, edit, and manage student profiles
- [ ] Coaches can create and manage teams with student assignments
- [ ] Coaches can log attendance for Saturday classes (9am-1pm, 1:30pm-5:30pm)
- [ ] Coaches can view attendance history and trends
- [ ] Coaches can rate students on VEX-specific skills (programming blocks/C++, building, CAD, driving, strategy)
- [ ] Coaches can assign general roles to students (builder, programmer, driver, scout, designer)
- [ ] Coaches can view skills matrix to inform team formation decisions
- [ ] Coaches can write per-student notes (progress, behavior, improvement areas)
- [ ] Coaches can write per-class notes (coverage, attendance issues, announcements)
- [ ] Coaches can write per-team notes (dynamics, performance, strategy)
- [ ] Coaches can record quick skill assessment notes
- [ ] Students can view their own profile, attendance, and skill ratings
- [ ] Students can access module-based curriculum content
- [ ] Students can track their progress through curriculum modules
- [ ] System provides separate coach and student views with appropriate permissions

### Out of Scope

- Mobile app (web-first, mobile responsive only)
- Automated team formation algorithms (coach decides manually)
- Parent portal (coaches and students only)
- Integration with VEX event scheduling systems
- Competition scoring/match tracking (focus on club management)
- Real-time collaboration features during build sessions

## Context

**Current State:**
- Live site at https://ctrc-v5-manager.netlify.app/
- Static HTML/CSS/JavaScript with vanilla JS
- Beautiful existing design system: Inter font, yellow (#F5D000) accent, black sidebar
- All current data is hardcoded placeholders
- Pages exist for: students, teams, tasks, inventory, purchases, reports, foundation (curriculum stub)

**Technical Environment:**
- VEX V5 robotics competition focus
- Saturday classes: 9am-1pm and 1:30pm-5:30pm time slots
- Multiple coaches managing 20-40 students across several teams

**User Needs:**
- Coaches need to quickly see who attended, who has which skills, and make informed team decisions
- Students need a clear learning path and visibility into their own development
- Curriculum inspiration: frcdesign.org learning course structure

**Migration Goals:**
- Keep existing visual design intact (users love it)
- Move from static files to persistent data storage
- Improve code maintainability (vanilla JS → component-based architecture)

## Constraints

- **Tech Stack**: Next.js + Supabase recommended (component-based, auth, database, real-time)
- **Design Continuity**: Must preserve existing design system (colors, typography, layout)
- **Timeline**: Club season is active, need working system soon
- **Deployment**: Currently on Netlify, should remain easy to deploy
- **Data Migration**: Minimal existing data (just placeholders to remove)

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Next.js + Supabase stack | Cleaner than vanilla JS, Supabase handles auth/DB/storage, easy migration path | — Pending |
| Keep existing design system | Users love current UI, no need to rebuild visuals | — Pending |
| Coach-logged attendance | Coaches have authority, students don't self-check-in | — Pending |
| Simple skills matrix view | Coach sees skills grid, decides teams manually (no auto-suggestions) | — Pending |
| Module-based curriculum | Clear structured learning path like frcdesign.org | — Pending |

---
*Last updated: 2025-03-04 after initialization*

# Requirements: CTRC Dashboard

**Defined:** 2025-03-04
**Core Value:** Coaches must be able to quickly assess student skills and attendance to form effective competition teams and track individual progress throughout the season.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Authentication & Access Control

- [ ] **AUTH-01**: Coach can log in to access coach dashboard
- [ ] **AUTH-02**: Student can log in to access student dashboard
- [ ] **AUTH-03**: System enforces role-based permissions (coach vs student)
- [ ] **AUTH-04**: User session persists across browser sessions

### Data Management

- [ ] **DATA-01**: Coach can add new coach accounts with basic info (name, email, role)
- [ ] **DATA-02**: Coach can edit existing coach account information
- [ ] **DATA-03**: Coach can add new student profiles (name, grade, contact info)
- [ ] **DATA-04**: Coach can edit existing student profiles
- [ ] **DATA-05**: Coach can create teams with team name and number
- [ ] **DATA-06**: Coach can assign students to teams
- [ ] **DATA-07**: Coach can remove students from teams
- [ ] **DATA-08**: Coach can view list of all coaches
- [ ] **DATA-09**: Coach can view list of all students
- [ ] **DATA-10**: Coach can view list of all teams with rosters

### Attendance Tracking

- [ ] **ATTD-01**: Coach can log attendance for Saturday morning class (9am-1pm)
- [ ] **ATTD-02**: Coach can log attendance for Saturday afternoon class (1:30pm-5:30pm)
- [ ] **ATTD-03**: Coach can mark individual students as present or absent for each class
- [ ] **ATTD-04**: Coach can view attendance history for any student
- [ ] **ATTD-05**: Coach can view attendance statistics (attendance rate, trends)
- [ ] **ATTD-06**: Coach can view attendance roster for a specific date
- [ ] **ATTD-07**: System displays attendance summary on student profiles

### Skills Matrix

- [ ] **SKIL-01**: Coach can rate students on C++ programming skill (1-5 scale or proficiency level)
- [ ] **SKIL-02**: Coach can rate students on building/assembly skill
- [ ] **SKIL-03**: Coach can rate students on CAD design skill
- [ ] **SKIL-04**: Coach can rate students on driving skill
- [ ] **SKIL-05**: Coach can rate students on strategy skill
- [ ] **SKIL-06**: Coach can assign general role tags to students (builder, programmer, driver, scout, designer)
- [ ] **SKIL-07**: Coach can view skills matrix grid showing all students and their skill levels
- [ ] **SKIL-08**: Coach can filter skills matrix by role or skill level
- [ ] **SKIL-09**: Coach can sort skills matrix by different skill categories
- [ ] **SKIL-10**: System displays skill ratings on student profiles

### Notes & Feedback

- [ ] **NOTE-01**: Coach can write notes on individual student profiles (progress, behavior, improvement)
- [ ] **NOTE-02**: Coach can edit and delete their own student notes
- [ ] **NOTE-03**: Coach can write per-class notes (what was covered, announcements, issues)
- [ ] **NOTE-04**: Coach can write per-team notes (dynamics, performance, strategy)
- [ ] **NOTE-05**: Coach can record quick skill assessment notes with timestamps
- [ ] **NOTE-06**: Coach can view note history for any student
- [ ] **NOTE-07**: Coach can view note history for any team
- [ ] **NOTE-08**: Coach can view all class notes chronologically
- [ ] **NOTE-09**: System shows recent notes on student/team dashboards

### Curriculum Platform

- [ ] **CURR-01**: System displays curriculum organized in modules (VEX basics, programming, building, CAD, strategy)
- [ ] **CURR-02**: Each module contains lessons/sections with content
- [ ] **CURR-03**: Students can view curriculum content
- [ ] **CURR-04**: Students can mark lessons as complete
- [ ] **CURR-05**: System tracks student progress through curriculum modules
- [ ] **CURR-06**: Coach can view which students completed which modules
- [ ] **CURR-07**: Curriculum content is editable by coaches
- [ ] **CURR-08**: Curriculum displays in clean, readable format similar to frcdesign.org

### Student View

- [ ] **STUD-01**: Student can view their own profile information
- [ ] **STUD-02**: Student can view their attendance record
- [ ] **STUD-03**: Student can view their skill ratings and assessments
- [ ] **STUD-04**: Student can view notes/feedback from coaches addressed to them
- [ ] **STUD-05**: Student can view their team assignment and teammates
- [ ] **STUD-06**: Student can view their curriculum progress
- [ ] **STUD-07**: Student cannot edit other students' data or see other students' private notes

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Advanced Features

- **COMP-01**: Competition schedule integration and tracking
- **COMP-02**: Match performance tracking during competitions
- **COMP-03**: Tournament results and statistics
- **NOTF-01**: Email notifications for attendance issues
- **NOTF-02**: Student progress milestone notifications
- **PRNT-01**: Parent portal view (read-only access to student progress)
- **BULK-01**: Bulk import students from CSV
- **BULK-02**: Bulk attendance entry for full class
- **REPO-01**: Automated attendance reports (weekly, monthly)
- **REPO-02**: Skills gap analysis reports
- **MOBL-01**: Native mobile app for iOS/Android

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Automated team formation | Coach expertise needed, algorithm can't capture team dynamics |
| Integration with VEX event systems | External dependency, not core to club management |
| Real-time collaboration tools | Adds complexity, not needed for workflow |
| Financial/budget tracking | Separate concern, use existing school systems |
| Equipment checkout system | Inventory page already exists, focus on people management |
| Video conferencing | Use Zoom/Teams, not building comms platform |
| Parent messaging | Email works, don't need custom messaging |
| Block-based programming | Club focuses on C++ and V5 Competition coding |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| AUTH-01 | Phase 1 | Pending |
| AUTH-02 | Phase 1 | Pending |
| AUTH-03 | Phase 1 | Pending |
| AUTH-04 | Phase 1 | Pending |
| DATA-01 | Phase 2 | Pending |
| DATA-02 | Phase 2 | Pending |
| DATA-03 | Phase 2 | Pending |
| DATA-04 | Phase 2 | Pending |
| DATA-05 | Phase 2 | Pending |
| DATA-06 | Phase 2 | Pending |
| DATA-07 | Phase 2 | Pending |
| DATA-08 | Phase 2 | Pending |
| DATA-09 | Phase 2 | Pending |
| DATA-10 | Phase 2 | Pending |
| ATTD-01 | Phase 3 | Pending |
| ATTD-02 | Phase 3 | Pending |
| ATTD-03 | Phase 3 | Pending |
| ATTD-04 | Phase 3 | Pending |
| ATTD-05 | Phase 3 | Pending |
| ATTD-06 | Phase 3 | Pending |
| ATTD-07 | Phase 3 | Pending |
| SKIL-01 | Phase 3 | Pending |
| SKIL-02 | Phase 3 | Pending |
| SKIL-03 | Phase 3 | Pending |
| SKIL-04 | Phase 3 | Pending |
| SKIL-05 | Phase 3 | Pending |
| SKIL-06 | Phase 3 | Pending |
| SKIL-07 | Phase 3 | Pending |
| SKIL-08 | Phase 3 | Pending |
| SKIL-09 | Phase 3 | Pending |
| SKIL-10 | Phase 3 | Pending |
| NOTE-01 | Phase 3 | Pending |
| NOTE-02 | Phase 3 | Pending |
| NOTE-03 | Phase 3 | Pending |
| NOTE-04 | Phase 3 | Pending |
| NOTE-05 | Phase 3 | Pending |
| NOTE-06 | Phase 3 | Pending |
| NOTE-07 | Phase 3 | Pending |
| NOTE-08 | Phase 3 | Pending |
| NOTE-09 | Phase 3 | Pending |
| CURR-01 | Phase 4 | Pending |
| CURR-02 | Phase 4 | Pending |
| CURR-03 | Phase 4 | Pending |
| CURR-04 | Phase 4 | Pending |
| CURR-05 | Phase 4 | Pending |
| CURR-06 | Phase 4 | Pending |
| CURR-07 | Phase 4 | Pending |
| CURR-08 | Phase 4 | Pending |
| STUD-01 | Phase 4 | Pending |
| STUD-02 | Phase 4 | Pending |
| STUD-03 | Phase 4 | Pending |
| STUD-04 | Phase 4 | Pending |
| STUD-05 | Phase 4 | Pending |
| STUD-06 | Phase 4 | Pending |
| STUD-07 | Phase 4 | Pending |

**Coverage:**
- v1 requirements: 52 total
- Mapped to phases: 52 (100%)
- Unmapped: 0

---
*Requirements defined: 2025-03-04*
*Last updated: 2026-03-04 after roadmap creation*
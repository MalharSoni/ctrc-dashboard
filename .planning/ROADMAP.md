# Roadmap: CTRC Dashboard

**Core Value:** Coaches must be able to quickly assess student skills and attendance to form effective competition teams and track individual progress throughout the season.

**Depth:** Quick (4 phases)
**Mode:** YOLO

## Phases

- [ ] **Phase 1: Foundation & Access** - Authentication system and role-based access control
- [ ] **Phase 2: Core Management** - Student, coach, and team data management
- [ ] **Phase 3: Assessment Tools** - Attendance tracking, skills matrix, and notes system
- [ ] **Phase 4: Learning Platform** - Curriculum modules and student self-service portal

## Phase Details

### Phase 1: Foundation & Access
**Goal**: Users can securely access the platform with appropriate permissions
**Depends on**: Nothing (first phase)
**Requirements**: AUTH-01, AUTH-02, AUTH-03, AUTH-04
**Success Criteria** (what must be TRUE):
  1. Coach can log in with credentials and access coach-only features
  2. Student can log in with credentials and access student-only features
  3. User stays logged in across browser sessions without re-authentication
  4. Attempting to access restricted areas redirects to appropriate view based on role
**Plans**: TBD

### Phase 2: Core Management
**Goal**: Coaches can manage all people and team data in the system
**Depends on**: Phase 1
**Requirements**: DATA-01, DATA-02, DATA-03, DATA-04, DATA-05, DATA-06, DATA-07, DATA-08, DATA-09, DATA-10
**Success Criteria** (what must be TRUE):
  1. Coach can create, edit, and view complete list of coach accounts
  2. Coach can create, edit, and view complete list of student profiles with all details
  3. Coach can create teams and assign/remove students to/from teams
  4. Coach can view organized lists showing all coaches, students, and teams with rosters
**Plans**: TBD

### Phase 3: Assessment Tools
**Goal**: Coaches can track attendance, assess skills, and record feedback for informed team decisions
**Depends on**: Phase 2
**Requirements**: ATTD-01, ATTD-02, ATTD-03, ATTD-04, ATTD-05, ATTD-06, ATTD-07, SKIL-01, SKIL-02, SKIL-03, SKIL-04, SKIL-05, SKIL-06, SKIL-07, SKIL-08, SKIL-09, SKIL-10, NOTE-01, NOTE-02, NOTE-03, NOTE-04, NOTE-05, NOTE-06, NOTE-07, NOTE-08, NOTE-09
**Success Criteria** (what must be TRUE):
  1. Coach can log attendance for both Saturday time slots and view historical attendance data
  2. Coach can rate students on all 5 VEX skills and assign role tags
  3. Coach can view sortable/filterable skills matrix showing all students' capabilities
  4. Coach can write and view notes at student, team, and class levels with full history
  5. Student profiles display attendance stats, skill ratings, and recent notes
**Plans**: TBD

### Phase 4: Learning Platform
**Goal**: Students can access their data and progress through curriculum modules
**Depends on**: Phase 3
**Requirements**: CURR-01, CURR-02, CURR-03, CURR-04, CURR-05, CURR-06, CURR-07, CURR-08, STUD-01, STUD-02, STUD-03, STUD-04, STUD-05, STUD-06, STUD-07
**Success Criteria** (what must be TRUE):
  1. Students can view their complete profile including attendance, skills, and feedback
  2. Students can access curriculum organized into modules with lessons
  3. Students can mark lessons complete and track their learning progress
  4. Coaches can edit curriculum content and view student completion status
  5. Students cannot access or modify other students' private data
**Plans**: TBD

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation & Access | 0/0 | Not started | - |
| 2. Core Management | 0/0 | Not started | - |
| 3. Assessment Tools | 0/0 | Not started | - |
| 4. Learning Platform | 0/0 | Not started | - |

## Dependencies Graph

```
Phase 1: Foundation & Access
    ↓
Phase 2: Core Management
    ↓
Phase 3: Assessment Tools
    ↓
Phase 4: Learning Platform
```

---
*Roadmap created: 2026-03-04*
*Last updated: 2026-03-04*
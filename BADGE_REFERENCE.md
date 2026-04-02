# Team Badge Reference Guide

## Badge Styling Examples

### V5RC Team Badges (Black)

**839Z:**
```html
<span class="team-pill v5rc">839Z</span>
```
Style: Black background (#171717), white text, 11px font, 700 weight, rounded pill

**839Y:**
```html
<span class="team-pill v5rc">839Y</span>
```

**839X:**
```html
<span class="team-pill v5rc">839X</span>
```

---

### Foundation Badge (Yellow/Amber)

```html
<span class="team-pill" style="background:#FFFBEB;color:#92700A;">Foundation</span>
```
Style: Light yellow background (#FFFBEB), dark amber text (#92700A)

---

### EV Team Badge (Green - Secondary)

```html
<span class="team-pill" style="background:#F0FDF4;color:#15803D;margin-left:4px;">EV</span>
```
Style: Light green background (#F0FDF4), dark green text (#15803D)

---

## Combined Badge Examples

### Student on 839Z + EV Team (e.g., Daniel Edelstein)

```html
<span class="team-pill v5rc">839Z</span>
<span class="team-pill" style="background:#F0FDF4;color:#15803D;margin-left:4px;">EV</span>
```

Visual: [839Z] [EV]
- Black badge for VRC team
- Green badge for EV team
- 4px spacing between badges

---

### Student on 839Y + EV Team (e.g., Brandon Zhao)

```html
<span class="team-pill v5rc">839Y</span>
<span class="team-pill" style="background:#F0FDF4;color:#15803D;margin-left:4px;">EV</span>
```

Visual: [839Y] [EV]

---

### Student on VRC Team Only (e.g., Ryan Jung on 839Z)

```html
<span class="team-pill v5rc">839Z</span>
```

Visual: [839Z]
- Single black badge only

---

### Student in Foundation Program (e.g., Luke Fu)

```html
<span class="team-pill" style="background:#FFFBEB;color:#92700A;">Foundation</span>
```

Visual: [Foundation]
- Yellow/amber badge only
- No VRC team assignment yet

---

### Student on EV Team Only (e.g., Kiara Ramsaran)

```html
<span class="team-pill" style="background:#F0FDF4;color:#15803D;">EV Only</span>
```

Visual: [EV Only]
- Green badge indicating EV team with no VRC team

---

### Unassigned Student

```html
<span class="team-pill none">Unassigned</span>
```

Visual: [Unassigned]
- Gray badge (#D4D4D4 background, #737373 text)

---

## Badge Hierarchy

**Primary Badge (shows first):**
- VRC Team (839Z, 839Y, 839X) - Black
- Foundation - Yellow/Amber
- EV Only - Green

**Secondary Badge (shows after primary, if applicable):**
- EV - Green (only shown if student has both VRC + EV)

---

## Implementation Pattern

```javascript
// In renderTable() function
let teamPill = '';
if (s.team === 'Foundation') {
  teamPill = `<span class="team-pill" style="background:#FFFBEB;color:#92700A;">Foundation</span>`;
} else if (s.team) {
  teamPill = `<span class="team-pill v5rc">${s.team}</span>`;
  if (s.evTeam) {
    teamPill += ` <span class="team-pill" style="background:#F0FDF4;color:#15803D;margin-left:4px;">EV</span>`;
  }
} else if (s.evTeam) {
  teamPill = `<span class="team-pill" style="background:#F0FDF4;color:#15803D;">EV Only</span>`;
} else {
  teamPill = `<span class="team-pill none">Unassigned</span>`;
}
```

---

## Color Palette

| Badge Type | Background | Text Color | Use Case |
|------------|-----------|------------|----------|
| V5RC Team | #171717 (black) | #FFFFFF (white) | 839Z, 839Y, 839X |
| Foundation | #FFFBEB (light yellow) | #92700A (dark amber) | Foundation program |
| EV Team | #F0FDF4 (light green) | #15803D (dark green) | EV team indicator |
| Unassigned | #D4D4D4 (gray) | #737373 (dark gray) | No team assigned |

---

## Student Examples by Category

### 839Z Team (15 students)
- Daniel Edelstein → [839Z] [EV]
- Steven Papazian → [839Z] [EV]
- Brialyn Quast → [839Z] [EV]
- Ryan Jung → [839Z]
- Brandon Situ → [839Z]
- Nathan Tam → [839Z]

### 839Y Team (4 students)
- Alessio Lai → [839Y]
- Allen Wang → [839Y]
- Brandon Zhao → [839Y] [EV]
- Yichen Zheng → [839Y]

### 839X Team (5 students)
- Cyrus Liu → [839X]
- Cici Ma → [839X]
- Kylie Woo → [839X]
- Jake Yeung → [839X]
- Tobias Yeung → [839X]

### Foundation (8 students)
- Luke Fu → [Foundation]
- Brayden Sun → [Foundation]
- Keegan Ramsaran → [Foundation]
- Bryan Kuan → [Foundation]
- Elyse To → [Foundation]
- Jayden Yang → [Foundation]
- Thomas Yang → [Foundation]

### EV Only (1 student)
- Kiara Ramsaran → [EV Only]

---

*Reference for CTRC Dashboard team badge implementation*
*Last Updated: April 2, 2026*

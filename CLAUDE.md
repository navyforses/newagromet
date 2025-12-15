# CLAUDE.md - AI Assistant Guide for Perinatal Rehabilitation System

## Project Overview

This is a **Georgian-language web application** for managing the rehabilitation process of infants with perinatal asphyxia. It provides healthcare professionals with tools to track patients, conduct assessments, plan therapy sessions, and monitor rehabilitation progress.

**Key Characteristics:**
- 100% client-side application (no backend)
- All data stored in browser localStorage
- Georgian (ka) language interface
- No build tools or dependencies required
- Works offline after initial load

## Technology Stack

| Layer | Technology |
|-------|------------|
| Structure | HTML5 (semantic) |
| Styling | CSS3 (Grid, Flexbox, CSS Variables) |
| Logic | Vanilla JavaScript (ES6+) |
| Storage | Browser LocalStorage API |
| Fonts | Google Fonts (Noto Sans Georgian) |

**No external dependencies** - pure HTML/CSS/JS.

## Directory Structure

```
/home/user/newagromet/
├── index.html          # Main application entry (437 lines)
├── css/
│   └── style.css       # All styling and design system (833 lines)
├── js/
│   └── script.js       # Application logic (772 lines)
├── README.md           # User documentation (Georgian)
└── CLAUDE.md           # This file - AI assistant guide
```

**Total codebase:** ~2,000 lines of source code

## Key Files

### index.html
- Single HTML file containing all markup
- 4 main views: Dashboard, Patients, Add Patient, Statistics
- Patient detail modal with 4 tabs: Info, Assessments, Sessions, Progress
- Forms for patient registration, assessments, and session planning
- Inline SVG icons

### js/script.js
Core application logic organized into:

**Global State Arrays:**
```javascript
let patients = []      // Patient records
let assessments = []   // Medical assessments
let sessions = []      // Therapy sessions
let activities = []    // Activity log for dashboard
```

**Key Functions:**
- `initializeApp()` - Application bootstrap
- `handlePatientSubmit()` - Patient creation with validation
- `handleAssessmentSubmit()` - Assessment recording with scoring
- `handleSessionSubmit()` - Session scheduling
- `renderPatientsList()` - Patient card grid rendering
- `filterPatients()` - Real-time search
- `openPatientModal()` / `closePatientModal()` - Modal management
- `renderPatientInfo()` / `renderAssessmentHistory()` / `renderSessionsList()` / `renderProgress()` - Tab content
- `updateDashboard()` / `updateStatistics()` - Dashboard updates
- `saveData()` - Persist to localStorage
- `exportData()` / `importData()` - JSON backup/restore

**Utility Functions:**
- `calculateAge()` - Age from birthdate
- `formatDate()` / `formatDateTime()` - Georgian locale formatting
- `calculateOverallScore()` / `calculateCategoryScore()` - Assessment scoring
- `getSeverityName()` / `getTherapyTypeName()` - Label translations
- `showNotification()` - Toast notifications

### css/style.css
Design system with CSS variables:

```css
:root {
  --primary-color: #4F46E5;    /* Indigo - main actions */
  --secondary-color: #16A34A;  /* Green - success states */
  --warning-color: #D97706;    /* Amber - warnings */
  --danger-color: #DC2626;     /* Red - errors/severe */
}
```

**Component Styles:**
- Header with sticky navigation
- Stats grid (responsive 250px cards)
- Patient cards (350px min-width)
- Modal dialog system
- Form layouts (2-column grid)
- Assessment history timeline
- Progress bar visualizations
- Toast notifications

## Code Conventions

### Naming
- **Functions:** camelCase with action prefix (`render`, `handle`, `calculate`, `get`)
- **Variables:** camelCase
- **HTML data attributes:** kebab-case (`data-view`, `data-tab`, `data-patient-id`)
- **CSS classes:** kebab-case

### Data Structures

**Patient Object:**
```javascript
{
  id: "timestamp-string",
  name: "სახელი გვარი",
  patientId: "P001",
  birthDate: "2025-01-01",
  gender: "male" | "female",
  weight: 3.5,
  height: 50,
  parentName: "მშობლის სახელი",
  phone: "555123456",
  address: "მისამართი",
  email: "email@example.com",
  asphyxiaSeverity: "mild" | "moderate" | "severe",
  apgarScore: 7,
  apgarScore5: 9,
  diagnosis: "დიაგნოზი",
  medicalHistory: "ანამნეზი",
  rehabilitationGoals: "მიზნები",
  therapyTypes: ["physical", "occupational", "speech", "cognitive", "sensory"],
  status: "active" | "inactive",
  createdAt: "ISO-string",
  lastUpdated: "ISO-string"
}
```

**Assessment Object:**
```javascript
{
  id: "timestamp-string",
  patientId: "patient-id",
  date: "ISO-string",
  scores: {
    motor: { "head-control": 0-2, "limb-movement": 0-2, "tone": 0-2 },
    cognitive: { "visual-contact": 0-2, "sound-response": 0-2 },
    feeding: { "sucking": 0-2, "swallowing": 0-2 }
  },
  overallScore: 0-100,
  notes: "შენიშვნები"
}
```

**Session Object:**
```javascript
{
  id: "timestamp-string",
  patientId: "patient-id",
  type: "physical" | "occupational" | "speech" | "cognitive" | "sensory",
  date: "2025-01-15",
  time: "10:00",
  duration: 30,
  status: "scheduled" | "completed" | "cancelled",
  notes: "შენიშვნები",
  createdAt: "ISO-string"
}
```

### Scoring System
- Individual skills scored 0-2 (0=none, 1=partial, 2=good)
- Category score = average of skills in category
- Overall score = average of all categories * 50 (percentage)

### Event Patterns
- Event delegation on parent containers
- `preventDefault()` on form submissions
- Data attributes for dynamic content (`dataset`)
- Template literals for HTML generation

## Development Workflow

### Running Locally
```bash
# Option 1: Direct file access
open index.html  # or double-click in file manager

# Option 2: Python server
python -m http.server 8000

# Option 3: Node.js server
npx http-server

# Option 4: PHP server
php -S localhost:8000
```

Then visit `http://localhost:8000`

### Making Changes
1. Edit the relevant file directly (no build step)
2. Refresh browser to see changes
3. Test in browser console if needed:
   ```javascript
   console.log(patients)     // View patient data
   console.log(assessments)  // View assessments
   exportData()              // Download backup
   ```

### Testing
- **No automated tests** - manual browser testing only
- Test patient creation, assessment recording, session scheduling
- Verify localStorage persistence (data survives refresh)
- Test export/import functionality

## Common Tasks for AI Assistants

### Adding New Form Fields
1. Add HTML input in `index.html` within the appropriate form
2. Update the `handle*Submit()` function in `script.js` to capture new field
3. Update data structure documentation if adding to patient/assessment/session objects
4. Add any necessary CSS for new field styling

### Adding New Views/Tabs
1. Add navigation button in header (for main view) or modal tabs
2. Add content section with appropriate `data-view` or `data-tab` attribute
3. Create render function (e.g., `renderNewView()`)
4. Add navigation handler in `initializeNavigation()`
5. Style new content in `style.css`

### Modifying Assessment Categories
1. Update HTML form with new skill inputs (use existing pattern)
2. Modify score calculation functions: `calculateCategoryScore()`, `calculateOverallScore()`
3. Update `renderAssessmentHistory()` and `renderProgress()` to display new categories

### Adding Export Formats
1. Create new export function (similar to `exportData()`)
2. Transform data to desired format (CSV, PDF, etc.)
3. Use Blob API for file download

### Internationalization
- All user-facing text is in Georgian
- Date formatting uses Georgian locale (`ka-GE`)
- To add language support: create translation objects, update `get*Name()` functions

## Georgian Language Notes

**Common Terms Used:**
| Georgian | English |
|----------|---------|
| პაციენტი | Patient |
| შეფასება | Assessment |
| სესია | Session |
| პროგრესი | Progress |
| თერაპია | Therapy |
| რეაბილიტაცია | Rehabilitation |
| მშობელი | Parent |
| დაბადების თარიღი | Birth date |

**Therapy Types:**
| Georgian | English |
|----------|---------|
| ფიზიოთერაპია | Physical therapy |
| ოკუპაციური თერაპია | Occupational therapy |
| ლოგოპედია | Speech therapy |
| შემეცნებითი თერაპია | Cognitive therapy |
| სენსორული ინტეგრაცია | Sensory integration |

**Severity Levels:**
| Georgian | English |
|----------|---------|
| მსუბუქი | Mild |
| საშუალო | Moderate |
| მძიმე | Severe |

## Browser APIs Used

- **LocalStorage** - Data persistence
- **FileReader** - JSON import
- **Blob** - JSON export/download
- **Date/Intl** - Date formatting with Georgian locale

## Security Considerations

- All data stays in browser (no server transmission)
- No authentication (single-user design)
- localStorage is not encrypted
- Warn users about data loss when clearing browser cache
- Medical data privacy - not suitable for multi-user deployment without backend

## Deployment

**Static Hosting (Recommended):**
- GitHub Pages
- Netlify
- Vercel
- Any static file server

**Requirements:**
- Serve files as-is (no build step)
- HTTPS recommended for modern browser features
- No server-side processing needed

## Git Workflow

- Main branch contains stable releases
- Feature branches for new functionality
- Georgian commit messages acceptable
- No CI/CD pipeline currently configured

## Debugging Tips

1. **Data issues:** Check localStorage in DevTools (Application > Local Storage)
2. **Rendering issues:** Verify DOM updates with `console.log` before render calls
3. **Event issues:** Add event listeners logging to trace flow
4. **Style issues:** Use browser inspector to check CSS specificity

## Important Caveats

1. **No backend** - All data local to browser
2. **No multi-user** - Single browser instance only
3. **Data loss risk** - Browser cache clearing deletes all data
4. **No encryption** - localStorage stores plaintext
5. **Georgian only** - No built-in i18n support

---

*Last updated: December 2025*

# UI Components & Patterns

Complete UI implementation guide for the Sora Auto Queue Prompts extension.

---

## Overview

The extension UI is a **600px × 700px popup** with 6 tabbed sections, built with React 18 and vanilla CSS.

**Key Metrics:**
- **React Component:** 804 lines (single monolithic component)
- **CSS File:** 640 lines
- **Active Tabs:** 6
- **Test Coverage:** 93.82%
- **Bundle Size:** 1.1 MB (popup.js with React)

---

## UI Structure

```
┌─────────────────────────────────────────────┐
│           Header with Stats                 │ (32px)
│  ⏳ Pending (5) │ ▶ Processing (2) │ ✓ Complete (10)
├─────────────────────────────────────────────┤
│ Generate │ Manual │ CSV │ Queue │ Settings │ │ (32px)
│ Debug    │                                   │
├─────────────────────────────────────────────┤
│                                             │
│     [Active Tab Content Area]               │ (550px, scrollable)
│                                             │
├─────────────────────────────────────────────┤
│ [Error/Success Messages] (dismissible)      │ (auto)
└─────────────────────────────────────────────┘
```

---

## Six Main Tabs

### 1. Generate Tab

**Purpose:** AI-powered prompt generation using GPT-4

**Components:**
- API Key input (password field)
- Context Prompt textarea (4 rows)
- Batch Size input (1-200)
- Media Type dropdown (video/image)
- Variations dropdown (2 or 4)
- Enhanced Prompts checkbox
- Generate button

**Validation:**
- API key required
- Context prompt required
- Batch size 1-200

**User Flow:**
```
Enter API key → Describe prompts → Set parameters →
Click Generate → Wait for AI → Prompts added to queue
```

---

### 2. Manual Tab

**Purpose:** Add custom prompts by typing/pasting

**Components:**
- Large textarea (10 rows)
- Add Prompts button

**Features:**
- Line-by-line parsing
- Auto-assign media type from config
- Trim whitespace

**User Flow:**
```
Paste/type prompts (one per line) →
Click Add Prompts → Prompts added to queue
```

---

### 3. CSV Tab

**Purpose:** Bulk import/export with metadata

**Components:**
- File input (.csv)
- Download Template button
- Export Prompts button
- Format specification

**CSV Format (5 columns):**
```csv
prompt,type,aspect_ratio,variations,preset
"Beautiful sunset",video,16:9,2,cinematic
"Mountain landscape",image,1:1,4,realistic
```

**Supported Values:**
- **Type:** video, image
- **Aspect Ratio:** 16:9, 9:16, 1:1, 4:3, 3:4, 21:9
- **Variations:** 2, 4
- **Preset:** cinematic, documentary, artistic, realistic, animated, none

---

### 4. Queue Tab

**Purpose:** Real-time queue monitoring and management

**Components:**

**Queue Controls:**
- Status indicator: Running/Paused/Stopped
- Progress counter: "X / Y"
- Control buttons: Start, Pause, Resume, Stop

**Prompt Cards:**

Each card displays:
```
┌─────────────────────────────────────────┐
│ [VIDEO] [16:9] [CINEMATIC] [PENDING] ← │ (badges)
│                                         │
│ A beautiful cinematic landscape shot    │ (text)
│ with golden hour lighting...            │
│                                         │
│ Variations: 2    ✨ Enhanced           │ (metadata)
│                                         │
│ [✏️] [📋] [✨] [🔄] [🗑️]                │ (actions)
└─────────────────────────────────────────┘
```

**Card States (color-coded):**
- **Pending** (yellow border) - Waiting
- **Processing** (blue border) - Currently submitting
- **Completed** (green border) - Done (faded)
- **Editing** (purple border) - In edit mode

**Action Buttons:**
- ✏️ **Edit** - Inline edit prompt text
- 📋 **Duplicate** - Create exact copy
- ✨ **Refine** - AI enhancement
- 🔄 **Generate Similar** - Create 3 variations
- 🗑️ **Delete** - Remove prompt

---

### 5. Settings Tab

**Purpose:** Configuration options

**Sections:**

**Queue Automation:**
- Auto-generate when queue is empty (checkbox)
- Auto-generate when prompts added (checkbox)

**Anti-Bot Delays:**
- Min Delay (1000-30000ms, step 500)
- Max Delay (1000-60000ms, step 500)
- Help text explaining random delays

**Danger Zone:**
- Clear All Prompts button (with confirmation)

---

### 6. Debug Tab

**Purpose:** Logging and troubleshooting

**Components:**
- Action buttons: Refresh, Export, Clear
- Log list (scrollable)
- Color-coded log levels

**Log Levels:**
- **DEBUG** (gray) - Low-level details
- **INFO** (blue) - General information
- **WARN** (yellow) - Warnings
- **ERROR** (red) - Errors

**Each Log Entry:**
```
[DEBUG] [QUEUE] 14:32:15
Queue processing started
{"status": "running", "count": 5}
```

---

## Color Palette

### Primary Colors
```css
/* Main Colors */
#007bff   /* Primary Blue */
#333      /* Dark Text */
#f5f5f5   /* Light Background */
#fff      /* White Cards */
#ddd      /* Borders */

/* Status Colors */
#ffc107   /* Pending/Warning (yellow) */
#007bff   /* Processing/Info (blue) */
#28a745   /* Completed/Success (green) */
#dc3545   /* Error (red) */
#6c757d   /* Debug/Secondary (gray) */
```

---

## Typography

**Font Family:** System fonts
```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI',
             'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell',
             'Helvetica Neue', sans-serif;
```

**Font Sizes:**
- **h1:** 20px, weight 600
- **h3:** 16px, weight 600
- **Body:** 14px
- **Small:** 13px
- **Tiny:** 11-12px

---

## Layout System

### Container
```css
.popup-container {
  width: 100%;
  max-width: 600px;
  max-height: 700px;
  overflow: hidden;
}
```

### Tab Content
```css
.tab-content {
  max-height: 550px;
  overflow-y: auto;
  padding: 16px;
}
```

### Flexbox Layouts
- Tab navigation (horizontal)
- Button groups (horizontal)
- Card actions (horizontal)

### CSS Grid
```css
.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
```

---

## Interactive States

### Button States
```css
.btn {
  transition: all 0.2s ease;
}

.btn:hover {
  /* Color darkening + background change */
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
```

### Form Input States
```css
input:focus, textarea:focus, select:focus {
  border-color: #007bff;
  outline: none;
  transition: border-color 0.2s;
}
```

### Card Hover Effects
```css
.prompt-card:hover .action-btn {
  transform: scale(1.1);
}
```

---

## Key User Workflows

### Workflow 1: AI Generation

```
1. Open extension popup
2. Navigate to Generate tab
3. Enter OpenAI API key
4. Enter context prompt
5. Set batch size (e.g., 25)
6. Click "Generate Prompts"
7. AI generates prompts in seconds
8. Navigate to Queue tab
9. Click "Start Queue"
10. Monitor real-time progress
```

### Workflow 2: Manual Entry

```
1. Open extension popup
2. Navigate to Manual tab
3. Paste prompts (one per line)
4. Click "Add Prompts"
5. Navigate to Queue tab
6. Click "Start Queue"
```

### Workflow 3: CSV Import

```
1. Open extension popup
2. Navigate to CSV tab
3. Download template (optional)
4. Create CSV with 5 columns
5. Upload CSV file
6. Prompts imported with metadata
7. Navigate to Queue tab
8. Click "Start Queue"
```

### Workflow 4: In-Queue Editing

```
Queue is running
    ↓
Spot typo in a prompt
    ↓
Click ✏️ edit button
    ↓
Inline textarea appears
    ↓
Edit text
    ↓
Click "Save"
    ↓
Prompt updated without stopping queue
    ↓
OR Click 🔄 to generate variations
    ↓
3 new similar prompts added to queue
```

---

## Component Patterns

### Styled Buttons

**Primary Button:**
```css
.btn-primary {
  background: #007bff;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}
```

**Secondary Button:**
```css
.btn-secondary {
  background: #6c757d;
  color: white;
}
```

**Danger Button:**
```css
.btn-danger {
  background: #dc3545;
  color: white;
}
```

### Form Groups

```css
.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
}

.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}
```

### Status Badges

```css
.stat {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
}

.stat.pending { background: #ffc107; }
.stat.processing { background: #007bff; color: white; }
.stat.completed { background: #28a745; color: white; }
```

### Prompt Cards

```css
.prompt-card {
  background: white;
  border: 2px solid #ddd;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;
  transition: all 0.2s;
}

.prompt-card.pending { border-color: #ffc107; }
.prompt-card.processing { border-color: #007bff; }
.prompt-card.completed {
  border-color: #28a745;
  opacity: 0.6;
}
```

---

## Real-Time Features

### Polling System
- **Interval:** Every 2 seconds when popup is open
- **Updates:** Prompt statuses, queue state, counts
- **Live Stats:** Header badges update automatically

### Auto-Dismiss Notifications
- **Success messages:** Auto-dismiss after 3 seconds
- **Error messages:** Manual dismiss required

---

## Validation Rules

| Field | Rule |
|-------|------|
| API Key | Required for generation |
| Context Prompt | Required for generation |
| Batch Size | 1-200 (custom allowed) |
| Min Delay | 1000-30000ms |
| Max Delay | 1000-60000ms |
| Variations | 2 or 4 only |

---

## Empty States

**Queue Tab:**
```
"No prompts in queue. Generate or add prompts to get started."
```

**Debug Tab:**
```
"No logs yet"
```

---

## Accessibility Considerations

### Keyboard Navigation
- Tab navigation between form fields
- Enter key submits forms
- Escape key closes modals (future)

### Color Contrast
- All text meets WCAG AA standards
- Status colors clearly distinguishable
- Error states use color + icons

### Screen Readers
- Form labels properly associated
- Button text descriptive
- Status changes announced (future improvement)

---

## Performance Notes

### Bundle Size
- **popup.js:** 1.1 MB (includes React)
- Relatively large for extension popup
- Consider code splitting for future

### Rendering Optimization
- Large prompt lists (1000+) may slow down
- Consider virtual scrolling for optimization
- Current limit: ~500 prompts recommended

### Memory Usage
- Polling every 2 seconds uses minimal memory
- Chrome storage has 5MB limit (consider IndexedDB for future)

---

## CSS Organization

### File Structure
```css
/* popup.css organization */

/* 1. Global Styles */
* { box-sizing: border-box; }
body { font-family: system fonts; }

/* 2. Container & Layout */
.popup-container { ... }
.tabs { ... }
.tab-content { ... }

/* 3. Typography */
h1, h2, h3 { ... }

/* 4. Form Elements */
.form-group { ... }
input, textarea, select { ... }

/* 5. Buttons */
.btn, .btn-primary, .btn-secondary { ... }

/* 6. Cards & Components */
.prompt-card { ... }
.stat { ... }

/* 7. Utilities */
.text-center { ... }
.mb-2 { ... }
```

---

## Future UI Enhancements

### Short-Term
- [ ] Add loading spinners for async operations
- [ ] Improve empty states with illustrations
- [ ] Add keyboard shortcuts
- [ ] Implement toast notification system

### Medium-Term
- [ ] Break into smaller React components
- [ ] Add CSS framework (Tailwind)
- [ ] Implement virtual scrolling for large lists
- [ ] Add dark mode support

### Long-Term
- [ ] Redesign with modern UI patterns
- [ ] Add animations and transitions
- [ ] Implement drag-and-drop for queue reordering
- [ ] Add prompt templates library UI

---

## Troubleshooting UI Issues

### Problem: UI not updating

**Cause:** Polling may be paused or background script not responding

**Solution:**
1. Check if popup is open (polling only works when open)
2. Check browser console for errors
3. Refresh extension in `chrome://extensions/`

### Problem: Buttons not working

**Cause:** Message passing to background may be failing

**Solution:**
1. Check Debug tab for error logs
2. Inspect background service worker console
3. Verify Chrome permissions are granted

### Problem: Styles not applied

**Cause:** CSS file may not be loaded or cached

**Solution:**
1. Hard refresh popup (Ctrl+Shift+R)
2. Rebuild extension: `pnpm run build`
3. Reload extension in `chrome://extensions/`

---

**Last Updated:** 2025-11-18
**UI Version:** 1.0.1
**React Version:** 18.3.1
**Component Lines:** 804 LOC
**CSS Lines:** 640 LOC

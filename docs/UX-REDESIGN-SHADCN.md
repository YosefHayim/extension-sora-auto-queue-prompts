# Sora Auto Queue Prompts - Complete UX Redesign
## Shadcn UI Implementation Guide

**Version:** 2.0
**Date:** 2025-01-18
**Design Philosophy:** Professional, Minimalistic, Best-in-Class User Experience

---

## Table of Contents

1. [User Context Summary](#1-user-context-summary)
2. [Core UX Strategy](#2-core-ux-strategy)
3. [User Journey Map](#3-user-journey-map)
4. [Interface Architecture](#4-interface-architecture)
5. [Feature-Level Flows](#5-feature-level-flows)
6. [Component Specification](#6-component-specification)
7. [State & Data Management](#7-state--data-management)
8. [Automation & Background Tasks](#8-automation--background-tasks)
9. [Technical Integration Points](#9-technical-integration-points)
10. [Design Rationale](#10-design-rationale)
11. [Implementation Roadmap](#11-implementation-roadmap)

---

## 1. User Context Summary

### Target User Persona

**Primary Persona: "The AI Content Creator"**
- **Role**: Content creator, digital artist, video producer, social media manager
- **Goals**:
  - Generate hundreds of AI video/image prompts efficiently
  - Automate repetitive Sora submission workflows
  - Maintain consistent quality across prompt batches
  - Track generation status in real-time
- **Pain Points**:
  - Manual prompt creation is time-consuming and creatively draining
  - Submitting prompts one-by-one to Sora is tedious
  - No way to organize, edit, or batch-manage prompts
  - Risk of bot detection when submitting too quickly
  - Losing work when browser tabs close
- **Skill Level**: Intermediate to advanced (comfortable with AI tools, understands prompting)
- **Typical Session**: 15-30 minutes (setup + monitoring queue)
- **Success Metrics**:
  - Time to first prompt submission: < 2 minutes
  - Prompts generated per session: 50-200
  - Queue management efficiency: Zero manual intervention after start
  - User satisfaction: Perceived as "fast, reliable, invisible automation"

### Current Workflow Analysis

**Existing 6-Tab Structure Issues:**
1. **Generate Tab**: API key input feels disconnected from settings
2. **Manual Tab**: Single-purpose tab for simple text entry (overengineered)
3. **CSV Tab**: Separate tab for bulk operations creates fragmentation
4. **Queue Tab**: Most important view, but buried among 6 tabs
5. **Settings Tab**: Critical configuration hidden, not easily accessible
6. **Debug Tab**: Useful for power users, but clutters main navigation

**Key Friction Points:**
- **Too many tabs**: 6 tabs create cognitive load, unclear navigation hierarchy
- **Context switching**: Users must jump between tabs to complete basic workflows
- **Hidden functionality**: Important features buried in specific tabs
- **No quick actions**: Common tasks (pause, edit, delete) require multiple clicks
- **Poor visual hierarchy**: All tabs treated equally despite usage frequency
- **Status visibility**: Hard to see queue status without switching to Queue tab

### Success Metrics for Extension

1. **Efficiency**: 80% reduction in time from prompt ideation to submission
2. **Reliability**: 99% success rate for queue processing without errors
3. **Usability**: New users complete first workflow in < 3 minutes
4. **Clarity**: Users understand extension purpose within 10 seconds of opening
5. **Performance**: UI remains responsive with 500+ prompts in queue

---

## 2. Core UX Strategy

### Primary Value Proposition

**"From idea to video in 3 clicks: Generate, Queue, Done."**

The extension's single purpose is to eliminate friction between creative intent and Sora execution. Every design decision serves this goal.

### Design Principles

1. **Progressive Disclosure**
   - Show essential controls first, hide advanced options until needed
   - Default to simplest workflow, offer complexity on demand
   - Example: Settings live in dropdown menu, not dedicated tab

2. **Immediate Feedback**
   - Every action produces instant visual response
   - Loading states, progress indicators, success confirmations omnipresent
   - Example: Toast notifications for actions, inline status badges

3. **Forgiving Interactions**
   - Allow undo for destructive actions
   - Confirm before irreversible operations
   - Auto-save all work continuously
   - Example: Deleted prompts go to "Trash" before permanent removal

4. **Visual Hierarchy by Frequency**
   - Most-used features are largest, most prominent
   - Rarely-used features collapse or hide
   - Example: Queue view is primary screen, CSV import is nested action

5. **Minimalist Aesthetic**
   - Clean, uncluttered interface using Shadcn's neutral palette
   - Typography as primary visual element (reduce icon clutter)
   - White space for breathing room
   - Example: Single-color badge system (green/yellow/red only)

6. **Keyboard-First for Power Users**
   - Every action accessible via keyboard
   - Command palette for quick navigation
   - Tab order follows visual hierarchy
   - Example: Cmd+K opens command palette, Cmd+G generates prompts

### Automation Philosophy

**Automate everything except creative decisions:**
- **Automate**: API calls, queue processing, delays, status updates, persistence
- **Manual**: Prompt content, generation parameters, queue control (start/pause)
- **Hybrid**: Editing prompts (AI-assisted but user-controlled)

---

## 3. User Journey Map

### First-Time User Experience (Onboarding)

**Goal:** Get user from install to first prompt submission in < 3 minutes

1. **Extension Install** (0:00)
   - User installs from Chrome Web Store
   - Clicks extension icon in toolbar

2. **Welcome Screen** (0:05)
   - Splash screen: "Welcome to Sora Auto Queue"
   - Single card explaining value: "Generate AI prompts, automate submission"
   - Primary CTA: "Get Started"

3. **Quick Setup Wizard** (0:10 - 1:00)
   - **Step 1: API Key**
     - Input: OpenAI API key
     - Helper text: "Get your key at platform.openai.com"
     - Link: "How do I get an API key?"
   - **Step 2: First Prompt**
     - Textarea: "Describe what you want to create..."
     - Example: "Cinematic shots of futuristic cities"
   - **Step 3: Generate**
     - Click "Generate 10 Prompts" (default batch size for onboarding)
     - Loading state: "Generating your prompts..."

4. **First Success** (1:00 - 1:30)
   - View generated prompts in queue
   - Tooltip highlights: "Click Start Queue to begin"
   - User clicks "Start Queue"

5. **Monitor Progress** (1:30 - 3:00)
   - Watch first prompt process
   - Success toast: "First prompt submitted!"
   - End of onboarding: "Setup complete. You're ready to create."

**First-Run Completion Rate Target:** 90% of users complete setup

---

### Typical Session Flow (Experienced User)

**Goal:** Repeat user workflow optimized for speed

1. **Entry** (0:00)
   - User clicks extension icon
   - Opens directly to Queue View (default after onboarding)
   - Sees queue status at a glance (pending/processing/completed counts)

2. **Generate New Batch** (0:05 - 0:30)
   - Clicks "+ Generate" button (prominent in header)
   - Modal opens: "Generate AI Prompts"
   - Fills context prompt (remembered from last session)
   - Adjusts batch size (presets: 10, 25, 50, 100, Custom)
   - Clicks "Generate"
   - Modal stays open showing progress
   - On completion, modal closes, prompts appear in queue

3. **Review & Edit** (0:30 - 2:00)
   - Scrolls through queue
   - Hover actions appear on prompt cards
   - Quick edits:
     - Click edit icon → Inline editing
     - Click duplicate → Creates copy
     - Click delete → Removes prompt
   - No tab switching required

4. **Start Queue** (2:00)
   - Clicks "Start Queue" button (if stopped)
   - Or clicks "Resume" (if paused)
   - Queue begins processing automatically

5. **Monitor & Adjust** (2:00 - 15:00)
   - Watches real-time status updates
   - Pauses if needed (emergency stop)
   - Adds more prompts mid-queue (via quick action)
   - Minimizes extension, returns occasionally to check

6. **Completion** (15:00)
   - All prompts processed
   - Success notification: "Queue complete! 50 prompts submitted."
   - Option: "Generate More" or "Clear Completed"

**Session Efficiency Target:** < 30 seconds from open to queue running

---

### Power User Patterns (Advanced Workflows)

1. **Bulk CSV Import**
   - User has 200 prompts in CSV
   - Opens command palette (Cmd+K)
   - Types "import csv"
   - Drags CSV file into dialog
   - Prompts added to queue instantly
   - CSV template available via "Download Template" link

2. **Prompt Refinement Loop**
   - User sees generated prompt needs improvement
   - Hovers over prompt card
   - Clicks "Refine with AI" icon
   - AI enhances prompt in background
   - Updated prompt replaces original with visual "enhanced" badge
   - No interruption to queue

3. **Queue Customization**
   - User wants different settings per prompt
   - Clicks prompt card to expand details
   - Edits aspect ratio, variations, preset inline
   - Changes save automatically
   - Visual indicator shows custom settings

4. **Auto-Generation Mode**
   - User enables "Auto-generate on empty" in settings
   - Queue runs continuously
   - When queue empties, new batch generates automatically
   - User can walk away, queue runs for hours

---

### Re-Engagement Scenarios (Returning After Time Away)

1. **Return to In-Progress Queue**
   - User opens extension after closing browser
   - Queue state restored from storage
   - Banner: "You have 23 pending prompts. Continue?"
   - Click "Resume Queue" to continue where left off

2. **Return with Completed Queue**
   - User opens extension after queue finished
   - Summary card: "Last session: 100 prompts completed"
   - CTA: "Start New Batch"
   - Completed prompts visible in history

3. **Return for CSV Export**
   - User wants to backup prompts
   - Opens command palette (Cmd+K)
   - Types "export"
   - Downloads CSV with all prompt metadata

---

## 4. Interface Architecture

### Redesigned Navigation: From 6 Tabs to 2 Primary Views

**New Structure: 2 Main Views + Header Actions**

```
┌─────────────────────────────────────────────────────┐
│  Header (Global Controls + Status)                  │
├─────────────────────────────────────────────────────┤
│  Primary View (Queue or Settings)                   │
│  └─ Dynamically changes based on user selection     │
└─────────────────────────────────────────────────────┘
```

#### Header Components (Always Visible)

1. **Branding**
   - Logo/Icon + "Sora Queue"
   - Subtle, not dominant

2. **Status Bar**
   - Compact statistics:
     - `⏳ 23 Pending`
     - `▶ 2 Processing`
     - `✓ 45 Completed`
   - Badges with color coding (yellow, blue, green)

3. **Primary Actions**
   - `+ Generate` button (primary action, always visible)
   - `⏸ Pause` / `▶ Start` button (context-aware)
   - Settings gear icon (dropdown menu)

4. **Command Palette Trigger**
   - Search icon or "Cmd+K" hint
   - Opens fuzzy search for all actions

---

### Primary View 1: Queue View (Default)

**Purpose:** Main workspace for prompt management and queue monitoring

**Layout: Single Column with Grouped Cards**

```
┌─────────────────────────────────────────────────────┐
│ Header                                              │
├─────────────────────────────────────────────────────┤
│ Queue Controls Bar                                  │
│ ├─ [Start Queue] [Pause] [Stop]                    │
│ └─ Progress: 12/50 prompts • 38 remaining          │
├─────────────────────────────────────────────────────┤
│ Prompt List (Scrollable)                           │
│ ┌─────────────────────────────────────────────┐   │
│ │ Prompt Card 1                                │   │
│ │ └─ Hover: Edit, Duplicate, Delete, Refine   │   │
│ ├─────────────────────────────────────────────┤   │
│ │ Prompt Card 2                                │   │
│ └─────────────────────────────────────────────┘   │
│ [Load More]                                         │
└─────────────────────────────────────────────────────┘
```

**Key Features:**
- Infinite scroll for large queues
- Status-based grouping (Pending → Processing → Completed)
- Collapsible completed section
- Empty state: "No prompts yet. Click + Generate to start"

---

### Primary View 2: Settings View (Modal/Sidebar)

**Purpose:** Configuration without disrupting main workflow

**Access Method:** Click settings gear icon → Opens modal/drawer

**Layout: Tabbed Sections (Within Settings View)**

```
┌─────────────────────────────────────────────────────┐
│ Settings                                        [×] │
├─────────────────────────────────────────────────────┤
│ Tabs: [General] [API] [Queue] [Advanced]          │
├─────────────────────────────────────────────────────┤
│ General                                             │
│ ├─ Media Type: [Video] [Image]                    │
│ ├─ Variations: [2] [4]                            │
│ ├─ Enhanced Prompts: [Toggle]                     │
│ └─ Auto-generate on empty: [Toggle]               │
│                                                     │
│ API                                                 │
│ ├─ OpenAI API Key: [••••••••••]                   │
│ └─ Test Connection: [Button]                      │
│                                                     │
│ Queue                                               │
│ ├─ Min Delay: [2s] slider                         │
│ ├─ Max Delay: [5s] slider                         │
│ └─ Anti-bot mode: [Enabled]                       │
│                                                     │
│ Advanced                                            │
│ ├─ Debug Logs: [View Logs]                        │
│ ├─ Export Data: [CSV]                             │
│ └─ Clear Queue: [Danger Button]                   │
│                                                     │
│ [Save Changes]                                      │
└─────────────────────────────────────────────────────┘
```

**Key Features:**
- Modal overlay (doesn't replace Queue view)
- Auto-save for non-destructive changes
- Validation feedback inline
- "Danger Zone" section at bottom for destructive actions

---

### Modal Dialogs (Overlays)

1. **Generate Prompts Modal**
   - Triggered by: "+ Generate" button
   - Form fields:
     - Context prompt (textarea)
     - Batch size (select with presets)
     - Media type (toggle)
     - Enhanced prompts (checkbox)
   - Actions: [Cancel] [Generate]
   - Loading state shows progress bar

2. **CSV Import Modal**
   - Triggered by: Command palette or settings
   - Drag-and-drop zone for CSV
   - Preview table shows first 5 rows
   - Actions: [Cancel] [Import]

3. **Prompt Details Modal**
   - Triggered by: Clicking prompt card
   - Full-screen editor for prompt text
   - Metadata fields (aspect ratio, variations, preset)
   - Actions: [Save] [Cancel]

4. **Command Palette**
   - Triggered by: Cmd+K or search icon
   - Fuzzy search for actions:
     - "generate" → Generate prompts
     - "import" → Import CSV
     - "export" → Export CSV
     - "clear" → Clear queue
     - "logs" → View debug logs
   - Keyboard navigation (arrow keys + Enter)

---

### Key Screens Summary

| Screen | Purpose | Access Method | Frequency |
|--------|---------|---------------|-----------|
| **Queue View** | Main workspace, prompt management | Default view | Every session |
| **Settings Modal** | Configuration | Gear icon in header | Once per session |
| **Generate Modal** | Create new prompts | "+ Generate" button | 1-3 times per session |
| **CSV Import Modal** | Bulk upload | Command palette or menu | Occasionally |
| **Command Palette** | Quick actions | Cmd+K | Power users |
| **Onboarding** | First-time setup | Auto-shown on first launch | Once per install |

---

## 5. Feature-Level Flows

### Feature 1: AI Prompt Generation

**Trigger:** User clicks "+ Generate" button in header

**Steps:**

1. **Modal Opens**
   - Form appears with focus on context prompt textarea
   - Previous context pre-filled (remembered from last session)
   - Batch size defaults to last-used value or 25

2. **User Input**
   - Types or edits context prompt
   - Example placeholder: "e.g., Cinematic shots of underwater bioluminescent creatures"
   - Selects batch size from dropdown: 10, 25, 50, 100, or Custom (input)
   - Toggles "Enhanced Prompts" (enabled by default)

3. **Validation**
   - If context is empty: Inline error "Context prompt is required"
   - If API key missing: Error toast "Please add your OpenAI API key in Settings"
   - If validation passes: "Generate" button becomes enabled

4. **Generation**
   - User clicks "Generate"
   - Button changes to loading state: "Generating..."
   - Progress bar appears: "0/25 prompts generated"
   - Modal remains open, showing live progress

5. **Completion**
   - Success toast: "Generated 25 prompts!"
   - Modal closes automatically
   - Queue view updates with new prompts (scrolls to top)
   - New prompts have visual "new" indicator (fades after 3 seconds)

**Inputs:**
- Context prompt (string, 10-500 chars)
- Batch size (number, 1-200)
- Media type (video/image, from global settings)
- Enhanced mode (boolean)

**Automation:**
- API call happens in background
- Prompts added to queue automatically
- No manual "add to queue" step needed

**Output:**
- N new prompts in queue (status: pending)
- Each prompt has metadata: timestamp, media type, enhanced flag

**Edge Cases:**
- **API key invalid**: Error toast "Invalid API key. Check settings."
- **Rate limit hit**: Error toast "API rate limit. Try again in 60 seconds."
- **Network error**: Error toast "Connection failed. Check internet."
- **Partial success** (some prompts fail): Warning toast "Generated 20/25 prompts. 5 failed."

---

### Feature 2: Queue Processing (Start/Pause/Stop)

**Trigger:** User clicks "Start Queue" button

**Steps:**

1. **Pre-Flight Check**
   - Extension checks if Sora tab is open
   - If not: Prompt "Open Sora.com in a new tab to continue"
   - User clicks "Open Sora.com" → New tab opens
   - Extension waits for tab to load

2. **Queue Starts**
   - Button changes: "Start Queue" → "⏸ Pause"
   - Status badge updates: "▶ Running"
   - First pending prompt changes to "processing" status
   - Visual indicator (pulsing animation) on processing prompt

3. **Processing Loop** (Automated)
   - Content script injects into Sora tab
   - Types prompt with human-like delays (30-80ms per char)
   - Submits form
   - Waits for Sora loader to disappear
   - Marks prompt as "completed"
   - Waits random delay (2-5s default)
   - Moves to next prompt

4. **Real-Time Updates**
   - Queue view refreshes every 2 seconds
   - Progress bar updates: "12/50 prompts completed"
   - Completed prompts move to bottom section (collapsible)
   - Processing prompt highlighted with border

5. **User Pause**
   - User clicks "⏸ Pause"
   - Current prompt finishes processing
   - Queue pauses after current prompt
   - Button changes: "Pause" → "▶ Resume"
   - Status badge: "⏸ Paused"

6. **User Resume**
   - User clicks "▶ Resume"
   - Queue continues from next pending prompt
   - Button changes: "Resume" → "⏸ Pause"

7. **User Stop**
   - User clicks "⏹ Stop" (secondary action in dropdown)
   - Confirmation dialog: "Stop queue? Current prompt will finish."
   - On confirm: Queue stops, button resets to "Start Queue"

8. **Completion**
   - All prompts processed
   - Success notification: "Queue complete! 50/50 prompts submitted."
   - Confetti animation (optional, dismissible)
   - CTA: "Generate More Prompts" or "Clear Completed"

**Inputs:** None (uses existing queue)

**Automation:**
- Entire submission process is automated
- User can walk away after clicking "Start"
- Extension handles errors and retries automatically

**Output:**
- Updated prompt statuses (pending → processing → completed)
- Queue state persisted to storage

**Edge Cases:**
- **Sora tab closes mid-queue**: Pause queue, prompt "Sora tab closed. Reopen to continue?"
- **Network error**: Mark prompt as "failed", retry 3 times, then skip
- **Bot detection triggered**: Pause queue, alert "Sora detected automation. Increase delays in settings."
- **Browser crash**: On restart, prompt "Resume previous queue? (23 prompts remaining)"

---

### Feature 3: Inline Prompt Editing

**Trigger:** User hovers over prompt card → Clicks edit icon

**Steps:**

1. **Edit Mode Activates**
   - Prompt card expands
   - Text becomes editable (contenteditable or textarea)
   - Border changes to blue (visual indicator)
   - Quick actions appear: [Save] [Cancel]

2. **User Edits**
   - Types changes to prompt text
   - Character count updates in real-time
   - Validation: 10-500 chars (error if out of range)

3. **Save Changes**
   - User clicks "Save" or presses Enter
   - API call (if "Refine with AI" enabled)
   - Prompt card collapses, shows updated text
   - Success micro-animation (subtle checkmark)

4. **Cancel Changes**
   - User clicks "Cancel" or presses Escape
   - Original text restored
   - Edit mode closes

**Inputs:**
- New prompt text (string)

**Automation:**
- Changes auto-save to storage
- Queue continues processing (no interruption)

**Output:**
- Updated prompt in queue

**Edge Cases:**
- **Edit during processing**: Warning "Prompt is currently processing. Edit anyway?" (allows edit but doesn't affect current submission)
- **Empty prompt**: Error "Prompt cannot be empty"

---

### Feature 4: CSV Bulk Import

**Trigger:** User opens command palette → Types "import" → Selects "Import CSV"

**Steps:**

1. **Modal Opens**
   - Title: "Import Prompts from CSV"
   - Drag-and-drop zone: "Drop CSV file here or click to browse"
   - Link: "Download Template" (downloads 5-column CSV template)

2. **File Selection**
   - User drags CSV file or clicks to browse
   - File validation: Must be .csv extension
   - If invalid: Error "Please select a CSV file"

3. **Parsing**
   - Loading state: "Parsing CSV..."
   - Preview table shows first 5 rows
   - Column headers: Prompt, Type, Aspect Ratio, Variations, Preset
   - Row count displayed: "200 prompts found"

4. **Validation**
   - Check required columns (only "prompt" is required)
   - Validate values (type: video/image, variations: 2/4, etc.)
   - Show warnings for invalid rows: "Row 45: Invalid aspect ratio (skipped)"

5. **Import**
   - User clicks "Import"
   - Progress bar: "Importing 200 prompts..."
   - Prompts added to queue in batches (50 at a time to avoid UI lag)

6. **Success**
   - Modal closes
   - Success toast: "Imported 198/200 prompts. 2 rows skipped."
   - Queue view scrolls to show new prompts
   - New prompts have "imported" badge

**Inputs:**
- CSV file with columns: prompt, type, aspect_ratio, variations, preset

**Automation:**
- Parsing happens in background worker (non-blocking)
- Invalid rows skipped automatically

**Output:**
- N new prompts in queue (status: pending)

**Edge Cases:**
- **Malformed CSV**: Error "CSV parsing failed. Check file format."
- **Huge file** (>10,000 rows): Warning "Large file detected. This may take a few minutes."
- **Duplicate prompts**: Warning "50 duplicate prompts found. Import anyway?"

---

### Feature 5: AI Prompt Refinement

**Trigger:** User hovers over prompt card → Clicks "Refine with AI" icon (sparkle)

**Steps:**

1. **Refinement Starts**
   - Prompt card shows loading state: "Refining..."
   - Spinner replaces text temporarily

2. **API Call**
   - Original prompt sent to OpenAI API with refinement instructions
   - Request: "Enhance this prompt with technical details: [original prompt]"
   - Timeout: 30 seconds

3. **Replacement**
   - Refined prompt replaces original
   - Visual indicator: "✨ Enhanced" badge appears
   - Subtle animation (text fades in)

4. **Undo Option**
   - Tooltip appears: "Undo refinement"
   - Click to restore original text
   - Undo available for 30 seconds

**Inputs:**
- Original prompt text

**Automation:**
- API call automatic, no user input needed

**Output:**
- Enhanced prompt text
- Original text stored in `originalText` field (for undo)

**Edge Cases:**
- **API fails**: Error toast "Refinement failed. Try again?"
- **No improvement**: Warning "AI couldn't improve this prompt"
- **During processing**: Refinement disabled for processing prompts

---

### Feature 6: Keyboard Shortcuts & Command Palette

**Trigger:** User presses Cmd+K (or Ctrl+K on Windows)

**Steps:**

1. **Palette Opens**
   - Modal overlay with search input
   - Focus on search field
   - Placeholder: "Type a command or search..."

2. **Search**
   - User types: e.g., "gen"
   - Fuzzy search filters results:
     - "Generate Prompts" (matched)
     - "Generate Similar" (matched)
   - Arrow keys navigate results
   - Enter selects

3. **Action Execution**
   - Selected command executes
   - Palette closes
   - Relevant modal/view opens

**Available Commands:**
- `generate` → Open Generate Prompts modal
- `import` → Open CSV Import modal
- `export` → Export queue to CSV
- `start` → Start queue
- `pause` → Pause queue
- `clear` → Clear completed prompts
- `settings` → Open settings
- `logs` → View debug logs

**Keyboard Shortcuts:**
```
Cmd+K         Open command palette
Cmd+G         Generate prompts
Cmd+I         Import CSV
Cmd+E         Export CSV
Space         Pause/Resume queue
Cmd+Enter     Start queue
Escape        Close modal/dialog
```

---

## 6. Component Specification

### Shadcn UI Component Library

**Required Shadcn Components:**

1. **Button** (`components/ui/button.tsx`)
   - Variants: `default`, `destructive`, `outline`, `secondary`, `ghost`, `link`
   - Sizes: `default`, `sm`, `lg`, `icon`
   - Usage: All action buttons, CTA buttons

2. **Input** (`components/ui/input.tsx`)
   - Standard text input with focus states
   - Usage: API key, custom batch size, search

3. **Textarea** (`components/ui/textarea.tsx`)
   - Auto-resizing with min/max height
   - Usage: Context prompt, manual prompt entry, prompt editing

4. **Card** (`components/ui/card.tsx`)
   - Container for prompt cards
   - Variants: Default, with header/footer
   - Usage: Prompt cards, onboarding cards

5. **Badge** (`components/ui/badge.tsx`)
   - Variants: `default`, `secondary`, `destructive`, `outline`
   - Usage: Status indicators (pending, processing, completed), media type labels

6. **Dialog** (`components/ui/dialog.tsx`)
   - Modal overlay with backdrop
   - Usage: Generate modal, CSV import modal, confirmations

7. **DropdownMenu** (`components/ui/dropdown-menu.tsx`)
   - Context menus and action dropdowns
   - Usage: Settings menu, prompt card actions

8. **Tabs** (`components/ui/tabs.tsx`)
   - Horizontal tab navigation
   - Usage: Settings modal sections

9. **Progress** (`components/ui/progress.tsx`)
   - Linear progress bar
   - Usage: Generation progress, queue progress

10. **Toast** (`components/ui/toast.tsx`)
    - Notification system (via `useToast` hook)
    - Variants: `default`, `destructive`
    - Usage: Success messages, errors, warnings

11. **Switch** (`components/ui/switch.tsx`)
    - Toggle control
    - Usage: Enhanced prompts, auto-generate, settings toggles

12. **Select** (`components/ui/select.tsx`)
    - Dropdown selection
    - Usage: Batch size presets, media type, aspect ratio

13. **Command** (`components/ui/command.tsx`)
    - Command palette/search interface
    - Usage: Cmd+K quick actions

14. **Separator** (`components/ui/separator.tsx`)
    - Visual dividers
    - Usage: Section separators in settings, prompt card sections

15. **Slider** (`components/ui/slider.tsx`)
    - Range input control
    - Usage: Delay settings (min/max delay sliders)

16. **Accordion** (`components/ui/accordion.tsx`)
    - Collapsible sections
    - Usage: Completed prompts section, advanced settings

17. **ScrollArea** (`components/ui/scroll-area.tsx`)
    - Styled scrollable container
    - Usage: Prompt list, log viewer

18. **Skeleton** (`components/ui/skeleton.tsx`)
    - Loading placeholder
    - Usage: Loading states for prompt cards, generation

---

### Custom Component Designs

Beyond Shadcn base components, we need custom compositions:

#### 1. PromptCard Component

**Purpose:** Display individual prompt with actions

**Structure:**
```tsx
<Card className="prompt-card">
  <CardHeader>
    <div className="flex justify-between items-start">
      <div className="flex gap-2">
        <Badge variant="outline">{mediaType}</Badge>
        {aspectRatio && <Badge variant="secondary">{aspectRatio}</Badge>}
        {enhanced && <Badge variant="default">✨ Enhanced</Badge>}
      </div>
      <Badge className={statusColor}>{status}</Badge>
    </div>
  </CardHeader>

  <CardContent>
    <p className="prompt-text">{text}</p>
    {variations && <span className="text-sm text-muted-foreground">
      {variations} variations
    </span>}
  </CardContent>

  <CardFooter className="prompt-actions">
    <Button variant="ghost" size="icon" onClick={onEdit}>
      <Pencil className="h-4 w-4" />
    </Button>
    <Button variant="ghost" size="icon" onClick={onDuplicate}>
      <Copy className="h-4 w-4" />
    </Button>
    <Button variant="ghost" size="icon" onClick={onRefine}>
      <Sparkles className="h-4 w-4" />
    </Button>
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={onGenerateSimilar}>
          Generate Similar
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onDelete} className="text-destructive">
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </CardFooter>
</Card>
```

**Props:**
```ts
interface PromptCardProps {
  prompt: GeneratedPrompt;
  onEdit: (id: string) => void;
  onDuplicate: (id: string) => void;
  onRefine: (id: string) => void;
  onGenerateSimilar: (id: string) => void;
  onDelete: (id: string) => void;
  isEditing?: boolean;
}
```

**States:**
- Default: Idle state with actions hidden until hover
- Hover: Actions visible
- Editing: Card expands, textarea replaces text
- Processing: Pulsing border animation, actions disabled
- Completed: Reduced opacity (0.7), collapsible

---

#### 2. QueueControls Component

**Purpose:** Start/pause/stop queue with status display

**Structure:**
```tsx
<Card className="queue-controls">
  <CardHeader>
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Badge variant={isRunning ? 'default' : 'secondary'} className="text-sm">
          {isRunning ? (isPaused ? '⏸ Paused' : '▶ Running') : '⏹ Stopped'}
        </Badge>
        <span className="text-sm text-muted-foreground">
          {processedCount} / {totalCount} prompts
        </span>
      </div>

      <div className="flex gap-2">
        {!isRunning && (
          <Button onClick={onStart} className="w-32">
            Start Queue
          </Button>
        )}
        {isRunning && !isPaused && (
          <Button variant="secondary" onClick={onPause}>
            Pause
          </Button>
        )}
        {isRunning && isPaused && (
          <Button onClick={onResume}>
            Resume
          </Button>
        )}
        {isRunning && (
          <Button variant="destructive" onClick={onStop}>
            Stop
          </Button>
        )}
      </div>
    </div>
  </CardHeader>

  {isRunning && (
    <CardContent>
      <Progress value={(processedCount / totalCount) * 100} />
    </CardContent>
  )}
</Card>
```

**Props:**
```ts
interface QueueControlsProps {
  queueState: QueueState;
  totalCount: number;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
}
```

---

#### 3. GenerateModal Component

**Purpose:** Modal for AI prompt generation

**Structure:**
```tsx
<Dialog open={open} onOpenChange={onOpenChange}>
  <DialogContent className="sm:max-w-[600px]">
    <DialogHeader>
      <DialogTitle>Generate AI Prompts</DialogTitle>
      <DialogDescription>
        Describe what you want to create. AI will generate creative prompts for you.
      </DialogDescription>
    </DialogHeader>

    <div className="space-y-4">
      <div>
        <Label htmlFor="context">Context Prompt</Label>
        <Textarea
          id="context"
          value={context}
          onChange={(e) => setContext(e.target.value)}
          placeholder="e.g., Cinematic shots of futuristic cities at night"
          rows={4}
        />
        <span className="text-xs text-muted-foreground">
          {context.length}/500 characters
        </span>
      </div>

      <div>
        <Label htmlFor="batchSize">Batch Size</Label>
        <Select value={batchSize} onValueChange={setBatchSize}>
          <SelectTrigger id="batchSize">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10">10 prompts</SelectItem>
            <SelectItem value="25">25 prompts</SelectItem>
            <SelectItem value="50">50 prompts</SelectItem>
            <SelectItem value="100">100 prompts</SelectItem>
            <SelectItem value="custom">Custom...</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="enhanced"
          checked={enhanced}
          onCheckedChange={setEnhanced}
        />
        <Label htmlFor="enhanced">
          Enhanced Prompts
          <span className="block text-xs text-muted-foreground">
            Add technical cinematography details
          </span>
        </Label>
      </div>
    </div>

    {isGenerating && (
      <div className="space-y-2">
        <Progress value={progress} />
        <p className="text-sm text-center text-muted-foreground">
          Generating {generatedCount}/{batchSize} prompts...
        </p>
      </div>
    )}

    <DialogFooter>
      <Button variant="outline" onClick={onCancel} disabled={isGenerating}>
        Cancel
      </Button>
      <Button onClick={onGenerate} disabled={!context || isGenerating}>
        {isGenerating ? 'Generating...' : 'Generate Prompts'}
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

---

#### 4. StatusBar Component

**Purpose:** Header statistics display

**Structure:**
```tsx
<div className="status-bar flex items-center gap-4">
  <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
    <Clock className="h-3 w-3 mr-1" />
    {pendingCount} Pending
  </Badge>

  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
    <Play className="h-3 w-3 mr-1" />
    {processingCount} Processing
  </Badge>

  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
    <Check className="h-3 w-3 mr-1" />
    {completedCount} Completed
  </Badge>
</div>
```

**Props:**
```ts
interface StatusBarProps {
  pendingCount: number;
  processingCount: number;
  completedCount: number;
}
```

---

#### 5. EmptyState Component

**Purpose:** Friendly empty state for queue

**Structure:**
```tsx
<Card className="empty-state text-center py-12">
  <CardContent>
    <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
      <Inbox className="h-6 w-6 text-muted-foreground" />
    </div>
    <h3 className="text-lg font-semibold mb-2">No prompts yet</h3>
    <p className="text-sm text-muted-foreground mb-4">
      Generate AI prompts or import from CSV to get started
    </p>
    <div className="flex gap-2 justify-center">
      <Button onClick={onGenerate}>
        <Sparkles className="mr-2 h-4 w-4" />
        Generate Prompts
      </Button>
      <Button variant="outline" onClick={onImport}>
        <Upload className="mr-2 h-4 w-4" />
        Import CSV
      </Button>
    </div>
  </CardContent>
</Card>
```

---

### Component State Management Patterns

**Global State (via Zustand or Context):**
```ts
interface AppState {
  // Data
  config: PromptConfig;
  prompts: GeneratedPrompt[];
  queueState: QueueState;

  // UI State
  activeView: 'queue' | 'settings';
  selectedPromptId: string | null;
  isGenerateModalOpen: boolean;
  isSettingsOpen: boolean;

  // Actions
  setConfig: (config: Partial<PromptConfig>) => void;
  addPrompts: (prompts: GeneratedPrompt[]) => void;
  updatePrompt: (id: string, updates: Partial<GeneratedPrompt>) => void;
  deletePrompt: (id: string) => void;
  startQueue: () => void;
  pauseQueue: () => void;
  resumeQueue: () => void;
  stopQueue: () => void;
}
```

**Component-Level State:**
- Form inputs: `useState` for controlled inputs
- Modal open/close: `useState` for dialog visibility
- Loading states: `useState` for async operations
- Editing state: `useState` for inline editing

---

## 7. State & Data Management

### Data Structure (Chrome Storage)

**Storage Keys:**

1. **config** (sync storage)
```json
{
  "contextPrompt": "Last used context",
  "apiKey": "sk-...",
  "batchSize": 25,
  "mediaType": "video",
  "variationCount": 2,
  "useSecretPrompt": true,
  "autoGenerateOnEmpty": false,
  "autoGenerateOnReceived": false,
  "minDelayMs": 2000,
  "maxDelayMs": 5000,
  "setupCompleted": true
}
```

2. **prompts** (local storage)
```json
[
  {
    "id": "1234567890-1",
    "text": "Cinematic shot of...",
    "originalText": "Original before enhancement",
    "timestamp": 1705600000000,
    "status": "pending",
    "mediaType": "video",
    "aspectRatio": "16:9",
    "variations": 4,
    "preset": "cinematic",
    "enhanced": true
  }
]
```

3. **queueState** (local storage)
```json
{
  "isRunning": false,
  "isPaused": false,
  "currentPromptId": null,
  "processedCount": 0,
  "totalCount": 50
}
```

4. **history** (local storage)
```json
[
  {
    "id": "completed-prompt-id",
    "text": "Completed prompt",
    "timestamp": 1705600000000,
    "completedAt": 1705600100000,
    "status": "completed",
    "mediaType": "video"
  }
]
```

---

### UI State Representation

**Status Indicators:**

| Prompt Status | Badge Color | Icon | Card Border | Actions Enabled |
|---------------|-------------|------|-------------|-----------------|
| pending | Yellow | Clock | None | All |
| processing | Blue | Play | Blue, pulsing | View only |
| completed | Green | Check | None | View, duplicate |
| failed | Red | X | Red | Edit, retry, delete |
| editing | Purple | Pencil | Purple | Save, cancel |

**Queue State Representation:**

| State | Button | Badge | Progress Bar | Auto-Refresh |
|-------|--------|-------|--------------|--------------|
| Stopped | "Start Queue" | Gray "⏹ Stopped" | Hidden | No |
| Running | "⏸ Pause" + "⏹ Stop" | Blue "▶ Running" | Visible | Yes (2s) |
| Paused | "▶ Resume" + "⏹ Stop" | Yellow "⏸ Paused" | Visible | No |

---

### Data Persistence Strategy

**When to Save:**
1. **Config changes**: Immediate save on blur/change (debounced 500ms)
2. **Prompt edits**: Save on "Save" button click
3. **Prompt additions**: Batch save when generation completes
4. **Queue state**: Save every status change (start, pause, stop, prompt completion)
5. **Delete actions**: Immediate save

**Storage Quotas:**
- Chrome sync storage: 100KB (config only)
- Chrome local storage: 10MB (prompts, history, queue state)
- Strategy: Keep max 5000 prompts, auto-archive old completed prompts

**Data Migration:**
- Version field in config: `{ configVersion: 2 }`
- Migration functions run on startup if version mismatch

---

### Real-Time Updates

**Polling Strategy:**
- Poll queue state every 2 seconds when queue is running
- Stop polling when queue is stopped
- Use `setInterval` in popup, `chrome.storage.onChanged` listener

**Optimistic Updates:**
- UI updates immediately for user actions (edit, delete)
- If backend fails, rollback UI change and show error
- Example: Delete prompt → Remove from UI → If API fails → Restore + error toast

---

## 8. Automation & Background Tasks

### Automated Triggers

1. **Queue Processing**
   - **Trigger**: User clicks "Start Queue"
   - **Automation**: Background worker processes queue until empty or stopped
   - **Frequency**: Continuous loop with delays
   - **User Visibility**: Status updates in real-time

2. **Auto-Generate on Empty**
   - **Trigger**: Queue finishes all prompts AND `autoGenerateOnEmpty: true`
   - **Automation**: Generate new batch with last-used context
   - **Frequency**: Once per queue completion
   - **User Visibility**: Toast notification "Auto-generating new batch..."

3. **Auto-Generate on Received**
   - **Trigger**: User adds prompts manually or via CSV AND `autoGenerateOnReceived: true`
   - **Automation**: Generate additional prompts to supplement
   - **Frequency**: Once per manual add
   - **User Visibility**: Badge "AI supplement" on generated prompts

4. **Retry Failed Prompts**
   - **Trigger**: Prompt fails to submit (network error, etc.)
   - **Automation**: Retry 3 times with exponential backoff (2s, 4s, 8s)
   - **Frequency**: Per failed prompt
   - **User Visibility**: Status badge "Retrying (2/3)..."

---

### Background Operations

**Operations Running in Background Service Worker:**

1. **Prompt Generation (OpenAI API)**
   - Runtime: 5-30 seconds (depending on batch size)
   - User notification: Progress bar in Generate modal
   - Cancellable: Yes (abort API request)

2. **Queue Processing**
   - Runtime: Hours (for large queues)
   - User notification: Progress bar + status badges
   - Cancellable: Yes (pause/stop buttons)

3. **CSV Parsing**
   - Runtime: 1-10 seconds (depending on file size)
   - User notification: Loading spinner in import modal
   - Cancellable: No (fast enough)

4. **Prompt Refinement (OpenAI API)**
   - Runtime: 3-10 seconds per prompt
   - User notification: Spinner on prompt card
   - Cancellable: No (implicit via card actions)

---

### Notification Strategy

**Toast Notifications (Shadcn Toast):**

| Event | Type | Duration | Message |
|-------|------|----------|---------|
| Prompts generated | Success | 3s | "Generated 25 prompts!" |
| Queue started | Info | 2s | "Queue started. Processing..." |
| Queue completed | Success | 5s | "Queue complete! 50/50 prompts submitted." |
| Prompt failed | Error | 5s | "Failed to submit prompt. Retrying..." |
| API key invalid | Error | Persistent | "Invalid API key. Check settings." |
| CSV imported | Success | 3s | "Imported 200 prompts from CSV" |
| CSV error | Error | 5s | "CSV parsing failed. Check format." |

**Badge Notifications (In-App):**
- Extension icon badge: Show pending count (e.g., "23")
- Only when queue is running
- Clear when queue stops or completes

**Browser Notifications (Optional):**
- Queue complete: "Sora Queue finished processing 50 prompts"
- Requires permission, opt-in via settings
- Only when extension is closed

---

### Monitoring Ongoing Tasks

**Queue Progress Monitoring:**
- Progress bar in QueueControls component
- Text: "12/50 prompts • 38 remaining"
- Estimated time remaining (based on average delay): "~5 minutes left"

**Generation Progress Monitoring:**
- Progress bar in Generate modal
- Text: "Generating 15/25 prompts..."
- Incremental updates as API returns batches

**Background Task Indicators:**
- Spinner icon in header when background tasks active
- Tooltip on hover: "Generating prompts..." or "Processing queue..."

---

## 9. Technical Integration Points

### Chrome Extension APIs Used

1. **chrome.storage.local** - Prompts, queue state, history
2. **chrome.storage.sync** - Config (synced across devices)
3. **chrome.runtime.sendMessage** - Popup ↔ Background communication
4. **chrome.tabs.query** - Find Sora.com tab
5. **chrome.tabs.sendMessage** - Popup → Content script commands
6. **chrome.scripting.executeScript** - Inject content script into Sora tab
7. **chrome.notifications** - Optional browser notifications

---

### Page Elements to Interact With (Sora.com)

**Selectors (May need updates if Sora changes):**

1. **Prompt Input Field**
   - Selector: `textarea[placeholder*="prompt"]` or `#prompt-input`
   - Action: Type prompt text with human-like delays

2. **Media Type Toggle**
   - Selector: `button[aria-label*="video"]` or `.media-toggle`
   - Action: Click to set video/image mode

3. **Aspect Ratio Dropdown**
   - Selector: `select[name="aspectRatio"]` or `.aspect-ratio-select`
   - Action: Select from dropdown

4. **Variations Control**
   - Selector: `input[name="variations"]` or `.variations-input`
   - Action: Set value (2 or 4)

5. **Submit Button**
   - Selector: `button[type="submit"]` or `.generate-button`
   - Action: Click to submit

6. **Loading Indicator**
   - Selector: `.spinner`, `.loading`, `[aria-busy="true"]`
   - Action: Wait until disappears (prompt completed)

7. **Error Messages**
   - Selector: `.error-message`, `[role="alert"]`
   - Action: Read text, log error, mark prompt as failed

---

### DOM Manipulation Requirements

**Content Script Actions:**

1. **Inject Prompt**
   ```ts
   const textarea = document.querySelector('textarea#prompt');
   if (textarea) {
     // Simulate human typing
     for (const char of promptText) {
       textarea.value += char;
       textarea.dispatchEvent(new Event('input', { bubbles: true }));
       await delay(30 + Math.random() * 50); // 30-80ms per char
     }
   }
   ```

2. **Set Media Type**
   ```ts
   const videoButton = document.querySelector('button[data-media="video"]');
   if (videoButton && !videoButton.classList.contains('active')) {
     videoButton.click();
     await delay(100);
   }
   ```

3. **Submit Form**
   ```ts
   const submitButton = document.querySelector('button[type="submit"]');
   if (submitButton && !submitButton.disabled) {
     submitButton.click();
   }
   ```

4. **Wait for Completion**
   ```ts
   await new Promise((resolve) => {
     const observer = new MutationObserver(() => {
       const loader = document.querySelector('.loading-spinner');
       if (!loader) {
         observer.disconnect();
         resolve();
       }
     });
     observer.observe(document.body, { childList: true, subtree: true });
   });
   ```

---

### API Calls Needed

1. **OpenAI Chat Completions API**
   - **Endpoint**: `https://api.openai.com/v1/chat/completions`
   - **Method**: POST
   - **Auth**: Bearer token (API key)
   - **Payload**:
   ```json
   {
     "model": "gpt-4",
     "messages": [
       {
         "role": "system",
         "content": "You are a creative prompt generator for AI video/image generation."
       },
       {
         "role": "user",
         "content": "Generate 25 creative prompts for: [context]"
       }
     ],
     "temperature": 0.8,
     "max_tokens": 2000
   }
   ```
   - **Response**: Array of generated prompts

2. **Chrome Storage API**
   - **Get**: `chrome.storage.local.get(['prompts', 'queueState'])`
   - **Set**: `chrome.storage.local.set({ prompts: [...] })`
   - **Listen**: `chrome.storage.onChanged.addListener(...)`

---

### Background Message Passing

**Message Types (Popup → Background):**

```ts
type MessageAction =
  | 'generatePrompts'    // Generate AI prompts
  | 'startQueue'         // Start queue processing
  | 'pauseQueue'         // Pause queue
  | 'resumeQueue'        // Resume queue
  | 'stopQueue'          // Stop queue
  | 'promptAction'       // Edit/delete/refine prompt
  | 'getLogs'            // Fetch debug logs
  | 'exportLogs'         // Export logs to file
  | 'clearLogs';         // Clear all logs

interface Message {
  action: MessageAction;
  data?: any;
}

interface Response {
  success: boolean;
  data?: any;
  error?: string;
}

// Example usage
const response = await chrome.runtime.sendMessage({
  action: 'generatePrompts',
  data: {
    context: 'Cinematic underwater scenes',
    count: 25,
    mediaType: 'video',
    useSecretPrompt: true
  }
});
```

**Message Types (Content Script → Background):**

```ts
type ContentMessage =
  | 'promptSubmitted'    // Prompt successfully submitted
  | 'promptFailed'       // Prompt submission failed
  | 'pageStateChange';   // Sora page state changed

// Example
chrome.runtime.sendMessage({
  action: 'promptSubmitted',
  data: { promptId: '12345', timestamp: Date.now() }
});
```

---

## 10. Design Rationale

### Key Decision Explanations

#### Decision 1: From 6 Tabs to 1 Primary View

**Problem**: Current 6-tab structure creates cognitive overload. Users must remember which tab contains which feature.

**Solution**: Collapse to single Queue View as primary workspace. Move infrequent actions to:
- Modals (Generate, Import)
- Dropdown menus (Settings, Export)
- Command palette (Power users)

**Why This Works**:
- **Reduces cognitive load**: One screen to monitor, not six
- **Matches mental model**: Users think "I have a queue to manage," not "I need to visit 6 different places"
- **Faster workflows**: Generate → Queue → Done (no tab switching)
- **Scales better**: Easy to add new features without cluttering navigation

**Trade-offs**:
- Settings less discoverable → Mitigated by prominent gear icon
- Manual entry less obvious → Mitigated by command palette + import modal
- Debug logs hidden → Acceptable (power user feature, not daily use)

---

#### Decision 2: Inline Editing vs. Modal Editing

**Problem**: Current approach requires switching to edit mode, saving, switching back.

**Solution**: Hover actions + inline contenteditable for quick edits. Modal only for complex changes.

**Why This Works**:
- **Speed**: Click → Edit → Save in same location (0 context switches)
- **Visual continuity**: Card stays in place, user doesn't lose context
- **Accessibility**: Still keyboard-navigable (Tab to card → Enter to edit → Esc to cancel)

**Alternatives Considered**:
- **Modal editing**: Too heavy for simple text changes
- **Separate edit view**: Breaks continuity, adds navigation burden

---

#### Decision 3: Command Palette for Power Users

**Problem**: Frequent users want speed, new users want clarity. Hard to serve both.

**Solution**: Dual interface:
- **Visual UI**: Buttons, cards, modals for new users
- **Command palette**: Keyboard shortcuts for power users

**Why This Works**:
- **Progressive enhancement**: New users don't see complexity
- **Power user delight**: Cmd+K → "generate" → Enter (3 keystrokes vs. 2 clicks + form)
- **Discoverability**: Palette shows all available actions (helps learning)

**Example Flow**:
- New user: Click "+ Generate" → Fill form → Click "Generate"
- Power user: Cmd+K → "gen" → Enter → Cmd+Enter (4 keystrokes total)

---

#### Decision 4: Status-Based Color Coding

**Problem**: Users can't quickly identify prompt status in large queues.

**Solution**: Three-color system:
- Yellow: Pending (action required)
- Blue: Processing (in progress)
- Green: Completed (done)

**Why This Works**:
- **Universal recognition**: Traffic light metaphor (yellow = wait, green = go)
- **Accessibility**: Not relying only on color (icons + text labels too)
- **Scannable**: User can glance and see "5 yellow badges = 5 pending"

**Alternatives Considered**:
- **Emoji-only**: Not professional, hard to scan
- **More colors**: Confusing (what does orange mean?)
- **No color**: Boring, harder to parse visually

---

#### Decision 5: Auto-Save Everything

**Problem**: Users lose work if browser crashes or they forget to save.

**Solution**: Eliminate "Save" buttons for non-destructive actions. Auto-save on every change.

**Why This Works**:
- **Zero data loss**: Config changes, prompt edits, queue state all persist immediately
- **Less friction**: No "Did you save?" anxiety
- **Matches modern UX**: Google Docs, Notion, etc. don't have save buttons

**Where We Keep "Save"**:
- Destructive actions (Clear Queue)
- Explicit commits (CSV Import → "Import" button)

---

#### Decision 6: Modal Overlays Instead of New Tabs

**Problem**: Opening settings in a new tab (old approach) loses context.

**Solution**: Use modals for secondary actions (settings, generate, import).

**Why This Works**:
- **Context preservation**: Queue view stays visible in background
- **Faster transitions**: Modal opens instantly, no page load
- **Escape hatch**: Press Esc to close, return to queue immediately

**When Not to Use Modals**:
- Complex multi-step wizards (better as separate view)
- Content that needs to stay open while working (use sidebar instead)

---

#### Decision 7: Real-Time Polling vs. WebSockets

**Problem**: Queue status needs to update without user refresh.

**Solution**: Poll Chrome storage every 2 seconds when queue is running.

**Why This Works**:
- **Simple**: No server required (everything is local)
- **Reliable**: Chrome storage events + polling = redundant updates
- **Battery-friendly**: Polling stops when queue stops

**Alternatives Considered**:
- **WebSockets**: Overkill for local extension (adds complexity)
- **chrome.storage.onChanged only**: Misses updates if listener fails
- **No polling**: Requires manual refresh (bad UX)

---

#### Decision 8: Empty States with Clear CTAs

**Problem**: New users open extension and see blank screen. What do they do?

**Solution**: Empty state with visual icon, explanation, and primary CTA.

**Why This Works**:
- **Onboarding built-in**: Empty state teaches user what extension does
- **Reduces support burden**: Users don't need to read docs to start
- **Delightful**: Friendly illustration + helpful text (not just "No data")

**Example**:
```
Icon: Inbox
Title: "No prompts yet"
Description: "Generate AI prompts or import from CSV to get started"
Actions: [Generate Prompts] [Import CSV]
```

---

#### Decision 9: Shadcn UI Instead of Custom CSS

**Problem**: Current 640-line CSS file is hard to maintain, no design system.

**Solution**: Adopt Shadcn UI + Tailwind CSS.

**Why This Works**:
- **Design consistency**: Pre-built components with cohesive styling
- **Accessibility**: Shadcn components have ARIA labels built-in
- **Developer velocity**: Copy-paste components, customize with Tailwind
- **Maintenance**: Fewer custom styles to debug
- **Professional aesthetic**: Modern, clean design out of the box

**Migration Strategy**:
- Keep existing functionality, replace UI components incrementally
- Start with high-impact components (buttons, cards, modals)
- Remove old CSS as components are replaced

---

#### Decision 10: Progress Bars for Long Operations

**Problem**: Users don't know if generation is working or hung.

**Solution**: Show progress bar with live updates for async operations.

**Why This Works**:
- **Reduces perceived wait time**: Progress bars make waits feel 20-30% shorter (UX research)
- **Builds trust**: User sees system is working, not frozen
- **Actionable**: User can estimate time remaining

**Where to Use**:
- Prompt generation: "Generating 15/25 prompts..."
- Queue processing: "12/50 prompts submitted"
- CSV import: "Parsing 200 rows..."

---

## 11. Implementation Roadmap

### Phase 1: Setup & Foundation (Week 1)

**Goal**: Set up Shadcn UI, Tailwind CSS, and component structure

**Tasks**:
1. Install dependencies:
   ```bash
   npm install tailwindcss @tailwindcss/forms
   npm install class-variance-authority clsx tailwind-merge
   npm install lucide-react  # Icon library
   ```

2. Initialize Tailwind config:
   ```js
   // tailwind.config.js
   module.exports = {
     content: ['./src/**/*.{ts,tsx}'],
     theme: {
       extend: {
         colors: {
           border: 'hsl(var(--border))',
           input: 'hsl(var(--input))',
           ring: 'hsl(var(--ring))',
           background: 'hsl(var(--background))',
           foreground: 'hsl(var(--foreground))',
           primary: {
             DEFAULT: 'hsl(var(--primary))',
             foreground: 'hsl(var(--primary-foreground))',
           },
           // ... rest of Shadcn color tokens
         },
       },
     },
     plugins: [require('@tailwindcss/forms')],
   };
   ```

3. Create component directory structure:
   ```
   src/
   ├── components/
   │   ├── ui/              # Shadcn components
   │   │   ├── button.tsx
   │   │   ├── card.tsx
   │   │   ├── dialog.tsx
   │   │   ├── badge.tsx
   │   │   ├── input.tsx
   │   │   ├── textarea.tsx
   │   │   └── ...
   │   ├── PromptCard.tsx
   │   ├── QueueControls.tsx
   │   ├── GenerateModal.tsx
   │   ├── StatusBar.tsx
   │   └── EmptyState.tsx
   ├── lib/
   │   └── utils.ts        # cn() helper for Tailwind
   └── styles/
       └── globals.css     # Shadcn CSS variables
   ```

4. Set up CSS variables in `globals.css`:
   ```css
   @tailwind base;
   @tailwind components;
   @tailwind utilities;

   @layer base {
     :root {
       --background: 0 0% 100%;
       --foreground: 222.2 84% 4.9%;
       --primary: 221.2 83.2% 53.3%;
       --primary-foreground: 210 40% 98%;
       /* ... rest of Shadcn variables */
     }
   }
   ```

**Deliverables**:
- Tailwind configured and working
- All Shadcn UI components installed in `src/components/ui/`
- Basic component structure created

---

### Phase 2: Core Components (Week 2)

**Goal**: Build reusable components with Shadcn UI

**Tasks**:

1. **PromptCard Component**
   - Layout: Card with header, content, footer
   - Props: prompt data, action handlers
   - States: default, hover, editing, processing
   - Actions: Edit, duplicate, refine, delete

2. **QueueControls Component**
   - Layout: Card with status + buttons
   - Props: queue state, handlers
   - Dynamic buttons based on state (start/pause/resume/stop)
   - Progress bar integration

3. **StatusBar Component**
   - Layout: Horizontal badges
   - Props: counts (pending, processing, completed)
   - Color-coded badges (yellow, blue, green)

4. **EmptyState Component**
   - Layout: Centered card with icon + text
   - Props: icon, title, description, actions
   - CTAs: Generate, Import

5. **GenerateModal Component**
   - Layout: Dialog with form
   - Form fields: context, batch size, enhanced toggle
   - Validation: required fields, char limits
   - Loading state with progress bar

**Deliverables**:
- 5 custom components fully functional
- Storybook or component playground (optional)
- Unit tests for components

---

### Phase 3: Queue View (Week 3)

**Goal**: Implement primary Queue View with all components

**Tasks**:

1. **Header Section**
   - Logo + title
   - StatusBar component
   - Primary actions: "+ Generate" button, settings gear
   - Command palette trigger (Cmd+K hint)

2. **Queue Controls Section**
   - Integrate QueueControls component
   - Connect to queue state from storage
   - Wire up start/pause/resume/stop handlers

3. **Prompt List Section**
   - Map prompts to PromptCard components
   - Implement infinite scroll (react-window or virtualized list)
   - Group by status (pending, processing, completed)
   - Collapsible completed section (Accordion)

4. **Empty State**
   - Show when prompts.length === 0
   - Integrate EmptyState component

5. **Real-Time Updates**
   - Set up polling: `setInterval(() => loadData(), 2000)`
   - Update UI when storage changes
   - Optimistic UI updates for user actions

**Deliverables**:
- Fully functional Queue View
- Real-time status updates working
- Responsive layout (600px width)

---

### Phase 4: Modals & Dialogs (Week 4)

**Goal**: Implement all modal interfaces

**Tasks**:

1. **Generate Modal**
   - Form validation (context required, batch size 1-200)
   - API integration (OpenAI call in background)
   - Live progress updates (0/25 prompts...)
   - Error handling (API key invalid, network error)

2. **Settings Modal**
   - Tabbed sections (General, API, Queue, Advanced)
   - Form fields for all config options
   - Auto-save on change (debounced)
   - Validation (delays must be positive, API key format)

3. **CSV Import Modal**
   - File upload (drag-and-drop + browse)
   - CSV parsing (use existing CSVParser utility)
   - Preview table (first 5 rows)
   - Import button + progress

4. **Confirmation Dialogs**
   - Delete prompt: "Delete this prompt?"
   - Clear queue: "Clear all prompts? This cannot be undone."
   - Stop queue: "Stop queue? Current prompt will finish."

**Deliverables**:
- All modals functional
- Form validation working
- CSV import tested with large files

---

### Phase 5: Command Palette (Week 5)

**Goal**: Add keyboard-first navigation for power users

**Tasks**:

1. **Command Palette Component**
   - Use Shadcn Command component
   - Fuzzy search (use fuse.js or built-in)
   - Keyboard navigation (arrow keys, Enter)

2. **Command Definitions**
   - List of all actions:
     - Generate prompts
     - Import CSV
     - Export CSV
     - Start/pause/resume/stop queue
     - Clear completed
     - View logs
     - Open settings

3. **Keyboard Shortcuts**
   - Global listener: `document.addEventListener('keydown', ...)`
   - Shortcuts:
     - Cmd+K: Open palette
     - Cmd+G: Generate
     - Cmd+I: Import
     - Cmd+E: Export
     - Space: Pause/resume
     - Escape: Close modals

4. **Visual Hints**
   - Show shortcuts in buttons (e.g., "Generate (Cmd+G)")
   - Tooltip on hover: "Press Cmd+K to open command palette"

**Deliverables**:
- Command palette functional
- All keyboard shortcuts working
- Help modal showing shortcuts (optional)

---

### Phase 6: Polish & Accessibility (Week 6)

**Goal**: Refine UX, ensure accessibility, optimize performance

**Tasks**:

1. **Accessibility Audit**
   - ARIA labels on all interactive elements
   - Keyboard navigation tested (Tab order correct)
   - Screen reader testing (NVDA or VoiceOver)
   - Focus indicators visible
   - Color contrast meets WCAG AA (4.5:1 minimum)

2. **Loading States**
   - Skeleton loaders for slow operations (Shadcn Skeleton)
   - Spinners for inline actions
   - Progress bars for long tasks
   - Disable buttons during async operations

3. **Error States**
   - Toast notifications for errors (Shadcn Toast)
   - Inline validation errors (form fields)
   - Retry buttons for failed operations
   - Clear error messages (no "Error 500")

4. **Performance Optimization**
   - Virtualized list for 500+ prompts (react-window)
   - Debounce config saves (500ms)
   - Lazy load modals (React.lazy + Suspense)
   - Minimize re-renders (React.memo, useMemo)

5. **Visual Polish**
   - Animations (Framer Motion or CSS transitions)
     - Fade in for new prompts
     - Slide in for modals
     - Pulse for processing status
   - Micro-interactions (button hover, card lift)
   - Dark mode support (use Shadcn dark theme)

**Deliverables**:
- Accessibility score 95+ (Lighthouse)
- No janky animations (60fps)
- All states polished (loading, error, empty, success)

---

### Phase 7: Testing & Bug Fixes (Week 7)

**Goal**: Comprehensive testing, fix edge cases

**Tasks**:

1. **Unit Tests**
   - Test all components (React Testing Library)
   - Test utilities (storage, csvParser, etc.)
   - Coverage target: 80%

2. **Integration Tests**
   - Test full workflows:
     - Generate → Queue → Process
     - Import CSV → Edit → Export
     - Settings changes persist
   - Test error scenarios:
     - API key invalid
     - Network failure
     - Sora tab closed

3. **Manual Testing**
   - Test on different screen sizes (600px popup constraint)
   - Test with 10, 100, 1000 prompts (performance)
   - Test keyboard navigation (no mouse)
   - Test screen reader (NVDA)

4. **Bug Fixes**
   - Fix issues found in testing
   - Edge case handling (empty queues, missing API key, etc.)
   - Cross-browser testing (Chrome, Edge)

**Deliverables**:
- 80% test coverage
- All critical bugs fixed
- Manual testing checklist completed

---

### Phase 8: Documentation & Launch (Week 8)

**Goal**: Finalize documentation, prepare for release

**Tasks**:

1. **Update README**
   - Screenshots of new UI
   - Updated feature list
   - Installation instructions

2. **Create User Guide**
   - Quick start tutorial
   - Feature documentation
   - Keyboard shortcuts cheat sheet
   - FAQ (common issues)

3. **Developer Documentation**
   - Component API docs
   - State management guide
   - Build process (Tailwind + esbuild)

4. **Migration Guide**
   - How to migrate from v1.0 to v2.0
   - Breaking changes (if any)
   - Data migration (config structure changes)

5. **Chrome Web Store Submission**
   - Update store listing (description, screenshots)
   - Submit for review
   - Monitor for approval

**Deliverables**:
- Complete documentation
- Chrome Web Store listing updated
- v2.0 released

---

### File Structure (New)

```
extension-sora-auto-queue-prompts/
├── src/
│   ├── components/
│   │   ├── ui/                    # Shadcn components (17 components)
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── input.tsx
│   │   │   ├── textarea.tsx
│   │   │   ├── select.tsx
│   │   │   ├── switch.tsx
│   │   │   ├── tabs.tsx
│   │   │   ├── toast.tsx
│   │   │   ├── progress.tsx
│   │   │   ├── command.tsx
│   │   │   ├── separator.tsx
│   │   │   ├── slider.tsx
│   │   │   ├── accordion.tsx
│   │   │   ├── scroll-area.tsx
│   │   │   └── skeleton.tsx
│   │   ├── PromptCard.tsx
│   │   ├── QueueControls.tsx
│   │   ├── GenerateModal.tsx
│   │   ├── SettingsModal.tsx
│   │   ├── CSVImportModal.tsx
│   │   ├── StatusBar.tsx
│   │   ├── EmptyState.tsx
│   │   ├── CommandPalette.tsx
│   │   ├── Header.tsx
│   │   └── QueueView.tsx
│   ├── hooks/
│   │   ├── useQueue.ts            # Queue state management
│   │   ├── usePrompts.ts          # Prompts CRUD operations
│   │   ├── useConfig.ts           # Config management
│   │   ├── useKeyboardShortcuts.ts
│   │   └── useToast.ts            # Toast notifications
│   ├── lib/
│   │   ├── utils.ts               # cn() helper, date formatters
│   │   └── constants.ts           # App constants
│   ├── styles/
│   │   └── globals.css            # Tailwind + Shadcn variables
│   ├── utils/                     # Existing utilities (keep)
│   │   ├── storage.ts
│   │   ├── promptGenerator.ts
│   │   ├── csvParser.ts
│   │   ├── queueProcessor.ts
│   │   ├── promptActions.ts
│   │   └── logger.ts
│   ├── types/
│   │   └── index.ts               # Existing types
│   ├── popup.tsx                  # Main entry point (refactored)
│   ├── background.ts              # Unchanged
│   └── content.ts                 # Unchanged
├── tailwind.config.js
├── postcss.config.js
├── components.json                # Shadcn config
└── package.json
```

---

### Migration Strategy (From Current UI to New UI)

**Approach: Incremental Migration (Avoid Big Bang)**

1. **Phase 1: Parallel Implementation**
   - Keep old popup.tsx as `popup-legacy.tsx`
   - Create new `popup.tsx` with Shadcn UI
   - Feature flag: `USE_NEW_UI` in config
   - Users can switch between old/new UI in settings

2. **Phase 2: Feature Parity**
   - Ensure new UI has 100% feature parity with old UI
   - Test side-by-side with users
   - Gather feedback, iterate

3. **Phase 3: Default to New UI**
   - Make new UI the default
   - Keep legacy UI accessible via settings toggle
   - Announce deprecation timeline (e.g., "Legacy UI will be removed in v2.1")

4. **Phase 4: Remove Legacy**
   - After 1-2 months, remove old UI
   - Delete `popup-legacy.tsx` and old CSS
   - Celebrate clean codebase

**Rollback Plan**:
- If critical bugs found, re-enable legacy UI as default
- Fix bugs in new UI, re-release
- Never delete legacy code until new UI is stable

---

### Styling Approach (Tailwind CSS)

**Tailwind Configuration:**

```js
// tailwind.config.js
module.exports = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Shadcn UI color tokens
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'pulse-border': {
          '0%, 100%': { borderColor: 'hsl(var(--primary))' },
          '50%': { borderColor: 'hsl(var(--primary) / 0.5)' },
        },
      },
      animation: {
        'pulse-border': 'pulse-border 2s ease-in-out infinite',
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
};
```

**Global Styles (globals.css):**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 221.2 83.2% 53.3%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 221.2 83.2% 53.3%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 217.2 91.2% 59.8%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 224.3 76.3% 48%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
    font-feature-settings: "rlig" 1, "calt" 1;
  }
}

/* Custom utility classes */
@layer utilities {
  .popup-container {
    @apply w-[600px] min-h-[500px] max-h-[700px] p-4 bg-background overflow-y-auto;
  }

  .prompt-card-processing {
    @apply animate-pulse-border;
  }
}
```

**Component Styling Example:**

```tsx
// PromptCard.tsx
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function PromptCard({ prompt, onEdit, onDelete }: PromptCardProps) {
  return (
    <Card
      className={cn(
        'transition-all duration-200 hover:shadow-md',
        prompt.status === 'processing' && 'border-primary prompt-card-processing',
        prompt.status === 'completed' && 'opacity-70'
      )}
    >
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="flex gap-2">
          <Badge variant="outline">{prompt.mediaType}</Badge>
          {prompt.enhanced && (
            <Badge variant="default" className="gap-1">
              <Sparkles className="h-3 w-3" />
              Enhanced
            </Badge>
          )}
        </div>
        <Badge className={getStatusColor(prompt.status)}>
          {prompt.status}
        </Badge>
      </CardHeader>

      <CardContent>
        <p className="text-sm leading-relaxed">{prompt.text}</p>
        {prompt.variations && (
          <span className="text-xs text-muted-foreground mt-2 block">
            {prompt.variations} variations
          </span>
        )}
      </CardContent>

      <CardFooter className="gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button variant="ghost" size="icon" onClick={() => onEdit(prompt.id)}>
          <Pencil className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => onDelete(prompt.id)}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}

function getStatusColor(status: string) {
  switch (status) {
    case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'processing': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'completed': return 'bg-green-100 text-green-800 border-green-200';
    case 'failed': return 'bg-red-100 text-red-800 border-red-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}
```

---

## Accessibility Checklist

- [ ] All interactive elements are keyboard-accessible (Tab navigation)
- [ ] Focus indicators are visible (ring utility class)
- [ ] ARIA labels on icon-only buttons
- [ ] Form fields have associated labels (for attribute)
- [ ] Error messages are announced to screen readers (aria-live)
- [ ] Modal dialogs trap focus (can't Tab out accidentally)
- [ ] Color contrast meets WCAG AA (4.5:1 minimum)
- [ ] Images have alt text (icon components have aria-label)
- [ ] Headings follow semantic order (h1 → h2 → h3)
- [ ] Buttons have descriptive text (not just "Click here")
- [ ] Loading states are announced (aria-busy, aria-live)
- [ ] Status changes are announced (toast notifications)

---

## Performance Optimization Checklist

- [ ] Virtualized list for 500+ prompts (react-window)
- [ ] Lazy load modals (React.lazy + Suspense)
- [ ] Debounce config saves (500ms)
- [ ] Memoize expensive computations (useMemo)
- [ ] Prevent unnecessary re-renders (React.memo)
- [ ] Optimize bundle size (tree-shaking, code splitting)
- [ ] Minimize Tailwind CSS (PurgeCSS removes unused classes)
- [ ] Use CSS transitions instead of JS animations
- [ ] Batch storage writes (don't save on every keystroke)
- [ ] Throttle scroll handlers (IntersectionObserver for infinite scroll)

---

## Dark Mode Support

**Implementation:**

1. Add dark mode toggle to settings:
   ```tsx
   <Switch
     checked={darkMode}
     onCheckedChange={(checked) => {
       setDarkMode(checked);
       document.documentElement.classList.toggle('dark', checked);
     }}
   />
   ```

2. Persist preference in config:
   ```ts
   interface PromptConfig {
     // ... existing fields
     darkMode: boolean;
   }
   ```

3. Apply dark class on mount:
   ```tsx
   useEffect(() => {
     if (config.darkMode) {
       document.documentElement.classList.add('dark');
     }
   }, [config.darkMode]);
   ```

4. Ensure all components use Shadcn color tokens (automatic dark mode support)

---

## Browser Compatibility

**Target:** Chrome 90+ (Manifest V3 requirement)

**Features to Test:**
- CSS Grid (queue layout)
- CSS Custom Properties (Shadcn color tokens)
- ES2020 (esbuild output)
- Chrome Extension APIs (Manifest V3)

**Fallbacks:** None required (Chrome 90+ supports all features)

---

## Final Notes

This UX redesign document serves as the complete blueprint for implementing a professional, minimalistic, Shadcn UI-based interface for the Sora Auto Queue Prompts extension. Every design decision is justified with user research principles and practical implementation guidance.

**Key Success Metrics After Launch:**
- **Task completion time**: < 2 minutes from open to queue running (50% reduction from current)
- **User satisfaction**: 4.5+ stars on Chrome Web Store
- **Support ticket volume**: 50% reduction (due to clearer UX)
- **Feature adoption**: 80% of users use command palette within 1 week (power user delight)

**Next Steps:**
1. Review this document with stakeholders
2. Begin Phase 1 implementation (Setup & Foundation)
3. Weekly check-ins to track progress against 8-week roadmap
4. User testing sessions after Phase 4 (modals complete)
5. Beta release after Phase 7 (testing complete)
6. Public launch after Phase 8 (documentation ready)

---

**Document Version**: 2.0
**Last Updated**: 2025-01-18
**Author**: UX Architecture Team
**Status**: Ready for Implementation

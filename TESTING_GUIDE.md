# Testing Guide - UI/UX Improvements

## Loading the Extension in Chrome

1. **Open Chrome Extensions Page**
   - Navigate to `chrome://extensions/`
   - Or: Chrome Menu → More Tools → Extensions

2. **Enable Developer Mode**
   - Toggle "Developer mode" switch in the top-right corner

3. **Load the Extension**
   - Click "Load unpacked"
   - Navigate to: `/Applications/Github/extension-sora-auto-queue-prompts/dist`
   - Select the folder and click "Select"

4. **Pin the Extension** (Optional)
   - Click the puzzle icon in Chrome toolbar
   - Find "Sora Auto Queue Prompts"
   - Click the pin icon to keep it visible

## Testing New Features

### 1. Search Functionality
- Click the extension icon to open popup
- Type in the search bar to filter prompts
- Test with various search terms
- Click the X button to clear search

### 2. Filter Functionality
- Use status filter buttons (All, Pending, Processing, Completed, Failed)
- Use media type filter buttons (All Types, Video, Image)
- Combine filters with search
- Check the result count badge
- Click "Clear" to reset filters

### 3. Dark Mode
- Click the moon/sun icon in the header
- Verify all components adapt to dark mode
- Close and reopen extension - dark mode should persist

### 4. Keyboard Shortcuts
- Press `⌘K` (Mac) or `Ctrl+K` (Windows/Linux) to focus search
- Press `⌘N` (Mac) or `Ctrl+N` (Windows/Linux) to open generate dialog
- Press `Escape` to close any open dialog

### 5. Export Functionality
- Click "Export" button when prompts are visible
- Select export format (CSV, JSON, TXT)
- Verify file downloads correctly
- Check file contents match prompts

### 6. Enhanced Visual Design
- Check prompt cards have better colors and spacing
- Verify status badges are color-coded
- Check hover effects on cards
- Verify queue controls show progress correctly

### 7. Empty State
- Clear all prompts to see empty state
- Verify improved design and helpful tips
- Test all action buttons in empty state

## Visual Checklist

- [ ] Header has proper spacing and dark mode toggle
- [ ] Status bar shows counts with proper colors
- [ ] Queue controls have color-coded status
- [ ] Search bar is functional and styled
- [ ] Filter bar shows active filters
- [ ] Prompt cards have improved design
- [ ] Export dialog works for all formats
- [ ] Dark mode works throughout
- [ ] Keyboard shortcuts work
- [ ] Empty state is engaging
- [ ] Scrollbar is styled
- [ ] All buttons have proper hover states

## Known Issues / Notes

- Dark mode preference is stored in localStorage
- Search is case-insensitive
- Filters are combined with AND logic
- Export includes all prompts or filtered prompts based on current view

## Performance Testing

- Test with 100+ prompts
- Verify search performance
- Check filter performance
- Test drag and drop with many items

## Browser Compatibility

- Tested on: Chrome (latest)
- Should work on: Edge, Brave, Opera (Chromium-based)
- Firefox: May require adjustments (different extension API)


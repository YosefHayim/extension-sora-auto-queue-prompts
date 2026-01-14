# Claude Code Instructions

## Task Master AI Instructions

**Import Task Master's development workflow commands and guidelines, treat as if import is in the main CLAUDE.md file.**
@./.taskmaster/CLAUDE.md

---

## Component Architecture Guidelines

### File Size Limits

| Type | Max Lines | Action When Exceeded |
|------|-----------|---------------------|
| Components | 300 | Decompose into sub-components |
| Hooks | 100 | Split into focused hooks |
| Utilities | 50 per function | Extract to separate files |
| Entry points (popup/sidepanel) | 500 | Extract logic to hooks |

### When to Extract a Custom Hook

Extract when you see:
1. **3+ related useState calls** → Create `useXxxState` hook
2. **useEffect with cleanup logic** → Create `useXxx` hook
3. **Repeated async logic** → Create `useXxxActions` hook
4. **chrome.* API calls** → Always extract to hooks or services

### Directory Structure

```
src/
├── components/           # React components
│   ├── ui/              # Shadcn primitives (Button, Card, etc.)
│   └── [Feature].tsx    # Feature components
├── hooks/               # Custom React hooks
│   ├── useQueueData.ts  # Data loading + storage sync
│   ├── usePromptFilters.ts
│   └── index.ts         # Barrel export
├── constants/           # Shared constants and configs
│   └── filterConfig.ts  # STATUS_CONFIG, MEDIA_TYPE_CONFIG
├── utils/               # Pure utility functions
│   ├── formatters.ts    # formatDuration, formatTimeAgo
│   ├── storage.ts       # Chrome storage abstraction
│   └── logger.ts        # Logging utilities
├── types/               # TypeScript type definitions
└── lib/                 # Third-party integrations
```

### Avoiding Duplication

Before creating new code:
1. **Search first**: `grep -r "functionName" src/`
2. **Check utils/**: Look for existing utilities
3. **Check constants/**: Look for shared config objects

**Red flags for duplication:**
- Same function name in multiple files
- Config objects with identical keys
- Identical type definitions

**Current shared utilities:**
- `src/utils/formatters.ts` - formatDuration, formatTimeAgo, formatDateTime
- `src/constants/filterConfig.ts` - STATUS_CONFIG, MEDIA_TYPE_CONFIG, StatusFilter, MediaTypeFilter

### Props Interface Patterns

```typescript
// Group props by concern, callbacks last
interface ComponentProps {
  // Data (required first)
  prompt: GeneratedPrompt;
  config: PromptConfig;
  
  // State (optional)
  isSelected?: boolean;
  isEnabled?: boolean;
  
  // Callbacks (alphabetical, optional last)
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
  onToggleSelection?: (id: string) => void;
}
```

**Prop Limits:**
- Max 10 props per component
- Max 3 levels of prop drilling
- Use Context at level 4+

### Custom Hooks Usage

Available hooks in `src/hooks/`:

| Hook | Purpose | Use When |
|------|---------|----------|
| `useQueueData` | Config, prompts, queueState, rateLimitState + storage sync | Loading queue data |
| `usePromptFilters` | Search, status filter, media type filter | Filtering prompts |
| `usePromptSelection` | Selected/enabled prompts management | Batch operations |
| `useQueueActions` | Start/Pause/Resume/Stop queue | Queue controls |
| `usePromptActions` | Edit/Delete/Duplicate/Refine prompts | Prompt operations |
| `useDialogs` | Dialog open/close state | Managing dialogs |

### Component Composition Rules

1. **Prefer composition over configuration**
   ```typescript
   // Prefer:
   <Card><CardHeader /><CardContent /></Card>
   
   // Over:
   <Card header="..." content="..." />
   ```

2. **Extract sub-components when a section is 50+ lines**

3. **Use Shadcn primitives** from `src/components/ui/` instead of custom elements

### Chrome Extension Specifics

- **Never call chrome.* directly in components** — use hooks/services
- **Debounce storage listeners** — chrome.storage.onChanged fires frequently
- **Handle missing chrome API** — check `chrome?.storage?.onChanged` for dev mode
- **Message passing** — use typed request/response contracts

### Testing Requirements

| Type | Coverage Target |
|------|-----------------|
| Utilities | 100% (pure functions) |
| Hooks | Test with @testing-library/react-hooks |
| Components | Test user interactions, not implementation |

### Code Quality Checklist

Before submitting changes:
- [ ] No duplicate functions across files
- [ ] Shared utilities used where available
- [ ] Props grouped by concern
- [ ] File under size limit
- [ ] Build passes: `pnpm run build`
- [ ] Types check: `pnpm run typecheck` (if available)

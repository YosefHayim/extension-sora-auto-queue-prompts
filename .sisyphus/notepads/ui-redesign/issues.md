# Known Issues

## [2026-01-26] LSP Errors in sidepanel.tsx

**File**: `entrypoints/sidepanel.tsx`

**Errors**:

1. Line 942: FilterDropdown missing `promptCount` prop in type definition
2. Line 1072: BatchOperationsPanel missing `onMoveToPosition` prop in type definition
3. Line 1093: EmptyState missing `onManual` prop in type definition

**Status**: Needs investigation and fix
**Priority**: High (blocking clean build)

## [2026-01-26] RESOLVED: LSP Errors in sidepanel.tsx

**Resolution**: Added missing prop definitions to component interfaces

**Changes Made**:
1. FilterDropdown.tsx: Added `promptCount: number` and `filteredCount?: number` props
2. BatchOperationsPanel.tsx: Added `onMoveToPosition?: (position: number) => Promise<void>`, `onCreateBatch?: () => void`, `onSetPriority?: () => void`, and `totalPrompts?: number` props
3. EmptyState.tsx: Added `onManual?: () => void` prop

**Verification**:
- ✅ All 3 LSP errors resolved
- ✅ `pnpm run build` exits with code 0
- ✅ No new TypeScript errors introduced
- ✅ Build output: 810.61 kB total size

**Timestamp**: 2026-01-26 (Completed)

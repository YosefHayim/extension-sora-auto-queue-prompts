# Component Gap Analysis - Pencil vs React

## Summary

| Component            | Status          | Priority | Issues |
| -------------------- | --------------- | -------- | ------ |
| SearchBar            | ❌ Mismatch     | High     | 2      |
| StatusBar            | ✅ Match        | -        | 0      |
| FilterDropdown       | ✅ Match        | -        | 0      |
| EmptyState           | ❌ Mismatch     | Medium   | 1      |
| PromptCard           | ⚠️ Needs Review | Medium   | TBD    |
| BatchOperationsPanel | ✅ Fixed        | -        | 0      |

---

## Detailed Analysis

### SearchBar

**Status**: ❌ NEEDS FIXES
**Priority**: High

**Pencil Specs**:

- Height: 36
- Padding: [0, 12]
- Gap: 8
- CornerRadius: $radius-md
- Fill: $muted

**Current React** (`src/components/SearchBar.tsx`):

- Height: h-9 (36px) ✅
- Padding: px-3 (12px horizontal) ✅, but vertical is 0 ❌
- Gap: gap-2 (8px) ✅
- CornerRadius: rounded-md ✅
- Fill: bg-muted ✅

**Mismatches**:

1. ❌ **Icon size**: Currently h-4 w-4 (16px), should check Pencil for exact size
2. ❌ **Input padding**: The input itself has no explicit padding, relies on parent

**Fix Needed**:

- Verify icon size from Pencil (likely 14x14 or 16x16)
- Ensure proper vertical centering

---

### StatusBar

**Status**: ✅ PERFECT MATCH
**Priority**: -

**Pencil Specs**:

- Padding: [8, 12]
- Gap: 8
- CornerRadius: $radius-md
- Fill: $muted

**Current React** (`src/components/StatusBar.tsx`):

- Padding: px-3 py-2 (12, 8) ✅
- Gap: gap-2 (8px) ✅
- CornerRadius: rounded-md ✅
- Fill: bg-muted ✅
- FontSize: text-[13px] ✅
- Dot indicators: h-2 w-2 (8px) ✅

**No changes needed** ✅

---

### FilterDropdown

**Status**: ✅ PERFECT MATCH
**Priority**: -

**Pencil Specs**:

- Width: 200
- Padding: 8
- Gap: 4
- CornerRadius: $radius-lg
- Fill: $card

**Current React** (`src/components/FilterDropdown.tsx`):

- Width: w-[200px] ✅
- Padding: Handled by DropdownMenuContent ✅
- Gap: Proper spacing between items ✅
- CornerRadius: rounded-lg ✅
- Fill: bg-card ✅
- FontSize: text-[13px] for items, text-[12px] for header, text-[11px] for labels ✅

**No changes needed** ✅

---

### EmptyState

**Status**: ❌ NEEDS FIXES
**Priority**: Medium

**Pencil Specs**:

- Padding: 24
- Gap: 16

**Current React** (`src/components/EmptyState.tsx`):

- Padding: p-6 (24px) ✅
- Gap: gap-4 (16px) ✅

**Mismatches**:

1. ❌ **Icon container size**: Currently h-16 w-16 (64px), need to verify Pencil spec
2. ⚠️ **Icon size**: Currently h-7 w-7 (28px), need to verify Pencil spec
3. ⚠️ **Button gap**: Currently gap-1.5 (6px), need to verify if should be gap-2 (8px)

**Fix Needed**:

- Extract exact icon container and icon sizes from Pencil
- Verify button gap spacing

---

### PromptCard

**Status**: ⚠️ NEEDS DETAILED REVIEW
**Priority**: Medium

**Pencil Specs**:

- Width: 280
- Gap: 10
- CornerRadius: $radius-lg
- Fill: $card

**Current React** (`src/components/PromptCard.tsx`):

- Complex component with many sub-elements
- Need to extract detailed specs for:
  - Card padding
  - Header section (checkbox, drag handle, badges)
  - Content section (prompt text)
  - Footer section (actions, metadata)
  - Icon sizes throughout

**Action Required**: Deep dive into Pencil structure to extract all specs

---

## Priority Fix List

### High Priority (Visual Impact)

1. SearchBar - icon size verification

### Medium Priority (Polish)

1. EmptyState - icon sizes
2. PromptCard - comprehensive review

### Completed ✅

1. BatchOperationsPanel - Fixed (removed BulkActionsMenu, correct padding, icon sizes)
2. StatusBar - Already perfect
3. FilterDropdown - Already perfect

---

## Next Steps

1. Extract detailed Pencil specs for:
   - SearchBar icon size
   - EmptyState icon container and icon sizes
   - PromptCard complete structure
2. Create fix tasks for each component
3. Implement fixes one component at a time
4. Verify with build and visual QA

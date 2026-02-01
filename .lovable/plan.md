
# Make Campaign Cards Smaller with Rounded Backgrounds + Hide Scrollbar

## Overview
This plan addresses two changes to the Campaigns page mobile experience:

1. **Hide scrollbar in Discover page** - Remove the visible scrollbar on the right side when viewing the Discover/Featured tab
2. **Smaller, rounded campaign cards in Home view** - Make the full-screen campaign images slightly narrower than the screen with rounded corners

---

## Current Behavior

### Home Tab (For You)
- Campaign images are full-width, edge-to-edge
- No rounded corners - images stretch to screen edges
- Vertical snap-scroll works correctly

### Discover Tab
- Grid layout shows cards in 2-column format
- Scrollbar may be visible on the right side

---

## Proposed Changes

### 1. Hide Scrollbar in Discover Mode

**File:** `src/pages/Campaigns.tsx`

The browse mode container at line 1137 needs scrollbar hiding:

```diff
- <div ref={featuredScrollRef} className="relative flex-1 overflow-y-auto pt-24 pb-24 md:pb-8">
+ <div ref={featuredScrollRef} className="relative flex-1 overflow-y-auto pt-24 pb-24 md:pb-8 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
```

This adds:
- `scrollbar-hide` class (Tailwind utility)
- Inline styles for Firefox (`scrollbarWidth: 'none'`) and IE (`msOverflowStyle: 'none'`)

### 2. Smaller Campaign Cards with Rounded Backgrounds (Home Tab)

**File:** `src/pages/Campaigns.tsx`

In the "For You" section (lines 988-1032), modify the campaign card container and image:

**Before (Full Width):**
```jsx
<div 
  key={campaign.id} 
  className="h-[calc(100dvh-80px)] md:h-screen flex items-stretch justify-stretch..."
>
  <div className="relative w-full h-full md:w-auto...">
    <img src={campaign.image} className="w-full h-full object-cover" />
```

**After (Smaller with Rounded Corners):**
```jsx
<div 
  key={campaign.id} 
  className="h-[calc(100dvh-80px)] md:h-screen flex items-center justify-center..."
>
  <div className="relative w-[calc(100%-24px)] h-[calc(100%-16px)] rounded-2xl overflow-hidden md:w-auto...">
    <img src={campaign.image} className="w-full h-full object-cover" />
```

Key changes for mobile:
- **Width**: `w-[calc(100%-24px)]` → 12px margin on each side
- **Height**: `h-[calc(100%-16px)]` → 8px margin top and bottom
- **Border radius**: `rounded-2xl` → 16px rounded corners
- **Container**: Change `items-stretch justify-stretch` to `items-center justify-center`
- **Overflow**: `overflow-hidden` ensures the image respects the rounded corners

---

## Visual Result

```text
Before (Full screen):
+------------------+
|                  |
|    [FULL IMAGE]  |
|                  |
+------------------+

After (Smaller + Rounded):
+------------------+
|  +-----------+   |
|  |           |   |
|  |   IMAGE   |   |  ← 12px margin sides
|  |           |   |
|  +-----------+   |  ← rounded-2xl corners
+------------------+
```

---

## Technical Details

### Files to Modify
| File | Change |
|------|--------|
| `src/pages/Campaigns.tsx` | Add scrollbar hiding to Discover mode container |
| `src/pages/Campaigns.tsx` | Adjust Home mode card sizing and add rounded corners |

### Line References
- **Line 988-1032**: Home/ForYou campaign card layout (modify sizing and corners)
- **Line 1137**: Browse/Discover mode container (add scrollbar hiding)

### CSS Classes Used
- `scrollbar-hide` - Tailwind plugin for hiding scrollbars
- `rounded-2xl` - 16px border radius
- `overflow-hidden` - Clips content to rounded corners
- `w-[calc(100%-24px)]` - Responsive width with margins

---

## Summary

Two targeted changes:
1. Add `scrollbar-hide` and inline styles to the Discover mode scroll container
2. Change the Home mode campaign cards from full-bleed to slightly inset with rounded corners

Both changes are mobile-focused and preserve the existing desktop layout behavior.

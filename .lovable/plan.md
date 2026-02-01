

# Lighter Glass Node with Smooth Animation Fix

## Overview

Two changes to improve the expandable glass node:

1. **Revert to lighter glass styling** - Change from dark `rgba(0, 0, 0, 0.4)` back to light `rgba(255, 255, 255, 0.2)` for the frosted glass effect
2. **Fix the animation** - The current approach transitions `top` from `auto` to `80px`, but CSS cannot animate from `auto` - this causes the jerky/instant transition. We need to use a different technique.

---

## Current Problem

```css
/* This doesn't animate smoothly because 'auto' can't be interpolated */
top: isExpanded ? '80px' : 'auto';
transition: top 0.5s ...;
```

CSS transitions require numeric start and end values. `auto` breaks the animation.

---

## Solution

### 1. Lighter Glass Styling

Change from dark to light glass:

```text
Before: rgba(0, 0, 0, 0.4)   - Too dark
After:  rgba(255, 255, 255, 0.2) - Light frosted glass
```

### 2. Animation Fix Using Height Transform

Instead of animating `top`, we'll use a fixed position and animate the height:

```jsx
style={{
  bottom: '12px',
  // Use explicit height instead of auto/top
  height: isExpanded ? 'calc(100% - 92px)' : 'auto',
  maxHeight: isExpanded ? 'calc(100% - 92px)' : '72px',
  transition: 'max-height 0.5s cubic-bezier(0.32, 0.72, 0, 1)',
}}
```

Alternative approach using transform for GPU-accelerated smoothness:
```jsx
// Keep fixed dimensions and use transform + opacity for smooth animation
```

---

## File Changes

| File | Change |
|------|--------|
| `src/components/CampaignCard.tsx` | Lighter glass background + proper height-based animation |

---

## Technical Implementation

### Updated Glass Node Styling

```tsx
<div
  onClick={handleNodeClick}
  className="md:hidden absolute left-3 right-3 rounded-[22px] overflow-hidden"
  style={{
    bottom: '12px',
    // Light frosted glass - not dark
    background: 'rgba(255, 255, 255, 0.2)',
    backdropFilter: 'blur(20px) saturate(180%)',
    WebkitBackdropFilter: 'blur(20px) saturate(180%)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    // Animate height smoothly
    height: isExpanded ? 'calc(100% - 92px)' : 'auto',
    minHeight: isExpanded ? undefined : '60px',
    transition: 'height 0.5s cubic-bezier(0.32, 0.72, 0, 1)',
  }}
>
```

The key insight is:
- Use `height` with explicit values (not `auto` to fixed)
- Or use `maxHeight` which CAN animate from a small value to a large value
- Keep `bottom: 12px` fixed and let height grow upward

---

## Summary

1. Glass node returns to light `rgba(255, 255, 255, 0.2)` frosted style
2. Animation fixed by using `height`/`maxHeight` instead of `top: auto` transition
3. Smooth iOS-style cubic-bezier curve preserved


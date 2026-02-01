
# Interactive Swipe + Apple Liquid Glass Earnings Node

## Overview

This plan implements four changes to make the Home/For You campaign cards more interactive and native-feeling:

1. **Interactive swipe gesture** - Add real-time drag tracking so the card moves with your finger, with the background shifting 20% of the swipe distance
2. **Apple liquid glass earnings node** - Replace the current earnings display with a frosted glass-style node showing rate per 1000 views AND total pot
3. **Remove left arrow hint** - Delete the pulsing chevron arrow on the right side
4. **Add save icon + company logo above the node** - Position the bookmark and company profile icon on the right side above the glass node

---

## Current State

The swipe currently works like this:
- `onTouchStart` records the X position
- `onTouchEnd` checks if swipe distance > 80px and opens details
- No visual feedback during the swipe - the card doesn't move

The earnings display shows:
- Campaign description
- Max earnings in large text
- Save button in bottom-right corner

---

## Proposed Changes

### 1. Interactive Swipe with Parallax Effect

Replace the simple touch handlers with state-tracked drag behavior:

```text
User drags left:
+------------------+
|                  |
|    [CARD]  →     |  Card moves with finger (1:1)
|         ←-----   |  Background peeks 20% of drag distance
+------------------+
```

**Technical approach:**
- Add React state: `const [dragOffset, setDragOffset] = useState(0)`
- Track drag in `onTouchMove` handler (new)
- Apply `transform: translateX(${-dragOffset}px)` to the card
- Apply `transform: translateX(${-dragOffset * 0.2}px)` to create parallax peek of next card
- On release: if `dragOffset > 80`, trigger detail view; else animate back to 0
- Add `transition` class only on release for smooth snap-back

### 2. Apple Liquid Glass Node

Create a frosted glass earnings node positioned at the bottom-right:

```text
+----------------------------------+
|                                  |
|                        [Save] [🏢]|  ← Icons above node
|                                  |
|                  ┌───────────────┐|
|                  │ 40 sek/1000   ││  ← Frosted glass node
|                  │ Total: 1,000  ││
|                  └───────────────┘|
+----------------------------------+
```

**Glass effect CSS:**
```css
background: rgba(255, 255, 255, 0.15);
backdrop-filter: blur(20px) saturate(180%);
-webkit-backdrop-filter: blur(20px) saturate(180%);
border: 1px solid rgba(255, 255, 255, 0.25);
border-radius: 20px;
```

**Node content:**
- Rate: "40 sek / 1000 views" 
- Total pot: "Up to 1,000 sek"

### 3. Remove Left Arrow Hint

Delete lines 1007-1012 which render the pulsing chevron:
```jsx
{/* DELETE THIS */}
<div className="md:hidden absolute right-3 top-1/2 -translate-y-1/2 ...">
  <svg className="h-5 w-5 animate-pulse" ...>
    <path d="M9 18l6-6-6-6" />
  </svg>
</div>
```

### 4. Reposition Save Icon + Add Company Logo

Move the bookmark button and add company logo icon above the glass node:

```jsx
{/* Right side icons - above glass node */}
<div className="md:hidden absolute bottom-32 right-4 flex flex-col items-center gap-3">
  {/* Company profile icon */}
  <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md border border-white/30 overflow-hidden">
    <img src={campaign.logo} alt={campaign.brand} className="w-full h-full object-contain p-1.5" />
  </div>
  
  {/* Save button */}
  <button onClick={(e) => toggleFavorite(campaign.id, e)}>
    <Bookmark className={`h-7 w-7 ${isSaved ? 'fill-white text-white' : 'text-white/70'}`} />
  </button>
</div>
```

---

## File Changes

| File | Change |
|------|--------|
| `src/pages/Campaigns.tsx` | Add drag state, move handler, parallax transforms, glass node, repositioned icons |

---

## Implementation Details

### New State Variables
```typescript
const [dragOffset, setDragOffset] = useState(0);
const [isDragging, setIsDragging] = useState(false);
```

### Updated Touch Handlers
```typescript
const handleTouchStart = (e: React.TouchEvent) => {
  touchStartX = e.touches[0].clientX;
  setIsDragging(true);
};

const handleTouchMove = (e: React.TouchEvent) => {
  const currentX = e.touches[0].clientX;
  const offset = Math.max(0, touchStartX - currentX); // Only allow left swipe
  setDragOffset(offset);
};

const handleTouchEnd = (e: React.TouchEvent) => {
  setIsDragging(false);
  if (dragOffset > 80) {
    handleSelectCampaign(campaign);
  }
  setDragOffset(0); // Animate back
};
```

### Card Transform
```jsx
<div 
  style={{ 
    transform: `translateX(${-dragOffset}px)`,
    transition: isDragging ? 'none' : 'transform 0.3s ease-out'
  }}
>
```

### Glass Node Styling
```jsx
<div className="absolute bottom-4 right-4 px-4 py-3 rounded-2xl"
  style={{
    background: 'rgba(255, 255, 255, 0.15)',
    backdropFilter: 'blur(20px) saturate(180%)',
    WebkitBackdropFilter: 'blur(20px) saturate(180%)',
    border: '1px solid rgba(255, 255, 255, 0.25)',
  }}
>
  <div className="text-sm font-semibold text-white/90">{campaign.ratePerThousand} sek / 1000 views</div>
  <div className="text-lg font-bold text-white">Up to {campaign.maxEarnings.toLocaleString()} sek</div>
</div>
```

---

## Visual Summary

```text
Before:                          After:
+------------------+             +------------------+
|                  |             |            [🏢]  |
|              →   |             |            [♡]   |
|                  |             |                  |
| Description      |             |    ╭──────────╮  |
| 1,000 sek   [♡]  |             |    │40 sek/1k │  |
+------------------+             |    │Total 1,000│  |
                                 |    ╰──────────╯  |
                                 +------------------+
                                        ↑
                                  Frosted glass
```

---

## Summary

1. **Interactive drag** - Card follows finger with parallax peek effect
2. **Glass earnings node** - Shows rate AND total pot in Apple-style frosted glass
3. **No arrow** - Removed the chevron hint
4. **Icons repositioned** - Save and company logo in vertical stack on right side above the node

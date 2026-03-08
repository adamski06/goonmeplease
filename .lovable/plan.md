
# Routing, Stats & Persistent UI Improvements

## Overview

This plan addresses four key changes:
1. **Separate Routes**: Home (`/`) and Discover (`/discover`) as distinct pages
2. **Stats Under Icons**: Add save/share counts below action buttons
3. **Description Above Node**: White text description (max 3 lines) positioned above the glass node
4. **Persistent UI with Fade Transitions**: Keep the node, icons, and description in place between swipes - only the content information fades and changes

---

## Current Architecture

The CampaignCard component currently contains all UI elements (image, icons, node) per card. When swiping, everything moves including the glass node and action icons.

```text
Current structure:
+----------------------------------+
| CampaignCard (per campaign)      |
|   +- Image                       |
|   +- Right icons (logo,save,share)|
|   +- Glass node                  |
+----------------------------------+
| CampaignCard (next campaign)     |
|   +- (same structure)            |
+----------------------------------+
```

---

## Technical Solution

### 1. Separate Routes for Home and Discover

| Route | Page | Content |
|-------|------|---------|
| `/` | Home | For You feed (vertical snap scroll) |
| `/discover` | Discover | Featured grid/browse mode |

**Changes in App.tsx:**
- Add `/discover` route pointing to a Discover page
- Keep `/` as the Home page (For You feed only)

**Changes in Campaigns.tsx:**
- Split into two modes based on route instead of filter state
- Update bottom nav to navigate between routes

### 2. Persistent Overlay Architecture

Instead of each CampaignCard containing its own icons and node, we'll:
- Move the **icons**, **description**, and **glass node** to a fixed overlay outside the scroll container
- Keep only the image inside the swipeable cards
- Update the overlay content with fade transitions when `currentIndex` changes

```text
New structure:
+----------------------------------+
| Scroll Container                 |
|   +- Card 1 (IMAGE ONLY)         |
|   +- Card 2 (IMAGE ONLY)         |
|   +- ...                         |
+----------------------------------+
| Fixed Overlay (persists)         |
|   +- Description text (fades)    |
|   +- Right icons (stay in place) |
|   +- Glass node (content fades)  |
+----------------------------------+
```

### 3. Stats Under Icons

Add random placeholder stats (500-2000) below Save and Share buttons:

```text
+-------------+
|  [Company]  |  <- logo
+-------------+
|  [Bookmark] |
|    1,234    |  <- saves count
+-------------+
|   [Share]   |
|     892     |  <- shares count
+-------------+
```

### 4. Description Above Node

- Position white text description above the glass node
- Limit to 3 lines with `line-clamp-3`
- Apply fade transition when campaign changes

---

## File Changes

| File | Changes |
|------|---------|
| `src/App.tsx` | Add `/discover` route |
| `src/pages/Campaigns.tsx` | Handle route-based mode; Move overlay UI outside scroll container |
| `src/components/CampaignCard.tsx` | Simplify to only render the background image (mobile) |

---

## Implementation Details

### CampaignCard.tsx Changes

Remove the icons and glass node from CampaignCard (mobile). It becomes a simple image container:

```tsx
// Mobile: just the image
<div className="relative w-full h-full">
  <img src={campaign.image} className="w-full h-full object-cover" />
  {/* Noise overlay */}
</div>
```

### Campaigns.tsx - Fixed Overlay

Create a fixed overlay that stays in place during scroll:

```tsx
{/* Fixed Overlay - stays in place during swipe */}
<div className="md:hidden fixed inset-0 pointer-events-none z-20">
  {/* Description above node - max 3 lines */}
  <div 
    key={currentCampaign.id}
    className="absolute left-6 right-20 bottom-[100px] animate-fade-in"
  >
    <p className="text-white text-sm font-medium line-clamp-3 drop-shadow-lg">
      {currentCampaign.description}
    </p>
  </div>

  {/* Right side icons with stats */}
  <div className="absolute bottom-32 right-3 flex flex-col items-center gap-3 pointer-events-auto">
    {/* Company logo */}
    <div className="w-12 h-12 rounded-full glass-bubble">
      <img 
        key={currentCampaign.id}
        src={currentCampaign.logo} 
        className="w-full h-full object-cover animate-fade-in"
      />
    </div>
    
    {/* Save button + count */}
    <div className="flex flex-col items-center gap-1">
      <button className="w-12 h-12 rounded-full glass-bubble">
        <Bookmark />
      </button>
      <span 
        key={`saves-${currentCampaign.id}`}
        className="text-xs text-white/90 animate-fade-in"
      >
        {randomSavesCount}
      </span>
    </div>
    
    {/* Share button + count */}
    <div className="flex flex-col items-center gap-1">
      <button className="w-12 h-12 rounded-full glass-bubble">
        <Send />
      </button>
      <span 
        key={`shares-${currentCampaign.id}`}
        className="text-xs text-white/90 animate-fade-in"
      >
        {randomSharesCount}
      </span>
    </div>
  </div>

  {/* Glass node - fixed position, content fades */}
  <div className="absolute left-3 right-3 bottom-3 rounded-[22px] glass-node pointer-events-auto">
    <div 
      key={currentCampaign.id}
      className="px-5 py-4 flex items-center justify-between animate-fade-in"
    >
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold">{currentCampaign.maxEarnings}</span>
        <span className="text-base">sek</span>
      </div>
      <div className="flex items-center gap-2">
        <span>Platform:</span>
        <img src={platformLogo} className="w-7 h-7 rounded-full" />
      </div>
    </div>
  </div>
</div>
```

### Fade Animation

Use the existing `animate-fade-in` class. The `key` prop on elements ensures React re-renders them when the campaign changes, triggering the animation.

```css
/* Already defined in tailwind config */
animation: {
  "fade-in": "fade-in 0.3s ease-out"
}
```

### Random Stats Generation

Generate consistent random numbers per campaign using the campaign ID as seed:

```tsx
// Generate pseudo-random stats based on campaign ID
const getRandomStat = (campaignId: string, type: 'saves' | 'shares') => {
  const seed = campaignId.charCodeAt(0) + (type === 'shares' ? 100 : 0);
  return 500 + (seed * 17) % 1500; // Returns 500-2000
};
```

### Bottom Navigation Update

Update nav buttons to navigate to routes instead of changing filter state:

```tsx
<button onClick={() => navigate('/')}>Home</button>
<button onClick={() => navigate('/discover')}>Discover</button>
```

---

## Summary

1. **Routes**: `/` = Home (For You), `/discover` = Discover (Featured)
2. **Stats**: Random 500-2000 numbers under Save and Share icons
3. **Description**: 3-line max white text above glass node
4. **Persistent UI**: Icons, description, and node stay fixed; content fades with `animate-fade-in` on campaign change

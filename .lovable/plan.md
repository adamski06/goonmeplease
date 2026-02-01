
# Enhanced Business Onboarding Flow

## Overview
This plan enhances the business onboarding chat flow to:
1. Research more social platforms (Instagram, TikTok, YouTube)
2. Allow editing/removing found accounts inline in chat
3. Generate company description from company's perspective after confirmation
4. Guess target audience demographics with edit capability
5. Display profile preview as a compact box in chat (not sidebar)
6. Style the business site like the home page
7. Skip VAT/address fields during chat onboarding

## Visual Flow

```text
+------------------------------------------+
|  Found accounts for Nike:                |
|                                          |
|  +------------------------------------+  |
|  | [TikTok logo] @nike        [pen][x]|  |
|  | [IG logo] @nike            [pen][x]|  |
|  | [YT logo] /nike            [pen][x]|  |
|  | [Website] nike.com         [pen][x]|  |
|  +------------------------------------+  |
|                                          |
|  [Yes, that's correct!] [No, wrong]      |
+------------------------------------------+
           |
           v (after confirm)
+------------------------------------------+
|  Jarla: Great! Here's what I learned...  |
|                                          |
|  +------------------------------------+  |
|  |      [Compact Profile Card]        |  |
|  |  [Logo] Nike                       |  |
|  |  "We empower athletes worldwide..." |  |
|  +------------------------------------+  |
|                                          |
|  Jarla: I think your audience is:        |
|                                          |
|  +------------------------------------+  |
|  | Age: 18-34             [pen]       |  |
|  | Gender: All            [pen]       |  |
|  | Interests: Sports, Fitness [pen]   |  |
|  +------------------------------------+  |
|                                          |
|  [Looks good!] [Edit]                    |
+------------------------------------------+
```

## Implementation Steps

### 1. Update Edge Function - analyze-company
**File: `supabase/functions/analyze-company/index.ts`**

Modify the autoSearch mode to:
- Search for TikTok, Instagram, and YouTube accounts specifically
- Return structured social media data with handles
- Generate a company description from the company's perspective
- Infer target audience demographics (age range, gender, interests)

Changes:
- Update the search prompt to find TikTok, Instagram, YouTube specifically
- Add a new `generateDescription` mode after account confirmation
- Add audience inference based on company analysis

### 2. Update BusinessAuth Types and State
**File: `src/pages/BusinessAuth.tsx`**

Add new state variables:
- `targetAudience` - object with age, gender, interests
- `editingAccountPlatform` - for inline editing of accounts

Update ChatMessage type to include:
- `'editable-accounts'` - new message type for editable account list
- `'company-description'` - inline profile preview
- `'audience-guess'` - editable audience demographics

Add new ChatStep values:
- `'confirm-description'`
- `'confirm-audience'`

### 3. Create Editable Accounts Component
**File: `src/pages/BusinessAuth.tsx`**

Create inline UI for found accounts with:
- Platform logo on the left
- Account handle/URL in the middle
- Pencil icon button to edit (opens inline input)
- X button to remove account
- Blue confirm button below

When editing:
- Replace text with input field
- Show check button to save

### 4. Create Compact Profile Preview in Chat
**File: `src/pages/BusinessAuth.tsx`**

After user confirms accounts, show:
- A smaller, inline profile card within the chat (not sidebar)
- Company logo + name
- Generated description from company perspective
- Styled as a chat message box

### 5. Create Audience Guess Component
**File: `src/pages/BusinessAuth.tsx`**

Display guessed audience with edit capability:
- Age range (e.g., "18-34") with pencil to edit
- Gender (All/Male/Female) with pencil to edit  
- Interests (tags) with pencil to edit
- Confirm/Edit buttons below

### 6. Remove Profile Sidebar Preview
**File: `src/pages/BusinessAuth.tsx`**

- Remove the `showProfilePreview` right-side panel
- Move profile display to be inline in the chat as a compact card

### 7. Skip VAT/Address in Chat Flow
**File: `src/pages/BusinessAuth.tsx`**

Modify `renderCredentialsForm()`:
- Remove VAT Number field
- Remove Address, City, Postal Code fields
- Keep only: Company Country, Organization Number (optional), and user credentials
- These fields can be collected later in account settings

### 8. Style Business Pages Like Home
**File: `src/pages/BusinessAuth.tsx`**

- Add the grainy background and noise layer from Index.tsx
- Match the fixed navbar style

## Technical Details

### Edge Function Updates

```typescript
// New search prompt for autoSearch mode
const searchPrompt = `Find official social media for "${companyName}":
- TikTok account
- Instagram account  
- YouTube channel
- Official website

Return JSON:
{
  "website": "url or null",
  "socialMedia": {
    "tiktok": "@handle or url",
    "instagram": "@handle or url",
    "youtube": "@handle or url"
  },
  "confidence": "high/medium/low"
}`

// New generateDescription mode
if (generateDescription) {
  // Analyze website/socials and return:
  // - Company description (from "we/our" perspective)
  // - Guessed target audience
}
```

### Editable Accounts UI Structure

```tsx
// Found accounts with edit/delete capability
<div className="border rounded-[3px] p-3 space-y-2">
  {Object.entries(foundSocialMedia).map(([platform, url]) => (
    <div className="flex items-center gap-3">
      <PlatformIcon platform={platform} />
      {editingPlatform === platform ? (
        <Input value={editValue} onChange={...} />
      ) : (
        <span>{url}</span>
      )}
      <button onClick={() => startEditing(platform)}>
        <Pencil />
      </button>
      <button onClick={() => removePlatform(platform)}>
        <X />
      </button>
    </div>
  ))}
</div>
```

### Compact Profile Card Structure

```tsx
// Inline profile card in chat
<div className="bg-muted/60 rounded-[3px] p-4 max-w-md">
  <div className="flex items-center gap-3 mb-3">
    <Logo />
    <h4 className="font-bold">{companyName}</h4>
  </div>
  <p className="text-sm text-foreground/80">
    {generatedDescription}
  </p>
</div>
```

## Files to Modify

| File | Changes |
|------|---------|
| `supabase/functions/analyze-company/index.ts` | Add TikTok/IG/YT search, description generation, audience inference |
| `src/pages/BusinessAuth.tsx` | Add editable accounts UI, inline profile, audience picker, remove sidebar, skip VAT fields, add home page styling |

## Flow Changes Summary

**Before:**
1. Enter company name
2. Auto-search finds website + LinkedIn
3. Confirm accounts
4. Analyze and show summary sections
5. Profile preview in sidebar
6. Enter VAT, address, credentials

**After:**
1. Enter company name
2. Auto-search finds website + TikTok + Instagram + YouTube
3. Show editable account list with pen/X buttons
4. Confirm accounts (blue button)
5. Generate company description (from company perspective)
6. Show compact profile card inline in chat
7. Guess target audience demographics
8. Allow editing audience with pen icons
9. Enter credentials only (skip VAT/address)
10. Complete - styled like home page


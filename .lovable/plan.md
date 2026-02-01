
# Transform Jarla into Creator-Only Mobile App

## Overview

This plan transforms the remixed project into a **creator-only mobile app** by:
1. Removing the landing page (Index.tsx)
2. Removing all business-related pages and components
3. Making the default route the creator's campaign feed
4. Removing the DomainRouter (no longer needed)
5. Setting up mobile-first viewport and styling

## What Will Be Removed

### Pages to Delete
| File | Reason |
|------|--------|
| `src/pages/Index.tsx` | Landing page not needed for app |
| `src/pages/BusinessAuth.tsx` | Business authentication |
| `src/pages/business/BusinessDashboard.tsx` | Business dashboard |
| `src/pages/business/BusinessCampaigns.tsx` | Business campaign list |
| `src/pages/business/BusinessCampaignForm.tsx` | Business campaign creation |
| `src/pages/business/BusinessCampaignDetail.tsx` | Business campaign detail |
| `src/pages/business/BusinessAnalytics.tsx` | Business analytics |

### Components to Delete
| File | Reason |
|------|--------|
| `src/components/BusinessLayout.tsx` | Business sidebar layout |
| `src/components/CampaignPreview.tsx` | Used in business campaign form |
| `src/components/DomainRouter.tsx` | No longer needed |

### Edge Functions to Delete
| File | Reason |
|------|--------|
| `supabase/functions/analyze-company/` | Business onboarding only |
| `supabase/functions/analyze-business-website/` | Business onboarding only |

## What Will Be Kept

### Creator Pages
- `src/pages/Auth.tsx` - Creator signup/login with TikTok connect
- `src/pages/Campaigns.tsx` - Campaign feed (will become home)
- `src/pages/CampaignDetail.tsx` - Campaign details and submission
- `src/pages/Activity.tsx` - Creator activity/earnings
- `src/pages/Profile.tsx` - Creator profile
- `src/pages/NotFound.tsx` - 404 page

### Creator Components
- `src/components/CampaignDetailView.tsx` - Campaign details
- `src/components/CampaignDetailModal.tsx` - Campaign modal
- `src/components/CampaignChat.tsx` - Chat component
- All UI components in `src/components/ui/`
- `src/components/ThemeToggle.tsx`
- `src/components/LanguageSwitcher.tsx`

## New App Structure

```text
+----------------------------------+
|         CREATOR iOS APP          |
|                                  |
|  /              --> Campaigns    |
|  /auth          --> Auth         |
|  /campaigns/:id --> Detail       |
|  /activity      --> Activity     |
|  /profile       --> Profile      |
+----------------------------------+
```

## Implementation Steps

### Step 1: Update App.tsx
Remove all business routes and imports. Change the home route (`/`) to show the Campaigns page instead of Index.

**Before:**
```typescript
<Route path="/" element={<Index />} />
// ... all business routes
```

**After:**
```typescript
<Route path="/" element={<Campaigns />} />
<Route path="/auth" element={<Auth />} />
<Route path="/campaigns/:id" element={<CampaignDetail />} />
<Route path="/activity" element={<Activity />} />
<Route path="/profile" element={<Profile />} />
```

### Step 2: Delete Business Files
Remove all business-related pages, components, and edge functions listed above.

### Step 3: Update index.html for Mobile
Add mobile-optimized viewport meta tags:
- `viewport-fit=cover` for iOS safe areas
- `apple-mobile-web-app-capable` for full-screen mode
- Theme color meta tags

### Step 4: Update Campaigns.tsx Navigation
Modify the Campaigns page to:
- Remove any links to business features
- Update navigation to use `/` as home instead of redirecting
- Ensure mobile-first layout

### Step 5: Update Auth.tsx Redirects
Change post-auth redirect from `'/'` to go directly to the campaigns feed (which is now `/`).

### Step 6: Clean Up Unused Assets
Remove business-specific assets if any (logos, etc.) - though most assets are shared.

### Step 7: Update Capacitor Config (Optional)
Ensure the app name and settings are appropriate for the creator app.

## File Changes Summary

| Action | File |
|--------|------|
| **Modify** | `src/App.tsx` - Remove business routes, remove DomainRouter |
| **Modify** | `src/pages/Campaigns.tsx` - Use as home page |
| **Modify** | `src/pages/Auth.tsx` - Update redirects |
| **Modify** | `index.html` - Add mobile meta tags |
| **Delete** | `src/pages/Index.tsx` |
| **Delete** | `src/pages/BusinessAuth.tsx` |
| **Delete** | `src/pages/business/` (entire folder) |
| **Delete** | `src/components/BusinessLayout.tsx` |
| **Delete** | `src/components/CampaignPreview.tsx` |
| **Delete** | `src/components/DomainRouter.tsx` |
| **Delete** | `supabase/functions/analyze-company/` |
| **Delete** | `supabase/functions/analyze-business-website/` |

## Route Structure After Changes

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | `Campaigns` | Campaign feed (home) |
| `/auth` | `Auth` | Login/signup + TikTok connect |
| `/campaigns/:id` | `CampaignDetail` | View campaign details |
| `/activity` | `Activity` | View submissions & earnings |
| `/profile` | `Profile` | Creator profile & settings |

## Mobile-First Considerations

The Campaigns page already has a mobile-friendly design with:
- Bottom navigation bar
- Card-based campaign layout
- Touch-friendly interactions
- Filter buttons

The Auth page also has mobile-friendly styling with full-width forms.

## Database Connection

This app will continue to use the **same database** as the business web app:
- Creators will see campaigns created by businesses
- Submissions will be saved to `content_submissions`
- Profiles stored in `profiles` table
- Earnings tracked in existing tables

No database changes are needed - only frontend cleanup.

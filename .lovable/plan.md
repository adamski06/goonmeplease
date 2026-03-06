

## Admin Dashboard

### Overview
Create a protected admin page at `/admin` that provides a bird's-eye view of all businesses, their ads (Spread campaigns, Deals, Rewards), and all submissions/applications across the platform.

### Database Changes
1. **Add 'admin' role to a user** — Use the insert tool to add an admin role row for your user ID in `user_roles`. The `has_role` function and `app_role` enum already support 'admin'.

2. **Add RLS policies for admin read access** — The current RLS on `campaigns`, `deals`, `reward_ads`, `content_submissions`, `deal_applications`, and `business_profiles` does not grant admin users cross-business read access. Add SELECT policies using `has_role(auth.uid(), 'admin')` on each table.

### New Files

**`src/pages/admin/AdminDashboard.tsx`**
- Protected page that checks for admin role on mount, redirects unauthorized users
- Tabs: **Businesses**, **Spread Ads**, **Deals**, **Rewards**, **Submissions**
- Each tab renders a data table fetching all rows (not filtered by business_id)
- Businesses tab: company name, website, industry, created date
- Spread Ads tab: title, brand, status, budget, budget spent, submission count
- Deals tab: title, brand, status, budget, application count
- Rewards tab: title, brand, status, views required
- Submissions tab: creator ID, campaign title, status, views, likes, video URL, created date
- Clickable rows to expand details

**`src/pages/admin/AdminLayout.tsx`**
- Simple layout with topbar showing "Admin" label and sign-out button
- No sidebar needed — just a clean tabbed interface

### Route Changes (`src/App.tsx`)
- Add `/admin` route with the admin layout/dashboard
- Lazy-loaded like other routes

### Technical Details
- All data fetched via standard Supabase client queries — admin RLS policies allow full SELECT
- No new edge functions needed
- Uses existing UI components: Tabs, Table, Badge, Button
- Stats (total ads, total submissions, total spend) shown as summary cards at the top


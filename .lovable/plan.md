

## Problem Analysis

The current admin flow requires drilling through **4 levels** to review a single submission:
1. Dashboard → pick a business
2. Business detail → pick an ad type tab → pick an ad
3. Submissions list → pick a submission
4. Review side-by-side view

This means you have to already know *which* business has pending work. There's no unified view of what needs your attention.

## Proposed Redesign

Restructure the admin dashboard around **action-oriented views** instead of business-first navigation.

### New Navigation Tabs

Replace the current "Businesses / Creators / Settings" nav with:

```text
Review Queue | All Ads | Businesses | Creators | Settings
```

### 1. Review Queue (new default landing page)

A single unified list of **all pending submissions and deal requests** across every business, sorted newest first. Each row shows:
- Creator name + avatar
- Ad title + brand name
- Type badge (Spread / Deal)
- Status badge
- Submitted date
- Quick-action buttons (Approve / Deny) inline OR click to open the existing side-by-side review view

This is the primary workspace -- you open the admin and immediately see everything that needs action.

### 2. All Ads (new page)

A flat table of **every ad** across all businesses (spreads, deals, rewards) with:
- Title, brand, type, status, budget, created date
- Submission/request count column
- Inline Pause/Set Live toggle
- Filter tabs or dropdown: All / Pending / Active / Paused
- Click any ad to see its submissions (reuses existing submissions list + review views)

This replaces the need to drill into a specific business just to manage their ads.

### 3. Businesses & Creators (kept but simplified)

Keep these as directory/profile views for looking up specific accounts, but they no longer need to be the primary entry point for reviewing content.

## Implementation Plan

**File changes:**

1. **`src/pages/admin/AdminReviewQueue.tsx`** (new) -- Fetches all `content_submissions` with status `pending_review` and `deal_applications` with status `pending`, joins with campaign/deal and creator profile data. Renders a table with inline approve/deny or click-to-review.

2. **`src/pages/admin/AdminAllAds.tsx`** (new) -- Fetches all campaigns, deals, and reward_ads. Renders in a unified table with type badge, status filter tabs, and inline status toggle. Click-through to submissions list.

3. **`src/pages/admin/AdminLayout.tsx`** -- Add "Review Queue" and "All Ads" to the nav tabs. Update active-state logic.

4. **`src/App.tsx`** -- Add routes for `review-queue` and `all-ads` under the admin layout. Make review-queue the index route.

5. **`src/pages/admin/AdminDashboard.tsx`** -- Repurpose as the Review Queue or remove in favor of the new page.

6. **`src/pages/admin/AdminBusinessDetail.tsx`** -- Keep as-is for business-specific drill-down, but it's no longer the primary workflow.

No database changes needed -- all data is already queryable with existing admin RLS policies.


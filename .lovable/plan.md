

# Creator Payout System with Stripe Connect

## Overview
Implement a secure creator payout system using Stripe Connect for direct bank transfers. Creators must earn a minimum of 100 SEK (configurable by admin) before requesting a payout. Admins get full visibility into every creator, their videos, performance, earnings, and payout requests.

## Database Changes

### 1. `payout_requests` table
Tracks every withdrawal request from creators.
- `id`, `creator_id` (uuid), `amount` (numeric, in USD — normalized), `status` (pending/approved/processing/paid/rejected), `stripe_transfer_id` (text), `stripe_account_id` (text), `created_at`, `reviewed_at`, `reviewed_by`, `admin_notes`
- RLS: creators can SELECT/INSERT own rows; admins can SELECT/UPDATE all

### 2. `platform_settings` table
Admin-configurable settings (minimum payout threshold, etc.).
- `key` (text, primary key), `value` (text), `updated_at`, `updated_by`
- Seed with `min_payout_amount` = `9.50` (≈100 SEK in USD)
- RLS: anyone authenticated can SELECT; admins can UPDATE

### 3. Add `stripe_connect_id` column to `profiles` table
Stores the creator's Stripe Connected Account ID after onboarding.

## Edge Functions

### `create-connect-account`
- Creates a Stripe Connect Express account for the creator
- Returns an Account Link URL for onboarding (bank details, KYC)
- Saves `stripe_connect_id` to the creator's profile

### `create-connect-login-link`
- Returns a Stripe dashboard login link for creators who are already onboarded (to update bank details)

### `request-payout`
- Validates: creator is authenticated, balance >= minimum threshold, no pending request already exists, 7-day cooldown has passed on earnings
- Inserts a row into `payout_requests` with status `pending`
- Does NOT transfer money yet — admin must approve first

### `process-payout` (admin only)
- Validates admin role via JWT
- Uses Stripe Transfer API to send funds from platform to creator's connected account
- Updates `payout_requests.status` to `paid`, sets `stripe_transfer_id`
- Marks corresponding `earnings` rows as `is_paid = true`
- Updates `creator_stats` balances

## Frontend Changes

### Creator Side

**Profile Withdraw Flow** (`WithdrawContent.tsx`)
- Replace Swish/PayPal placeholder with Stripe Connect
- If creator has no `stripe_connect_id`: show "Connect Bank Account" button → opens Stripe onboarding
- If connected but balance < minimum: show "Minimum 100 SEK required" message
- If eligible: show "Request Payout" button → calls `request-payout` edge function
- Show payout request status (pending approval, processing, paid)

### Admin Side

**New "Creators" tab on Admin Dashboard** (`AdminDashboard.tsx`)
- Add a top-level tab or section showing all creators
- Each row: avatar, username, TikTok handle, total videos, total views, total earnings, balance, Stripe status (connected/not)
- Click to drill into creator detail

**Admin Creator Detail page** (new `AdminCreatorDetail.tsx`)
- Creator profile info + TikTok account
- Table of all their submitted videos with status, views, likes, shares, earnings per video
- Payout requests section: list of all requests with status, amount, date
- Approve/Reject buttons for pending payout requests
- "Process Payout" button triggers the Stripe transfer

**Platform Settings section** (new, accessible from admin)
- Edit minimum payout amount
- View/update other platform-wide settings

## Routes
- `/admin/creators` — creators list
- `/admin/creators/:userId` — creator detail with videos + payouts

## Security
- All payout logic runs server-side in edge functions
- Admin role verified via `has_role()` in both RLS and edge functions
- Stripe transfers only triggered by admin-approved edge function
- Creator cannot manipulate payout amounts — calculated from verified `earnings` table
- Minimum threshold checked server-side before accepting requests
- `stripe_connect_id` validated against Stripe API before transfers

## Implementation Order
1. Database migration (new tables + column)
2. Edge functions (`create-connect-account`, `request-payout`, `process-payout`)
3. Creator withdraw flow update
4. Admin creators list + detail page
5. Admin platform settings


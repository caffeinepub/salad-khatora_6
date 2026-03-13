# Salad Khatora

## Current State
- Homepage (LandingPage.tsx) has a reviews carousel that shows up to 6 approved reviews (sliced to 6) from the backend via `useApprovedReviews`.
- No dedicated Reviews page exists.
- Navigation.tsx has nav links for Home, Menu, My Orders, Profile, Subscriptions -- no Reviews link.
- App.tsx has no `/reviews` route registered.
- No rating summary or "View All Reviews" CTA exists.

## Requested Changes (Diff)

### Add
- New page: `src/frontend/src/pages/ReviewsPage.tsx`
  - Fetches all approved reviews from backend via `useApprovedReviews`
  - Sorted by newest first (by `createdAt` descending)
  - Rating summary at top: average rating (X.X / 5), total count, star visualization
  - Grid layout: 3 columns desktop, 2 tablet, 1 mobile
  - Each card: customer name, profession (if available), star rating, review text, review date
  - "Load More" button showing 12 reviews at a time
  - Fully responsive
- New route `/reviews` in App.tsx pointing to ReviewsPage
- "View All Reviews" button on LandingPage below the carousel

### Modify
- `LandingPage.tsx`: limit carousel to latest 8 approved reviews (sort by newest); add "View All Reviews" button directly below the carousel section
- `Navigation.tsx`: add "Reviews" link in both desktop and mobile nav (no auth required)
- `App.tsx`: register `/reviews` route

### Remove
- Nothing removed

## Implementation Plan
1. Create `ReviewsPage.tsx` with rating summary, sorted grid, load-more pagination
2. Register `/reviews` route in App.tsx, import ReviewsPage
3. Update LandingPage.tsx: sort carousel reviews by newest 8; add "View All Reviews" button below carousel
4. Update Navigation.tsx: add Reviews link to navLinks array (authOnly: false)

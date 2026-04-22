# Project Plan: Custom Chrome New Tab Page

## Overview
A visually appealing, very small static page intended to act as the new tab page in Google Chrome, replacing the standard bookmarks bar. The page will be updated infrequently but needs a premium, modern design. Additional functionality may be added in the future.

## Planned Features
- [ ] **Progressive Web App (PWA)**: Installable directly onto Android devices.
- [ ] **Instant Search**: Google Search bar that auto-focuses immediately upon opening the tab.
- [ ] **Categorized Bookmarks**:
  - Work (Google Workspace apps)
  - Shopping
  - Reading (favorite articles/blogs)
  - Watching (YouTube, subscription services)
  - AI Services
- [ ] **Dual Clock & Weather Info**: Live clocks displaying time, date, and weather status for **London** and **Dubai**.
- [ ] **RSS Feed Reader**: Recent headlines from Hacker News, BBC, and TechCrunch.
- [ ] **Financial Tickers**: Live tracking of BTC and FTSE.

## Technical & Design Requirements
- **Core Technology**: HTML/CSS/JS (includes Web App Manifest and Service Worker for PWA). API integration required for live weather (e.g., free OpenWeather API).
- **Design Guidelines**: **Dark Mode preference**, strictly mobile-responsive, modern and premium visual layout.
- **Hosting Strategy**: Firebase Hosting (assigned to custom domain `ghead.co.uk`).

## Roadmap / Next Steps
1. Finalize the list of specific bookmarks and features to show on the page.
2. Outline the desired color palette, theme (e.g., dark mode preferred?), and aesthetic.
3. Review implementation plan for user sign-off.
